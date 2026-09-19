import React, { useState, useEffect } from 'react';
import { X, Sparkles, UserCheck, UserPlus, LogIn, LogOut, Mail, Lock, ShieldCheck } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function FirebaseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(firebaseService.currentUser);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeAuth((u) => {
      setCurrentUser(u);
    });
    return () => unsubscribe();
  }, []);

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
      const res = isRegisterMode
        ? await firebaseService.registerUser(email, password)
        : await firebaseService.loginUser(email, password);

      if (res && res.user) {
        setAuthSuccess(isRegisterMode ? 'Account Created & Logged In!' : 'Logged In Successfully!');
        setTimeout(() => {
          onClose();
        }, 1000);
      } else if (res && res.error) {
        setAuthError(res.error);
      }
    } catch (err) {
      setAuthError('Authentication failed. Check your details.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await firebaseService.logoutUser();
    setAuthSuccess('Logged out safely!');
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
            {currentUser ? 'User Account Profile' : 'Sign in or create an account to get started.'}
          </p>
        </div>

        <div className="modal-body-container">
          <div className="auth-panel-wrapper">
            {currentUser ? (
              /* Logged-in Profile Card */
              <div className="insta-profile-box glass-panel">
                <div className="avatar-circle">
                  <UserCheck size={36} className="cyan-icon" />
                </div>
                <div className="profile-info">
                  <h3 className="user-email-title">{currentUser.email}</h3>
                  <span className="profile-status-pill">
                    <ShieldCheck size={14} />
                    <span>Account Active</span>
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
        </div>
      </div>
    </div>
  );
}
