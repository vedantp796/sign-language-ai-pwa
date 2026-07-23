import React, { useState } from 'react';
import { Search, BookOpen, Filter, Volume2, Info } from 'lucide-react';
import { GESTURE_DICTIONARY } from '../utils/aslDictionaryData';
import { speechService } from '../services/speechService';

export default function GestureDictionary() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Phrase', 'Alphabet', 'Number'];

  const filteredGestures = GESTURE_DICTIONARY.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSpeakName = (name) => {
    speechService.speak(name);
  };

  return (
    <div className="dictionary-view-container">
      <div className="dictionary-header glass-panel">
        <div className="flex-between">
          <div className="flex-align-center gap-2">
            <BookOpen size={24} className="cyan-icon" />
            <div>
              <h2 className="section-title">Sign Language Reference Dictionary</h2>
              <p className="section-subtitle">Visual guide & posture descriptions for standard ASL signs</p>
            </div>
          </div>

          <div className="search-bar-wrap">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search sign, letter, phrase..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="category-filter-row">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat === 'All' ? 'All Signs' : `${cat}s`}
            </button>
          ))}
          <span className="results-count">{filteredGestures.length} Signs Found</span>
        </div>
      </div>

      <div className="dictionary-grid">
        {filteredGestures.map((gesture) => (
          <div key={gesture.id} className="dictionary-card glass-panel glow-hover">
            <div className="dict-card-top">
              <span className="dict-symbol-emoji">{gesture.handShape}</span>
              <span className={`dict-cat-badge ${gesture.category.toLowerCase()}`}>
                {gesture.category}
              </span>
            </div>

            <div className="dict-card-body">
              <h3 className="dict-sign-title">{gesture.name}</h3>
              <p className="dict-sign-desc">{gesture.description}</p>

              <div className="dict-tip-box">
                <Info size={14} className="blue-icon" />
                <span>{gesture.tips}</span>
              </div>
            </div>

            <div className="dict-card-footer">
              <button
                className="btn-dict-speak"
                onClick={() => handleSpeakName(gesture.name)}
                title="Listen to pronunciation"
              >
                <Volume2 size={14} />
                <span>Pronounce</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
