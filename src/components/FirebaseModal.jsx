import React, { useState } from 'react';
import { X, Database, Check, Save, RotateCcw, UserCheck, UserPlus, LogIn, LogOut, Key } from 'lucide-react';
import { getFirebaseConfig, saveFirebaseConfig, firebaseService } from '../services/firebaseService';

export default function FirebaseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const currentConfig = getFirebaseConfig();
  const [activeSubTab, setActiveSubTab] = useState('auth'); // 'auth' | 'config'

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  // Firebase Config State
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [messagingSenderId, setMessagingSenderId] = useState(currentConfig.messagingSenderId || '');
  const [appId, setAppId] = useState(currentConfig.appId || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentUser = firebaseService.currentUser;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!email || !password) {
      setAuthError('Please enter email and password.');
      return;
    }

    if (isRegisterMode) {
      const res = await firebaseService.registerUser(email, password);
      if (res.error) setAuthError(res.error);
      else setAuthSuccess('Registered & Logged in successfully!');
    } else {
      const res = await firebaseService.loginUser(email, password);
      if (res.error) setAuthError(res.error);
      else setAuthSuccess('Logged in successfully!');
    }
  };

  const handleLogout = async () => {
    await firebaseService.logoutUser();
    setAuthSuccess('Logged out!');
  };

  const handleSaveConfig = () => {
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
    }, 1200);
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
            <h3 className="modal-title">Cloud Vault Settings & User Account</h3>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Navigation Sub-tabs */}
        <div className="modal-subtabs">
          <button
            className={`subtab-btn ${activeSubTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('auth')}
          >
            <UserCheck size={16} />
            <span>User Account & Security</span>
          </button>

          <button
            className={`subtab-btn ${activeSubTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('config')}
          >
            <Key size={16} />
            <span>Cloud API Credentials</span>
          </button>
        </div>

        <div className="modal-body">
          {activeSubTab === 'auth' ? (
            <div className="auth-panel">
              {currentUser && !currentUser.isAnonymous ? (
                <div className="user-profile-card glass-panel">
                  <div className="flex-between mb-2">
                    <div>
                      <h4 className="user-email">{currentUser.email}</h4>
                      <p className="user-uid">UID: {currentUser.uid}</p>
                    </div>
                    <span className="badge-online">Active User</span>
                  </div>
                  <button className="btn-danger-sm width-full mt-3" onClick={handleLogout}>
                    <LogOut size={14} />
                    <span>Log Out Account</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAuthSubmit} className="auth-form">
                  <div className="form-group mb-3">
                    <label className="control-label">Email Address</label>
                    <input
                      type="email"
                      className="custom-input"
                      placeholder="user@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="control-label">Password</label>
                    <input
                      type="password"
                      className="custom-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>

                  {authError && <div className="auth-alert error">{authError}</div>}
                  {authSuccess && <div className="auth-alert success">{authSuccess}</div>}

                  <div className="flex-between mt-4">
                    <button type="button" className="btn-link" onClick={() => setIsRegisterMode(!isRegisterMode)}>
                      {isRegisterMode ? 'Already have account? Log In' : 'New User? Register Account'}
                    </button>

                    <button type="submit" className="btn-primary-sm">
                      {isRegisterMode ? <UserPlus size={14} /> : <LogIn size={14} />}
                      <span>{isRegisterMode ? 'Register' : 'Log In'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="config-panel">
              <p className="modal-description">
                Configure your cloud vault database keys below for real-time online transcript backup and sync.
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
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary-sm" onClick={handleResetDefaults}>
            <RotateCcw size={14} />
            <span>Reset Defaults</span>
          </button>

          {activeSubTab === 'config' && (
            <button className={`btn-primary-sm ${savedSuccess ? 'success' : ''}`} onClick={handleSaveConfig}>
              {savedSuccess ? <Check size={14} /> : <Save size={14} />}
              <span>{savedSuccess ? 'Saved & Reloading!' : 'Save Credentials'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
