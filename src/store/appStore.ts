import { create } from 'zustand';
import { Widget, ActionLog, AppFile, RemoteAgent, AgentCommand, AgentMission, AgentSkill, AutopilotAction, WebLink, Asset, OBDConnectionStatus, OBDPID, DTCRecord } from '../types';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface AppStoreState {
  widgets: Widget[];
  logs: ActionLog[];
  files: AppFile[];
  agents: RemoteAgent[];
  missions: AgentMission[];
  skills: AgentSkill[];
  reportFiles: AppFile[];
  links: WebLink[];
  assets: Asset[];
  isAutopilotActive: boolean;
  autopilotQueue: AutopilotAction[];
  autopilotStatus: string;
  obd: {
    status: OBDConnectionStatus;
    pids: OBDPID[];
    dtcs: DTCRecord[];
    isScanning: boolean;
    agentMode: 'assisted' | 'guided' | 'autonomous';
  };
  
  // Actions
  addLog: (action: string, details: string, previousState?: any) => void;
  rollback: (logId: string) => void;
  
  addWidget: (widget: Partial<Widget>) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  deleteWidget: (id: string) => void;
  
  addFile: (file: Omit<AppFile, 'id'>) => void;
  updateFile: (id: string, updates: Partial<AppFile>) => void;
  deleteFile: (id: string) => void;
  
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  deleteAsset: (id: string) => void;
  
  updateAgent: (agentId: string, updates: Partial<RemoteAgent>) => Promise<void>;
  sendCommand: (agentId: string, cmd: string, args?: any[]) => Promise<void>;
  deleteAgent: (agentId: string) => Promise<void>;
  
  addMission: (mission: Omit<AgentMission, 'id' | 'createdAt'>) => void;
  updateMission: (id: string, updates: Partial<AgentMission>) => void;
  deleteMission: (id: string) => void;
  
  addSkill: (skill: Omit<AgentSkill, 'id'>) => void;
  updateSkill: (id: string, updates: Partial<AgentSkill>) => void;
  deleteSkill: (id: string) => void;
  
  toggleAutopilot: () => void;
  addAutopilotTask: (actions: Omit<AutopilotAction, 'id' | 'status'>[]) => void;
  clearAutopilotQueue: () => void;
  updateAutopilotStatus: (status: string) => void;
  completeAutopilotAction: (id: string) => void;
  
  addLink: (link: Omit<WebLink, 'id'>) => void;
  deleteLink: (id: string) => void;
  
  connectOBD: (adapter: 'elm327' | 'j2534') => Promise<void>;
  disconnectOBD: () => void;
  scanDTCs: () => Promise<void>;
  clearDTCs: () => Promise<void>;
  updatePID: (pidId: string, value: number | string) => void;
  setOBDAgentMode: (mode: 'assisted' | 'guided' | 'autonomous') => void;

  generateSystemReport: () => void;

  initializeFirebaseSubscriptions: (userId: string) => () => void;
}

const INITIAL_WIDGETS: Widget[] = [
  {
    id: 'w1',
    title: 'System Clock',
    type: 'metric',
    x: 0, y: 0, w: 1, h: 1,
    code: 'const now = new Date(); return { renderType: "metric", value: now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"}), unit: "IST", label: "Local Time", variant: "digital" }',
    config: { color: '#d4ff00' },
    isVisible: true
  },
  {
    id: 'w2',
    title: 'Network Traffic',
    type: 'custom',
    x: 1, y: 0, w: 1, h: 1,
    code: 'return { renderType: "metric", value: (Math.random() * 5).toFixed(2), unit: "MB/s", label: "Neural Link Bandwidth" }',
    config: {},
    isVisible: true
  },
  {
    id: 'w3',
    title: 'Action Latency',
    type: 'chart',
    x: 0, y: 1, w: 2, h: 1,
    code: `return {\n  renderType: 'chart',\n  chartData: [\n    { name: 'T-20', value: 40 },\n    { name: 'T-15', value: 30 },\n    { name: 'T-10', value: 60 },\n    { name: 'T-5', value: 45 },\n    { name: 'NOW', value: Math.floor(Math.random() * 40) + 30 }\n  ]\n}`,
    config: {},
    isVisible: true
  },
  {
    id: 'w4',
    title: 'Uplink Topology',
    type: 'map',
    x: 2, y: 0, w: 1, h: 2,
    code: `return {\n  renderType: 'html',\n  html: '<div style="background: rgba(0,0,0,0.4); border: 1px solid rgba(212,255,0,0.2); width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 12px; color: #d4ff00; font-family: monospace;"><div style="font-size: 24px; margin-bottom: 8px; animation: pulse 2s infinite;">🌐</div><div style="font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Core_Hub_Active</div><div style="margin-top: 10px; font-size: 9px; color: #888; text-align: center;">LOCAL_NODE: 127.0.0.1<br/>UPLINK: CLOUD_SECURE</div></div>'\n}`,
    config: {},
    isVisible: true
  },
  {
    id: 'w5',
    title: 'Quick Orchestration',
    type: 'action',
    x: 0, y: 2, w: 2, h: 1,
    code: `return {\n  renderType: 'actions',\n  buttons: [\n    { label: 'Flush Logs', action: 'console.log("System Logs Flushed");' },\n    { label: 'Re-Link Agents', action: 'console.log("Re-establishing satellite links...");' }\n  ]\n}`,
    config: {},
    isVisible: true
  }
];

