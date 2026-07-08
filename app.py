import os
import numpy as np
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image
import tensorflow as tf
import cv2
import io
import base64

app = Flask(__name__)
CORS(app)

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response

# ─── Model Configuration ──────────────────────────────────────────────────────

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "skin_disease_mobilenet.h5")

DISEASE_LABELS = [
    'Acne',                  # index 0
    'Actinic Keratosis',     # index 1
    'Basal Cell Carcinoma',  # index 2
    'Eczema',                # index 3
    'Psoriasis',             # index 4
    'Ringworm',              # index 5
    'Rosacea',               # index 6
    'Seborrheic Keratosis',  # index 7
    'Vitiligo',              # index 8
    'Warts',                 # index 9
]

SEVERITY_MAP = {
    'Acne':                  'Low',
    'Actinic Keratosis':     'Medium',
    'Basal Cell Carcinoma':  'Medium',
    'Eczema':                'Low',
    'Psoriasis':             'Low',
    'Ringworm':              'Low',
    'Rosacea':               'Low',
    'Seborrheic Keratosis':  'Low',
    'Vitiligo':              'Low',
    'Warts':                 'Low',
}

# ─── Load Model ───────────────────────────────────────────────────────────────

print("Loading model...")
model = None
try:
    model = tf.keras.models.load_model(MODEL_PATH, compile=False)
    IMG_SIZE = (model.input_shape[1], model.input_shape[2])
    num_classes = model.output_shape[-1]
    print(f"Model loaded successfully!")
    print(f"Input shape: {model.input_shape}")
    print(f"Output shape: {model.output_shape}")
except Exception as e:
    print(f"Model loading failed: {e}")
    print("Running in MOCK MODE")
    IMG_SIZE = (224, 224)
    num_classes = 10

if len(DISEASE_LABELS) != num_classes:
    print(f"WARNING: DISEASE_LABELS has {len(DISEASE_LABELS)} entries but model outputs {num_classes} classes")

if model is not None:
    print(f"Model ready. Input: {model.input_shape}, Output: {model.output_shape}")
else:
    print("No model loaded — running in mock mode")
# ─── Helper Functions ─────────────────────────────────────────────────────────

def preprocess_image(file_bytes):
    """Convert uploaded image bytes to model-ready numpy array."""
    img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE)
    arr = np.array(img, dtype=np.float32)
    arr = tf.keras.applications.mobilenet_v2.preprocess_input(arr)
    arr = np.expand_dims(arr, axis=0)
    return arr


def generate_gradcam(img_array, class_index):
    """Generate Grad-CAM heatmap and return as base64 string."""
    try:
        last_conv_layer_name = None
        for layer in reversed(model.layers):
            if isinstance(layer, tf.keras.layers.Conv2D):
                last_conv_layer_name = layer.name
                break

        if last_conv_layer_name is None:
            print("No Conv2D layer found")
            return None

        grad_model = tf.keras.models.Model(
            inputs=model.input,
            outputs=[
                model.get_layer(last_conv_layer_name).output,
                model.output
            ]
        )

        with tf.GradientTape() as tape:
            conv_outputs, preds = grad_model(img_array)
            loss = preds[:, class_index]

        grads        = tape.gradient(loss, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        conv_outputs = conv_outputs[0]
        heatmap      = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap      = tf.squeeze(heatmap)
        heatmap      = tf.maximum(heatmap, 0)
        heatmap      = heatmap / (tf.math.reduce_max(heatmap) + 1e-8)
        heatmap      = heatmap.numpy()

        h, w = IMG_SIZE
        heatmap_resized = cv2.resize(heatmap, (w, h))
        heatmap_colored = cv2.applyColorMap(
            np.uint8(255 * heatmap_resized),
            cv2.COLORMAP_JET
        )

        original     = np.uint8(img_array[0] * 255)
        original_bgr = cv2.cvtColor(original, cv2.COLOR_RGB2BGR)
        superimposed = cv2.addWeighted(
            original_bgr, 0.6,
            heatmap_colored, 0.4,
            0
        )

        # Return as base64 instead of saving to disk
        _, buffer = cv2.imencode('.jpg', superimposed)
        b64 = base64.b64encode(buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{b64}"

    except Exception as e:
        print(f"Grad-CAM error: {e}")
        return None


def build_response(predictions, img_array=None):
    """Convert raw model output into JSON structure."""
    predictions_arr = predictions[0]

    top_index      = int(np.argmax(predictions_arr))
    top_disease    = DISEASE_LABELS[top_index]
    top_confidence = round(float(predictions_arr[top_index]) * 100, 1)
    severity       = SEVERITY_MAP.get(top_disease, "Medium")

    probabilities = sorted(
        [
            {"name": DISEASE_LABELS[i], "score": round(float(p) * 100, 1)}
            for i, p in enumerate(predictions_arr)
        ],
        key=lambda x: x["score"],
        reverse=True,
    )

    # Generate Grad-CAM
    gradcam_url = None
    if img_array is not None:
        gradcam_b64 = generate_gradcam(img_array, top_index)
        if gradcam_b64:
            gradcam_url = gradcam_b64

    return {
        "disease":       top_disease,
        "confidence":    top_confidence,
        "severity":      severity,
        "probabilities": probabilities,
        "gradcam_url":   gradcam_url,
        "mock_mode":     False
    }

# ─── Routes ───────────────────────────────────────────────────────────────────

@app.route('/')
def home():
    return jsonify({
        'app':           'DermaLens API',
        'status':        'running',
        'model_loaded':  model is not None,
        'mode':          'real' if model is not None else 'mock',
        'total_classes': len(DISEASE_LABELS),
        'labels':        DISEASE_LABELS
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_loaded": model is not None})


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "Empty filename."}), 400

    allowed = {"image/jpeg", "image/png", "image/webp", "image/bmp"}
    if file.content_type not in allowed:
        return jsonify({"error": f"Unsupported file type: {file.content_type}"}), 400

    try:
        file_bytes  = file.read()
        arr         = preprocess_image(file_bytes)
        predictions = model.predict(arr, verbose=0)

        top_confidence = float(np.max(predictions[0])) * 100
        MIN_CONFIDENCE = 30.0

        if top_confidence < MIN_CONFIDENCE:
            return jsonify({
                'error':      'not_skin',
                'message':    f'This does not appear to be a skin image. Confidence too low ({top_confidence:.1f}%). Please upload a clear close-up photo of affected skin.',
                'confidence': round(top_confidence, 2)
            }), 400

        response = build_response(predictions, arr)
        return jsonify(response), 200

    except Exception as e:
        app.logger.exception("Prediction failed")
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500


# ─── Entry Point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(host="0.0.0.0", port=port, debug=False)