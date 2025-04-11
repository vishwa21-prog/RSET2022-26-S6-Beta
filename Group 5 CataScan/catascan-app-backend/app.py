from flask import Flask, request, jsonify, send_file
import tensorflow as tf
import numpy as np
from PIL import Image as PilImage
import io
import time
import logging
import reportlab
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from flask_cors import CORS
from functools import wraps
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
import uuid
import requests
from google import genai

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["https://catascan.vercel.app", "http://localhost:5173"],
        "methods": ["GET", "POST", "PUT", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Configure logging
logging.basicConfig(level=logging.INFO)

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_ID = "gemini-1.5-pro"  # Updated model ID (removed "models/" prefix)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
genai_client = genai.Client(api_key="AIzaSyD61XXk7aplSLCryA5qdj8znYP58duMLm4")

# Max file size (5MB) for image upload
MAX_FILE_SIZE = 5 * 1024 * 1024

# Middleware to verify JWT token
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"error": "Authorization token is missing"}), 401

        try:
            # Ensure token is in "Bearer <token>" format, extract just the token
            if not token.startswith("Bearer "):
                return jsonify({"error": "Invalid token format. Use 'Bearer <token>'"}), 401
            token = token.replace("Bearer ", "")
            # Validate token with Supabase
            user_response = supabase.auth.get_user(token)
            if not user_response.user:
                return jsonify({"error": "Invalid or expired token"}), 401
            # Store the User object directly in request.user
            request.user = user_response.user
        except Exception as e:
            logging.error(f"Token verification failed: {str(e)}")
            return jsonify({"error": f"Token verification failed: {str(e)}"}), 401

        return f(*args, **kwargs)
    return decorated

# Function to process the input image
def process_image(image):
    image = image.resize((224, 224))
    image_array = np.array(image) / 255.0
    image_array = np.expand_dims(image_array, axis=0)
    return image_array.astype(np.float32)

