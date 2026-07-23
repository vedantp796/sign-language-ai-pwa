import React, { useState } from 'react';
import { Volume2, Copy, Delete, Trash2, Space, CloudUpload, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speechService } from '../services/speechService';
import { firebaseService } from '../services/firebaseService';

export default function SentenceBuilder({ sentence, setSentence, currentPrediction }) {
  const [copied, setCopied] = useState(false);
  const [savedToFirebase, setSavedToFirebase] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!sentence || sentence.trim() === '') return;
    setIsSpeaking(true);
    speechService.speak(sentence, () => setIsSpeaking(false));
  };

  const handleCopy = () => {
    if (!sentence) return;
    navigator.clipboard.writeText(sentence);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackspace = () => {
    setSentence(prev => {
      if (prev.length === 0) return '';
      // If ends with space, remove space or last word
      const words = prev.trimEnd().split(' ');
      words.pop();
      return words.join(' ');
    });
  };

  const handleAddSpace = () => {
    setSentence(prev => (prev.endsWith(' ') ? prev : prev + ' '));
  };

  const handleClear = () => {
    setSentence('');
  };

  const handleSaveToFirestore = async () => {
    if (!sentence || sentence.trim() === '') return;
    try {
      await firebaseService.saveHistoryRecord(sentence.trim(), 1, currentPrediction?.name || 'Translated Sign');
      setSavedToFirebase(true);

      // Trigger Confetti Effect
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      setTimeout(() => setSavedToFirebase(false), 3000);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  return (
    <div className="sentence-builder-card glass-panel glow-border">
      <div className="sentence-header">
        <div className="flex-align-center gap-2">
          <span className="badge-live-pulse">TRANSCRIPT</span>
          <h3 className="card-title">Translated Sentence Buffer</h3>
        </div>
        <div className="flex-align-center gap-2">
          <button
            className={`btn-action-sm ${savedToFirebase ? 'success' : 'primary'}`}
            onClick={handleSaveToFirestore}
            disabled={!sentence.trim()}
          >
            {savedToFirebase ? <Check size={14} /> : <CloudUpload size={14} />}
            <span>{savedToFirebase ? 'Saved to Firestore!' : 'Save to Firestore'}</span>
          </button>
        </div>
      </div>

      <div className="sentence-display-box">
        {sentence ? (
          <p className="sentence-text">{sentence}</p>
        ) : (
          <p className="sentence-placeholder">
            Perform sign gestures facing the camera to build words & sentences...
          </p>
        )}
      </div>

      <div className="sentence-toolbar">
        <div className="left-controls">
          <button
            className={`btn-control speak ${isSpeaking ? 'speaking-pulse' : ''}`}
            onClick={handleSpeak}
            disabled={!sentence.trim()}
          >
            <Volume2 size={18} />
            <span>{isSpeaking ? 'Speaking...' : 'Speak Text'}</span>
          </button>

          <button
            className="btn-control copy"
            onClick={handleCopy}
            disabled={!sentence.trim()}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        <div className="right-controls">
          <button className="btn-control icon-only" onClick={handleAddSpace} title="Add Space">
            <Space size={18} />
          </button>

          <button className="btn-control icon-only" onClick={handleBackspace} title="Delete Last Word">
            <Delete size={18} />
          </button>

          <button className="btn-control icon-only danger" onClick={handleClear} title="Clear All">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
