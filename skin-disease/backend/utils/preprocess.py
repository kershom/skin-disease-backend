import numpy as np
from PIL import Image
import io

# Must match training — IMG_SIZE = 128
IMG_SIZE = (128, 128)

def preprocess_image(file_bytes):
    """
    Takes raw image bytes from API request.
    Returns preprocessed numpy array ready for model prediction.
    """
    # Open image from bytes
    image = Image.open(io.BytesIO(file_bytes))

    # Convert to RGB — handles PNG with alpha channel too
    image = image.convert('RGB')

    # Resize to 128x128 — matches training size
    image = image.resize(IMG_SIZE)

    # Convert to numpy array
    img_array = np.array(image)

    # Normalize to [0, 1] — matches rescale=1./255 in training
    img_array = img_array.astype('float32') / 255.0

    # Add batch dimension → shape becomes (1, 128, 128, 3)
    img_array = np.expand_dims(img_array, axis=0)

    return img_array

