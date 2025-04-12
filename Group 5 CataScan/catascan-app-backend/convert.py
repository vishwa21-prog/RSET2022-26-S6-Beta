import tensorflow as tf
import time

# Step 1: Load the 250 MB .h5 model
try:
    model = tf.keras.models.load_model('./CataScan_v1_best.h5')
    print("Model loaded successfully")
    # Optional: Print model summary to verify
    model.summary()
except Exception as e:
    print(f"Error loading model: {e}")
    exit()

# Step 2: Start timing and convert to TFLite
start_time = time.time()
try:
    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    # Add FP16 and extended ops support
    converter.target_spec.supported_types = [tf.float16]  # For your f16 tensors
    converter.target_spec.supported_ops = [
        tf.lite.OpsSet.TFLITE_BUILTINS,  # Default TFLite ops
        tf.lite.OpsSet.SELECT_TF_OPS     # Fallback for unsupported ops
    ]
    converter.allow_custom_ops = True  # Handle potential custom ops
    tflite_model = converter.convert()
    print("Conversion successful")
except Exception as e:
    print(f"Error during conversion: {e}")
    exit()

# Step 3: End timing and save the .tflite model
end_time = time.time()
try:
    with open('CataScan_v1_best.tflite', 'wb') as f:
        f.write(tflite_model)
    print("Model saved successfully")
except Exception as e:
    print(f"Error saving model: {e}")
    exit()

print(f"Conversion took {end_time - start_time:.2f} seconds")