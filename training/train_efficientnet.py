import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras.applications.efficientnet import preprocess_input
from tensorflow.keras.layers import Dense, Dropout, GlobalAveragePooling2D
from tensorflow.keras.models import Model
from tensorflow.keras.callbacks import (
    EarlyStopping,
    ReduceLROnPlateau,
    ModelCheckpoint
)
from sklearn.utils.class_weight import compute_class_weight
import numpy as np
import pickle

# ==========================================================
# SETTINGS
# ==========================================================

IMG_SIZE = 224
BATCH_SIZE = 32
EPOCHS = 30

train_path = "../dataset/train"
val_path = "../dataset/val"
test_path = "../dataset/test"

# ==========================================================
# DATA AUGMENTATION
# ==========================================================

train_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input,
    rotation_range=25,
    zoom_range=0.25,
    horizontal_flip=True,
    width_shift_range=0.15,
    height_shift_range=0.15,
    shear_range=0.20,
    brightness_range=[0.8, 1.2]
)

val_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

# ==========================================================
# LOAD DATA
# ==========================================================

train_data = train_datagen.flow_from_directory(
    train_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=True,
    seed=42
)

val_data = val_datagen.flow_from_directory(
    val_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False,
    seed=42
)

test_data = test_datagen.flow_from_directory(
    test_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False,
    seed=42
)

# ==========================================================
# CLASS WEIGHTS
# ==========================================================

weights = compute_class_weight(
    class_weight="balanced",
    classes=np.unique(train_data.classes),
    y=train_data.classes
)

class_weights = dict(enumerate(weights))

print("\n========================")
print("CLASS WEIGHTS")
print("========================")
print(class_weights)

# ==========================================================
# LOAD EFFICIENTNET
# ==========================================================

base_model = EfficientNetB0(
    weights="imagenet",
    include_top=False,
    input_shape=(IMG_SIZE, IMG_SIZE, 3)
)

base_model.trainable = True

# Freeze all layers except last 30

for layer in base_model.layers[:-30]:
    layer.trainable = False

# ==========================================================
# CUSTOM CLASSIFIER
# ==========================================================

x = base_model.output

x = GlobalAveragePooling2D()(x)

x = Dense(
    256,
    activation="relu"
)(x)

x = Dropout(0.5)(x)

outputs = Dense(
    train_data.num_classes,
    activation="softmax"
)(x)

model = Model(
    inputs=base_model.input,
    outputs=outputs
)

# ==========================================================
# COMPILE
# ==========================================================

model.compile(
    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-5
    ),
    loss="categorical_crossentropy",
    metrics=["accuracy"]
)

print("\n========================")
print("MODEL SUMMARY")
print("========================")

model.summary()

# ==========================================================
# CALLBACKS
# ==========================================================

early_stop = EarlyStopping(
    monitor="val_loss",
    patience=7,
    restore_best_weights=True,
    verbose=1
)

reduce_lr = ReduceLROnPlateau(
    monitor="val_loss",
    factor=0.2,
    patience=3,
    verbose=1,
    min_lr=1e-7
)

checkpoint = ModelCheckpoint(
    "best_efficientnet.keras",
    monitor="val_accuracy",
    save_best_only=True,
    mode="max",
    verbose=1
)

# ==========================================================
# TRAIN MODEL
# ==========================================================

print("\n========================")
print("TRAINING STARTED")
print("========================")

history = model.fit(
    train_data,
    validation_data=val_data,
    epochs=EPOCHS,
    class_weight=class_weights,
    callbacks=[
        early_stop,
        reduce_lr,
        checkpoint
    ]
)

# ==========================================================
# SAVE TRAINING HISTORY
# ==========================================================

with open("history.pkl", "wb") as f:
    pickle.dump(history.history, f)

print("\nTraining history saved!")

# ==========================================================
# EVALUATE
# ==========================================================

print("\n========================")
print("EVALUATING MODEL")
print("========================")

loss, accuracy = model.evaluate(test_data)

print("\n========================")
print("TEST RESULTS")
print("========================")
print("Test Accuracy :", accuracy)
print("Test Loss     :", loss)

# ==========================================================
# SAVE FINAL MODEL
# ==========================================================

model.save("skin_disease_efficientnet.keras")

print("\n========================")
print("FINAL MODEL SAVED")
print("========================")
print("skin_disease_efficientnet.keras")
