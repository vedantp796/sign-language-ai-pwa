# 🤟 AI-Based Sign Language Recognition System (PWA + Firebase)

An intelligent, real-time sign language recognition Progressive Web App (PWA) built with **React**, **MediaPipe 21-Point Hand Landmark Tracking**, **Web Speech API (Text-to-Speech)**, and **Firebase Firestore Database**.

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-cyan.svg)
![Vite](https://img.shields.io/badge/Vite-6-purple.svg)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-green.svg)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange.svg)

---

## 📌 Abstract

Communication is one of the most fundamental aspects of human interaction. However, for individuals who are deaf or speech-impaired, communicating with people unfamiliar with sign language remains a significant challenge. This project presents an **AI-Based Sign Language Recognition System** that utilizes computer vision and deep learning to recognize hand gestures in real time, converting them into readable text and audible speech.

The system captures live video through a webcam, processes video frames using MediaPipe to accurately detect 21 hand landmark points, and classifies performed gestures into corresponding letters, numbers, or phrases. Recognized outputs are assembled into meaningful sentences and converted into speech using a Text-to-Speech engine, backed by Firebase Firestore database synchronization.

---

## ✨ Features

- 📱 **Progressive Web App (PWA)**: Installable on Windows, macOS, iOS, and Android with offline Service Worker support.
- 🖐️ **MediaPipe 21 Hand Landmark Tracking**: 60 FPS in-browser 3D joint landmark extraction and skeleton overlay canvas rendering.
- 🧠 **AI Gesture Classifier Engine**: Classifies ASL Alphabets (A-Z), Numbers (0-9), and Common Phrases (*Hello, Peace, Thumbs Up, Thumbs Down, I Love You, Rock On, Call Me, OK Sign, Pinch, Fist*).
- 🔊 **Text-To-Speech (TTS) Engine**: Web Speech API integration with voice selection, speech rate, pitch, and volume sliders.
- 🔥 **Firebase Firestore Database**: Syncs translation records, gesture logs, and custom landmark training sets to the cloud. Includes a local storage fallback mode for instant keyless usage.
- 📚 **Sign Language Reference Dictionary**: Visual catalog of standard ASL signs with finger posture guides.
- 🧪 **Custom Gesture Studio**: Capture live 21-point hand landmark snapshots to train custom signs.
- 🐍 **Optional Python Backend**: Included Flask + OpenCV + MediaPipe + PyTorch backend architecture under `/backend`.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Vite, Vanilla CSS (Glassmorphism design system)
- **Computer Vision & AI**: MediaPipe Hands (`@mediapipe/hands`), JavaScript geometry & vector math
- **Speech**: Web Speech API (`SpeechSynthesis`)
- **Database**: Firebase Firestore & Firebase Authentication
- **PWA**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`)
- **Backend (Optional)**: Python, Flask, OpenCV, PyTorch/TensorFlow

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/<YOUR_USERNAME>/sign-language-ai-pwa.git
   cd sign-language-ai-pwa
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

4. **Build Production Bundle**
   ```bash
   npm run build
   ```

---

## 📁 Repository Structure

```
.
├── public/
│   ├── manifest.webmanifest   # PWA manifest
│   ├── sw.js                  # PWA service worker
│   └── favicon.ico
├── src/
│   ├── components/            # React UI components
│   │   ├── Navbar.jsx
│   │   ├── CameraFeed.jsx
│   │   ├── PredictionDisplay.jsx
│   │   ├── SentenceBuilder.jsx
│   │   ├── SpeechControls.jsx
│   │   ├── GestureDictionary.jsx
│   │   ├── HistoryLog.jsx
│   │   ├── CustomGestureStudio.jsx
│   │   ├── FirebaseModal.jsx
│   │   └── PwaInstallPrompt.jsx
│   ├── services/              # AI, Vision, Speech & Firebase services
│   │   ├── mediapipeService.js
│   │   ├── gestureClassifier.js
│   │   ├── speechService.js
│   │   └── firebaseService.js
│   ├── utils/
│   │   ├── aslDictionaryData.js
│   │   └── mathHelpers.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── backend/                   # Python Flask reference server
│   ├── app.py
│   └── requirements.txt
├── index.html
├── vite.config.js
└── package.json
```

---

## 📄 License

This project is licensed under the MIT License.
