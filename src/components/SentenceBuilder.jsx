import React, { useState, useEffect } from 'react';
import { Volume2, Copy, Delete, Trash2, Space, CloudUpload, Check, Calculator, Type, Monitor } from 'lucide-react';
import confetti from 'canvas-confetti';
import { speechService } from '../services/speechService';
import { firebaseService } from '../services/firebaseService';

export default function SentenceBuilder({
  sentence,
  setSentence,
  currentPrediction,
  mode,
  setMode,
  isBlackboardView,
  setIsBlackboardView
}) {
  const [copied, setCopied] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Calculator Mode State
  const [calcExpression, setCalcExpression] = useState('');
  const [calcResult, setCalcResult] = useState('');

  // Handle calculator sign inputs
  useEffect(() => {
    if (mode === 'calculator' && currentPrediction?.text) {
      const txt = currentPrediction.text.trim();
      const num = parseInt(txt);

      if (!isNaN(num)) {
        setCalcExpression(prev => prev + txt);
      } else if (txt === 'C' || txt === 'Clear') {
        setCalcExpression('');
        setCalcResult('');
      }
    }
  }, [currentPrediction, mode]);

  const handleEvaluateCalc = () => {
    try {
      if (!calcExpression) return;
      const evalRes = Function(`"use strict"; return (${calcExpression})`)();
      setCalcResult(String(evalRes));
      speechService.speak(`${calcExpression} equals ${evalRes}`);
    } catch (e) {
      setCalcResult('Invalid Operation');
      speechService.speak('Invalid Operation');
    }
  };

  const handleSpeak = () => {
    const textToSpeak = mode === 'calculator' ? `${calcExpression} ${calcResult ? 'equals ' + calcResult : ''}` : sentence;
    if (!textToSpeak || textToSpeak.trim() === '') return;
    setIsSpeaking(true);
    speechService.speak(textToSpeak, () => setIsSpeaking(false));
  };

  const handleCopy = () => {
    const textToCopy = mode === 'calculator' ? `${calcExpression} = ${calcResult}` : sentence;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBackspace = () => {
    if (mode === 'calculator') {
      setCalcExpression(prev => prev.slice(0, -1));
    } else {
      setSentence(prev => {
        if (prev.length === 0) return '';
        const words = prev.trimEnd().split(' ');
        words.pop();
        return words.join(' ');
      });
    }
  };

  const handleAddSpace = () => {
    setSentence(prev => (prev.endsWith(' ') ? prev : prev + ' '));
  };

  const handleClear = () => {
    if (mode === 'calculator') {
      setCalcExpression('');
      setCalcResult('');
    } else {
      setSentence('');
    }
  };

  const handleSaveToVault = async () => {
    const textToSave = mode === 'calculator' ? `${calcExpression} = ${calcResult}` : sentence;
    if (!textToSave || textToSave.trim() === '') return;
    try {
      await firebaseService.saveHistoryRecord(textToSave.trim(), 1, currentPrediction?.name || 'Recognized Gesture');
      setSavedToHistory(true);

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 }
      });

      setTimeout(() => setSavedToHistory(false), 3000);
    } catch (e) {
      console.error("Save error:", e);
    }
  };

  return (
    <div className={`sentence-builder-card glass-panel glow-border ${isBlackboardView ? 'blackboard-mode' : ''}`}>
      <div className="sentence-header">
        <div className="flex-align-center gap-2">
          {/* Mode Selector */}
          <div className="mode-toggle-group">
            <button
              className={`mode-btn ${mode === 'text' ? 'active' : ''}`}
              onClick={() => setMode('text')}
            >
              <Type size={14} />
              <span>Text Assembly</span>
            </button>

            <button
              className={`mode-btn ${mode === 'calculator' ? 'active' : ''}`}
              onClick={() => setMode('calculator')}
            >
              <Calculator size={14} />
              <span>Math Calculator</span>
            </button>
          </div>
        </div>

        <div className="flex-align-center gap-2">
          <button
            className={`btn-action-sm ${isBlackboardView ? 'active' : ''}`}
            onClick={() => setIsBlackboardView(!isBlackboardView)}
            title="Toggle Blackboard Demonstration View"
          >
            <Monitor size={14} />
            <span>{isBlackboardView ? 'Normal View' : 'Blackboard View'}</span>
          </button>

          <button
            className={`btn-action-sm ${savedToHistory ? 'success' : 'primary'}`}
            onClick={handleSaveToVault}
            disabled={mode === 'calculator' ? !calcExpression : !sentence.trim()}
          >
            {savedToHistory ? <Check size={14} /> : <CloudUpload size={14} />}
            <span>{savedToHistory ? 'Saved to Vault!' : 'Save Transcript'}</span>
          </button>
        </div>
      </div>

      {/* Main Display Box */}
      <div className="sentence-display-box">
        {mode === 'calculator' ? (
          <div className="calculator-display">
            <span className="calc-exp">{calcExpression || 'Perform number gestures to calculate...'}</span>
            {calcResult && <span className="calc-res"> = {calcResult}</span>}
          </div>
        ) : sentence ? (
          <p className="sentence-text">{sentence}</p>
        ) : (
          <p className="sentence-placeholder">
            Form sign gestures facing webcam (~12 frames) to auto-append characters & words...
          </p>
        )}
      </div>

      {/* Toolbar Controls */}
      <div className="sentence-toolbar">
        <div className="left-controls">
          <button
            className={`btn-control speak ${isSpeaking ? 'speaking-pulse' : ''}`}
            onClick={handleSpeak}
            disabled={mode === 'calculator' ? !calcExpression : !sentence.trim()}
          >
            <Volume2 size={18} />
            <span>{isSpeaking ? 'Speaking...' : 'Speak Text'}</span>
          </button>

          {mode === 'calculator' && (
            <button
              className="btn-control primary"
              onClick={handleEvaluateCalc}
              disabled={!calcExpression}
            >
              <span>= Calculate</span>
            </button>
          )}

          <button
            className="btn-control copy"
            onClick={handleCopy}
            disabled={mode === 'calculator' ? !calcExpression : !sentence.trim()}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied!' : 'Copy Transcript'}</span>
          </button>
        </div>

        <div className="right-controls">
          {mode === 'text' && (
            <button className="btn-control icon-only" onClick={handleAddSpace} title="Add Space">
              <Space size={18} />
            </button>
          )}

          <button className="btn-control icon-only" onClick={handleBackspace} title="Delete Last">
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
