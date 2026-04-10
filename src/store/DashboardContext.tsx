import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Widget, ActionLog, AppState, Asset, AppFile } from '../types';
import { auth, db, signInWithGoogle, logout as firebaseLogout, handleFirestoreError, OperationType } from '../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, updateDoc, deleteDoc, collection, serverTimestamp, getDoc } from 'firebase/firestore';

interface DashboardContextType extends AppState {
  user: User | null;
  isAuthReady: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  addWidget: (widget: Partial<Widget>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  addLog: (action: string, details: string, previousState?: any) => void;
  toggleCarMode: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  updateCredential: (key: string, value: string) => void;
  updateNotes: (notes: string) => void;
  rollback: (logId: string) => void;
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (id: string) => void;
  addFile: (file: Omit<AppFile, 'id'>) => void;
  updateFile: (id: string, updates: Partial<AppFile>) => void;
  deleteFile: (id: string) => void;
  updateAiContext: (context: string) => void;
  setSearchQuery: (query: string) => void;
  updateTheme: (theme: Partial<AppState['theme']>) => void;
  addShortcut: (command: string, scriptId: string) => void;
  removeShortcut: (command: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const STORAGE_KEY = 'omnidash_state';

const INITIAL_WIDGETS: Widget[] = [
  {
    id: 'w1',
    title: 'Speedometer',
    type: 'metric',
    x: 0, y: 0, w: 1, h: 1,
    code: 'return { renderType: "metric", value: 57, unit: "km/h", label: "Current Speed", variant: "digital" }',
    config: { color: '#d4ff00' },
    isVisible: true
  },
  {
    id: 'w2',
    title: 'Climate Control',
    type: 'custom',
    x: 1, y: 0, w: 1, h: 1,
    code: 'return { renderType: "metric", temp: 23, unit: "°C", status: "Window Closed" }',
    config: {},
    isVisible: true
  },
  {
    id: 'w3',
    title: 'System Performance',
    type: 'chart',
    x: 0, y: 1, w: 2, h: 1,
    code: `return {
  renderType: 'chart',
  chartData: [
    { name: '10:00', value: 40 },
    { name: '10:05', value: 30 },
    { name: '10:10', value: 60 },
    { name: '10:15', value: 80 },
    { name: '10:20', value: 50 }
  ]
}`,
    config: {},
    isVisible: true
  },
  {
    id: 'w4',
    title: 'Location Map',
    type: 'map',
    x: 2, y: 0, w: 1, h: 2,
    code: `return {
  renderType: 'html',
  html: '<div style="background: #111; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 8px; color: #d4ff00;"><div style="font-size: 32px; margin-bottom: 8px;">📍</div><div style="font-size: 12px; font-family: monospace;">Lat: 37.7749<br/>Lng: -122.4194</div><div style="margin-top: 8px; font-size: 10px; color: #888;">Google Maps Integration Mock</div></div>'
}`,
    config: {},
    isVisible: true
  },
  {
    id: 'w5',
    title: 'Quick Actions',
    type: 'action',
    x: 0, y: 2, w: 2, h: 1,
    code: `return {
  renderType: 'actions',
  buttons: [
    { label: 'Clear Cache', action: 'console.log("Cache cleared!");' },
    { label: 'Sync Data', action: 'console.log("Data synced!");' }
  ]
}`,
    config: {},
    isVisible: true
  }
];

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        assets: parsed.assets || [],
        files: parsed.files || [],
        aiContext: parsed.aiContext || 'You are OmniDash AI, a helpful assistant integrated into a highly customizable dashboard. The user can edit widgets using JavaScript.',
        searchQuery: parsed.searchQuery || '',
        theme: parsed.theme || { primary: '#d4ff00', secondary: '#00f0ff', background: '#0a0a0c', cardBg: '#151619' },
        shortcuts: parsed.shortcuts || []
      };
    }
    return {
      widgets: INITIAL_WIDGETS,
      logs: [],
      isCarMode: false,
      viewMode: 'grid',
      credentials: {},
      notes: '',
      assets: [],
      files: [],
      aiContext: 'You are OmniDash AI, a helpful assistant integrated into a highly customizable dashboard. The user can edit widgets using JavaScript.',
      searchQuery: '',
      theme: { primary: '#d4ff00', secondary: '#00f0ff', background: '#0a0a0c', cardBg: '#151619' },
      shortcuts: []
    };
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Sync with Firestore when user is logged in
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, 'users', user.uid);
    
    // Listen to user profile (theme, notes, etc)
    const unsubProfile = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setState(prev => ({
          ...prev,
          theme: data.theme || prev.theme,
          notes: data.notes || prev.notes,
          isCarMode: data.isCarMode ?? prev.isCarMode,
          viewMode: data.viewMode || prev.viewMode,
          aiContext: data.aiContext || prev.aiContext
        }));
      } else {
        // Initialize user doc if it doesn't exist
        setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          theme: state.theme,
          notes: state.notes,
          isCarMode: state.isCarMode,
          viewMode: state.viewMode,
          aiContext: state.aiContext,
          updatedAt: serverTimestamp()
        }).catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`));
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${user.uid}`));

    // Listen to widgets
    const widgetsColRef = collection(db, 'users', user.uid, 'widgets');
    const unsubWidgets = onSnapshot(widgetsColRef, (snapshot) => {
      const widgetsData = snapshot.docs.map(doc => doc.data() as Widget);
      setState(prev => ({ ...prev, widgets: widgetsData.length > 0 ? widgetsData : prev.widgets }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/widgets`));

    // Listen to files
    const filesColRef = collection(db, 'users', user.uid, 'files');
    const unsubFiles = onSnapshot(filesColRef, (snapshot) => {
      const filesData = snapshot.docs.map(doc => doc.data() as AppFile);
      setState(prev => ({ ...prev, files: filesData.length > 0 ? filesData : prev.files }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/files`));

    return () => {
      unsubProfile();
      unsubWidgets();
      unsubFiles();
    };
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    // Apply theme to document root
    document.documentElement.style.setProperty('--color-neon-lime', state.theme.primary);
    document.documentElement.style.setProperty('--color-neon-blue', state.theme.secondary);
    document.documentElement.style.setProperty('--color-dashboard-bg', state.theme.background);
    document.documentElement.style.setProperty('--color-card-bg', state.theme.cardBg);
  }, [state]);

  const addLog = useCallback((action: string, details: string, previousState?: any) => {
    const newLog: ActionLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      action,
      details,
      previousState
    };
    setState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 100)
    }));
  }, []);

  const login = async () => {
    await signInWithGoogle();
  };

  const logout = async () => {
    await firebaseLogout();
  };

  const addWidget = (widget: Partial<Widget>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newWidget: Widget = {
      id,
      title: widget.title || 'New Widget',
      type: widget.type || 'custom',
      x: widget.x || 0,
      y: widget.y || 0,
      w: widget.w || 1,
      h: widget.h || 1,
      code: widget.code || 'return { renderType: "metric", value: 0, label: "New Metric" };',
      config: widget.config || {},
      isVisible: true
    };

    if (user) {
      const widgetDocRef = doc(db, 'users', user.uid, 'widgets', id);
      setDoc(widgetDocRef, { ...newWidget, ownerId: user.uid, createdAt: serverTimestamp() })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/widgets/${id}`));
    }

    setState(prev => {
      const newState = { ...prev, widgets: [...prev.widgets, newWidget] };
      addLog('ADD_WIDGET', `Added widget: ${newWidget.title}`, prev);
      return newState;
    });
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    if (user) {
      const widgetDocRef = doc(db, 'users', user.uid, 'widgets', id);
      updateDoc(widgetDocRef, updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/widgets/${id}`));
    }
    setState(prev => {
      const newState = {
        ...prev,
        widgets: prev.widgets.map(w => w.id === id ? { ...w, ...updates } : w)
      };
      addLog('UPDATE_WIDGET', `Updated widget: ${id}`, prev);
      return newState;
    });
  };

  const deleteWidget = (id: string) => {
    if (user) {
      const widgetDocRef = doc(db, 'users', user.uid, 'widgets', id);
      deleteDoc(widgetDocRef)
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/widgets/${id}`));
    }
    setState(prev => {
      const newState = {
        ...prev,
        widgets: prev.widgets.filter(w => w.id !== id)
      };
      addLog('DELETE_WIDGET', `Deleted widget: ${id}`, prev);
      return newState;
    });
  };

  const toggleCarMode = () => {
    const nextMode = !state.isCarMode;
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { isCarMode: nextMode })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    }
    setState(prev => ({ ...prev, isCarMode: nextMode }));
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { viewMode: mode })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    }
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const updateCredential = (key: string, value: string) => {
    setState(prev => ({
      ...prev,
      credentials: { ...prev.credentials, [key]: value }
    }));
  };

  const updateNotes = (notes: string) => {
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { notes })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    }
    setState(prev => ({ ...prev, notes }));
  };

  const rollback = (logId: string) => {
    const log = state.logs.find(l => l.id === logId);
    if (log && log.previousState) {
      setState(log.previousState);
      addLog('ROLLBACK', `Rolled back to state from log: ${logId}`);
    }
  };

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    const newAsset = { ...asset, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => {
      const newState = { ...prev, assets: [...prev.assets, newAsset] };
      addLog('ADD_ASSET', `Added asset: ${asset.name}`, prev);
      return newState;
    });
  };

  const deleteAsset = (id: string) => {
    setState(prev => {
      const newState = { ...prev, assets: prev.assets.filter(a => a.id !== id) };
      addLog('DELETE_ASSET', `Deleted asset: ${id}`, prev);
      return newState;
    });
  };

  const addFile = (file: Omit<AppFile, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newFile = { ...file, id };
    if (user) {
      const fileDocRef = doc(db, 'users', user.uid, 'files', id);
      setDoc(fileDocRef, { ...newFile, ownerId: user.uid, createdAt: serverTimestamp() })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/files/${id}`));
    }
    setState(prev => {
      const newState = { ...prev, files: [...prev.files, newFile] };
      addLog('ADD_FILE', `Added file: ${file.name}`, prev);
      return newState;
    });
  };

  const updateFile = (id: string, updates: Partial<AppFile>) => {
    if (user) {
      const fileDocRef = doc(db, 'users', user.uid, 'files', id);
      updateDoc(fileDocRef, updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/files/${id}`));
    }
    setState(prev => {
      const newState = {
        ...prev,
        files: prev.files.map(f => f.id === id ? { ...f, ...updates } : f)
      };
      addLog('UPDATE_FILE', `Updated file: ${id}`, prev);
      return newState;
    });
  };

  const deleteFile = (id: string) => {
    if (user) {
      const fileDocRef = doc(db, 'users', user.uid, 'files', id);
      deleteDoc(fileDocRef)
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/files/${id}`));
    }
    setState(prev => {
      const newState = { ...prev, files: prev.files.filter(f => f.id !== id) };
      addLog('DELETE_FILE', `Deleted file: ${id}`, prev);
      return newState;
    });
  };

  const updateAiContext = (context: string) => {
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { aiContext: context })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    }
    setState(prev => ({ ...prev, aiContext: context }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const updateTheme = (theme: Partial<AppState['theme']>) => {
    const nextTheme = { ...state.theme, ...theme };
    if (user) {
      updateDoc(doc(db, 'users', user.uid), { theme: nextTheme })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`));
    }
    setState(prev => ({ ...prev, theme: nextTheme }));
  };

  const addShortcut = (command: string, scriptId: string) => {
    setState(prev => ({ ...prev, shortcuts: [...prev.shortcuts, { command, scriptId }] }));
  };

  const removeShortcut = (command: string) => {
    setState(prev => ({ ...prev, shortcuts: prev.shortcuts.filter(s => s.command !== command) }));
  };

  return (
    <DashboardContext.Provider value={{
      ...state,
      user,
      isAuthReady,
      login,
      logout,
      addWidget,
      updateWidget,
      deleteWidget,
      addLog,
      toggleCarMode,
      setViewMode,
      updateCredential,
      updateNotes,
      rollback,
      addAsset,
      deleteAsset,
      addFile,
      updateFile,
      deleteFile,
      updateAiContext,
      setSearchQuery,
      updateTheme,
      addShortcut,
      removeShortcut
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
