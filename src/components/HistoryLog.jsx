import React, { useState, useEffect } from 'react';
import { History, Trash2, Volume2, Download, RefreshCw, Database, Search, User, ShieldCheck } from 'lucide-react';
import { firebaseService } from '../services/firebaseService';
import { speechService } from '../services/speechService';

export default function HistoryLog() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');

  const loadHistory = async () => {
    setLoading(true);
    try {
      const records = await firebaseService.fetchHistoryRecords();
      setHistory(records);
    } catch (e) {
      console.error("Fetch history error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    await firebaseService.deleteHistoryRecord(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = async () => {
    if (window.confirm("Are you sure you want to clear all saved recognition transcripts?")) {
      await firebaseService.clearAllHistory();
      setHistory([]);
    }
  };

  const handleSpeak = (text) => {
    speechService.speak(text);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `sign_language_history_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredHistory = history.filter(item =>
    (item.sentence || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (item.primaryGesture || '').toLowerCase().includes(filterText.toLowerCase()) ||
    (item.userEmail || '').toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div className="history-view-container">
      <div className="history-header glass-panel glow-border">
        <div className="flex-between">
          <div className="flex-align-center gap-2">
            <Database size={24} className="cyan-icon" />
            <div>
              <h2 className="section-title">Translation Vault & Saved Records</h2>
              <p className="section-subtitle">Real-time sentence transcripts, speech audio, and mode metrics</p>
            </div>
          </div>

          <div className="flex-align-center gap-2">
            <button className="btn-secondary-sm" onClick={loadHistory} title="Refresh saved transcripts">
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh Vault</span>
            </button>

            <button className="btn-secondary-sm" onClick={handleExportJson} disabled={history.length === 0}>
              <Download size={14} />
              <span>Export JSON</span>
            </button>

            <button className="btn-danger-sm" onClick={handleClearAll} disabled={history.length === 0}>
              <Trash2 size={14} />
              <span>Clear Vault</span>
            </button>
          </div>
        </div>

        <div className="history-search-row">
          <div className="search-bar-wrap width-full">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search transcript, sentence, gesture..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      <div className="history-list-container">
        {loading ? (
          <div className="history-empty-state">
            <RefreshCw size={36} className="spin cyan-icon" />
            <p>Retrieving translation records...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="history-empty-state glass-panel">
            <History size={48} className="gray-icon" />
            <h3>No Saved Transcripts Found</h3>
            <p>Save translated sentences from the main translation screen to log records into your Vault.</p>
          </div>
        ) : (
          <div className="history-grid">
            {filteredHistory.map((item) => (
              <div key={item.id} className="history-card glass-panel glow-hover">
                <div className="history-card-header">
                  <span className="history-badge">
                    <User size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    {item.userEmail || 'Guest User'}
                  </span>
                  <span className="history-time">
                    {item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recent'}
                  </span>
                </div>

                <div className="history-card-body">
                  <p className="history-sentence">"{item.sentence}"</p>
                  <div className="flex-between mt-2">
                    <span className="metric-tag">{item.primaryGesture || 'Sign'}</span>
                    <span className="metric-tag blue">{item.mode || 'Text'} Mode</span>
                  </div>
                </div>

                <div className="history-card-footer">
                  <button
                    className="btn-history-action speak"
                    onClick={() => handleSpeak(item.sentence)}
                    title="Play Audio Speech"
                  >
                    <Volume2 size={14} />
                    <span>Play Audio</span>
                  </button>

                  <button
                    className="btn-history-action delete"
                    onClick={() => handleDelete(item.id)}
                    title="Delete record"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
