"""
44-Class Keras CNN Model Runner for Sign Language Recognition
Loads cnn_model_keras2.h5 and hist file from Sign-Language folder.
"""

import os
import cv2
import pickle
import numpy as np
from keras.models import load_model

# 44 Gesture Class Labels mapping (from gesture_db.db)
GESTURE_LABELS = {
    0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'F', 6: 'G', 7: 'H', 8: 'I', 9: 'J',
    10: 'K', 11: 'L', 12: 'M', 13: 'N', 14: 'O', 15: 'P', 16: 'Q', 17: 'R', 18: 'S', 19: 'T',
    20: 'U', 21: 'V', 22: 'W', 23: 'X', 24: 'Y', 25: 'Z',
    26: '0', 27: '1', 28: '2', 29: '3', 30: '4', 31: '5', 32: '6', 33: '7', 34: '8', 35: '9',
    36: 'Best of Luck', 37: 'You', 38: 'I/Me', 39: 'Like', 40: 'Remember', 41: 'Love', 42: 'Fuck', 43: 'I love you'
}

class SignModelRunner:
    def __init__(self, model_path=None, hist_path=None):
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        if not model_path:
            model_path = os.path.join(base_dir, 'Sign-Language', 'cnn_model_keras2.h5')
        if not hist_path:
            hist_path = os.path.join(base_dir, 'Sign-Language', 'hist')

        self.model_path = model_path
        self.hist_path = hist_path
        self.model = None
        self.hist = None
        self.img_x = 50
        self.img_y = 50
        self.load_resources()

    def load_resources(self):
        if os.path.exists(self.model_path):
            try:
                self.model = load_model(self.model_path)
                print(f"Loaded Keras CNN model from {self.model_path}")
            except Exception as e:
                print(f"Error loading Keras model: {e}")
        else:
            print(f"Model path not found: {self.model_path}")

        if os.path.exists(self.hist_path):
            try:
                with open(self.hist_path, "rb") as f:
                    self.hist = pickle.load(f)
                print(f"Loaded skin histogram from {self.hist_path}")
            except Exception as e:
                print(f"Error loading skin histogram: {e}")

    def preprocess_crop(self, img_crop):
        if img_crop is None or img_crop.size == 0:
            return None
        resized = cv2.resize(img_crop, (self.img_x, self.img_y))
        normalized = np.array(resized, dtype=np.float32)
        reshaped = np.reshape(normalized, (1, self.img_x, self.img_y, 1))
        return reshaped

    def predict_image(self, img):
        """
        Processes BGR image through HSV skin thresholding & CNN model prediction.
        """
        if self.model is None:
            return {"error": "Model not loaded"}

        h, w = img.shape[:2]
        x, y, crop_w, crop_h = int(w * 0.45), int(h * 0.15), int(w * 0.45), int(h * 0.55)
        crop_w = min(crop_w, w - x)
        crop_h = min(crop_h, h - y)

        if crop_w <= 0 or crop_h <= 0:
            return {"prediction": "None", "confidence": 0}

        img_crop = img[y:y+crop_h, x:x+crop_w]

        if self.hist is not None:
            img_hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            dst = cv2.calcBackProject([img_hsv], [0, 1], self.hist, [0, 180, 0, 256], 1)
            disc = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (10, 10))
            cv2.filter2D(dst, -1, disc, dst)
            blur = cv2.GaussianBlur(dst, (11, 11), 0)
            blur = cv2.medianBlur(blur, 15)
            thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
            thresh = cv2.merge((thresh, thresh, thresh))
            thresh = cv2.cvtColor(thresh, cv2.COLOR_BGR2GRAY)
            thresh_crop = thresh[y:y+crop_h, x:x+crop_w]
        else:
            thresh_crop = cv2.cvtColor(img_crop, cv2.COLOR_BGR2GRAY)
            _, thresh_crop = cv2.threshold(thresh_crop, 127, 255, cv2.THRESH_BINARY)

        contours, _ = cv2.findContours(thresh_crop.copy(), cv2.RETR_TREE, cv2.CHAIN_APPROX_NONE)
        if len(contours) > 0:
            contour = max(contours, key=cv2.contourArea)
            if cv2.contourArea(contour) > 8000:
                x1, y1, w1, h1 = cv2.boundingRect(contour)
                save_img = thresh_crop[y1:y1+h1, x1:x1+w1]

                if w1 > h1:
                    save_img = cv2.copyMakeBorder(save_img, int((w1-h1)/2), int((w1-h1)/2), 0, 0, cv2.BORDER_CONSTANT, (0, 0, 0))
                elif h1 > w1:
                    save_img = cv2.copyMakeBorder(save_img, 0, 0, int((h1-w1)/2), int((h1-w1)/2), cv2.BORDER_CONSTANT, (0, 0, 0))

                processed = self.preprocess_crop(save_img)
                if processed is not None:
                    pred_probab = self.model.predict(processed, verbose=0)[0]
                    pred_class = int(np.argmax(pred_probab))
                    confidence = float(pred_probab[pred_class])
                    label = GESTURE_LABELS.get(pred_class, f"Sign_{pred_class}")

                    category = "Alphabet" if pred_class <= 25 else ("Number" if pred_class <= 35 else "Phrase")

                    return {
                        "class_id": pred_class,
                        "label": label,
                        "confidence": round(confidence, 4),
                        "category": category
                    }

        return {"class_id": -1, "label": "Searching...", "confidence": 0, "category": "Standby"}

model_runner = SignModelRunner()
