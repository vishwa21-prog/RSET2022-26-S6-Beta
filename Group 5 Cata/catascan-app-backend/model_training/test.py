import tensorflow as tf
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model
import numpy as np
from matplotlib import pyplot as plt

# Set float32 policy
tf.keras.mixed_precision.set_global_policy('float32')

# Load the model
model = load_model("./CataScan_v1_best.h5")

# Load and preprocess the image
IMG_SIZE = 224
image_path = "../../../Downloads/joel.jpg"  # Replace with your image path
img = load_img(image_path, target_size=(IMG_SIZE, IMG_SIZE))
img_array = img_to_array(img) / 255.0  # Rescale
img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension

# Predict
prediction = model.predict(img_array)
predicted_class = tf.argmax(prediction, axis=1).numpy()[0]
class_names = {0: "immature", 1: "mature", 2: "normal"}  # From your training class_indices
confidence = prediction[0][predicted_class] * 100

# Display result
print(f"Predicted class: {class_names[predicted_class]}")
print(f"Confidence: {confidence:.2f}%")
print(f"Prediction probabilities: {prediction[0]}")

# Visualize the image with prediction
plt.imshow(img)
plt.title(f"Predicted: {class_names[predicted_class]} ({confidence:.2f}%)")
plt.axis('off')
plt.show()