import numpy as np
from PIL import Image
import tensorflow as tf
import sys

CLASS_LABELS = [
    "Actinic Keratosis",
    "Basal Cell Carcinoma",
    "Benign Keratosis",
    "Dermatofibroma",
    "Melanocytic Nevi",
    "Melanoma",
    "Vascular Lesion",
]

model = tf.keras.models.load_model("model/skin_disease_model.h5")

img_path = sys.argv[1]
img = Image.open(img_path).convert("RGB").resize((128, 128))
arr = np.array(img, dtype=np.float32) / 255.0
arr = np.expand_dims(arr, axis=0)

preds = model.predict(arr)[0]

print("\n--- Raw Model Output ---")
for i, (label, score) in enumerate(zip(CLASS_LABELS, preds)):
    print(f"  [{i}] {label}: {round(score * 100, 2)}%")

print(f"\nPredicted: {CLASS_LABELS[np.argmax(preds)]} ({round(float(np.max(preds)) * 100, 1)}%)")