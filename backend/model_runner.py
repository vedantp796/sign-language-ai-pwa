"""
Unified Master Sign Language Model Runner (54 Classes)
Loads unified_gesture_manifest.json & gesture_db.db from backend directory.
"""

import os
import cv2
import json
import sqlite3
import numpy as np

BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
MANIFEST_PATH = os.path.join(BACKEND_DIR, 'unified_gesture_manifest.json')
DB_PATH = os.path.join(BACKEND_DIR, 'gesture_db.db')

def load_unified_manifest():
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH, 'r') as f:
            return json.load(f)
    elif os.path.exists(DB_PATH):
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        rows = cursor.execute("SELECT g_id, g_name, category, math_operator FROM gesture").fetchall()
        conn.close()
        return [{"id": r[0], "name": r[1], "category": r[2], "mathOperator": r[3]} for r in rows]
    return []

UNIFIED_MANIFEST = load_unified_manifest()
GESTURE_LABELS = { item["id"]: item["name"] for item in UNIFIED_MANIFEST }

class SignModelRunner:
    def __init__(self):
        self.manifest = UNIFIED_MANIFEST
        self.labels = GESTURE_LABELS
        print(f"✅ Initialized SignModelRunner with {len(self.labels)} Master Gesture Classes!")

    def predict_image(self, img):
        if img is None:
            return {"class_id": -1, "label": "Searching...", "confidence": 0, "category": "Standby"}

        # Return status & loaded classes list
        return {
            "status": "ready",
            "total_classes": len(self.labels),
            "manifest": self.manifest
        }

model_runner = SignModelRunner()
