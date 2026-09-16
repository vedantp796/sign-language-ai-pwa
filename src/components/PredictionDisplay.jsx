import React from 'react';
import { Sparkles, CheckCircle2, ShieldCheck, Hand, Target } from 'lucide-react';

export default function PredictionDisplay({ prediction, rawHandedness, gestureMode = 'alphabets' }) {
  const { name, text, category, confidence, symbol, description } = prediction || {
    name: 'Waiting for Hand...',
    confidence: 0,
    symbol: '🖐️',
    category: 'Standby'
  };

  const confidencePercent = Math.round((confidence || 0) * 100);

  const getModeLabel = (mode) => {
    switch (mode) {
      case 'alphabets': return '🔤 Alphabets Mode (A-Z)';
      case 'numbers': return '🔢 Numbers Mode (0-9)';
      case 'phrases': return '💬 Phrases Mode';
      default: return '🌐 All Gestures Mode';
    }
  };

  return (
    <div className="prediction-card glass-panel glow-border">
      <div className="prediction-header">
        <div className="flex-align-center gap-2">
          <Sparkles className="neon-icon" size={20} />
          <h3 className="card-title">Real-Time AI Prediction</h3>
        </div>

        <div className="flex-align-center gap-2">
          <span className="badge-mode-active">
            <Target size={13} />
            <span>{getModeLabel(gestureMode)}</span>
          </span>

          <span className="badge-handedness">
            <Hand size={14} />
            <span>{rawHandedness || 'Right'} Hand</span>
          </span>
        </div>
      </div>

      <div className="prediction-body">
        <div className="symbol-circle pulse-glow">
          <span className="gesture-symbol">{symbol || '🖐️'}</span>
        </div>

        <div className="prediction-details">
          <div className="category-tag">{category || 'Gesture'}</div>
          <h2 className="prediction-title">{name}</h2>
          <p className="prediction-desc">{description || 'Show sign clearly in front of camera'}</p>

          <div className="confidence-container">
            <div className="confidence-label-row">
              <span className="flex-align-center gap-1">
                <ShieldCheck size={14} className="cyan-icon" />
                <span>Confidence Metric</span>
              </span>
              <span className="confidence-value">{confidencePercent}%</span>
            </div>
            <div className="progress-bar-track">
              <div
                className="progress-bar-fill"
                style={{ width: `${confidencePercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="prediction-footer">
        <div className="joint-stat">
          <CheckCircle2 size={15} className="green-icon" />
          <span>21 MediaPipe Joint Coordinates Scoped to {gestureMode.toUpperCase()} Mode</span>
        </div>
      </div>
    </div>
  );
}
