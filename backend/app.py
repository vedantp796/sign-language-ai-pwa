"""
Python Backend Server - Sign Language Recognition API
Framework: Flask / FastAPI + OpenCV + MediaPipe + PyTorch/TensorFlow
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
import mediapipe as mp

app = Flask(__name__)
CORS(app)

# Initialize MediaPipe Hands
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=2,
    min_detection_confidence=0.65,
    min_tracking_confidence=0.65
)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI Sign Language Recognition Python Backend",
        "version": "1.0.0"
    })

@app.route('/predict_landmarks', methods=['POST'])
def predict_landmarks():
    """
    Receives JSON body containing base64 encoded image frame or landmark array,
    runs MediaPipe & DL model classification, and returns prediction.
    """
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image payload provided"}), 400

    try:
        # Decode base64 image
        image_data = base64.b64decode(data['image'].split(',')[1] if ',' in data['image'] else data['image'])
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        results = hands.process(img_rgb)

        predictions = []

        if results.multi_hand_landmarks:
            for hand_landmarks, handedness in zip(results.multi_hand_landmarks, results.multi_handedness):
                landmarks_list = []
                for lm in hand_landmarks.landmark:
                    landmarks_list.append({"x": lm.x, "y": lm.y, "z": lm.z})

                # Landmark array (21 points)
                predictions.append({
                    "hand": handedness.classification[0].label,
                    "confidence": float(handedness.classification[0].score),
                    "landmarks_count": len(landmarks_list),
                    "landmarks": landmarks_list
                })

        return jsonify({
            "success": True,
            "detected_hands": len(predictions),
            "predictions": predictions
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting AI Sign Language Python Backend on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
