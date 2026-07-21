# DermaLens Backend Interview Questions and Answers

## 1. What does this project do?
This project provides a Flask-based backend API for skin disease classification. It accepts an image upload, runs inference with a TensorFlow model, and returns a predicted disease with confidence, severity, class probabilities, and an explainability heatmap.

## 2. What are the main technologies used?
- Python 3.10
- Flask
- Flask-CORS
- TensorFlow CPU
- Pillow
- NumPy
- OpenCV (headless)
- Gunicorn
- Docker
- Render.com deployment

## 3. How is the model loaded and used?
The model is loaded from `model/skin_disease_efficientnet.keras` using `tf.keras.models.load_model(..., compile=False)`. Input images are resized to the model's expected input dimensions and converted to raw pixel arrays in `[0, 255]`. The model predicts class probabilities, which are mapped to disease labels.

## 4. Why does the code avoid TensorFlow preprocessing functions like `preprocess_input`?
Because the EfficientNet model already includes built-in preprocessing layers for rescaling and normalization. Applying `tf.keras.applications.*.preprocess_input` again would double-normalize the image and produce incorrect predictions.

## 5. What endpoints does the API expose?
- `GET /`: Returns app status, supported labels, and model status.
- `GET /health`: Returns a basic health check and model load status.
- `POST /predict`: Accepts an image file and returns prediction results.

## 6. What is Grad-CAM and how is it used here?
Grad-CAM is an explainability technique that visualizes which image regions most influenced the model's prediction. The app computes a heatmap from the last convolutional layer, overlays it on the input image, and returns a base64-encoded JPEG.

## 7. What image file types are supported?
Supported file MIME types are:
- `image/jpeg`
- `image/png`
- `image/webp`
- `image/bmp`

## 8. What are the predicted disease classes?
- Acne
- Athlete's Foot
- Cellulitis
- Eczema
- Impetigo
- Ringworm
- Rosacea
- Shingles
- Urticaria (Hives)
- Vitiligo

## 9. How does the app handle low-confidence predictions?
If the top model confidence is below 30%, the API returns:
- `disease`: `Unknown / Unrecognized`
- `confidence`: the low score
- `status`: `Low confidence score`

## 10. What deployment options are configured?
- Docker container via `Dockerfile`
- Render.com via `render.yaml`
- Gunicorn is the production WSGI server

## 11. What does the Docker setup do?
The `Dockerfile` uses `python:3.10-slim`, installs dependencies, copies the project, exposes port `7860`, and starts the app with Gunicorn.

## 12. What does `render.yaml` configure?
It configures a Render web service using Python 3.10, installs requirements, and starts the app with `gunicorn app:app`.

## 13. What file might be outdated or inconsistent?
`test_model.py` is inconsistent with the current app model path and image shape. It references `model/skin_disease_model.h5` and resizes images to `128x128`, while `app.py` uses `skin_disease_efficientnet.keras`.

## 14. What are common areas for improvement?
- Add complete unit and integration tests for the API.
- Add request validation and security controls.
- Add a frontend or mobile client.
- Add versioning and model metadata management.
- Add logging, metric collection, and better error handling.

## 15. How would you improve explainability further?
- Return the top 3 predicted classes instead of just the top class.
- Store Grad-CAM images for auditing.
- Add a threshold for when to generate Grad-CAM based on confidence.
- Use SHAP or integrated gradients for additional explainability.
