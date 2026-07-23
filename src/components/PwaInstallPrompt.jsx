import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone } from 'lucide-react';

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log("User installed the PWA!");
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="pwa-install-banner glass-panel glow-border">
      <div className="flex-align-center gap-3">
        <div className="pwa-banner-icon">
          <Smartphone size={24} className="cyan-icon" />
        </div>
        <div>
          <h4 className="pwa-banner-title">Install SignAI Progressive Web App</h4>
          <p className="pwa-banner-desc">Use real-time sign language translation offline on mobile & desktop</p>
        </div>
      </div>

      <div className="flex-align-center gap-2">
        <button className="btn-primary-sm" onClick={handleInstall}>
          <Download size={14} />
          <span>Install Now</span>
        </button>

        <button className="btn-icon-close" onClick={() => setIsVisible(false)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
