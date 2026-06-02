import React, { useState } from 'react';
import { useApp } from '../App';
import './OnboardingInterests.css';

const ALL_INTERESTS = [
  { key: 'hiking', label: 'Hiking', icon: '🥾' },
  { key: 'photography', label: 'Photography', icon: '📷' },
  { key: 'gaming', label: 'Gaming', icon: '🎮' },
  { key: 'coffee', label: 'Coffee', icon: '☕' },
  { key: 'cycling', label: 'Cycling', icon: '🚴' },
  { key: 'cooking', label: 'Cooking', icon: '🍳' },
  { key: 'music', label: 'Music', icon: '🎵' },
  { key: 'reading', label: 'Reading', icon: '📚' },
  { key: 'fitness', label: 'Fitness', icon: '💪' },
  { key: 'jogging', label: 'Jogging', icon: '🏃' },
  { key: 'crafts', label: 'Crafts', icon: '🎨' },
  { key: 'chess', label: 'Chess', icon: '♟️' },
  { key: 'art', label: 'Art', icon: '🖼️' },
  { key: 'anime', label: 'Anime', icon: '⛩️' },
  { key: 'coding', label: 'Coding', icon: '💻' },
  { key: 'sports', label: 'Sports', icon: '⚽' },
];

export default function OnboardingInterests() {
  const { auth, setScreen, showToast } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [warning, setWarning] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = (key: string) => {
    if (selected.includes(key)) {
      setSelected(selected.filter(k => k !== key));
      setWarning(false);
    } else {
      if (selected.length >= 10) {
        setWarning(true);
        showToast('You can only select up to 10 interests', 'warning');
        return;
      }
      setSelected([...selected, key]);
      setWarning(false);
    }
  };

  const handleContinue = async () => {
    if (selected.length < 1) {
      showToast('Please select at least 1 interest', 'warning'); return;
    }
    if (!auth.userId) return;
    setLoading(true);
    try {
      await fetch(`/api/profile/${auth.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ interests: selected }),
      });
      setScreen('onboarding-range');
    } catch {
      showToast('Failed to save interests', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="onboarding-page">
      <div className="onboarding-header">
        <h1>What are you into?</h1>
        <p>Pick at least 1 and up to 10 interests.</p>
        <div className="selection-badge">
          <span>Selected</span>
          <span className="badge">{selected.length}/{ALL_INTERESTS.length}</span>
        </div>
      </div>

      {warning && (
        <div className="warning-banner">
          ⚠️ You can only select up to 10 interests
        </div>
      )}

      <div className="interests-grid">
        {ALL_INTERESTS.map(interest => (
          <button
            key={interest.key}
            className={`interest-tile ${selected.includes(interest.key) ? 'selected' : ''}`}
            onClick={() => toggle(interest.key)}
          >
            <span className="interest-icon">{interest.icon}</span>
            <span className="interest-label">{interest.label}</span>
          </button>
        ))}
      </div>

      <div className="onboarding-footer">
        <button className="btn-primary" onClick={handleContinue} disabled={loading || selected.length < 1}>
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