@app.route("/upload-image", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files["file"]
    
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400
    
    # Get user_id from form data
    user_id = request.form.get("user_id")
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    file_content = file.read()
    if len(file_content) > MAX_FILE_SIZE:
        return jsonify({"error": "File is too large. Maximum size is 5MB."}), 400

    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({"error": "Invalid file format. Please upload an image (PNG, JPG, JPEG)."}), 400

    # Check if the image is an eye using Gemini API
    try:
        logging.info("Calling Gemini API to analyze image")
        response = genai_client.models.generate_content(
            model=MODEL_ID,
            contents=[
                {
                    "inline_data": {
                        "mime_type": "image/jpeg",
                        "data": file_content
                    }
                },
                "Is this a close-up image of a single human eye, where the eye is the primary focus and occupies most of the frame? Return only 'yes' or 'no' as the response, nothing else."
            ]
        )
        logging.info(f"Gemini API response: {response.text}")
        if response.text.strip().lower() != "yes":
            return jsonify({"error": "The image is not an eye"}), 400
    except Exception as e:
        logging.error(f"Gemini API error: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to analyze image with Gemini API"}), 500

    try:
        scan_id = str(uuid.uuid4())
        file_path = f"scans/{scan_id}.jpg"

        logging.info(f"Uploading image to Supabase Storage at path: {file_path}")
        response = supabase.storage.from_("scan-images").upload(
            file=file_content,
            path=file_path,
            file_options={"content-type": "image/jpeg", "upsert": "true"}
        )
        logging.info(f"Upload response: {response}")

        image_url = supabase.storage.from_("scan-images").get_public_url(file_path)
        logging.info(f"Image URL: {image_url}")

        return jsonify({
            "message": "Image uploaded successfully",
            "scan_id": scan_id,
            "image_url": image_url,
            "user_id": user_id
        }), 200

    except Exception as e:
        logging.error(f"Error uploading image: {str(e)}", exc_info=True)
        return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    image_url = data.get("image_url")
    scan_id = data.get("scan_id")
    user_id = data.get("user_id")

    if not image_url or not scan_id or not user_id:
        return jsonify({"error": "Image URL, scan ID, and user ID are required"}), 400

    try:
        start_time = time.time()
        response = requests.get(image_url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch image from URL"}), 400

        image = PilImage.open(io.BytesIO(response.content))

        if min(image.size) < 32:
            return jsonify({"error": "Image is too small. Please upload a larger image."}), 400

        # Process the image (assuming process_image prepares it for the model)
        image_array = process_image(image)  # Ensure this outputs the correct shape

        # Load the TFLite model and allocate tensors
        interpreter = tf.lite.Interpreter(model_path="./CataScan_v1_best.tflite")  # Update with your .tflite file path
        interpreter.allocate_tensors()

        # Get input and output details
        input_details = interpreter.get_input_details()
        output_details = interpreter.get_output_details()

        # Set the input tensor
        interpreter.set_tensor(input_details[0]['index'], image_array)

        # Run inference
        interpreter.invoke()

        # Get the output tensor
        prediction = interpreter.get_tensor(output_details[0]['index'])  # Shape: (1, num_classes)
        predicted_class = np.argmax(prediction, axis=1)[0]
        class_names = {0: "immature", 1: "mature", 2: "normal"}  # Adjust based on your model
        confidence = float(prediction[0][predicted_class]) * 100
        processing_time = round(time.time() - start_time, 3)

        # Store in scan_record with user_id
        scan_data = {
            "scan_id": scan_id,
            "user_id": user_id,
            "image_url": image_url,
            "severity_level": class_names[predicted_class],
            "confidence": confidence,
            "feedback": "Analysis completed successfully.",
            "created_at": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        supabase.table("scan_record").insert(scan_data).execute()

        # Store in analysis with processing_time as a float
        analysis_data = {
            "analysis_id": str(uuid.uuid4()),
            "scan_id": scan_id,
            "processing_time": processing_time
        }
        supabase.table("analysis").insert(analysis_data).execute()

        recommendation_text = "Consult an eye specialist for further evaluation." if predicted_class in [0, 1] else "No immediate action required."
        recommendation_data = {
            "r_id": str(uuid.uuid4()),
            "scan_id": scan_id,
            "r_text": recommendation_text,
            "created_at": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        supabase.table("recommendation").insert(recommendation_data).execute()

        result = {
            "scan_id": scan_id,
            "user_id": user_id,
            "prediction": class_names[predicted_class],
            "confidence": confidence,
            "severity": class_names[predicted_class],
            "probabilities": prediction[0].tolist(),  # Include full probability array
            "feedback": scan_data["feedback"],
            "recommendation": recommendation_text,
            "processing_time": processing_time,
            "model_version": "CataScan_v1_tflite",  # Updated to reflect TFLite usage
        }

        logging.info(f"Prediction made: {result}")
        return jsonify(result)

    except Exception as e:
        logging.error(f"Error occurred during prediction: {str(e)}", exc_info=True)
        return jsonify({"error": f"An error occurred during prediction: {str(e)}"}), 500
    
@app.route("/signup", methods=["POST"])
def signup():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        response = supabase.auth.sign_up({"email": email, "password": password})
        if not response.user:
            return jsonify({"error": "Sign-up failed"}), 400

        user_id = response.user.id
        user_profile_data = {
            "user_id": user_id,
            "email": email,
            "password": password,
            "created_at": time.strftime('%Y-%m-%d %H:%M:%S')
        }
        insert_response = supabase.table("user_profile").insert(user_profile_data).execute()

        if insert_response.data:
            logging.info(f"User signed up and profile created: {email}")
            return jsonify({
                "message": "Sign-up successful",
                "user_id": user_id,
                "access_token": response.session.access_token
            }), 201
        else:
            supabase.auth.admin.delete_user(user_id)
            return jsonify({"error": "Failed to create user profile"}), 500

    except Exception as e:
        logging.error(f"Sign-up error: {e}")
        return jsonify({"error": f"An error occurred during sign-up: {str(e)}"}), 500

@app.route("/onboarding", methods=["POST"])
@require_auth
def onboarding():
    data = request.get_json()
    user_id = data.get("user_id")
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    gender = data.get("gender")
    dob = data.get("dob")
    age = data.get("age")
    address = data.get("address")

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    try:
        update_data = {
            "first_name": first_name,
            "last_name": last_name,
            "gender": gender,
            "dob": dob,
            "age": age,
            "address": address,
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}
        update_response = supabase.table("user_profile").update(update_data).eq("user_id", user_id).execute()

        if update_response.data:
            logging.info(f"User profile updated for user_id: {user_id}")
            return jsonify({"message": "Onboarding successful"}), 200
        else:
            return jsonify({"error": "Failed to update user profile"}), 500

    except Exception as e:
        logging.error(f"Onboarding error: {e}")
        return jsonify({"error": f"An error occurred during onboarding: {str(e)}"}), 500

@app.route("/signin", methods=["POST"])
def signin():
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if response.user:
            logging.info(f"User signed in: {email}")
            return jsonify({
                "message": "Sign-in successful",
                "user_id": response.user.id,
                "access_token": response.session.access_token
            }), 200
        else:
            return jsonify({"error": "Sign-in failed"}), 400
    except Exception as e:
        logging.error(f"Sign-in error: {e}")
        return jsonify({"error": "Invalid email or password"}), 401

@app.route("/profile", methods=["GET"])
@require_auth
def get_profile():
    try:
        user = request.user  # Changed from request.user.user to request.user
        user_id = user.id

        profile_response = supabase.table("user_profile").select("*").eq("user_id", user_id).single().execute()
        if not profile_response.data:
            return jsonify({"error": "Profile not found"}), 404

        avatar_url = user.user_metadata.get("avatar_url", None)

        return jsonify({
            "profile": profile_response.data,
            "avatar_url": avatar_url
        }), 200

    except Exception as e:
        logging.error(f"Error fetching profile: {e}")
        return jsonify({"error": f"Failed to fetch profile: {str(e)}"}), 500

@app.route("/profile", methods=["PUT"])
@require_auth
def update_profile():
    try:
        user = request.user  # Changed from request.user.user to request.user
        user_id = user.id

        data = request.get_json()
        update_data = {
            "first_name": data.get("first_name"),
            "last_name": data.get("last_name"),
            "gender": data.get("gender"),
            "dob": data.get("dob"),
            "age": data.get("age"),
            "address": data.get("address"),
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}

        update_response = supabase.table("user_profile").update(update_data).eq("user_id", user_id).execute()

        if not update_response.data:
            return jsonify({"error": "Failed to update profile"}), 500

        logging.info(f"Profile updated for user_id: {user_id}")
        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        logging.error(f"Error updating profile: {e}")
        return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500

@app.route("/profile/image", methods=["POST"])
@require_auth
def upload_profile_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        return jsonify({"error": "Invalid file format. Please upload an image (PNG, JPG, JPEG)."}), 400

    try:
        user = request.user  # Changed from request.user.user to request.user
        user_id = user.id

        file_path = f"public/{user_id}.jpg"
        supabase.storage.from_("profile-images").upload(file_path, file, {"upsert": True})

        public_url = supabase.storage.from_("profile-images").get_public_url(file_path)

        supabase.auth.admin.update_user_by_id(user_id, {"user_metadata": {"avatar_url": public_url}})

        logging.info(f"Profile image uploaded for user_id: {user_id}")
        return jsonify({"message": "Profile image uploaded successfully", "avatar_url": public_url}), 200

    except Exception as e:
        logging.error(f"Error uploading profile image: {e}")
        return jsonify({"error": f"Failed to upload profile image: {str(e)}"}), 500

@app.route("/download_report", methods=["GET"])
@require_auth
def download_report():
    try:
        scan_id = request.args.get("scanId")
        if not scan_id:
            return jsonify({"error": "Scan ID is required"}), 400

        # Fetch data from Supabase
        scan_response = supabase.table("scan_record").select("*").eq("scan_id", scan_id).single().execute()
        if not scan_response.data:
            return jsonify({"error": "Scan record not found"}), 404
        scan_data = scan_response.data

        analysis_response = supabase.table("analysis").select("*").eq("scan_id", scan_id).single().execute()
        analysis_data = analysis_response.data if analysis_response.data else {}

        recommendation_response = supabase.table("recommendation").select("*").eq("scan_id", scan_id).single().execute()
        recommendation_data = recommendation_response.data if recommendation_response.data else {}

        user_response = supabase.table("user_profile").select("first_name, last_name").eq("user_id", scan_data["user_id"]).single().execute()
        user_data = user_response.data if user_response.data else {}

        # Fetch the scanned image
        image_url = scan_data.get("image_url")
        image_content = None
        if image_url:
            try:
                response = requests.get(image_url)
                if response.status_code == 200:
                    image_content = io.BytesIO(response.content)
            except Exception as e:
                logging.warning(f"Failed to fetch image from {image_url}: {str(e)}")

        # Generate PDF
        pdf_buffer = io.BytesIO()
        doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
        styles = getSampleStyleSheet()

        # Custom Styles
        title_style = ParagraphStyle("TitleStyle", parent=styles["Heading1"], fontSize=22, textColor=colors.HexColor("#004d99"), alignment=1)
        label_style = ParagraphStyle("LabelStyle", parent=styles["Normal"], fontSize=12, textColor=colors.darkgreen)
        value_style = ParagraphStyle("ValueStyle", parent=styles["Normal"], fontSize=12)

        story = [Paragraph("CataScan Report", title_style), Spacer(1, 12)]

        user_name = f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip() or "User"
        story.append(Paragraph(f"Prepared for: <b>{user_name}</b>", styles["Normal"]))
        story.append(Spacer(1, 10))

        # Scanned Image
        if image_content:
            try:
                img = ImageReader(image_content)
                story.append(Image(image_content, width=200, height=200, hAlign="CENTER"))
                story.append(Spacer(1, 20))
            except Exception as e:
                logging.error(f"Error adding image to PDF: {str(e)}")
                story.append(Paragraph("Scanned Image: <i>Unable to load image</i>", value_style))

        # Report Details Table
        details = [
            ["Scan ID:", scan_id],
            ["Severity Level:", scan_data.get("severity_level", "N/A")],
            ["Confidence:", scan_data.get("confidence", "N/A")],
            ["Feedback:", scan_data.get("feedback", "N/A")],
            ["Recommendation:", recommendation_data.get("r_text", "N/A")],
            ["Processing Time:", f"{analysis_data.get('processing_time', 'N/A')} seconds"],
            ["Date:", scan_data.get("created_at", "N/A")]
        ]

        table = Table(details, colWidths=[120, 300])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#004d99")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('BOX', (0, 0), (-1, -1), 1, colors.black)
        ]))

        story.append(table)
        story.append(Spacer(1, 20))

        # Footer
        story.append(Paragraph("Generated by CataScan_V1", styles["Normal"]))
        story.append(Paragraph(f"Date Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}", styles["Normal"]))

        doc.build(story)
        pdf_buffer.seek(0)

        return send_file(
            pdf_buffer,
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"catascan_report_{scan_id}.pdf"
        )
    except Exception as e:
        logging.error(f"Error generating report: {e}")
        return jsonify({"error": f"Failed to generate report: {str(e)}"}), 500

@app.route("/scans", methods=["GET"])
@require_auth
def get_scans():
    try:
        user = request.user  # Changed from request.user.user to request.user
        user_id = user.id
        scans_response = supabase.table("scan_record").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return jsonify(scans_response.data), 200
    except Exception as e:
        logging.error(f"Error fetching scans: {e}")
        return jsonify({"error": f"Failed to fetch scans: {str(e)}"}), 500

@app.route("/test-supabase", methods=["GET"])
def test_supabase():
    try:
        response = supabase.table("user_profile").select("*").limit(1).execute()
        return jsonify({"message": "Supabase connection successful", "data": response.data}), 200
    except Exception as e:
        return jsonify({"error": f"Supabase connection failed: {str(e)}"}), 500
    




@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "Server is alive"}), 200


def keep_alive():
    while True:
        try:
            
            url = "https://catascan-app-backend.onrender.com/health"  
            response = requests.get(url)
            if response.status_code == 200:
                logging.info("Keep-alive ping successful")
            else:
                logging.warning(f"Keep-alive ping failed with status: {response.status_code}")
        except Exception as e:
            logging.error(f"Error in keep_alive: {str(e)}")
        
     
        time.sleep(500)



if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=7000)