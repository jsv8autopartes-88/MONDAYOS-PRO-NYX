import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Widget, ActionLog, AppState, Asset, AppFile } from '../types';

interface DashboardContextType extends AppState {
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

  const addWidget = (widget: Partial<Widget>) => {
    const newWidget: Widget = {
      id: Math.random().toString(36).substr(2, 9),
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
    setState(prev => {
      const newState = { ...prev, widgets: [...prev.widgets, newWidget] };
      addLog('ADD_WIDGET', `Added widget: ${newWidget.title}`, prev);
      return newState;
    });
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
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
    setState(prev => ({ ...prev, isCarMode: !prev.isCarMode }));
  };

  const setViewMode = (mode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode: mode }));
  };

  const updateCredential = (key: string, value: string) => {
    setState(prev => ({
      ...prev,
      credentials: { ...prev.credentials, [key]: value }
    }));
  };

  const updateNotes = (notes: string) => {
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
    const newFile = { ...file, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => {
      const newState = { ...prev, files: [...prev.files, newFile] };
      addLog('ADD_FILE', `Added file: ${file.name}`, prev);
      return newState;
    });
  };

  const updateFile = (id: string, updates: Partial<AppFile>) => {
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
    setState(prev => {
      const newState = { ...prev, files: prev.files.filter(f => f.id !== id) };
      addLog('DELETE_FILE', `Deleted file: ${id}`, prev);
      return newState;
    });
  };

  const updateAiContext = (context: string) => {
    setState(prev => ({ ...prev, aiContext: context }));
  };

  const setSearchQuery = (query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  };

  const updateTheme = (theme: Partial<AppState['theme']>) => {
    setState(prev => ({ ...prev, theme: { ...prev.theme, ...theme } }));
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
