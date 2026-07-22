---
title: DermaLens Backend
emoji: 🩺
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# DermaLens Backend

## Overview

DermaLens Backend is a Flask-based API service for classifying common skin conditions from uploaded images. It uses a TensorFlow image classification model and exposes prediction and health endpoints for integration with a frontend or mobile application.

## Features

- Image upload API for skin disease prediction
- TensorFlow model inference using a `.keras` packaged model
- Grad-CAM heatmap generation for explainability
- CORS enabled for cross-origin access
- Docker-ready deployment with Gunicorn
- Health check endpoint for monitoring

## Tech Stack

- Python 3.10
- Flask 3.0.3
- Flask-CORS 4.0.1
- TensorFlow CPU 2.21.0
- Pillow 10.3.0
- NumPy 1.26.4
- OpenCV Python Headless 4.10.0.84
- Gunicorn 22.0.0
- Docker
- Render.com deployment config

## Architecture

- `app.py` contains the main Flask application, model loading, prediction logic, and Grad-CAM generation.
- `model/skin_disease_efficientnet.keras` is the TensorFlow model package used for inference.
- `Dockerfile` builds a slim Python container and runs the app with Gunicorn.
- `render.yaml` defines Render.com deployment settings.

## API Endpoints

### `GET /`

Returns a JSON status response with model availability and supported labels.

### `GET /health`

Returns a simple health check response. Useful for uptime monitoring.

### `POST /predict`

Accepts an image file upload and returns a JSON prediction response.

Request form-data:
- `image`: image file (`image/jpeg`, `image/png`, `image/webp`, or `image/bmp`)

Response keys:
- `disease`: predicted skin condition
- `confidence`: top prediction confidence percentage
- `severity`: severity label mapped from disease
- `probabilities`: sorted class probability list
- `gradcam_url`: base64-encoded Grad-CAM image
- `mock_mode`: false when a real model is loaded

## Model 

- The app expects a packaged Keras model file in `model/skin_disease_efficientnet.keras`.
- The model outputs one of 10 disease labels.
- Input images are resized to the model input shape and passed to the model as raw pixel arrays in `[0, 255]`.
- The code avoids additional TensorFlow preprocessing because the model already contains rescaling/normalization layers.

## Model Training

The skin disease classification model was developed using EfficientNet.

### Model Details
- Architecture: EfficientNet
- Input Size: 224 × 224 × 3
- Output Classes: 10 skin diseases
- Framework: TensorFlow / Keras

### Training Process
- Dataset preprocessing and cleaning
- Data augmentation
- Model training and validation
- Performance evaluation using confusion matrix and classification report
- Exported trained model for Flask backend integration

## Supported Diseases

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

## Deployment

### Docker

- Base image: `python:3.10-slim`
- Exposes port `7860`
- Uses Gunicorn to serve the Flask app:
  `gunicorn app:app --bind 0.0.0.0:7860 --timeout 120 --workers 1`

### Render

- Configured in `render.yaml`
- Runtime: `python-3.10`
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app`

## Running Locally

1. Install dependencies:
   `pip install -r requirements.txt`
2. Run the app:
   `python app.py`
3. Or use Docker:
   `docker build -t dermalens-backend .`
   `docker run -p 7860:7860 dermalens-backend`

## Testing

- `test_api.py` provides a simple smoke test for the `/health` endpoint and can also POST an image to `/predict`.
- `healthcheck.py` imports the Flask app and tests the `/health` route in a local client.

## Notes

- If the model fails to load, the app falls back to a lightweight mock mode for development.
- `test_model.py` appears to reference a different model file and is not aligned with the current `app.py` model setup.
- `utils/` contains helper scripts, but the main service logic is in `app.py`.

## Recommended Improvements

- Add authentication and request rate limiting for production use.
- Add structured unit tests and integration tests for `/predict`.
- Improve error handling for bad image uploads.
- Add a frontend or mobile client to consume the API.
