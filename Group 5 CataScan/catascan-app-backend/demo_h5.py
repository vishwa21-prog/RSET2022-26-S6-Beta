import tensorflow as tf
import numpy as np
from PIL import Image as PilImage
import matplotlib.pyplot as plt
import os
from huggingface_hub import hf_hub_download

# Set float32 policy
tf.keras.mixed_precision.set_global_policy('float32')

# Load the Keras .h5 model from Hugging Face
repo_id = "GeorgeET15/CataScan_v1_best"
filename = "CataScan_v1_best.h5"
model_path = "CataScan_v1_best.h5"

if not os.path.exists(model_path):
    hf_hub_download(repo_id=repo_id, filename=filename, local_dir="./")
model = tf.keras.models.load_model(model_path)

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
    final_input = image_batch.astype(np.float32)
    stages["Float32"] = final_input
    return stages, final_input

# Function to plot images, histograms, and prediction with improved styling and save option
def visualize_stages(stages, prediction, predicted_class, class_names, confidence, save_path="output_visualization.png"):
    # Create figure with custom layout
    fig = plt.figure(figsize=(20, 10), facecolor='white')
    gs = fig.add_gridspec(3, 5, height_ratios=[1, 1, 0.5], hspace=0.4, wspace=0.3)
    
    # Plot images and histograms
    for i, (stage_name, data) in enumerate(stages.items()):
        if len(data.shape) == 4:
            img_data = data[0]
        else:
            img_data = data
        
        # Image subplot
        ax_img = fig.add_subplot(gs[0, i])
        ax_img.imshow(img_data, cmap='gray' if img_data.ndim == 2 else None)
        ax_img.set_title(f"{stage_name}\n{img_data.shape[:2]}", fontsize=12, fontweight='bold', color='#333333')
        ax_img.axis('off')
        
        # Histogram subplot
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
    
    # Add prediction text in a dedicated subplot
    ax_text = fig.add_subplot(gs[2, :])  # Span all columns in the third row
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
    
    # Add a main title
    fig.suptitle("Image Preprocessing Stages and Prediction", fontsize=16, fontweight='bold', color='#333333', y=1.05)
    
    # Save the figure before showing it
    plt.savefig(save_path, dpi=300, bbox_inches='tight', facecolor='white')
    print(f"Visualization saved to: {save_path}")
    
    # Display the figure
    plt.show()

# Main demo function with new prediction method
def run_demo(file_path, save_path="output_visualization.png"):
    print("Loading image...")
    image = load_image(file_path)
    print("Processing image through stages...")
    stages, final_input = process_image_with_stages(image)
    
    print("Making prediction...")
    prediction = model.predict(final_input)
    predicted_class = tf.argmax(prediction, axis=1).numpy()[0]
    class_names = {0: "immature", 1: "mature", 2: "normal"}  # Adjust based on your model's classes
    confidence = prediction[0][predicted_class] * 100
    
    # Display prediction in terminal
    print(f"\nPrediction Result:")
    print(f"- Predicted class: {class_names[predicted_class]}")
    print(f"- Confidence: {confidence:.2f}%")
    print(f"- Prediction probabilities: {prediction[0]}")
    
    print("Visualizing preprocessing stages with prediction...")
    visualize_stages(stages, prediction, predicted_class, class_names, confidence, save_path)

if __name__ == "__main__":
    image_file_path = "./images/kripa.jpg"  # Replace with your image file path
    save_file_path = "output_visualization.png"  # Path where the image will be saved
    try:
        run_demo(image_file_path, save_file_path)
    except Exception as e:
        print(f"Error: {str(e)}")