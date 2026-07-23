import React, { useState, useEffect } from 'react';
import { Volume2, Sliders, Play, RotateCcw } from 'lucide-react';
import { speechService } from '../services/speechService';

export default function SpeechControls() {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [testText, setTestText] = useState('Welcome to AI Sign Language Recognition PWA.');

  useEffect(() => {
    const updateVoices = () => {
      const available = speechService.getVoices();
      setVoices(available);
      if (available.length > 0) {
        const defaultV = available.find(v => v.lang.includes('en')) || available[0];
        setSelectedVoice(defaultV.voiceURI || defaultV.name);
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  const handleVoiceChange = (e) => {
    const vUri = e.target.value;
    setSelectedVoice(vUri);
    speechService.setVoice(vUri);
  };

  const handleRateChange = (e) => {
    const val = parseFloat(e.target.value);
    setRate(val);
    speechService.setRate(val);
  };

  const handlePitchChange = (e) => {
    const val = parseFloat(e.target.value);
    setPitch(val);
    speechService.setPitch(val);
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    speechService.setVolume(val);
  };

  const handleTestSpeech = () => {
    speechService.speak(testText);
  };

  const handleReset = () => {
    setRate(1.0);
    setPitch(1.0);
    setVolume(1.0);
    speechService.setRate(1.0);
    speechService.setPitch(1.0);
    speechService.setVolume(1.0);
  };

  return (
    <div className="speech-controls-card glass-panel">
      <div className="speech-header">
        <div className="flex-align-center gap-2">
          <Volume2 size={20} className="cyan-icon" />
          <h3 className="card-title">Text-to-Speech Engine Settings</h3>
        </div>
        <button className="btn-icon-link" onClick={handleReset} title="Reset Speech Defaults">
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>
      </div>

      <div className="speech-controls-grid">
        {/* Voice Selector */}
        <div className="control-group full-width">
          <label className="control-label">Voice Selection</label>
          <select
            className="custom-select"
            value={selectedVoice}
            onChange={handleVoiceChange}
          >
            {voices.map((v, i) => (
              <option key={i} value={v.voiceURI || v.name}>
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Speed / Rate */}
        <div className="control-group">
          <div className="label-val-row">
            <label className="control-label">Speed / Rate</label>
            <span className="control-val">{rate.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={rate}
            onChange={handleRateChange}
            className="custom-range"
          />
        </div>

        {/* Pitch */}
        <div className="control-group">
          <div className="label-val-row">
            <label className="control-label">Voice Pitch</label>
            <span className="control-val">{pitch.toFixed(1)}</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={pitch}
            onChange={handlePitchChange}
            className="custom-range"
          />
        </div>

        {/* Volume */}
        <div className="control-group">
          <div className="label-val-row">
            <label className="control-label">Volume</label>
            <span className="control-val">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            className="custom-range"
          />
        </div>

        {/* Test Speech Input */}
        <div className="control-group test-input-group">
          <input
            type="text"
            className="custom-input"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Type text to test speech..."
          />
          <button className="btn-primary-sm" onClick={handleTestSpeech}>
            <Play size={14} />
            <span>Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}
