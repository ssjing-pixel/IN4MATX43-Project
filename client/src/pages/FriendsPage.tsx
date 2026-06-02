import React, { useState, useEffect } from 'react';
import { useApp } from '../App';
import { Friend, NearbyUser } from '../types';

export default function FriendsPage() {
  const { auth, openChat, showToast } = useApp();
  const [tab, setTab] = useState<'friends' | 'nearby' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [nearby, setNearby] = useState<NearbyUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (auth.userId) {
      loadFriends();
      loadNearby();
    }
  }, [auth.userId]);

  const loadFriends = async () => {
    try {
      const res = await fetch(`/api/friends/${auth.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      setFriends(Array.isArray(data) ? data : []);
    } catch {}
  };

  const loadNearby = async () => {
    try {
      const res = await fetch(`/api/nearby?userId=${auth.userId}`);
      const data = await res.json();
      setNearby(data.nearby || []);
    } catch {}
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/friends/search?q=${encodeURIComponent(searchQuery)}&userId=${auth.userId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch {
      showToast('Search failed', 'warning');
    } finally {
      setSearching(false);
    }
  };

  const sendRequest = async (toUserId: number, toUsername: string) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ fromUserId: auth.userId, toUserId }),
      });
      if (res.ok) {
        showToast(`Friend request sent to ${toUsername}!`, 'success');
        setSearchResults(prev => prev.filter(u => u.id !== toUserId));
      } else {
        const d = await res.json();
        showToast(d.error || 'Could not send request', 'warning');
      }
    } catch {
      showToast('Failed to send request', 'warning');
    }
  };

  const acceptRequest = async (friendRecordId: number) => {
    try {
      const res = await fetch(`/api/friends/accept/${friendRecordId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        showToast('Friend request accepted!', 'success');
        loadFriends();
      }
    } catch {}
  };

  const pendingRequests = friends.filter(f => f.status === 'pending');
  const acceptedFriends = friends.filter(f => f.status === 'accepted');

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100%' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px 40px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>Friends</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 15 }}>
          Connect with people who share your interests nearby.
        </p>

        {/* Search bar */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
          <input
            className="input-field"
            placeholder="Search by username..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            style={{ flex: 1 }}
          />
          <button className="btn-primary btn-sm" style={{ width: 'auto', whiteSpace: 'nowrap' }} onClick={handleSearch} disabled={searching}>
            {searching ? '...' : '🔍 Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Search Results</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {searchResults.map(user => (
                <div key={user.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="avatar">{user.avatar || '👤'}</div>
                    <div>
                      <div style={{ fontWeight: 600 }}>{user.display_name || user.username}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>@{user.username}</div>
                    </div>
                  </div>
                  <button
                    className="btn-primary btn-sm"
                    style={{ width: 'auto' }}
                    onClick={() => sendRequest(user.id, user.username)}
                  >
                    + Add Friend
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {(['friends', 'nearby', 'requests'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '10px', border: 'none',
                background: tab === t ? 'var(--primary)' : 'transparent',
                color: tab === t ? 'white' : 'var(--text-muted)',
                borderRadius: 10, fontWeight: tab === t ? 600 : 500,
                cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {t === 'friends' && '🤝'}{t === 'nearby' && '📍'}{t === 'requests' && '📬'}
              {t.charAt(0).toUpperCase() + t.slice(1)}
              {t === 'requests' && pendingRequests.length > 0 && (
                <span style={{
                  background: tab === t ? 'rgba(255,255,255,0.3)' : 'var(--primary)',
                  color: 'white', borderRadius: '50%', width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                }}>
                  {pendingRequests.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Friends tab */}
        {tab === 'friends' && (
          <div>
            {acceptedFriends.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No friends yet</p>
                <p style={{ fontSize: 14 }}>Search for people or check the Nearby tab to find connections.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {acceptedFriends.map(friend => (
                  <div key={friend.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div className="avatar">{friend.avatar || '👤'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{friend.display_name}</div>
                      </div>
                    </div>
                    {friend.interests?.length > 0 && (
                      <div style={{ marginBottom: 14, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                        {friend.interests.slice(0, 4).map((i: string) => (
                          <span key={i} className="tag-outline" style={{ fontSize: 12, padding: '2px 8px' }}>{i}</span>
                        ))}
                      </div>
                    )}
                    <button
                      className="btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => openChat(friend.id, friend.display_name)}
                    >
                      💬 Message
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Nearby tab */}
        {tab === 'nearby' && (
          <div>
            {nearby.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📍</div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No one nearby yet</p>
                <p style={{ fontSize: 14 }}>Make sure your location is set and try again.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 16,
              }}>
                {nearby.map(user => (
                  <div key={user.id} className="card" style={{ padding: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div className="avatar">{user.avatar || '👤'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{user.display_name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                          {user.distance?.toFixed(1)} mi away
                        </div>
                      </div>
                      {user.sharedInterests?.length >= 2 && (
                        <span title="Great match!" style={{ fontSize: 20 }}>⭐</span>
                      )}
                    </div>
                    {user.sharedInterests?.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>Shared interests:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {user.sharedInterests.slice(0, 3).map((i: string) => (
                            <span key={i} className="tag" style={{ fontSize: 12, padding: '2px 8px' }}>{i}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      className="btn-secondary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => sendRequest(user.id, user.display_name)}
                    >
                      + Add Friend
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 24px' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📬</div>
                <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>No pending requests</p>
                <p style={{ fontSize: 14 }}>Friend requests you receive will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {pendingRequests.map(req => (
                  <div key={req.friend_record_id} className="card" style={{
                    padding: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="avatar">{req.avatar || '👤'}</div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{req.display_name}</div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Wants to be your friend</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        className="btn-primary btn-sm"
                        style={{ width: 'auto' }}
                        onClick={() => acceptRequest(req.friend_record_id)}
                      >
                        ✓ Accept
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
