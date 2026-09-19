"""
Python Backend Server - Sign Language Recognition API (54 Master Classes)
Framework: Flask + OpenCV + MediaPipe + Master SQLite Database (gesture_db.db)
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from model_runner import model_runner, GESTURE_LABELS, UNIFIED_MANIFEST

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "AI 54-Class Unified Sign Language Recognition Backend",
        "total_classes": len(GESTURE_LABELS),
        "database": "gesture_db.db"
    })

@app.route('/gestures', methods=['GET'])
def get_gestures():
    return jsonify({
        "total": len(GESTURE_LABELS),
        "manifest": UNIFIED_MANIFEST,
        "gestures": GESTURE_LABELS
    })

@app.route('/predict_frame', methods=['POST'])
def predict_frame():
    """
    Receives JSON body containing base64 encoded webcam image frame,
    runs master model inference, and returns prediction.
    """
    data = request.json
    if not data or 'image' not in data:
        return jsonify({"error": "No image payload provided"}), 400

    try:
        raw_b64 = data['image']
        if ',' in raw_b64:
            raw_b64 = raw_b64.split(',')[1]

        image_bytes = base64.b64decode(raw_b64)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if img is None:
            return jsonify({"error": "Failed to decode image frame"}), 400

        result = model_runner.predict_image(img)
        return jsonify({
            "success": True,
            "prediction": result
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Starting 54-Class Unified Sign Language Server on http://localhost:5000...")
    app.run(host='0.0.0.0', port=5000, debug=True)
