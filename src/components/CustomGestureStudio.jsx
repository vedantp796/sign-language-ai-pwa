import React, { useState } from 'react';
import { Cpu, Camera, Save, CheckCircle, Database, Download, FileText, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { normalizeLandmarks, getDistance } from '../utils/mathHelpers';

export default function CustomGestureStudio({ rawResults }) {
  const [gestureLabel, setGestureLabel] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedGestures, setSavedGestures] = useState([]);
  const [activeTab, setActiveTab] = useState('capture');

  const landmarksList = rawResults?.landmarks || rawResults?.multiHandLandmarks;
  const currentLandmarks = landmarksList && landmarksList.length > 0 ? landmarksList[0] : null;

  // Record Landmark Signature
  const handleSaveCustomSign = async () => {
    if (!gestureLabel || !gestureLabel.trim()) {
      alert("Please enter a custom sign name or label first.");
      return;
    }

    if (!currentLandmarks) {
      alert("No active hand detected in webcam feed. Hold hand facing the camera.");
      return;
    }

    const normalized = normalizeLandmarks(currentLandmarks);
    const newRecord = {
      id: Date.now(),
      name: gestureLabel.trim(),
      landmarks: normalized,
      rawPoints: currentLandmarks,
      timestamp: new Date().toLocaleTimeString(),
      dateISO: new Date().toISOString()
    };

    // Save to local session & Firebase
    setSavedGestures(prev => [newRecord, ...prev]);
    await firebaseService.saveCustomGesture(gestureLabel.trim(), normalized);

    setIsSaved(true);
    setGestureLabel('');
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Live Match Evaluator
  let liveMatch = null;
  if (currentLandmarks && savedGestures.length > 0) {
    const currentNorm = normalizeLandmarks(currentLandmarks);
    let bestScore = Infinity;
    let bestSign = null;

    savedGestures.forEach(saved => {
      let sumDist = 0;
      for (let i = 0; i < 21; i++) {
        if (currentNorm[i] && saved.landmarks[i]) {
          sumDist += getDistance(currentNorm[i], saved.landmarks[i]);
        }
      }
      const avgDist = sumDist / 21;
      if (avgDist < bestScore) {
        bestScore = avgDist;
        bestSign = saved;
      }
    });

    if (bestScore < 0.22 && bestSign) {
      const matchPercent = Math.max(0, Math.min(100, Math.round((1 - bestScore / 0.25) * 100)));
      liveMatch = { sign: bestSign.name, matchPercent };
    }
  }

  // Export Dataset as JSON
  const handleExportJSON = () => {
    if (savedGestures.length === 0) {
      alert("No recorded gestures to export. Record at least one sign.");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedGestures, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `asl_custom_dataset_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Dataset as CSV (63 Features + Label)
  const handleExportCSV = () => {
    if (savedGestures.length === 0) {
      alert("No recorded gestures to export. Record at least one sign.");
      return;
    }

    // Header: label, x0, y0, z0, ..., x20, y20, z20
    const headers = ['label'];
    for (let i = 0; i < 21; i++) {
      headers.push(`x${i}`, `y${i}`, `z${i}`);
    }

    const rows = savedGestures.map(item => {
      const row = [item.name];
      item.landmarks.forEach(p => {
        row.push(p.x.toFixed(6), p.y.toFixed(6), (p.z || 0).toFixed(6));
      });
      return row.join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `asl_landmark_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="studio-container">
      {/* Studio Header */}
      <div className="dictionary-header glass-panel glow-border">
        <div className="flex-align-center justify-between flex-wrap gap-4">
          <div className="flex-align-center gap-3">
            <div className="logo-icon">
              <Cpu size={24} />
            </div>
            <div>
              <h2 className="section-title">Custom Gesture AI Studio</h2>
              <p className="section-subtitle">Record 21-point hand landmark signatures, test custom signs, and export ML datasets (JSON/CSV)</p>
            </div>
          </div>

          <div className="flex-align-center gap-2">
            <button className="btn-action-sm" onClick={handleExportJSON} disabled={savedGestures.length === 0}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>
            <button className="btn-action-sm success" onClick={handleExportCSV} disabled={savedGestures.length === 0}>
              <FileText size={14} />
              <span>Export CSV (ML Dataset)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="studio-grid">
        {/* Left Column: Capture & Live Test */}
        <div className="studio-card glass-panel">
          <h3 className="card-title flex-align-center gap-2">
            <Camera size={18} className="cyan-icon" />
            <span>Hand Landmark Snapshot Recorder</span>
          </h3>

          <div className="landmark-status-box">
            {currentLandmarks ? (
              <div className="flex-align-center gap-2 green-text">
                <CheckCircle size={18} className="green-icon" />
                <span>21 Hand Joint Landmarks Active in Feed!</span>
              </div>
            ) : (
              <div className="flex-align-center gap-2 gray-text">
                <Camera size={18} />
                <span>Position hand facing webcam to capture landmark vector...</span>
              </div>
            )}
          </div>

          {/* Live Match Notification */}
          {liveMatch && (
            <div className="live-match-box glass-panel glow-border">
              <div className="flex-align-center gap-2">
                <Zap className="neon-icon" size={18} />
                <span className="match-title">Custom Sign Match: <strong>{liveMatch.sign}</strong></span>
              </div>
              <span className="match-val">{liveMatch.matchPercent}% Match Score</span>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">Custom Gesture Label / Word</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. Help, Emergency, Water, My Name..."
              value={gestureLabel}
              onChange={(e) => setGestureLabel(e.target.value)}
            />
          </div>

          <button
            className={`btn-primary ${isSaved ? 'success' : ''}`}
            onClick={handleSaveCustomSign}
            disabled={!currentLandmarks}
          >
            <Save size={16} />
            <span>{isSaved ? 'Saved to Dataset!' : 'Record 21-Point Landmark Signature'}</span>
          </button>
        </div>

        {/* Right Column: Recorded Dataset Table */}
        <div className="studio-card glass-panel">
          <div className="flex-align-center justify-between">
            <h3 className="card-title flex-align-center gap-2">
              <Database size={18} className="cyan-icon" />
              <span>Recorded Custom Dataset ({savedGestures.length})</span>
            </h3>
            {savedGestures.length > 0 && (
              <button className="btn-action-sm danger" onClick={() => setSavedGestures([])}>
                <span>Clear All</span>
              </button>
            )}
          </div>

          {savedGestures.length === 0 ? (
            <p className="sentence-placeholder" style={{ padding: '20px 0' }}>
              No custom landmark samples recorded in this session yet. Hold your hand in front of the camera and click Record!
            </p>
          ) : (
            <div className="captured-list">
              {savedGestures.map(item => (
                <div key={item.id} className="captured-item">
                  <div className="flex-align-center gap-2">
                    <Sparkles size={16} className="cyan-icon" />
                    <div>
                      <strong>{item.name}</strong>
                      <div className="timestamp" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                        21 Points Normalized • Recorded at {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <span className="mode-count-tag">Normalized</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
