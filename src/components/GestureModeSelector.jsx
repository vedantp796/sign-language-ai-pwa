import React from 'react';
import { Type, Hash, MessageSquare, Globe, Sparkles } from 'lucide-react';

export default function GestureModeSelector({ gestureMode, setGestureMode }) {
  const modes = [
    {
      id: 'alphabets',
      label: 'Alphabets',
      subtitle: 'Letters A – Z',
      icon: Type,
      symbol: '🔤',
      color: 'cyan',
      count: '26 Signs'
    },
    {
      id: 'numbers',
      label: 'Numbers',
      subtitle: 'Digits 0 – 9',
      icon: Hash,
      symbol: '🔢',
      color: 'green',
      count: '10 Digits'
    },
    {
      id: 'phrases',
      label: 'Phrases',
      subtitle: 'Common Gestures',
      icon: MessageSquare,
      symbol: '💬',
      color: 'pink',
      count: '8 Signs'
    },
    {
      id: 'all',
      label: 'All Gestures',
      subtitle: 'Auto 44-Class',
      icon: Globe,
      symbol: '🌐',
      color: 'purple',
      count: '44 Total'
    }
  ];

  return (
    <div className="gesture-mode-bar glass-panel glow-border">
      <div className="mode-bar-header">
        <div className="flex-align-center gap-2">
          <Sparkles className="neon-icon" size={18} />
          <span className="mode-bar-title">Recognition Target Mode:</span>
        </div>
        <span className="mode-hint-badge">
          Scope model filters to maximize classification accuracy & remove gesture conflicts
        </span>
      </div>

      <div className="mode-tabs-grid">
        {modes.map(mode => {
          const Icon = mode.icon;
          const isActive = gestureMode === mode.id;

          return (
            <button
              key={mode.id}
              className={`mode-tab-card ${isActive ? `active ${mode.color}` : ''}`}
              onClick={() => setGestureMode(mode.id)}
            >
              <div className="tab-icon-row">
                <span className="mode-symbol">{mode.symbol}</span>
                <span className="mode-count-tag">{mode.count}</span>
              </div>
              <div className="tab-text-wrap">
                <div className="tab-label-row">
                  <Icon size={16} className="tab-icon" />
                  <span className="tab-label">{mode.label}</span>
                </div>
                <span className="tab-subtitle">{mode.subtitle}</span>
              </div>
              {isActive && <div className="active-indicator-dot"></div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