export const useAppStore = create<AppStoreState>((set, get) => ({
  widgets: INITIAL_WIDGETS,
  logs: [],
  files: [],
  agents: [],
  missions: [],
  skills: [],
  reportFiles: [],
  links: [],
  assets: [],
  isAutopilotActive: false,
  autopilotQueue: [],
  autopilotStatus: 'STANDBY',
  obd: {
    status: { connected: false, protocol: 'NONE', adapter: 'none', interface: 'none', latency: 0, voltage: 0 },
    pids: [
      { id: 'pid1', code: '010C', name: 'Engine RPM', unit: 'RPM', value: 0, min: 0, max: 8000, priority: 'high', description: 'Engine Speed' },
      { id: 'pid2', code: '010D', name: 'Vehicle Speed', unit: 'km/h', value: 0, min: 0, max: 260, priority: 'high', description: 'Vehicle Speed' },
      { id: 'pid3', code: '0105', name: 'Coolant Temp', unit: '°C', value: 0, min: -40, max: 215, priority: 'medium', description: 'Engine Coolant Temperature' },
      { id: 'pid4', code: '0111', name: 'Throttle Position', unit: '%', value: 0, min: 0, max: 100, priority: 'medium', description: 'Absolute Throttle Position' },
      { id: 'pid5', code: '0104', name: 'Engine Load', unit: '%', value: 0, min: 0, max: 100, priority: 'medium', description: 'Calculated Engine Load' }
    ],
    dtcs: [],
    isScanning: false,
    agentMode: 'assisted'
  },

  addLog: (action, details, previousState) => {
    const newLog: ActionLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      action,
      details,
      previousState
    };
    set(state => ({ logs: [newLog, ...state.logs].slice(0, 100) }));
  },
  
  rollback: (logId) => {
    const state = get();
    const log = state.logs.find(l => l.id === logId);
    if (log && log.previousState) {
      set(log.previousState);
      get().addLog('ROLLBACK', `Rolled back to state from log: ${logId}`);
    }
  },

  addWidget: (ObjectWidget) => {
    const userId = auth?.currentUser?.uid || null;
    const id = Math.random().toString(36).substr(2, 9);
    const newWidget: Widget = {
      id,
      title: ObjectWidget.title || 'New Widget',
      type: ObjectWidget.type || 'custom',
      x: ObjectWidget.x || 0,
      y: ObjectWidget.y || 0,
      w: ObjectWidget.w || 1,
      h: ObjectWidget.h || 1,
      code: ObjectWidget.code || 'return { renderType: "metric", value: 0, label: "New Metric" };',
      config: ObjectWidget.config || {},
      isVisible: true
    };
    
    if (userId) {
      const widgetDocRef = doc(db, 'users', userId, 'widgets', id);
      setDoc(widgetDocRef, { ...newWidget, ownerId: userId, createdAt: serverTimestamp() })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/widgets/${id}`));
    }
    set(state => {
      const newState = { widgets: [...state.widgets, newWidget] };
      get().addLog('ADD_WIDGET', `Added widget: ${newWidget.title}`, state);
      return newState;
    });
  },

  updateWidget: (id, updates) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      const widgetDocRef = doc(db, 'users', userId, 'widgets', id);
      updateDoc(widgetDocRef, updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/widgets/${id}`));
    }
    set(state => {
      const newState = { widgets: state.widgets.map(w => w.id === id ? { ...w, ...updates } : w) };
      get().addLog('UPDATE_WIDGET', `Updated widget: ${id}`, state);
      return newState;
    });
  },

  deleteWidget: (id) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      const widgetDocRef = doc(db, 'users', userId, 'widgets', id);
      deleteDoc(widgetDocRef)
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${userId}/widgets/${id}`));
    }
    set(state => {
      const newState = { widgets: state.widgets.filter(w => w.id !== id) };
      get().addLog('DELETE_WIDGET', `Deleted widget: ${id}`, state);
      return newState;
    });
  },

  addFile: (file) => {
    const userId = auth?.currentUser?.uid || null;
    const id = Math.random().toString(36).substr(2, 9);
    const newFile = { ...file, id };
    if (userId) {
      const fileDocRef = doc(db, 'users', userId, 'files', id);
      setDoc(fileDocRef, { ...newFile, ownerId: userId, createdAt: serverTimestamp() })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/files/${id}`));
    }
    set(state => {
      const newState = { files: [...state.files, newFile] };
      get().addLog('ADD_FILE', `Added file: ${file.name}`, state);
      return newState;
    });
  },

  updateFile: (id, updates) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      const fileDocRef = doc(db, 'users', userId, 'files', id);
      updateDoc(fileDocRef, updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/files/${id}`));
    }
    set(state => ({ files: state.files.map(f => f.id === id ? { ...f, ...updates } : f) }));
  },

  deleteFile: (id) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      const fileDocRef = doc(db, 'users', userId, 'files', id);
      deleteDoc(fileDocRef)
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${userId}/files/${id}`));
    }
    set(state => ({ files: state.files.filter(f => f.id !== id) }));
  },

  addAsset: (asset) => {
    const newAsset = { ...asset, id: Math.random().toString(36).substr(2, 9) };
    set(state => {
      const newState = { assets: [...state.assets, newAsset] };
      get().addLog('ADD_ASSET', `Added asset: ${asset.name}`, state);
      return newState;
    });
  },

  deleteAsset: (id) => {
    set(state => {
      const newState = { assets: state.assets.filter(a => a.id !== id) };
      get().addLog('DELETE_ASSET', `Deleted asset: ${id}`, state);
      return newState;
    });
  },

  updateAgent: async (agentId, updates) => {
    const userId = auth?.currentUser?.uid || null;
    if (!userId) return;
    const agentDocRef = doc(db, 'users', userId, 'agents', agentId);
    await updateDoc(agentDocRef, updates)
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/agents/${agentId}`));
    get().addLog('AGENT_UPDATED', `Updated configuration for: ${agentId}`);
  },

  sendCommand: async (agentId, cmd, args = []) => {
    const userId = auth?.currentUser?.uid || null;
    if (!userId) return;
    const commandId = Math.random().toString(36).substr(2, 9);
    const commandDocRef = doc(db, 'users', userId, 'agents', agentId, 'commands', commandId);
    const command: AgentCommand = { id: commandId, cmd, args, status: 'pending', createdAt: Date.now() };
    await setDoc(commandDocRef, command)
      .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/agents/${agentId}/commands/${commandId}`));
    get().addLog('AGENT_COMMAND_SENT', `Sent command [${cmd}] to agent: ${agentId}`);
  },

  deleteAgent: async (agentId) => {
    const userId = auth?.currentUser?.uid || null;
    if (!userId) return;
    const agentDocRef = doc(db, 'users', userId, 'agents', agentId);
    await deleteDoc(agentDocRef)
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${userId}/agents/${agentId}`));
    get().addLog('AGENT_DELETED', `Removed agent: ${agentId}`);
  },

  addMission: (mission) => {
    const userId = auth?.currentUser?.uid || null;
    const id = Math.random().toString(36).substr(2, 9);
    const newMission: AgentMission = { ...mission, id, createdAt: Date.now() };
    if (userId) {
      setDoc(doc(db, 'users', userId, 'missions', id), { ...newMission, ownerId: userId })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/missions/${id}`));
    }
    set(state => ({ missions: [...state.missions, newMission] }));
    get().addLog('MISSION_ADDED', `New mission started: ${mission.title}`);
  },

  updateMission: (id, updates) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      updateDoc(doc(db, 'users', userId, 'missions', id), updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/missions/${id}`));
    }
    set(state => ({ missions: state.missions.map(m => m.id === id ? { ...m, ...updates } : m) }));
  },

  deleteMission: (id) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      deleteDoc(doc(db, 'users', userId, 'missions', id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${userId}/missions/${id}`));
    }
    set(state => ({ missions: state.missions.filter(m => m.id !== id) }));
  },

  addSkill: (skill) => {
    const userId = auth?.currentUser?.uid || null;
    const id = Math.random().toString(36).substr(2, 9);
    const newSkill: AgentSkill = { ...skill, id };
    if (userId) {
      setDoc(doc(db, 'users', userId, 'skills', id), { ...newSkill, ownerId: userId })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/skills/${id}`));
    }
    set(state => ({ skills: [...state.skills, newSkill] }));
    get().addLog('SKILL_ADDED', `New capability unlocked: ${skill.name}`);
  },

  updateSkill: (id, updates) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      updateDoc(doc(db, 'users', userId, 'skills', id), updates)
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${userId}/skills/${id}`));
    }
    set(state => ({ skills: state.skills.map(s => s.id === id ? { ...s, ...updates } : s) }));
  },

  deleteSkill: (id) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      deleteDoc(doc(db, 'users', userId, 'skills', id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${userId}/skills/${id}`));
    }
    set(state => ({ skills: state.skills.filter(s => s.id !== id) }));
  },

  toggleAutopilot: () => {
    set(state => ({ isAutopilotActive: !state.isAutopilotActive }));
    get().addLog('AUTOPILOT_TOGGLE', `Autopilot mode ${!get().isAutopilotActive ? 'ACTIVATED' : 'DEACTIVATED'}`);
  },

  addAutopilotTask: (actions) => {
    const newActions: AutopilotAction[] = actions.map(a => ({ ...a, id: Math.random().toString(36).substr(2, 9), status: 'pending' }));
    set(state => ({ autopilotQueue: [...state.autopilotQueue, ...newActions], isAutopilotActive: true }));
    get().addLog('AUTOPILOT_TASK_ADDED', `Queued ${actions.length} automated operations.`);
  },

  clearAutopilotQueue: () => set({ autopilotQueue: [], autopilotStatus: 'STANDBY' }),
  
  updateAutopilotStatus: (status) => set({ autopilotStatus: status }),
  
  completeAutopilotAction: (id) => set(state => ({ autopilotQueue: state.autopilotQueue.filter(a => a.id !== id) })),

  addLink: (link) => {
    const userId = auth?.currentUser?.uid || null;
    const id = Math.random().toString(36).substr(2, 9);
    const newLink: WebLink = { ...link, id };
    if (userId) {
      setDoc(doc(db, 'users', userId, 'links', id), { ...newLink, ownerId: userId })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/links/${id}`));
    }
    set(state => ({ links: [...state.links, newLink] }));
  },

  deleteLink: (id) => {
    const userId = auth?.currentUser?.uid || null;
    if (userId) {
      deleteDoc(doc(db, 'users', userId, 'links', id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `users/${userId}/links/${id}`));
    }
    set(state => ({ links: state.links.filter(l => l.id !== id) }));
  },

  connectOBD: async (adapter) => {
    set(state => ({ obd: { ...state.obd, isScanning: true } }));
    get().addLog('OBD_LINK', `Initializing ${adapter.toUpperCase()} handshake...`);
    try {
      get().addLog('OBD_SUCCESS', `Hardware sync mock successful.`);
      set(state => ({ obd: { ...state.obd, status: { ...state.obd.status, connected: true, adapter, protocol: 'ISO 15765-4 CAN', voltage: 14.2, latency: 12, interface: adapter === 'elm327' ? 'bluetooth' : 'usb' }, isScanning: false }}));
    } catch (error) {
      get().addLog('OBD_ERROR', `Connection failed`);
      set(state => ({ obd: { ...state.obd, isScanning: false } }));
    }
  },

  disconnectOBD: () => {
    set(state => ({ obd: { ...state.obd, status: { ...state.obd.status, connected: false } } }));
    get().addLog('OBD_DISCONNECT', 'Link terminated by user.');
  },

  scanDTCs: async () => {
    set(state => ({ obd: { ...state.obd, isScanning: true } }));
    setTimeout(() => set(state => ({ obd: { ...state.obd, isScanning: false, dtcs: [{ code: 'P0300', description: 'Random or Multiple Cylinder Misfire Detected', severity: 'medium', status: 'active', source: 'Engine Control Module' }] } })), 1500);
  },

  clearDTCs: async () => {
    set(state => ({ obd: { ...state.obd, isScanning: true } }));
    setTimeout(() => set(state => ({ obd: { ...state.obd, isScanning: false, dtcs: [] } })), 1000);
  },

  updatePID: (pidId, value) => set(state => ({ obd: { ...state.obd, pids: state.obd.pids.map(p => p.id === pidId ? { ...p, value } : p) } })),

  setOBDAgentMode: (mode) => set(state => ({ obd: { ...state.obd, agentMode: mode } })),

  generateSystemReport: () => {
    const userId = auth?.currentUser?.uid || null;
    const { agents, widgets, files, missions, logs } = get();
    const id = 'report_' + Date.now();
    const newReport: AppFile = { id, name: `SYSTEM_AUDIT_${Date.now()}`, content: `# SYTEM REPORT: ${agents.length} Agents\nWidgets: ${widgets.length}\nFiles: ${files.length}\nMissions: ${missions.length}`, type: 'md' };
    if (userId) {
      setDoc(doc(db, 'users', userId, 'reports', id), { ...newReport, ownerId: userId, createdAt: serverTimestamp() })
        .catch(err => handleFirestoreError(err, OperationType.CREATE, `users/${userId}/reports/${id}`));
    }
    set(state => ({ reportFiles: [newReport, ...state.reportFiles] }));
  },

  initializeFirebaseSubscriptions: (userId: string) => {
    const unsubWidgets = onSnapshot(collection(db, 'users', userId, 'widgets'), (snapshot) => {
      const widgetsData = snapshot.docs.map(doc => doc.data() as Widget);
      if (widgetsData.length > 0) set({ widgets: widgetsData });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/widgets`));

    const unsubFiles = onSnapshot(collection(db, 'users', userId, 'files'), (snapshot) => {
      const filesData = snapshot.docs.map(doc => doc.data() as AppFile);
      if (filesData.length > 0) set({ files: filesData });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/files`));

    const unsubAgents = onSnapshot(collection(db, 'users', userId, 'agents'), (snapshot) => {
      set({ agents: snapshot.docs.map(doc => doc.data() as RemoteAgent) });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/agents`));

    const unsubMissions = onSnapshot(collection(db, 'users', userId, 'missions'), (snapshot) => {
      set({ missions: snapshot.docs.map(doc => doc.data() as AgentMission) });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/missions`));

    const unsubSkills = onSnapshot(collection(db, 'users', userId, 'skills'), (snapshot) => {
      set({ skills: snapshot.docs.map(doc => doc.data() as AgentSkill) });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/skills`));

    const unsubReports = onSnapshot(collection(db, 'users', userId, 'reports'), (snapshot) => {
      set({ reportFiles: snapshot.docs.map(doc => doc.data() as AppFile) });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/reports`));

    const unsubLinks = onSnapshot(collection(db, 'users', userId, 'links'), (snapshot) => {
      set({ links: snapshot.docs.map(doc => doc.data() as WebLink) });
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${userId}/links`));

    const unsubObd = onSnapshot(doc(db, 'users', userId, 'obd', 'telemetry'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.connected && (Date.now() - (data.lastSync || 0) < 15000)) {
          set(state => ({
            obd: {
              ...state.obd,
              status: {
                connected: true,
                protocol: data.protocol || 'ISO 15765-4 CAN',
                adapter: data.adapter || 'ELM327 NATIVE',
                interface: data.interface || 'wifi',
                latency: data.latency || 10,
                voltage: data.voltage || 14.1
              },
              pids: state.obd.pids.map(p => {
                const found = data.pids?.find((f: any) => f.id === p.id);
                return found ? { ...p, value: found.value } : p;
              }),
              dtcs: data.dtcs || []
            }
          }));
        } else {
          // If native backend disconnects, auto-drop active state
          set(state => ({ obd: { ...state.obd, status: { ...state.obd.status, connected: false } } }));
        }
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `users/${userId}/obd/telemetry`));

    return () => {
      unsubWidgets();
      unsubFiles();
      unsubAgents();
      unsubMissions();
      unsubSkills();
      unsubReports();
      unsubLinks();
      unsubObd();
    };
  }
}));
