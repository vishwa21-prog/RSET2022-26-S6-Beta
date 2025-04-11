import tensorflow as tf
import numpy as np
from PIL import Image as PilImage
import matplotlib.pyplot as plt
import os

# Load the TFLite model
tflite_path = "./CataScan_v1_best.tflite"
if not os.path.exists(tflite_path):
    raise FileNotFoundError(f"TFLite model not found at: {tflite_path}. Please ensure it exists.")

interpreter = tf.lite.Interpreter(model_path=tflite_path)
interpreter.allocate_tensors()

# Get input and output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Function to load an image from a local file
def load_image(file_path):
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Image file not found at: {file_path}")
    image = PilImage.open(file_path).convert("RGB")
    return image

# Preprocessing function with intermediate outputs
def process_image_with_stages(image):
    stages = {}
    stages["Original"] = np.array(image)
    image_resized = image.resize((224, 224))
    stages["Resized (224x224)"] = np.array(image_resized)
    image_array = np.array(image_resized) / 255.0
    stages["Normalized"] = image_array
    image_batch = np.expand_dims(image_array, axis=0)
    stages["Batched"] = image_batch
    final_input = image_batch.astype(np.float32)  # Default to float32; adjust if needed
    stages["Float32"] = final_input
    return stages, final_input

# Function to plot images, histograms, and prediction
def visualize_stages(stages, prediction, predicted_class, class_names, confidence, save_path="output_visualization.png"):
    fig = plt.figure(figsize=(20, 10), facecolor='white')
    gs = fig.add_gridspec(3, 5, height_ratios=[1, 1, 0.5], hspace=0.4, wspace=0.3)
    
    for i, (stage_name, data) in enumerate(stages.items()):
        if len(data.shape) == 4:
            img_data = data[0]
        else:
            img_data = data
        
        ax_img = fig.add_subplot(gs[0, i])
        ax_img.imshow(img_data, cmap='gray' if img_data.ndim == 2 else None)
        ax_img.set_title(f"{stage_name}\n{img_data.shape[:2]}", fontsize=12, fontweight='bold', color='#333333')
        ax_img.axis('off')
        
        ax_hist = fig.add_subplot(gs[1, i])
        if img_data.ndim == 3:
            for channel, color in enumerate(['#FF6B6B', '#4ECDC4', '#45B7D1']):
                hist, bins = np.histogram(img_data[..., channel].ravel(), bins=50, range=(0, 1 if "Normalized" in stage_name else 255))
                ax_hist.plot(bins[:-1], hist, color=color, lw=1.5)
        else:
            hist, bins = np.histogram(img_data.ravel(), bins=50, range=(0, 1 if "Normalized" in stage_name else 255))
            ax_hist.plot(bins[:-1], hist, color='#45B7D1', lw=1.5)
        ax_hist.grid(True, linestyle='--', alpha=0.5)
        ax_hist.set_title(f"{stage_name} Histogram", fontsize=10, color='#555555')
        ax_hist.set_xlabel("Pixel Value", fontsize=9)
        ax_hist.set_ylabel("Frequency", fontsize=9)
        ax_hist.tick_params(axis='both', which='major', labelsize=8)
    
    ax_text = fig.add_subplot(gs[2, :])
    ax_text.axis('off')
    prediction_text = (
        f"Prediction Result:\n"
        f"  • Predicted Class: {class_names[predicted_class]}\n"
        f"  • Confidence: {confidence:.2f}%\n"
        f"  • Probabilities: {np.round(prediction[0], 3)}"
    )
    ax_text.text(0.5, 0.5, prediction_text, fontsize=12, ha='center', va='center', 
                 bbox=dict(facecolor='#F5F5F5', edgecolor='#333333', boxstyle='round,pad=0.5', alpha=0.9),
                 fontfamily='monospace', color='#333333')
    
    fig.suptitle("Image Preprocessing Stages and Prediction (TFLite)", fontsize=16, fontweight='bold', color='#333333', y=1.05)
    plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"Visualization saved to: {save_path}")
    plt.show()

# Main demo function using TFLite
def run_demo(file_path, save_path="output_visualization.png"):
    print("Loading image...")
    image = load_image(file_path)
    print("Processing image through stages...")
    stages, final_input = process_image_with_stages(image)
    
    # Check input type compatibility
    expected_dtype = input_details[0]['dtype']
    if expected_dtype == np.float16:
        final_input = final_input.astype(np.float16)
        print("Converted input to float16 for TFLite model")
    elif expected_dtype == np.float32:
        print("Input already in float32, compatible with TFLite model")
    else:
        raise ValueError(f"Unexpected input dtype: {expected_dtype}. Expected float32 or float16.")

    print("Making prediction with TFLite...")
    interpreter.set_tensor(input_details[0]['index'], final_input)
    interpreter.invoke()
    prediction = interpreter.get_tensor(output_details[0]['index'])
    
    predicted_class = np.argmax(prediction, axis=1)[0]
    class_names = {0: "immature", 1: "mature", 2: "normal"}  # Adjust based on your model
    confidence = prediction[0][predicted_class] * 100
    
    print(f"\nPrediction Result:")
    print(f"- Predicted class: {class_names[predicted_class]}")
    print(f"- Confidence: {confidence:.2f}%")
    print(f"- Prediction probabilities: {prediction[0]}")
    
    print("Visualizing preprocessing stages with prediction...")
    visualize_stages(stages, prediction, predicted_class, class_names, confidence, save_path)

if __name__ == "__main__":
    image_file_path = "../../Downloads/kripa.jpg"  # Replace with your image file path
    save_file_path = "output_visualization.png"
    try:
        run_demo(image_file_path, save_file_path)
    except Exception as e:
        print(f"Error: {str(e)}")