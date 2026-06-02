import React, { useState } from 'react';
import { useApp } from '../App';
import './OnboardingRange.css';

export default function OnboardingRange() {
  const { auth, setScreen, showToast } = useApp();
  const [range, setRange] = useState(2);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    if (!auth.userId) return;
    setLoading(true);
    try {
      // Save range and seed location at UCI
      await fetch(`/api/profile/${auth.userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${auth.token}` },
        body: JSON.stringify({ range_miles: range }),
      });
      // Also seed a location
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId, lat: 33.6405, lng: -117.8443 }),
      });
      setScreen('home');
    } catch {
      showToast('Failed to save settings', 'warning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="range-page">
      <div className="range-header">
        <h1>How far should we look?</h1>
        <p>Set the radius for discovering nearby users. You can change this anytime.</p>
      </div>

      <div className="range-display">
        <div className="range-number">{range < 1 ? range.toFixed(1) : range}</div>
        <div className="range-unit">mile radius</div>
      </div>

      <div className="range-slider-wrap">
        <input
          type="range"
          className="range-slider"
          min={0.5}
          max={25}
          step={0.5}
          value={range}
          onChange={e => setRange(parseFloat(e.target.value))}
        />
        <div className="range-labels">
          <span>0.5 mi</span>
          <span>25 mi</span>
        </div>
      </div>

      <div className="privacy-card card">
        <div className="privacy-content">
          <span className="privacy-icon">🛡️</span>
          <p>Your exact location is never shared. Others can only see that you're within range, not your distance or address.</p>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <button className="btn-primary" onClick={handleStart} disabled={loading}>
          {loading ? 'Setting up...' : 'Start exploring'}
        </button>
      </div>
    </div>
  );
}
