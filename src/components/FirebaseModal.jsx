import React, { useState } from 'react';
import { X, Sparkles, Check, Save, RotateCcw, UserCheck, UserPlus, LogIn, LogOut, Key, Mail, Lock, ShieldCheck } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);

  // Firebase Config State
  const [apiKey, setApiKey] = useState(currentConfig.apiKey || '');
  const [authDomain, setAuthDomain] = useState(currentConfig.authDomain || '');
  const [projectId, setProjectId] = useState(currentConfig.projectId || '');
  const [storageBucket, setStorageBucket] = useState(currentConfig.storageBucket || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const currentUser = firebaseService.currentUser;

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setLoading(true);

    if (!email || !password) {
      setAuthError('Please enter both email address and password.');
      setLoading(false);
      return;
    }

    try {
      if (isRegisterMode) {
        const res = await firebaseService.registerUser(email, password);
        if (res.error) setAuthError(res.error);
        else setAuthSuccess('Account registered & logged in successfully!');
      } else {
        const res = await firebaseService.loginUser(email, password);
        if (res.error) setAuthError(res.error);
        else setAuthSuccess('Logged in successfully!');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await firebaseService.logoutUser();
    setAuthSuccess('Logged out safely!');
  };

  const handleSaveConfig = () => {
    const newConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal-card glass-panel glow-border" onClick={(e) => e.stopPropagation()}>
        {/* Modal Close Button */}
        <button className="btn-close-modal" onClick={onClose} title="Close Modal">
          <X size={20} />
        </button>

        {/* Instagram-Style Header */}
        <div className="auth-header">
          <div className="auth-brand-logo">
            <Sparkles size={28} className="neon-icon" />
          </div>
          <h2 className="auth-brand-title">SignAI</h2>
          <p className="auth-subtitle">
            {activeSubTab === 'auth'
              ? (currentUser && !currentUser.isAnonymous ? 'Manage Your Account Settings' : 'Sign in to access Cloud Vault & Custom Sign Sync')
              : 'Configure Advanced Cloud Credentials'}
          </p>
        </div>

        {/* Navigation Switcher */}
        <div className="auth-tab-bar">
          <button
            className={`auth-tab-btn ${activeSubTab === 'auth' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('auth')}
          >
            <UserCheck size={16} />
            <span>Account</span>
          </button>
          <button
            className={`auth-tab-btn ${activeSubTab === 'config' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('config')}
          >
            <Key size={16} />
            <span>Cloud API</span>
          </button>
        </div>

        <div className="modal-body-container">
          {activeSubTab === 'auth' ? (
            <div className="auth-panel-wrapper">
              {currentUser && !currentUser.isAnonymous ? (
                /* Logged-in Profile Card */
                <div className="insta-profile-box glass-panel">
                  <div className="avatar-circle">
                    <UserCheck size={36} className="cyan-icon" />
                  </div>
                  <div className="profile-info">
                    <h3 className="user-email-title">{currentUser.email}</h3>
                    <span className="profile-status-pill">
                      <ShieldCheck size={14} />
                      <span>Cloud Sync Active</span>
                    </span>
                  </div>
                  <button className="btn-logout-pill" onClick={handleLogout}>
                    <LogOut size={16} />
                    <span>Log Out Account</span>
                  </button>
                </div>
              ) : (
                /* Instagram-Style Login & Sign Up Form */
                <div className="insta-auth-form-container">
                  {/* Mode Switcher Pills: Log In vs Sign Up */}
                  <div className="auth-mode-selector">
                    <button
                      type="button"
                      className={`mode-select-btn ${!isRegisterMode ? 'active' : ''}`}
                      onClick={() => { setIsRegisterMode(false); setAuthError(''); }}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      className={`mode-select-btn ${isRegisterMode ? 'active' : ''}`}
                      onClick={() => { setIsRegisterMode(true); setAuthError(''); }}
                    >
                      Sign Up
                    </button>
                  </div>

                  <form onSubmit={handleAuthSubmit} className="insta-auth-form">
                    <div className="input-field-group">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        className="insta-input"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>

                    <div className="input-field-group">
                      <Lock size={18} className="input-icon" />
                      <input
                        type="password"
                        className="insta-input"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>

                    {authError && <div className="auth-alert error-alert">{authError}</div>}
                    {authSuccess && <div className="auth-alert success-alert">{authSuccess}</div>}

                    <button type="submit" className="insta-submit-btn" disabled={loading}>
                      {isRegisterMode ? <UserPlus size={18} /> : <LogIn size={18} />}
                      <span>{loading ? 'Processing...' : (isRegisterMode ? 'Create Account' : 'Log In')}</span>
                    </button>
                  </form>

                  <div className="auth-divider">
                    <span className="divider-line"></span>
                    <span className="divider-text">OR</span>
                    <span className="divider-line"></span>
                  </div>

                  <div className="auth-switch-footer">
                    <span className="switch-prompt">
                      {isRegisterMode ? "Already have an account?" : "Don't have an account?"}
                    </span>
                    <button
                      type="button"
                      className="switch-link-btn"
                      onClick={() => {
                        setIsRegisterMode(!isRegisterMode);
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                    >
                      {isRegisterMode ? 'Log In' : 'Sign Up'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Cloud API Config Panel */
            <div className="config-panel-wrapper">
              <p className="config-desc">
                Provide custom Firebase project credentials to sync translation logs directly to your own cloud instance.
              </p>

              <div className="config-form-grid">
                <div className="config-field">
                  <label className="config-label">API Key</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                  />
                </div>

                <div className="config-field">
                  <label className="config-label">Auth Domain</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={authDomain}
                    onChange={(e) => setAuthDomain(e.target.value)}
                    placeholder="project-id.firebaseapp.com"
                  />
                </div>

                <div className="config-field">
                  <label className="config-label">Project ID</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    placeholder="project-id"
                  />
                </div>

                <div className="config-field">
                  <label className="config-label">Storage Bucket</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={storageBucket}
                    onChange={(e) => setStorageBucket(e.target.value)}
                    placeholder="project-id.appspot.com"
                  />
                </div>
              </div>

              <div className="config-actions">
                <button className="btn-icon-link" onClick={handleResetDefaults}>
                  <RotateCcw size={14} />
                  <span>Reset Defaults</span>
                </button>
                <button className={`btn-primary-sm ${savedSuccess ? 'success' : ''}`} onClick={handleSaveConfig}>
                  {savedSuccess ? <Check size={14} /> : <Save size={14} />}
                  <span>{savedSuccess ? 'Saved & Reloading!' : 'Save Credentials'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
