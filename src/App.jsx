import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import CameraFeed from './components/CameraFeed';
import PredictionDisplay from './components/PredictionDisplay';
import SentenceBuilder from './components/SentenceBuilder';
import SpeechControls from './components/SpeechControls';
import CustomGestureStudio from './components/CustomGestureStudio';
import FirebaseModal from './components/FirebaseModal';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import GestureModeSelector from './components/GestureModeSelector';

import { classifyGesture } from './services/gestureClassifier';
import { firebaseService } from './services/firebaseService';
import { speechService } from './services/speechService';

export default function App() {
  const [activeTab, setActiveTab] = useState('recognition');
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [rawResults, setRawResults] = useState(null);

  // Gesture Recognition Target Mode State ('alphabets' | 'numbers' | 'phrases' | 'all')
  const [gestureMode, setGestureMode] = useState('alphabets');
  const gestureModeRef = useRef('alphabets');

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

  // Same-frame holding counter matching fun_util.py (count_same_frame >= 12)
  const countSameFrameRef = useRef(0);
  const oldTextRef = useRef('');

  // Handle setting recognition target mode & sync with ref for real-time video loop
  const handleSetGestureMode = (newMode) => {
    setGestureMode(newMode);
    gestureModeRef.current = newMode;

    if (newMode === 'numbers') {
      setMode('calculator');
    } else if (newMode === 'alphabets') {
      setMode('text');
    }
  };

  // Handle incoming MediaPipe hand landmark detection results (Tasks Vision & Legacy)
  const handleLandmarksDetected = (results) => {
    setRawResults(results);

    const landmarksList = results?.landmarks || results?.multiHandLandmarks;

    if (landmarksList && landmarksList.length > 0) {
      const firstHand = landmarksList[0];
      const handedness = results?.handednesses?.[0]?.[0]?.displayName || results?.multiHandedness?.[0]?.label || 'Right';

      // Always pass the latest gestureModeRef value to avoid stale closures
      const currentPrediction = classifyGesture(firstHand, handedness, gestureModeRef.current);
      setPrediction(currentPrediction);

      // Frame Stability Counter matching fun_util.py
      const gestureKey = currentPrediction.action || currentPrediction.text;
      if (gestureKey && currentPrediction.confidence > 0.82) {
        if (oldTextRef.current === gestureKey) {
          countSameFrameRef.current += 1;
        } else {
          oldTextRef.current = gestureKey;
          countSameFrameRef.current = 0;
        }

        // When held continuously for ~12 frames
        if (countSameFrameRef.current >= 12) {
          countSameFrameRef.current = 0; // Reset counter

          if (mode === 'text') {
            if (currentPrediction.action === 'SPACE') {
              setSentence(prev => (prev.endsWith(' ') ? prev : prev + ' '));
              speechService.speak('Space');
            } else if (currentPrediction.action === 'DELETE') {
              setSentence(prev => {
                if (prev.length === 0) return '';
                const words = prev.trimEnd().split(' ');
                words.pop();
                return words.join(' ');
              });
              speechService.speak('Delete');
            } else {
              setSentence(prev => {
                let newWord = currentPrediction.text;
                let updated = prev + newWord;

                if (updated.startsWith('I/Me ')) {
                  updated = updated.replace('I/Me ', 'I ');
                } else if (updated.endsWith('I/Me ')) {
                  updated = updated.replace('I/Me ', 'me ');
                }

                speechService.speak(newWord.trim());
                return updated;
              });
            }
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
        description: 'Position hand inside green target box'
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
          <div className="recognition-workspace">
            {/* Separate Recognition Target Mode Tabs (Alphabets / Numbers / Phrases / All) */}
            <GestureModeSelector
              gestureMode={gestureMode}
              setGestureMode={handleSetGestureMode}
            />

            {/* Main Recognition Dashboard Grid */}
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
                  rawHandedness={rawResults?.handednesses?.[0]?.[0]?.displayName || rawResults?.multiHandedness?.[0]?.label}
                  gestureMode={gestureMode}
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
          </div>
        )}

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
        <p>AI-Based Sign Language Recognition System &copy; 2026 | Powered by MediaPipe Tasks Vision & Firebase</p>
      </footer>
    </div>
  );
}
