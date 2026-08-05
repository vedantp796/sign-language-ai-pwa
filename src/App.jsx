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
import { speechService } from './services/speechService';

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
  const [mode, setMode] = useState('text'); // 'text' | 'calculator'
  const [isBlackboardView, setIsBlackboardView] = useState(false);
  const [isFirebaseOnline, setIsFirebaseOnline] = useState(firebaseService.isOnline);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  // Same-frame holding counter matching fun_util.py (count_same_frame > 20)
  const countSameFrameRef = useRef(0);
  const oldTextRef = useRef('');

  // Handle incoming MediaPipe hand landmark detection results
  const handleLandmarksDetected = (results) => {
    setRawResults(results);

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const firstHand = results.multiHandLandmarks[0];
      const handedness = results.multiHandedness[0]?.label || 'Right';

      const currentPrediction = classifyGesture(firstHand, handedness);
      setPrediction(currentPrediction);

      // Frame Stability Counter matching fun_util.py
      if (currentPrediction.text && currentPrediction.confidence > 0.85) {
        if (oldTextRef.current === currentPrediction.text) {
          countSameFrameRef.current += 1;
        } else {
          oldTextRef.current = currentPrediction.text;
          countSameFrameRef.current = 0;
        }

        // When held continuously for ~15-20 frames
        if (countSameFrameRef.current >= 15) {
          countSameFrameRef.current = 0; // Reset counter

          if (mode === 'text') {
            setSentence(prev => {
              let newWord = currentPrediction.text;
              let updated = prev + newWord;

              // I/Me replacement formatting from fun_util.py
              if (updated.startsWith('I/Me ')) {
                updated = updated.replace('I/Me ', 'I ');
              } else if (updated.endsWith('I/Me ')) {
                updated = updated.replace('I/Me ', 'me ');
              }

              // Speak character / phrase
              speechService.speak(newWord.trim());
              return updated;
            });
          }
        }
      }
    } else {
      setPrediction({
        name: 'Waiting for Hand...',
        text: '',
        confidence: 0,
        symbol: '🖐️',
        category: 'Standby',
        description: 'Position hand in front of camera'
      });
      oldTextRef.current = '';
      countSameFrameRef.current = 0;
    }
  };

  return (
    <div className={`app-container ${isBlackboardView ? 'blackboard-theme' : ''}`}>
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
          <div className={`dashboard-grid ${isBlackboardView ? 'blackboard-split' : ''}`}>
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
                mode={mode}
                setMode={setMode}
                isBlackboardView={isBlackboardView}
                setIsBlackboardView={setIsBlackboardView}
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
        <p>AI-Based Sign Language Recognition System &copy; 2026 | Powered by Keras 44-Class Model, MediaPipe & Firebase</p>
      </footer>
    </div>
  );
}
