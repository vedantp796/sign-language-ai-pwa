import React from 'react';
import { Camera, Database, Download, Cpu, Sparkles } from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  isCameraActive,
  isFirebaseOnline,
  canInstallPwa,
  onInstallPwa,
  onOpenFirebaseModal
}) {
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
          className={`status-pill ${isFirebaseOnline ? 'online' : 'demo'}`}
          onClick={onOpenFirebaseModal}
          title="Cloud Vault Settings & Sync Configuration"
        >
          <Database size={14} />
          <span>{isFirebaseOnline ? 'Cloud Vault Sync' : 'Local Vault Mode'}</span>
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
