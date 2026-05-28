import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppNotification } from '../types';
import { auth, db, signInWithGoogle, signInDevBypass, logout as firebaseLogout, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { NeuralService } from '../lib/neuralService';

interface DashboardContextType {
  user: User | null;
  isAuthReady: boolean;
  login: () => Promise<User>;
  logout: () => Promise<void>;
  
  // Lightweight UI State
  isCarMode: boolean;
  viewMode: 'grid' | 'list';
  theme: { primary: string; secondary: string; background: string; cardBg: string };
  assistantSettings?: { isDraggable: boolean; voiceWaveEnabled: boolean; autoListen: boolean; position?: { x: number; y: number } };
  aiContext: string;
  searchQuery: string;
  notes: string;
  notifications: AppNotification[];
  activeTutorial: string | null;
  shortcuts: { command: string; scriptId: string }[];
  credentials: Record<string, string>;

  // Setters
  toggleCarMode: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  updateTheme: (theme: Partial<{ primary: string; secondary: string; background: string; cardBg: string }>) => void;
  updateNotes: (notes: string) => void;
  updateAiContext: (context: string) => void;
  setSearchQuery: (query: string) => void;
  updateAssistantSettings: (settings: Partial<any>) => void;
  updateCredential: (key: string, value: string) => void;
  addShortcut: (command: string, scriptId: string) => void;
  removeShortcut: (command: string) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp'>) => void;
  clearNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  setTutorial: (featureId: string | null) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  
  // UI ONLY State
  const [isCarMode, setIsCarMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid'|'list'>('grid');
  const [theme, setTheme] = useState({ primary: '#d4ff00', secondary: '#00f0ff', background: '#0a0a0c', cardBg: '#151619' });
  const [assistantSettings, setAssistantSettings] = useState({ isDraggable: true, voiceWaveEnabled: true, autoListen: false });
  const [aiContext, setAiContext] = useState('You are OmniDash AI...');
  const [searchQuery, setSearchQuery] = useState('');
  const [notes, setNotes] = useState('');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState<{ command: string; scriptId: string }[]>([]);
  const [credentials, setCredentials] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => { NeuralService.initialize(credentials); }, [credentials]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-neon-lime', theme.primary);
    document.documentElement.style.setProperty('--color-neon-blue', theme.secondary);
    document.documentElement.style.setProperty('--color-dashboard-bg', theme.background);
    document.documentElement.style.setProperty('--color-card-bg', theme.cardBg);
  }, [theme]);

  useEffect(() => {
    if (!user) return;
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.theme) setTheme(data.theme);
        if (data.notes) setNotes(data.notes);
        if (data.isCarMode !== undefined) setIsCarMode(data.isCarMode);
        if (data.viewMode) setViewMode(data.viewMode);
        if (data.aiContext) setAiContext(data.aiContext);
        if (data.assistantSettings) setAssistantSettings(data.assistantSettings);
      } else {
        setDoc(doc(db, 'users', user.uid), {
          uid: user.uid, email: user.email, theme, notes, isCarMode, viewMode, aiContext, assistantSettings, updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    return () => unsubProfile();
  }, [user]);

  // Actions...
  const toggleCarMode = () => {
    if (user) updateDoc(doc(db, 'users', user.uid), { isCarMode: !isCarMode });
    setIsCarMode(!isCarMode);
  };
  
  const setViewModeFn = (mode: 'grid'|'list') => {
    if (user) updateDoc(doc(db, 'users', user.uid), { viewMode: mode });
    setViewMode(mode);
  };

  const updateTheme = (newTheme: any) => {
    const nextTheme = { ...theme, ...newTheme };
    if (user) updateDoc(doc(db, 'users', user.uid), { theme: nextTheme });
    setTheme(nextTheme);
  };

  const updateNotes = (newNotes: string) => {
    if (user) updateDoc(doc(db, 'users', user.uid), { notes: newNotes });
    setNotes(newNotes);
  };

  const updateAiContext = (context: string) => {
    if (user) updateDoc(doc(db, 'users', user.uid), { aiContext: context });
    setAiContext(context);
  };

  const updateAssistantSettings = (settings: any) => {
    const nextSettings = { ...assistantSettings, ...settings };
    if (user) updateDoc(doc(db, 'users', user.uid), { assistantSettings: nextSettings });
    setAssistantSettings(nextSettings);
  };

  const handleLogin = async (): Promise<User> => {
    try {
      const u = await signInWithGoogle();
      setNotifications(p => [{
        id: Math.random().toString(),
        timestamp: Date.now(),
        title: 'SECURE_LINK_ACTIVE',
        message: `Welcome back, ${u.displayName || 'Operator'}. Satellite communication channel established.`,
        featureId: 'AUTH_BANNER',
        type: 'info'
      }, ...p]);
      return u;
    } catch (err: any) {
      console.warn("Google authentication popup error. Engaging local bypass...", err);
      try {
        const u = await signInDevBypass();
        setNotifications(p => [{
          id: Math.random().toString(),
          timestamp: Date.now(),
          title: 'DEV_BYPASS_ENGAGED',
          message: 'Google login was blocked by iframe/popup restrictions. Core OS has activated Safe Offline Dev Mode.',
          featureId: 'AUTH_BANNER',
          type: 'warning'
        }, ...p]);
        return u;
      } catch (bypassErr) {
        throw err;
      }
    }
  };

  return (
    <DashboardContext.Provider value={{
      user, isAuthReady, login: handleLogin, logout: firebaseLogout,
      isCarMode, viewMode, theme, assistantSettings, aiContext, searchQuery, notes, notifications, activeTutorial, shortcuts, credentials,
      toggleCarMode, setViewMode: setViewModeFn, updateTheme, updateNotes, updateAiContext, setSearchQuery, updateAssistantSettings,
      updateCredential: (k, v) => setCredentials(p => ({...p, [k]: v})),
      addShortcut: (cmd, sid) => setShortcuts(p => [...p, {command: cmd, scriptId: sid}]),
      removeShortcut: (cmd) => setShortcuts(p => p.filter(s => s.command !== cmd)),
      addNotification: (n) => setNotifications(p => [{...n, id: Math.random().toString(), timestamp: Date.now()}, ...p]),
      clearNotification: (id) => setNotifications(p => p.filter(n => n.id !== id)),
      markNotificationRead: (id) => setNotifications(p => p.map(n => n.id === id ? {...n, read: true} : n)),
      setTutorial: setActiveTutorial
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error('useDashboard must be used within a DashboardProvider');
  return context;
};
