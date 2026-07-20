# DERMALENS

Skin diseases are among the most common health conditions worldwide, but access to timely dermatological care is often limited. To address this, **DermaLens** is an AI-powered web platform that enables users to upload a skin image and receive an instant preliminary classification across ten common skin conditions, along with guidance on the next steps.

The platform integrates an EfficientNetB0-based deep learning model with a React frontend, Flask backend, and Firebase for authentication and data storage. It also provides multilingual support, a rule-based chatbot, nearby dermatologist search, PDF report generation, and an admin dashboard.

This document presents the project's architecture, implementation, model evaluation, deployment, and key outcomes.

<p align="center">
  <img src="https://github.com/user-attachments/assets/d0138050-f28e-4da3-9804-ec99ccd4bbf8" width="100%">
</p>

---

# Vision

> To make preliminary, AI-assisted skin health screening accessible, fast, and easy to understand for everyone—regardless of location, language, or immediate access to a dermatologist—while always directing users toward qualified medical care.

---

# End-to-End User Flow

1. User registers or logs in using Firebase Authentication (Google OAuth or Email/Password).
2. User uploads or captures a skin image.
3. The frontend validates the image and sends it to the Flask backend.
4. The backend preprocesses the image and performs inference using the EfficientNetB0 model.
5. A Grad-CAM heatmap is generated for visual explanation.
6. The backend returns the predicted disease, confidence score, severity, probabilities, and heatmap.
7. The frontend displays the prediction, disease information, and precautions.
8. The prediction is stored in Firestore.
9. Users can optionally:
   - Chat with the assistant
   - Find nearby dermatologists
   - Download a PDF report

---

# Multi-Image Consensus

For improved reliability, users can upload multiple images of the same skin condition. Each image is analysed independently, and the frontend combines the predictions into a consensus result, increasing confidence when multiple images agree.

<p align="center">
  <img src="https://github.com/user-attachments/assets/aeea94d4-e29c-4d79-b91f-1373afe17ba4" width="100%">
</p>

<p align="center">
  <img src="https://github.com/user-attachments/assets/0ce7bdde-d571-4766-8b3b-ab53bab09228" width="48%">
  <img src="https://github.com/user-attachments/assets/e4fde63a-8b10-41a8-900b-902283434623" width="48%">
</p>

---

# Find Dermatologist Module

- Developed a feature to help users locate nearby dermatology clinics.
- Integrated browser geolocation for location-based search.
- Used OpenStreetMap to display nearby dermatologists.
- Designed a responsive interface for displaying hospital information.
- Added one-click **Directions** support that redirects users to Google Maps for navigation.
- Improved accessibility and overall user experience.

<p align="center">
  <img src="https://github.com/user-attachments/assets/c15db33f-3d42-4ba2-bd8a-65aac3298610" width="100%">
</p>

---

#Deployment
-Frontend — Render
The React application is built with React Scripts and deployed as a static site on Render. Render builds the production bundle and serves it over HTTPS, giving the frontend an independent deployment lifecycle from the ML backend.

-Backend — Hugging Face Spaces
The Flask ML API is containerised with a python:3.10-slim base image, installs requirements.txt, and is deployed as a Docker-based Space on Hugging Face. The container runs Gunicorn on port 7860 (gunicorn app:app --bind 0.0.0.0:7860 --timeout 120 --workers 1), which keeps the deployment configuration consistent between local development and production.

-Firebase
Firebase Authentication and Firestore are used directly from the frontend as managed cloud services, requiring no separate deployment step beyond project configuration and security rules.

-Configuration
•	CORS is enabled on the Flask API (flask-cors) so the Render-hosted frontend can call the Hugging-Face-hosted backend across origins.
•	API keys and other secrets are kept in environment variables rather than committed to source control.
•	The backend listens on 0.0.0.0 with the port configurable via the PORT environment variable, so the same image runs unmodified locally, in Docker, and on Hugging Face.
