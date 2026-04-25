import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Widget, ActionLog, AppState, Asset, AppFile, RemoteAgent, AgentCommand, AgentMission, AgentSkill } from '../types';
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
  sendCommand: (agentId: string, cmd: string, args?: any[]) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  addMission: (mission: Omit<AgentMission, 'id' | 'createdAt'>) => void;
  updateMission: (id: string, updates: Partial<AgentMission>) => void;
  deleteMission: (id: string) => void;
  addSkill: (skill: Omit<AgentSkill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<AgentSkill>) => void;
  deleteSkill: (id: string) => void;
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
        shortcuts: parsed.shortcuts || [],
        agents: parsed.agents || [],
        missions: parsed.missions || [],
        skills: parsed.skills || []
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
      agents: [],
      missions: [],
      skills: [],
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

    // Listen to agents
    const agentsColRef = collection(db, 'users', user.uid, 'agents');
    const unsubAgents = onSnapshot(agentsColRef, (snapshot) => {
      const agentsData = snapshot.docs.map(doc => doc.data() as RemoteAgent);
      setState(prev => ({ ...prev, agents: agentsData }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/agents`));

    // Listen to missions
    const missionsColRef = collection(db, 'users', user.uid, 'missions');
    const unsubMissions = onSnapshot(missionsColRef, (snapshot) => {
      const missionsData = snapshot.docs.map(doc => doc.data() as AgentMission);
      if (missionsData.length === 0) {
        addMission({
          title: 'Initialize_Exponential_Core',
          goal: 'Bootstrap the unified agent architecture and establish local node uplink.',
          status: 'active',
          subtasks: [
            { id: 't1', description: 'Download Local Setup from Settings', status: 'pending' },
            { id: 't2', description: 'Execute NYX_OS_LAUNCHER.bat on Host', status: 'pending' },
            { id: 't3', description: 'Establish First Auth Handshake', status: 'pending' }
          ]
        });
      }
      setState(prev => ({ ...prev, missions: missionsData }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/missions`));

    // Listen to skills
    const skillsColRef = collection(db, 'users', user.uid, 'skills');
    const unsubSkills = onSnapshot(skillsColRef, (snapshot) => {
      const skillsData = snapshot.docs.map(doc => doc.data() as AgentSkill);
      if (skillsData.length === 0) {
        // Initialize default skills
        const defaultSkills: Omit<AgentSkill, 'id'>[] = [
          { name: 'Unified_Chief_Executive', description: 'Task delegation and multi-agent coordination core.', code: 'module:exec:calc', category: 'system' },
          { name: 'Self_Operating_Vision', description: 'Advanced screen capture and UI element detection.', code: 'module:vision', category: 'vision' },
          { name: 'OS_Symphony_Orchestrator', description: 'Low-level system automation and event scheduling.', code: 'module:system', category: 'system' }
        ];
        defaultSkills.forEach(s => addSkill(s));
      }
      setState(prev => ({ ...prev, skills: skillsData }));
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/skills`));

    return () => {
      unsubProfile();
      unsubWidgets();
      unsubFiles();
      unsubAgents();
      unsubMissions();
      unsubSkills();
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

  const sendCommand = async (agentId: string, cmd: string, args: any[] = []) => {
    if (!user) return;
    const commandId = Math.random().toString(36).substr(2, 9);
    const commandDocRef = doc(db, 'users', user.uid, 'agents', agentId, 'commands', commandId);
    
    const command: AgentCommand = {
      id: commandId,
      cmd,
      args,
      status: 'pending',
      createdAt: Date.now()
    };

    await setDoc(commandDocRef, command)
      .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/agents/${agentId}/commands/${commandId}`));
    
    addLog('AGENT_COMMAND_SENT', `Sent command [${cmd}] to agent: ${agentId}`);
  };

  const deleteAgent = async (agentId: string) => {
    if (!user) return;
    const agentDocRef = doc(db, 'users', user.uid, 'agents', agentId);
    await deleteDoc(agentDocRef)
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/agents/${agentId}`));
    addLog('AGENT_DELETED', `Removed agent: ${agentId}`);
  };

  const addMission = (mission: Omit<AgentMission, 'id' | 'createdAt'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newMission: AgentMission = { ...mission, id, createdAt: Date.now() };
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'missions', id), { ...newMission, ownerId: user.uid })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/missions/${id}`));
    }
    setState(prev => ({ ...prev, missions: [...prev.missions, newMission] }));
    addLog('MISSION_ADDED', `New mission started: ${mission.title}`);
  };

  const updateMission = (id: string, updates: Partial<AgentMission>) => {
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'missions', id), updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/missions/${id}`));
    }
    setState(prev => ({
      ...prev,
      missions: prev.missions.map(m => m.id === id ? { ...m, ...updates } : m)
    }));
  };

  const deleteMission = (id: string) => {
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'missions', id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/missions/${id}`));
    }
    setState(prev => ({ ...prev, missions: prev.missions.filter(m => m.id !== id) }));
  };

  const addSkill = (skill: Omit<AgentSkill, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSkill: AgentSkill = { ...skill, id };
    if (user) {
      setDoc(doc(db, 'users', user.uid, 'skills', id), { ...newSkill, ownerId: user.uid })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/skills/${id}`));
    }
    setState(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
    addLog('SKILL_ADDED', `New capability unlocked: ${skill.name}`);
  };

  const updateSkill = (id: string, updates: Partial<AgentSkill>) => {
    if (user) {
      updateDoc(doc(db, 'users', user.uid, 'skills', id), updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/skills/${id}`));
    }
    setState(prev => ({
      ...prev,
      skills: prev.skills.map(s => s.id === id ? { ...s, ...updates } : s)
    }));
    addLog('SKILL_EVOLVED', `Skill [${id}] undergone optimization.`);
  };

  const deleteSkill = (id: string) => {
    if (user) {
      deleteDoc(doc(db, 'users', user.uid, 'skills', id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/skills/${id}`));
    }
    setState(prev => ({ ...prev, skills: prev.skills.filter(s => s.id !== id) }));
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
      removeShortcut,
      sendCommand,
      deleteAgent,
      addMission,
      updateMission,
      deleteMission,
      addSkill,
      updateSkill,
      deleteSkill
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
