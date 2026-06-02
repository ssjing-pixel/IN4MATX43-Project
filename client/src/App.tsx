import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import AuthPage from './pages/AuthPage';
import OnboardingInterests from './pages/OnboardingInterests';
import OnboardingRange from './pages/OnboardingRange';
import HomePage from './pages/HomePage';
import ProfilePage from './pages/ProfilePage';
import FriendsPage from './pages/FriendsPage';
import ChatPage from './pages/ChatPage';
import Toast from './components/Toast';
import BottomNav from './components/BottomNav';
import TopNavbar from './components/TopNavbar';
import { AuthState } from './types';

type Screen = 'auth' | 'onboarding-interests' | 'onboarding-range' | 'home' | 'profile' | 'friends' | 'chat';

interface AppContextType {
  auth: AuthState;
  setAuth: (a: AuthState) => void;
  screen: Screen;
  setScreen: (s: Screen) => void;
  chatFriendId: number | null;
  chatFriendName: string;
  openChat: (friendId: number, friendName: string) => void;
  showToast: (msg: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AppContext = createContext<AppContextType>({} as AppContextType);
export const useApp = () => useContext(AppContext);

function App() {
  const [auth, setAuthState] = useState<AuthState>(() => {
    const token = localStorage.getItem('cg_token');
    const userId = localStorage.getItem('cg_userId');
    const username = localStorage.getItem('cg_username');
    return {
      token,
      userId: userId ? parseInt(userId) : null,
      username,
    };
  });
  const [screen, setScreenState] = useState<Screen>(() => {
    const token = localStorage.getItem('cg_token');
    return token ? 'home' : 'auth';
  });
  const [chatFriendId, setChatFriendId] = useState<number | null>(null);
  const [chatFriendName, setChatFriendName] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const setAuth = useCallback((a: AuthState) => {
    setAuthState(a);
    if (a.token) {
      localStorage.setItem('cg_token', a.token);
      localStorage.setItem('cg_userId', String(a.userId));
      localStorage.setItem('cg_username', a.username || '');
    } else {
      localStorage.removeItem('cg_token');
      localStorage.removeItem('cg_userId');
      localStorage.removeItem('cg_username');
    }
  }, []);

  const setScreen = useCallback((s: Screen) => {
    setScreenState(s);
  }, []);

  const openChat = useCallback((friendId: number, friendName: string) => {
    setChatFriendId(friendId);
    setChatFriendName(friendName);
    setScreenState('chat');
  }, []);

  const showToast = useCallback((msg: string, type: string = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const showNavScreens: Screen[] = ['home', 'profile', 'friends', 'chat'];
  const hasNav = showNavScreens.includes(screen);

  return (
    <AppContext.Provider value={{ auth, setAuth, screen, setScreen, chatFriendId, chatFriendName, openChat, showToast }}>
      <div className={`app-shell${hasNav ? ' has-nav' : ''}`}>
        {hasNav && <TopNavbar />}
        {screen === 'auth' && <AuthPage />}
        {screen === 'onboarding-interests' && <OnboardingInterests />}
        {screen === 'onboarding-range' && <OnboardingRange />}
        {screen === 'home' && <HomePage />}
        {screen === 'profile' && <ProfilePage />}
        {screen === 'friends' && <FriendsPage />}
        {screen === 'chat' && <ChatPage />}
        {showNavScreens.includes(screen) && <BottomNav />}
        {toast && <Toast message={toast.msg} type={toast.type} />}
      </div>
    </AppContext.Provider>
  );
}

export default App;
