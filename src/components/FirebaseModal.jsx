import React, { useState } from 'react';
import { X, Database, Check, Save, RotateCcw, ShieldCheck } from 'lucide-react';
import { getFirebaseConfig, saveFirebaseConfig } from '../services/firebaseService';

export default function FirebaseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentConfig = getFirebaseConfig();
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    const newConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId
    };
    saveFirebaseConfig(newConfig);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleResetDefaults = () => {
    localStorage.removeItem('app_firebase_config');
    window.location.reload();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel glow-border">
        <div className="modal-header">
          <div className="flex-align-center gap-2">
            <Database size={22} className="cyan-icon" />
            <h3 className="modal-title">Firebase Database Configuration</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Enter your Firebase project keys below to connect real-time Firestore database storage.
            If left as default, the application runs seamlessly in local database fallback mode.
          </p>

          <div className="firebase-form-grid">
            <div className="form-group">
              <label className="control-label">API Key</label>
              <input
                type="text"
                className="custom-input"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="control-label">Auth Domain</label>
              <input
                type="text"
                className="custom-input"
                value={authDomain}
                onChange={(e) => setAuthDomain(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="control-label">Project ID</label>
              <input
                type="text"
                className="custom-input"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="control-label">Storage Bucket</label>
              <input
                type="text"
                className="custom-input"
                value={storageBucket}
                onChange={(e) => setStorageBucket(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="control-label">Messaging Sender ID</label>
              <input
                type="text"
                className="custom-input"
                value={messagingSenderId}
                onChange={(e) => setMessagingSenderId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="control-label">App ID</label>
              <input
                type="text"
                className="custom-input"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-sm" onClick={handleResetDefaults}>
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          <button className={`btn-primary-sm ${savedSuccess ? 'success' : ''}`} onClick={handleSave}>
            {savedSuccess ? <Check size={14} /> : <Save size={14} />}
            <span>{savedSuccess ? 'Config Saved & Reloading!' : 'Save & Connect Firebase'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
