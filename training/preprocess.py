import os
import pandas as pd
import shutil

# Paths
metadata_path = "../dataset/raw/HAM10000_metadata.csv"

images_part1 = "../dataset/raw/HAM10000_images_part_1"
images_part2 = "../dataset/raw/HAM10000_images_part_2"

processed_path = "../dataset/processed"

# Read metadata
df = pd.read_csv(metadata_path)

# Create processed folder
os.makedirs(processed_path, exist_ok=True)

# Loop through metadata
for index, row in df.iterrows():

    image_id = row['image_id']
    label = row['dx']

    # Create disease folder
    label_folder = os.path.join(processed_path, label)
    os.makedirs(label_folder, exist_ok=True)

    image_name = image_id + ".jpg"

    # Search image in part 1
    image_path1 = os.path.join(images_part1, image_name)

    # Search image in part 2
    image_path2 = os.path.join(images_part2, image_name)

    # Decide correct path
    if os.path.exists(image_path1):
        source_path = image_path1
    else:
        source_path = image_path2

    # Destination path
    destination_path = os.path.join(label_folder, image_name)

    # Copy image
    shutil.copy(source_path, destination_path)

print("Dataset organized successfully!")
