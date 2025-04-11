import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetV2S
from tensorflow.keras.layers import Dense, Dropout, BatchNormalization, GlobalAveragePooling2D
from tensorflow.keras.models import Model, load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from tensorflow.keras.metrics import Precision, Recall
import numpy as np
import tensorflow_model_optimization as tfmot
from tensorflow.keras.optimizers import schedules
from sklearn.utils.class_weight import compute_class_weight

# Enable Mixed Precision for Training
tf.keras.mixed_precision.set_global_policy('mixed_float16')

# Image Parameters
IMG_SIZE = 224
BATCH_SIZE = 32
NUM_CLASSES = 3
VALIDATION_SPLIT = 0.2

# Data Augmentation
def get_augmentor():
    return ImageDataGenerator(
        rescale=1./255,
        rotation_range=40,
        zoom_range=0.3,
        horizontal_flip=True,
        shear_range=0.2,
        fill_mode='nearest',
        validation_split=VALIDATION_SPLIT
    )

# Base Model
base_model = EfficientNetV2S(weights="imagenet", include_top=False, input_shape=(IMG_SIZE, IMG_SIZE, 3))
base_model.trainable = False

# Modify Model
x = base_model.output
x = GlobalAveragePooling2D()(x)
x = Dense(512, activation="swish")(x)
x = BatchNormalization()(x)
x = Dropout(0.5)(x)
output_layer = Dense(NUM_CLASSES, activation="softmax", dtype='float32')(x)
model = Model(inputs=base_model.input, outputs=output_layer)

# Compile
model.compile(
    optimizer=Adam(learning_rate=0.001),
    loss="categorical_crossentropy",
    metrics=["accuracy", Precision(name="precision"), Recall(name="recall")]
)

# Class Weights
class_counts = [244, 370, 407]
class_weights = compute_class_weight(
    class_weight="balanced",
    classes=np.arange(NUM_CLASSES),
    y=np.concatenate([np.full(count, i) for i, count in enumerate(class_counts)])
)
class_weight_dict = dict(enumerate(class_weights))
print("Class weights:", class_weight_dict)

# Callbacks
steps_per_epoch = int((1021 * (1 - VALIDATION_SPLIT)) // BATCH_SIZE)
lr_scheduler = tf.keras.callbacks.LearningRateScheduler(
    schedules.CosineDecayRestarts(initial_learning_rate=0.001, first_decay_steps=steps_per_epoch * 5), 
    verbose=1
)
early_stop = EarlyStopping(monitor="val_loss", patience=5, restore_best_weights=True)

# Progressive Resizing
for size in [128, 160, 192, 224]:
    augmentor = get_augmentor()
    train_data = augmentor.flow_from_directory(
        "./eye_dataset/train",
        target_size=(size, size),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        shuffle=True
    )
    val_data = augmentor.flow_from_directory(
        "./eye_dataset/train",
        target_size=(size, size),
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False
    )
    print(f"Training with image size: {size}x{size}")
    print(f"Training samples: {train_data.samples}, Validation samples: {val_data.samples}")
    model.fit(
        train_data,
        validation_data=val_data,
        epochs=3,  # Reduced to 3
        callbacks=[lr_scheduler, early_stop],
        class_weight=class_weight_dict
    )

# Fine-tune
base_model.trainable = True
for layer in base_model.layers[:150]:
    layer.trainable = False
model.compile(
    optimizer=Adam(learning_rate=0.0005),
    loss="categorical_crossentropy",
    metrics=["accuracy", Precision(name="precision"), Recall(name="recall")]
)
model.fit(
    train_data,
    validation_data=val_data,
    epochs=5,  # Reduced to 5
    callbacks=[lr_scheduler, early_stop],
    class_weight=class_weight_dict
)

# Save Trained Model
model.save("CataScan_v1_best.h5")

# Convert to Float32 for Quantization
tf.keras.mixed_precision.set_global_policy('float32')
model_float32 = load_model("CataScan_v1_best.h5")

# Ensure all weights are float32
for layer in model_float32.layers:
    if hasattr(layer, 'kernel') and layer.kernel.dtype == tf.float16:
        layer.kernel = tf.cast(layer.kernel, tf.float32)
    if hasattr(layer, 'bias') and layer.bias.dtype == tf.float16:
        layer.bias = tf.cast(layer.bias, tf.float32)

quant_aware_model = tfmot.quantization.keras.quantize_model(model_float32)

# Compile Quantized Model
quant_aware_model.compile(
    optimizer=Adam(learning_rate=0.0005),
    loss="categorical_crossentropy",
    metrics=["accuracy", Precision(name="precision"), Recall(name="recall")]
)

# Save Quantized Model
quant_aware_model.save("CataScan_v1_quantized.h5")

# Evaluate
loss, accuracy, precision, recall = quant_aware_model.evaluate(val_data)
print(f"Validation Accuracy: {accuracy*100:.2f}%")
print(f"Validation Precision: {precision*100:.2f}%")
print(f"Validation Recall: {recall*100:.2f}%")

# TFLite Conversion
converter = tf.lite.TFLiteConverter.from_keras_model(quant_aware_model)
converter.optimizations = [tf.lite.Optimize.DEFAULT]
def representative_dataset():
    for _ in range(100):
        batch = next(val_data)[0]
        yield [batch.astype(np.float32)]
converter.representative_dataset = representative_dataset
tflite_model = converter.convert()
with open("CataScan_v1_best.tflite", "wb") as f:
    f.write(tflite_model)

# Print Class Indices and Sample Counts
print("Class indices:", train_data.class_indices)
print(f"Total samples: {train_data.samples + val_data.samples}")
print(f"Training samples: {train_data.samples}")
print(f"Validation samples: {val_data.samples}")


