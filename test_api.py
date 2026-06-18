"""
Quick smoke test for the /predict endpoint.
Run with:  python test_api.py path/to/any_skin_image.jpg
"""

import sys
import requests

URL = "http://localhost:5000"

def test_health():
    r = requests.get(f"{URL}/health")
    print("Health:", r.status_code, r.json())
    assert r.status_code == 200

def test_predict(image_path):
    with open(image_path, "rb") as f:
        files = {"image": (image_path, f, "image/jpeg")}
        r = requests.post(f"{URL}/predict", files=files)

    print("\nStatus:", r.status_code)
    if r.ok:
        data = r.json()
        print("Disease   :", data["disease"])
        print("Confidence:", data["confidence"], "%")
        print("Severity  :", data["severity"])
        print("Top 3 probabilities:")
        for p in data["probabilities"][:3]:
            print(f"  {p['name']}: {p['score']}%")
    else:
        print("Error:", r.json())

if __name__ == "__main__":
    test_health()
    if len(sys.argv) > 1:
        test_predict(sys.argv[1])
    else:
        print("\nTip: Pass an image path to test predict:")
        print("  python test_api.py skin_sample.jpg")
