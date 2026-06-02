import React, { useState } from 'react';
import { useApp } from '../App';
import './AuthPage.css';

export default function AuthPage() {
  const { setAuth, setScreen, showToast } = useApp();
  const [tab, setTab] = useState<'signup' | 'login'>('signup');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please fill in all fields', 'warning'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match', 'warning'); return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Registration failed', 'warning'); return; }
      setAuth({ token: data.token, userId: data.userId, username: data.username });
      setScreen('onboarding-interests');
    } catch {
      showToast('Server error. Please try again.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Please fill in all fields', 'warning'); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error || 'Login failed', 'warning'); return; }
      setAuth({ token: data.token, userId: data.userId, username: data.username });
      setScreen('home');
    } catch {
      showToast('Server error. Please try again.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialMock = (provider: string) => {
    showToast(`${provider} login coming soon!`, 'info');
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
      <div className="auth-header">
        <div className="auth-logo">🌿</div>
        <h1>Welcome to CommonGround</h1>
        <p>Find nearby friends through shared interests</p>
      </div>

      <div className="auth-tabs">
        <button
          className={`auth-tab ${tab === 'signup' ? 'active' : ''}`}
          onClick={() => setTab('signup')}
        >Create Account</button>
        <button
          className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
          onClick={() => setTab('login')}
        >Log In</button>
      </div>

      {tab === 'signup' ? (
        <form className="auth-form" onSubmit={handleSignUp}>
          <div className="form-group">
            <label>Username</label>
            <input
              className="input-field"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Confirm your password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <div className="auth-divider">
            <span>— or sign up with —</span>
          </div>

          <div className="social-buttons">
            <button type="button" className="social-btn google" onClick={() => handleSocialMock('Google')}>
              <span>G</span> Google
            </button>
            <button type="button" className="social-btn facebook" onClick={() => handleSocialMock('Facebook')}>
              <span>f</span> Facebook
            </button>
            <button type="button" className="social-btn instagram" onClick={() => handleSocialMock('Instagram')}>
              <span>📷</span> Instagram
            </button>
          </div>
        </form>
      ) : (
        <form className="auth-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label>Username</label>
            <input
              className="input-field"
              type="text"
              placeholder="Your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <p className="demo-hint">
            Demo: username <strong>demo_user</strong>, password <strong>password123</strong>
          </p>
        </form>
      )}
      </div>
    </div>
  );
}
