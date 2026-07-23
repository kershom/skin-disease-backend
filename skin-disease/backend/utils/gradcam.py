import numpy as np
import tensorflow as tf
import cv2
import os
import uuid

def generate_gradcam(model, img_array, class_index, save_dir='static/gradcam'):
    """
    Generates Grad-CAM heatmap showing where the AI focused on the image.
    Returns filename of saved heatmap image, or None if failed.
    """
    try:
        # Find the last Conv2D layer in the model
        last_conv_layer_name = None
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_layer_name = layer.name
                break

        if last_conv_layer_name is None:
            print("No Conv2D layer found in model")
            return None

        print(f"Using layer: {last_conv_layer_name} for Grad-CAM")

        # Build gradient model
        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[
                model.get_layer(last_conv_layer_name).output,
                model.output
            ]
        )

        # Compute gradients
        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            loss = predictions[:, class_index]

        grads        = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap      = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap      = tf.squeeze(heatmap)
        heatmap      = tf.maximum(heatmap, 0)
        heatmap      = heatmap / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap      = heatmap.numpy()

        # Resize heatmap to match image size
        heatmap_resized = cv2.resize(heatmap, (128, 128))
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap_resized),
            cv2.COLORMAP_JET
        )

        # Overlay heatmap on original image
        original     = np.uint8(img_array[0] * 255)
        original_bgr = cv2.cvtColor(original, cv2.COLOR_RGB2BGR)
        superimposed = cv2.addWeighted(
            original_bgr, 0.6,
            heatmap_colored, 0.4,
            0
        )

        # Save heatmap image to static/gradcam folder
        os.makedirs(save_dir, exist_ok=True)
        filename = f"gradcam_{uuid.uuid4().hex[:8]}.jpg"
        filepath = os.path.join(save_dir, filename)
        cv2.imwrite(filepath, superimposed)

        return filename

    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None


def cleanup_old_gradcams(save_dir='static/gradcam', keep_last=50):
    """
    Deletes old Grad-CAM files to save disk space.
    Keeps only the most recent 50 files.
    """
    try:
        files = sorted(
            [os.path.join(save_dir, f) for f in os.listdir(save_dir)],
            key=os.path.getmtime
        )
        for f in files[:-keep_last]:
            os.remove(f)
    except Exception as e:
        print(f"Cleanup error: {e}")
