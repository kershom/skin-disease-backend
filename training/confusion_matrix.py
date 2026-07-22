import tensorflow as tf
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.metrics import confusion_matrix, classification_report
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications.efficientnet import preprocess_input

# ==========================================================
# LOAD MODEL
# ==========================================================

model = tf.keras.models.load_model("best_efficientnet.keras")

# ==========================================================
# SETTINGS
# ==========================================================

IMG_SIZE = 224
BATCH_SIZE = 32

test_path = "../dataset/test"

# ==========================================================
# LOAD TEST DATA
# ==========================================================

test_datagen = ImageDataGenerator(
    preprocessing_function=preprocess_input
)

test_data = test_datagen.flow_from_directory(
    test_path,
    target_size=(IMG_SIZE, IMG_SIZE),
    batch_size=BATCH_SIZE,
    class_mode="categorical",
    shuffle=False
)

# ==========================================================
# PREDICTIONS
# ==========================================================

print("\nMaking Predictions...\n")

predictions = model.predict(test_data)

y_pred = np.argmax(predictions, axis=1)
y_true = test_data.classes

class_names = list(test_data.class_indices.keys())

# ==========================================================
# CONFUSION MATRIX
# ==========================================================

cm = confusion_matrix(y_true, y_pred)

plt.figure(figsize=(12, 10))

sns.heatmap(
    cm,
    annot=True,
    fmt="d",
    cmap="Blues",
    xticklabels=class_names,
    yticklabels=class_names
)

plt.title("EfficientNetB0 Confusion Matrix", fontsize=16)
plt.xlabel("Predicted Class", fontsize=12)
plt.ylabel("True Class", fontsize=12)

plt.xticks(rotation=45, ha="right")
plt.yticks(rotation=0)

plt.tight_layout()

plt.savefig("confusion_matrix.png", dpi=300)

plt.show()

print("\nConfusion matrix saved as: confusion_matrix.png")

# ==========================================================
# CLASSIFICATION REPORT
# ==========================================================

report = classification_report(
    y_true,
    y_pred,
    target_names=class_names
)

print("\n==============================")
print("CLASSIFICATION REPORT")
print("==============================\n")
print(report)

with open("classification_report.txt", "w") as f:
    f.write(report)

print("Classification report saved as: classification_report.txt")
