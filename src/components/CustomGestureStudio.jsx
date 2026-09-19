import React, { useState } from 'react';
import { Cpu, Camera, Save, CheckCircle, Database, Download, FileText, Sparkles, Zap } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { normalizeLandmarks, getDistance } from '../utils/mathHelpers';

export default function CustomGestureStudio({ rawResults }) {
  const [gestureLabel, setGestureLabel] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [savedGestures, setSavedGestures] = useState([]);

  const landmarksList = rawResults?.landmarks || rawResults?.multiHandLandmarks;
  const currentLandmarks = landmarksList && landmarksList.length > 0 ? landmarksList[0] : null;

  // Record Landmark Signature
  const handleSaveCustomSign = async () => {
    if (!gestureLabel || !gestureLabel.trim()) {
      alert("Please enter a sign name or word first.");
      return;
    }

    if (!currentLandmarks) {
      alert("No active hand detected in camera. Position your hand clearly facing the camera.");
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

  // Export Signs as Backup JSON
  const handleExportJSON = () => {
    if (savedGestures.length === 0) {
      alert("No recorded gestures to backup yet. Record at least one sign.");
      return;
    }

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(savedGestures, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `my_custom_signs_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export Dataset as CSV
  const handleExportCSV = () => {
    if (savedGestures.length === 0) {
      alert("No recorded gestures to export yet. Record at least one sign.");
      return;
    }

    const headers = ['sign_label'];
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
    link.setAttribute("download", `custom_signs_export_${Date.now()}.csv`);
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
              <h2 className="section-title">Custom Sign Studio</h2>
              <p className="section-subtitle">Teach the AI new sign gestures, test your signs live, and save custom dictionaries.</p>
            </div>
          </div>

          <div className="flex-align-center gap-2">
            <button className="btn-action-sm" onClick={handleExportJSON} disabled={savedGestures.length === 0}>
              <Download size={14} />
              <span>Backup Signs (JSON)</span>
            </button>
            <button className="btn-action-sm success" onClick={handleExportCSV} disabled={savedGestures.length === 0}>
              <FileText size={14} />
              <span>Export Spreadsheet (CSV)</span>
            </button>
          </div>
        </div>
      </div>

      <div className="studio-grid">
        {/* Left Column: Capture & Live Test */}
        <div className="studio-card glass-panel">
          <h3 className="card-title flex-align-center gap-2">
            <Camera size={18} className="cyan-icon" />
            <span>Record New Gesture</span>
          </h3>

          <div className="landmark-status-box">
            {currentLandmarks ? (
              <div className="flex-align-center gap-2 green-text">
                <CheckCircle size={18} className="green-icon" />
                <span>Hand Detected & Ready to Record!</span>
              </div>
            ) : (
              <div className="flex-align-center gap-2 gray-text">
                <Camera size={18} />
                <span>Hold hand clearly in front of webcam to record sign...</span>
              </div>
            )}
          </div>

          {/* Live Match Notification */}
          {liveMatch && (
            <div className="live-match-box glass-panel glow-border">
              <div className="flex-align-center gap-2">
                <Zap className="neon-icon" size={18} />
                <span className="match-title">Sign Recognized: <strong>{liveMatch.sign}</strong></span>
              </div>
              <span className="match-val">{liveMatch.matchPercent}% Match Score</span>
            </div>
          )}

          <div className="control-group">
            <label className="control-label">Sign Name / Word Label</label>
            <input
              type="text"
              className="custom-input"
              placeholder="e.g. Hello, Emergency, Water, My Name..."
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
            <span>{isSaved ? 'Saved to Signs Library!' : 'Record & Save Sign'}</span>
          </button>
        </div>

        {/* Right Column: Recorded Dataset Table */}
        <div className="studio-card glass-panel">
          <div className="flex-align-center justify-between">
            <h3 className="card-title flex-align-center gap-2">
              <Database size={18} className="cyan-icon" />
              <span>My Saved Signs ({savedGestures.length})</span>
            </h3>
            {savedGestures.length > 0 && (
              <button className="btn-action-sm danger" onClick={() => setSavedGestures([])}>
                <span>Clear All</span>
              </button>
            )}
          </div>

          {savedGestures.length === 0 ? (
            <p className="sentence-placeholder" style={{ padding: '20px 0' }}>
              No custom signs saved yet. Record your first gesture on the left!
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
                        Recorded at {item.timestamp}
                      </div>
                    </div>
                  </div>
                  <span className="mode-count-tag">Active Sign</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
