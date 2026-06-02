import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { ChatChannel, Message } from '../types';

export default function ChatPage() {
  const { auth, setScreen, chatFriendId, chatFriendName } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [channelId, setChannelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (auth.userId && chatFriendId) {
      initChannel();
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [auth.userId, chatFriendId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initChannel = async () => {
    try {
      const res = await fetch('/api/chat/channel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ user1Id: auth.userId, user2Id: chatFriendId }),
      });
      const data = await res.json();
      setChannelId(data.id);
      loadMessages(data.id);
      pollRef.current = setInterval(() => loadMessages(data.id), 3000);
    } catch {}
  };

  const loadMessages = async (cId: number) => {
    try {
      const res = await fetch(`/api/chat/messages/${cId}`, {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch {}
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !channelId) return;
    setLoading(true);
    try {
      await fetch('/api/chat/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ channelId, senderId: auth.userId, content: input.trim() }),
      });
      setInput('');
      loadMessages(channelId);
    } catch {} finally {
      setLoading(false);
    }
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: 'calc(100vh - var(--nav-height, 64px))',
      background: 'var(--bg)',
    }}>
      {/* Chat header */}
      <div style={{
        background: 'white', borderBottom: '1px solid var(--border)',
        padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 14,
        flexShrink: 0,
      }}>
        <button
          onClick={() => setScreen('friends')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)',
            fontSize: 22, padding: '4px 8px', borderRadius: 8, transition: 'background 0.2s',
          }}
          title="Back to Friends"
        >
          ←
        </button>
        <div className="avatar">{chatFriendName?.[0]?.toUpperCase() || '👤'}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>{chatFriendName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>CommonGround friend</div>
        </div>
      </div>

      {/* Messages area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '24px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', width: '100%' }}>
          {messages.length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 24px' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
              <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Start the conversation!</p>
              <p style={{ fontSize: 14 }}>Say hello to {chatFriendName}</p>
            </div>
          )}
          {messages.map(msg => {
            const isMe = msg.sender_id === auth.userId;
            return (
              <div key={msg.id} style={{
                display: 'flex',
                flexDirection: isMe ? 'row-reverse' : 'row',
                gap: 10, alignItems: 'flex-end',
              }}>
                {!isMe && (
                  <div className="avatar" style={{ width: 32, height: 32, fontSize: 14 }}>
                    {msg.sender_name?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div style={{ maxWidth: '65%' }}>
                  <div style={{
                    background: isMe ? 'var(--primary)' : 'white',
                    color: isMe ? 'white' : 'var(--text)',
                    borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '12px 16px',
                    fontSize: 15, lineHeight: 1.5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  }}>
                    {msg.content}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    textAlign: isMe ? 'right' : 'left',
                    marginTop: 4, paddingInline: 4,
                  }}>
                    {formatTime(msg.created_at)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div style={{
        background: 'white', borderTop: '1px solid var(--border)',
        padding: '16px 24px', flexShrink: 0,
      }}>
        <form
          onSubmit={sendMessage}
          style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 12 }}
        >
          <input
            className="input-field"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            style={{ flex: 1 }}
            autoFocus
          />
          <button
            type="submit"
            className="btn-primary"
            style={{ width: 'auto', padding: '12px 24px' }}
            disabled={loading || !input.trim()}
          >
            Send →
          </button>
        </form>
      </div>
    </div>
  );
}
