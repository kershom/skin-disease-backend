import os
import shutil
import random

processed_dir = "../dataset/processed"

train_dir = "../dataset/train"
val_dir = "../dataset/val"
test_dir = "../dataset/test"

# Ratios
train_ratio = 0.70
val_ratio = 0.15
test_ratio = 0.15

# Create folders
os.makedirs(train_dir, exist_ok=True)
os.makedirs(val_dir, exist_ok=True)
os.makedirs(test_dir, exist_ok=True)

for disease in os.listdir(processed_dir):

    disease_path = os.path.join(processed_dir, disease)

    if not os.path.isdir(disease_path):
        continue

    images = os.listdir(disease_path)
    random.seed(42)

    random.shuffle(images)

    total = len(images)

    train_end = int(total * train_ratio)
    val_end = train_end + int(total * val_ratio)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    os.makedirs(os.path.join(train_dir, disease), exist_ok=True)
    os.makedirs(os.path.join(val_dir, disease), exist_ok=True)
    os.makedirs(os.path.join(test_dir, disease), exist_ok=True)

    # Train
    for image in train_images:
        shutil.copy(
            os.path.join(disease_path, image),
            os.path.join(train_dir, disease, image)
        )

    # Validation
    for image in val_images:
        shutil.copy(
            os.path.join(disease_path, image),
            os.path.join(val_dir, disease, image)
        )

    # Test
    for image in test_images:
        shutil.copy(
            os.path.join(disease_path, image),
            os.path.join(test_dir, disease, image)
        )

    print(
        f"{disease}: "
        f"Train={len(train_images)} "
        f"Val={len(val_images)} "
        f"Test={len(test_images)}"
    )

print("\nTrain / Validation / Test split completed!")
