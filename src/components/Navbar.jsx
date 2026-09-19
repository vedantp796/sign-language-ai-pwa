import React, { useState, useEffect } from 'react';
import { Camera, Download, Cpu, Sparkles, User, UserCheck } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';

export default function Navbar({
  activeTab,
  setActiveTab,
  canInstallPwa,
  onInstallPwa,
  onOpenFirebaseModal
}) {
  const [currentUser, setCurrentUser] = useState(firebaseService.currentUser);

  useEffect(() => {
    const unsubscribe = firebaseService.subscribeAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const isLoggedIn = currentUser && !currentUser.isAnonymous;

  return (
    <header className="navbar-container">
      <div className="navbar-brand">
        <div className="logo-icon">
          <Sparkles className="sparkle-icon" size={24} />
        </div>
        <div>
          <h1 className="app-title">SignAI <span className="pwa-badge">PWA</span></h1>
          <p className="app-subtitle">Real-Time AI Sign Language Translator</p>
        </div>
      </div>

      <nav className="navbar-links">
        <button
          className={`nav-tab-btn ${activeTab === 'recognition' ? 'active' : ''}`}
          onClick={() => setActiveTab('recognition')}
        >
          <Camera size={18} />
          <span>Live Translation</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Cpu size={18} />
          <span>AI Gesture Lab</span>
        </button>
      </nav>

      <div className="navbar-controls">
        <button
          className={`nav-auth-btn ${isLoggedIn ? 'logged-in' : ''}`}
          onClick={onOpenFirebaseModal}
          title={isLoggedIn ? "Account Profile & Settings" : "Log In or Sign Up"}
        >
          {isLoggedIn ? <UserCheck size={16} className="cyan-icon" /> : <User size={16} />}
          <span>{isLoggedIn ? (currentUser.email ? currentUser.email.split('@')[0] : 'My Account') : 'Log In / Sign Up'}</span>
        </button>

        {canInstallPwa && (
          <button className="btn-install-pwa" onClick={onInstallPwa}>
            <Download size={16} />
            <span>Install App</span>
          </button>
        )}
      </div>
    </header>
  );
}
