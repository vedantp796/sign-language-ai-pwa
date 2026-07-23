import React, { useState } from 'react';
import { Cpu, Camera, Save, CheckCircle, Database } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { normalizeLandmarks } from '../utils/mathHelpers';

export default function CustomGestureStudio({ rawResults }) {
  const [gestureLabel, setGestureLabel] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedGestures, setSavedGestures] = useState([]);

  const currentLandmarks = rawResults && rawResults.multiHandLandmarks && rawResults.multiHandLandmarks.length > 0
    ? rawResults.multiHandLandmarks[0]
    : null;

  const handleSaveCustomSign = async () => {
    if (!gestureLabel || !gestureLabel.trim()) {
      alert("Please enter a custom sign name / label first.");
      return;
    }

    if (!currentLandmarks) {
      alert("No active hand detected in webcam feed. Hold hand in front of camera.");
      return;
    }

    const normalized = normalizeLandmarks(currentLandmarks);
    await firebaseService.saveCustomGesture(gestureLabel.trim(), normalized);

    setIsSaved(true);
    setSavedGestures(prev => [{ name: gestureLabel.trim(), count: normalized.length, timestamp: new Date().toLocaleTimeString() }, ...prev]);
    setGestureLabel('');

    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="studio-view-container glass-panel">
      <div className="studio-header">
        <div className="flex-align-center gap-2">
          <Cpu size={24} className="cyan-icon" />
          <div>
            <h2 className="section-title">Custom Gesture AI Studio</h2>
            <p className="section-subtitle">Capture 21-point landmark signatures & train custom signs in Firebase</p>
          </div>
        </div>
      </div>

      <div className="studio-grid">
        {/* Capture Panel */}
        <div className="studio-card glass-panel">
          <h3 className="card-title mb-4">Capture Hand Snapshot</h3>

          <div className="landmark-status-box mb-4">
            {currentLandmarks ? (
              <div className="flex-align-center gap-2 green-text">
                <CheckCircle size={18} />
                <span>21 Hand Joint Landmarks Active in Feed!</span>
              </div>
            ) : (
              <div className="flex-align-center gap-2 gray-text">
                <Camera size={18} />
                <span>No Hand Detected. Position hand in front of webcam...</span>
              </div>
            )}
          </div>

          <div className="form-group mb-4">
            <label className="control-label">Custom Sign Label / Word</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. Help, Emergency, Water, My Name..."
              value={gestureLabel}
              onChange={(e) => setGestureLabel(e.target.value)}
            />
          </div>

          <button
            className={`btn-primary width-full ${isSaved ? 'success' : ''}`}
            onClick={handleSaveCustomSign}
            disabled={!currentLandmarks}
          >
            <Save size={16} />
            <span>{isSaved ? 'Saved to Firebase!' : 'Record & Save Landmark Signature'}</span>
          </button>
        </div>

        {/* Saved Custom Signs List */}
        <div className="studio-card glass-panel">
          <h3 className="card-title mb-4">Custom Signed Library ({savedGestures.length})</h3>

          {savedGestures.length === 0 ? (
            <p className="gray-text">No custom signs recorded in this session yet.</p>
          ) : (
            <div className="custom-signs-list">
              {savedGestures.map((sg, idx) => (
                <div key={idx} className="custom-sign-item">
                  <div className="flex-align-center gap-2">
                    <Database size={16} className="cyan-icon" />
                    <strong>{sg.name}</strong>
                  </div>
                  <span className="timestamp">{sg.timestamp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
