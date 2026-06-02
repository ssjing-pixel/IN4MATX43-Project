import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { User } from '../types';

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

export default function ProfilePage() {
  const { auth, setAuth, setScreen, showToast } = useApp();
  const [profile, setProfile] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [rangeMiles, setRangeMiles] = useState(5);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.userId) loadProfile();
  }, [auth.userId]);

  const loadProfile = async () => {
    try {
      const res = await fetch(`/api/profile/${auth.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      setProfile(data);
      setDisplayName(data.display_name || '');
      setBio(data.bio || '');
      setInterests(Array.isArray(data.interests) ? data.interests : []);
      setRangeMiles(data.range_miles || 5);
      setVisible(!!data.visible);
    } catch {
      showToast('Failed to load profile', 'warning');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/profile/${auth.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ display_name: displayName, bio, interests, range_miles: rangeMiles, visible }),
      });
      if (!res.ok) throw new Error('Save failed');
      showToast('Profile saved!', 'success');
      setEditing(false);
      loadProfile();
    } catch {
      showToast('Failed to save profile', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuth({ token: null, userId: null, username: null });
    setScreen('auth');
  };

  const toggleInterest = (key: string) => {
    setInterests(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const interestMap = Object.fromEntries(ALL_INTERESTS.map(i => [i.key, i]));

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
        padding: '40px 32px 80px',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div style={{
            width: 96, height: 96, borderRadius: '50%', background: 'rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 44, border: '3px solid rgba(255,255,255,0.5)', flexShrink: 0,
          }}>
            {profile?.avatar || '🌿'}
          </div>
          <div style={{ color: 'white' }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
              {profile?.display_name || auth.username}
            </h1>
            <p style={{ opacity: 0.85, fontSize: 15 }}>@{auth.username}</p>
            {profile?.points !== undefined && (
              <p style={{ marginTop: 8, opacity: 0.9, fontSize: 14 }}>
                ⭐ {profile.points} points
              </p>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: '-40px auto 0', padding: '0 24px 40px', position: 'relative' }}>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, justifyContent: 'flex-end' }}>
          {!editing ? (
            <>
              <button
                className="btn-secondary btn-sm"
                style={{ width: 'auto' }}
                onClick={() => setEditing(true)}
              >
                ✏️ Edit Profile
              </button>
              <button
                className="btn-secondary btn-sm"
                style={{ width: 'auto', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-secondary btn-sm"
                style={{ width: 'auto' }}
                onClick={() => { setEditing(false); loadProfile(); }}
              >
                Cancel
              </button>
              <button
                className="btn-primary btn-sm"
                style={{ width: 'auto' }}
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>

        {/* Profile card */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            About
          </h2>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>DISPLAY NAME</label>
                <input
                  className="input-field"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>BIO</label>
                <textarea
                  className="input-field"
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell people about yourself..."
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.6 }}>
                {profile?.bio || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No bio yet. Click Edit Profile to add one.</span>}
              </p>
            </div>
          )}
        </div>

        {/* Interests */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Interests
          </h2>
          {editing ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: 8,
            }}>
              {ALL_INTERESTS.map(interest => (
                <button
                  key={interest.key}
                  onClick={() => toggleInterest(interest.key)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: 12,
                    border: interests.includes(interest.key)
                      ? '2px solid var(--primary)'
                      : '2px solid var(--border)',
                    background: interests.includes(interest.key) ? 'var(--primary)' : 'white',
                    color: interests.includes(interest.key) ? 'white' : 'var(--text)',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 20 }}>{interest.icon}</span>
                  {interest.label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {interests.length > 0
                ? interests.map(key => {
                    const interest = interestMap[key];
                    return interest ? (
                      <span key={key} className="tag">
                        {interest.icon} {interest.label}
                      </span>
                    ) : (
                      <span key={key} className="tag">{key}</span>
                    );
                  })
                : <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No interests selected yet.</span>
              }
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Discovery Settings
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600 }}>Search radius</label>
                <span style={{ fontSize: 14, color: 'var(--primary)', fontWeight: 700 }}>{rangeMiles} mi</span>
              </div>
              <input
                type="range"
                min={0.5} max={25} step={0.5}
                value={rangeMiles}
                onChange={e => setRangeMiles(parseFloat(e.target.value))}
                disabled={!editing}
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>Visible to others</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Show up on nearby user maps</div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: editing ? 'pointer' : 'default' }}>
                <input
                  type="checkbox"
                  checked={visible}
                  onChange={e => setVisible(e.target.checked)}
                  disabled={!editing}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: visible ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {visible ? 'Visible' : 'Hidden'}
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
