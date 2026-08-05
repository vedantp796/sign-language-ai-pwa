"""
Desktop OpenCV Sign Language Recognition Application
Features: Text Mode, Calculator Mode, Blackboard Split View, Speech Synthesis
"""

import sys
import os

# Add Sign-Language folder to Python path
base_dir = os.path.dirname(os.path.abspath(__file__))
sign_lang_dir = os.path.join(base_dir, 'Sign-Language')
if sign_lang_dir not in sys.path:
    sys.path.insert(0, sign_lang_dir)

try:
    import fun_util
    print("=" * 60)
    print(" Starting AI Sign Language Recognition Desktop Application...")
    print(" Modes: Press 't' for Text Mode, 'c' for Calculator Mode, 'v' to Toggle Voice, 'q' to Quit")
    print("=" * 60)
    fun_util.recognize()
except Exception as e:
    print(f"Error starting desktop sign language app: {e}")
    print("Please ensure opencv-python, tensorflow, keras, and pyttsx3 are installed:")
    print("pip install opencv-python tensorflow keras pyttsx3")
