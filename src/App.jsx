import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CameraFeed from './components/CameraFeed';
import PredictionDisplay from './components/PredictionDisplay';
import SentenceBuilder from './components/SentenceBuilder';
import SpeechControls from './components/SpeechControls';
import GestureDictionary from './components/GestureDictionary';
import HistoryLog from './components/HistoryLog';
import CustomGestureStudio from './components/CustomGestureStudio';
import FirebaseModal from './components/FirebaseModal';
import PwaInstallPrompt from './components/PwaInstallPrompt';

import { classifyGesture } from './services/gestureClassifier';
import { firebaseService } from './services/firebaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState('recognition');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [rawResults, setRawResults] = useState(null);
  const [prediction, setPrediction] = useState({
    name: 'Searching...',
    text: '',
    confidence: 0,
    symbol: '🖐️',
    category: 'Standby'
  });

  const [sentence, setSentence] = useState('');
  const [isFirebaseOnline, setIsFirebaseOnline] = useState(firebaseService.isOnline);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Auto-accumulation buffer state
  const lastGestureRef = useRef('');
  const gestureHoldTimerRef = useRef(null);

  // Handle incoming MediaPipe hand landmark detection results
  const handleLandmarksDetected = (results) => {
    setRawResults(results);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const firstHand = results.multiHandLandmarks[0];
      const handedness = results.multiHandedness[0]?.label || 'Right';

      const currentPrediction = classifyGesture(firstHand, handedness);
      setPrediction(currentPrediction);

      // Auto-append recognized text to sentence buffer if held for ~1 second
      if (currentPrediction.text && currentPrediction.confidence > 0.88) {
        if (lastGestureRef.current !== currentPrediction.text) {
          lastGestureRef.current = currentPrediction.text;

          if (gestureHoldTimerRef.current) clearTimeout(gestureHoldTimerRef.current);

          gestureHoldTimerRef.current = setTimeout(() => {
            setSentence(prev => {
              // Append letter or phrase with proper spacing
              if (currentPrediction.category === 'Phrase') {
                return prev ? `${prev.trim()} ${currentPrediction.text} ` : `${currentPrediction.text} `;
              } else {
                return prev + currentPrediction.text;
              }
            });
          }, 1100);
        }
      }
    } else {
      setPrediction({
        name: 'Waiting for Hand...',
        text: '',
        confidence: 0,
        symbol: '🖐️',
        category: 'Standby',
        description: 'Position hand clearly in front of webcam'
      });
      lastGestureRef.current = '';
    }
  };

  return (
    <div className="app-container">
      {/* Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCameraActive={isCameraActive}
        isFirebaseOnline={isFirebaseOnline}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'recognition' && (
          <div className="dashboard-grid">
            <div className="left-column">
              <CameraFeed
                onLandmarksDetected={handleLandmarksDetected}
                isCameraActive={isCameraActive}
                setIsCameraActive={setIsCameraActive}
              />
            </div>

            <div className="right-column">
              <PredictionDisplay
                prediction={prediction}
                rawHandedness={rawResults?.multiHandedness?.[0]?.label}
              />

              <SentenceBuilder
                sentence={sentence}
                setSentence={setSentence}
                currentPrediction={prediction}
              />

              <SpeechControls />
            </div>
          </div>
        )}

        {activeTab === 'dictionary' && <GestureDictionary />}

        {activeTab === 'history' && <HistoryLog />}

        {activeTab === 'studio' && <CustomGestureStudio rawResults={rawResults} />}
      </main>

      {/* PWA Floating Install Prompt */}
      <PwaInstallPrompt />

      {/* Firebase Configuration Modal */}
      <FirebaseModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="app-footer glass-panel">
        <p>AI-Based Sign Language Recognition System &copy; 2026 | Powered by React, MediaPipe, Web Speech API & Firebase Firestore</p>
      </footer>
    </div>
  );
}
