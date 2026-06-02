import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../App';
import { NearbyUser, Mission } from '../types';
import './HomePage.css';

// Fix default icon issue with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createPersonIcon(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <circle cx="18" cy="18" r="18" fill="${color}" opacity="0.95"/>
    <circle cx="18" cy="13" r="5" fill="white"/>
    <path d="M8 28 Q8 20 18 20 Q28 20 28 28" fill="white"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createStarIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
    <polygon points="18,4 22,14 33,14 24,21 27,32 18,25 9,32 12,21 3,14 14,14" fill="#F5A623" stroke="white" stroke-width="1.5"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
  });
}

function createSelfIcon() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
    <path d="M16 0 C7.16 0 0 7.16 0 16 C0 28 16 42 16 42 C16 42 32 28 32 16 C32 7.16 24.84 0 16 0Z" fill="#e05555"/>
    <circle cx="16" cy="16" r="8" fill="white" opacity="0.9"/>
    <circle cx="16" cy="16" r="4" fill="#e05555"/>
  </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -44],
  });
}

const UCI_CENTER: [number, number] = [33.6405, -117.8443];

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => { map.setView(center, 14); }, [center]);
  return null;
}

export default function HomePage() {
  const { auth, showToast } = useApp();
  const [tab, setTab] = useState<'missions' | 'badges'>('missions');
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userLocation] = useState<[number, number]>(UCI_CENTER);
  const [rangeMiles, setRangeMiles] = useState(5);
  const panelRef = useRef<HTMLDivElement>(null);

  // Convert miles to meters for the circle
  const rangeMeters = rangeMiles * 1609.34;

  useEffect(() => {
    if (!auth.userId) return;
    loadNearby();
    loadMissions();
    loadProfile();
  }, [auth.userId]);

  const loadProfile = async () => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/profile/${auth.userId}`);
      const data = await res.json();
      if (data.range_miles) setRangeMiles(data.range_miles);
    } catch {}
  };

  const loadNearby = async () => {
    if (!auth.userId) return;
    try {
      // Update location first
      await fetch('/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: auth.userId, lat: UCI_CENTER[0], lng: UCI_CENTER[1] }),
      });
      const res = await fetch(`/api/nearby?userId=${auth.userId}`);
      const data = await res.json();
      setNearbyUsers(data.nearby || []);
    } catch {}
  };

  const loadMissions = async () => {
    if (!auth.userId) return;
    try {
      const res = await fetch(`/api/missions/${auth.userId}`);
      const data = await res.json();
      setMissions(Array.isArray(data) ? data : []);
    } catch {}
  };

  const personIcon = createPersonIcon('#4A7C59');
  const starIcon = createStarIcon();
  const selfIcon = createSelfIcon();

  return (
    <div className="home-page">
      <div className="map-wrapper">
        <MapContainer
          center={UCI_CENTER}
          zoom={14}
          className="map-container"
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={userLocation} />

          {/* User's own location */}
          <Marker position={userLocation} icon={selfIcon}>
            <Popup>
              <strong>You</strong><br/>Your location
            </Popup>
          </Marker>

          {/* Discovery radius circle */}
          <Circle
            center={userLocation}
            radius={rangeMeters}
            pathOptions={{
              color: '#e05555',
              fillColor: '#e05555',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '6 4',
            }}
          />

          {/* Nearby users */}
          {nearbyUsers.map((user, idx) => {
            const isMatch = user.sharedInterests && user.sharedInterests.length >= 2;
            const icon = isMatch ? starIcon : personIcon;
            return (
              <Marker key={user.id} position={[user.lat, user.lng]} icon={icon}>
                <Popup>
                  <strong>{user.display_name}</strong><br/>
                  {user.sharedInterests?.length > 0
                    ? `Shared: ${user.sharedInterests.join(', ')}`
                    : 'Nearby user'}
                  <br/>
                  <small>{user.distance?.toFixed(1)} mi away</small>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className="bottom-panel" ref={panelRef}>
        <div className="panel-handle" />

        <div className="panel-tabs">
          <button
            className={`panel-tab ${tab === 'missions' ? 'active' : ''}`}
            onClick={() => setTab('missions')}
          >
            ⭐ Missions
          </button>
          <button
            className={`panel-tab ${tab === 'badges' ? 'active' : ''}`}
            onClick={() => setTab('badges')}
          >
            🏅 Badges
          </button>
        </div>

        {tab === 'missions' && (
          <div className="missions-list">
            {missions.length === 0 ? (
              <div className="empty-state">No missions yet.</div>
            ) : (
              missions.map(mission => (
                <div key={mission.id} className={`mission-card ${mission.completed ? 'completed' : ''}`}>
                  <div className="mission-header">
                    <span className="mission-star">⭐</span>
                    <div className="mission-info">
                      <div className="mission-name">{mission.name}</div>
                      {!mission.completed && (
                        <div className="mission-time">{mission.timeRemaining}</div>
                      )}
                      {mission.completed && (
                        <div className="mission-done">✓ Completed! +{mission.points} pts</div>
                      )}
                    </div>
                    <span className="mission-sparkle">✨</span>
                  </div>
                  {!mission.completed && mission.goal > 1 && (
                    <div className="mission-progress-wrap">
                      <div className="mission-progress-bar">
                        <div
                          className="mission-progress-fill"
                          style={{ width: `${Math.min(100, (mission.progress / mission.goal) * 100)}%` }}
                        />
                      </div>
                      <span className="mission-progress-text">{mission.progress}/{mission.goal}</span>
                    </div>
                  )}
                  {!mission.completed && mission.goal === 1 && (
                    <div className="mission-progress-wrap">
                      <div className="mission-progress-bar">
                        <div
                          className="mission-progress-fill"
                          style={{ width: `${mission.progress * 100}%` }}
                        />
                      </div>
                      <span className="mission-progress-text">{mission.progress > 0 ? 'In progress' : 'Not started'}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'badges' && (
          <div className="badges-grid">
            <div className="badge-item earned">
              <div className="badge-icon">🌱</div>
              <div className="badge-name">Newcomer</div>
            </div>
            <div className="badge-item earned">
              <div className="badge-icon">🗺️</div>
              <div className="badge-name">Explorer</div>
            </div>
            <div className="badge-item">
              <div className="badge-icon">🤝</div>
              <div className="badge-name">Connector</div>
            </div>
            <div className="badge-item">
              <div className="badge-icon">⭐</div>
              <div className="badge-name">Star User</div>
            </div>
            <div className="badge-item">
              <div className="badge-icon">🏆</div>
              <div className="badge-name">Champion</div>
            </div>
            <div className="badge-item">
              <div className="badge-icon">💬</div>
              <div className="badge-name">Chatter</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
