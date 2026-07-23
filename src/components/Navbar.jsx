import React from 'react';
import { Camera, Database, Download, BookOpen, History, Cpu, Sliders, Sparkles } from 'lucide-react';

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
          <p className="app-subtitle">AI Sign Language Translator & Database</p>
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
          className={`nav-tab-btn ${activeTab === 'dictionary' ? 'active' : ''}`}
          onClick={() => setActiveTab('dictionary')}
        >
          <BookOpen size={18} />
          <span>Sign Dictionary</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} />
          <span>Firestore Logs</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'studio' ? 'active' : ''}`}
          onClick={() => setActiveTab('studio')}
        >
          <Cpu size={18} />
          <span>Custom Studio</span>
        </button>
      </nav>

      <div className="navbar-controls">
        <button
          className={`status-pill ${isFirebaseOnline ? 'online' : 'demo'}`}
          onClick={onOpenFirebaseModal}
          title="Click to configure Firebase credentials"
        >
          <Database size={14} />
          <span>{isFirebaseOnline ? 'Firestore Live' : 'Firebase (Demo)'}</span>
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
