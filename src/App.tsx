import React, { useEffect } from 'react';
import { DashboardProvider, useDashboard } from './store/DashboardContext';
import { useAppStore } from './store/appStore';
import { Sidebar, TopBar } from './components/Navigation';
import { WidgetCard } from './components/WidgetCard';
import { SettingsPanel } from './components/SettingsPanel';
import { NotesPanel } from './components/NotesPanel';
import { AIPanel } from './components/AIPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { LinksPanel } from './components/LinksPanel';
import { FileManagerPanel } from './components/FileManagerPanel';
import { AgentControllerPanel } from './components/AgentControllerPanel';
import { AgentTreeView } from './components/AgentTreeView';
import { DevDirectory } from './components/DevDirectory';
import { ScriptEditorPanel } from './components/ScriptEditorPanel';
import { RemoteDesk } from './components/RemoteDesk';
import { AuditSystem } from './components/AuditSystem';
import { WizardInstallManager } from './components/WizardInstallManager';
import { BlueprintExplorer } from './components/BlueprintExplorer';
import { AutopilotController } from './components/AutopilotController';
import { GuidanceSystem } from './components/GuidanceSystem';
import { FloatingAssistant } from './components/FloatingAssistant';
import { OBDScan } from './components/OBDScan';
import { AdminMenu } from './components/AdminMenu';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  List, 
  Activity, 
  ShieldAlert,
  Wand2,
  Cpu, 
  Database, 
  Globe,
  History,
  Terminal as TerminalIcon,
  ChevronRight,
  Home,
  MessageSquare,
  Folder,
  FileText,
  FileCode,
  Gauge,
  Monitor,
  ClipboardCheck,
  Map,
  Package,
  Settings,
  Plus,
  Eye,
  EyeOff,
  PlusCircle,
  Sparkles,
  Smartphone,
  Layout,
  Check,
  ArrowUp,
  ArrowDown,
  Battery,
  Wifi,
  MoreHorizontal,
  RefreshCw,
  Sun,
  Moon,
  Trash,
  CheckSquare,
  ShieldCheck
} from 'lucide-react';
import { cn } from './lib/utils';

const AnalogClockWidget: React.FC = () => {
  const [time, setTime] = React.useState(new Date());
  
  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours();
  
  const secDeg = (seconds / 60) * 360;
  const minDeg = ((minutes + seconds / 60) / 60) * 360;
  const hourDeg = (((hours % 12) + minutes / 60) / 12) * 360;
  
  return (
    <div className="w-20 h-20 rounded-full border border-white/20 bg-black/60 relative flex items-center justify-center shadow-lg backdrop-blur-md">
      {/* Outer rim */}
      <div className="absolute inset-0.5 rounded-full border border-white/5" />
      {/* Ticks */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(n => (
        <div 
          key={n} 
          className="absolute w-0.5 h-1 bg-white/20" 
          style={{ 
            transform: `rotate(${n * 30}deg) translateY(-34px)`,
            transformOrigin: 'bottom center'
          }} 
        />
      ))}
      {/* Hands */}
      <div 
        className="absolute w-1 h-6 bg-white/40 rounded-full origin-bottom" 
        style={{ 
          transform: `rotate(${hourDeg}deg) translateY(-3px)`, 
          transformOrigin: 'bottom center',
          top: '22px'
        }} 
      />
      <div 
        className="absolute w-0.5 h-8 bg-white/70 rounded-full origin-bottom" 
        style={{ 
          transform: `rotate(${minDeg}deg) translateY(-4px)`, 
          transformOrigin: 'bottom center',
          top: '15px'
        }} 
      />
      <div 
        className="absolute w-px h-9 bg-primary rounded-full origin-bottom" 
        style={{ 
          transform: `rotate(${secDeg}deg) translateY(-5px)`, 
          transformOrigin: 'bottom center',
          top: '10px'
        }} 
      />
      {/* Pin */}
      <div className="w-1.5 h-1.5 rounded-full bg-primary border border-black absolute z-20 shadow-[0_0_6px_var(--color-primary)]" />
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const { isCarMode, viewMode, setViewMode, searchQuery, isAuthReady, addNotification, theme, user } = useDashboard();
  const { widgets, logs, rollback, addWidget, agents, missions, obd, initializeFirebaseSubscriptions } = useAppStore();
  const [activeTab, setActiveTab] = React.useState('home');
  const [agentSubTab, setAgentSubTab] = React.useState('list');

  const [isOsiOSMode, setIsOsiOSMode] = React.useState<boolean>(() => {
    return localStorage.getItem('nyx_os_is_ios_mode') === 'true';
  });

  const [isEditingApps, setIsEditingApps] = React.useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = React.useState<boolean>(false);
  const [isAppAdminOpen, setIsAppAdminOpen] = React.useState<boolean>(false);
  const [isLightMode, setIsLightMode] = React.useState<boolean>(() => {
    return localStorage.getItem('nyx_os_light_mode') === 'true';
  });

  const [apps, setApps] = React.useState(() => {
    const stored = localStorage.getItem('nyx_os_custom_apps');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback below
      }
    }
    return [
      { id: 'home', label: 'Inicio', iconName: 'Home', visible: true, order: 1, category: 'Utilities' },
      { id: 'remote', label: 'RemoteDesk', iconName: 'Monitor', visible: true, order: 2, category: 'PC Bridge' },
      { id: 'ai', label: 'Neural Chat', iconName: 'MessageSquare', visible: true, order: 3, category: 'Intelligent AI' },
      { id: 'agents', label: 'Network', iconName: 'Cpu', visible: true, order: 4, category: 'Management' },
      { id: 'files', label: 'Asset Library', iconName: 'Folder', visible: true, order: 5, category: 'Database' },
      { id: 'obdscan', label: 'OBD Scanner', iconName: 'Gauge', visible: true, order: 6, category: 'Vehicle' },
      { id: 'notes', label: 'Tech Notes', iconName: 'FileText', visible: true, order: 7, category: 'Documentation' },
      { id: 'terminal', label: 'Terminal', iconName: 'TerminalIcon', visible: true, order: 8, category: 'Utilities' },
      { id: 'scripts', label: 'Scripts Sandbox', iconName: 'FileCode', visible: true, order: 9, category: 'Development' },
      { id: 'audit', label: 'Audit System', iconName: 'ClipboardCheck', visible: true, order: 10, category: 'Utilities' },
      { id: 'dev', label: 'Dev Directory', iconName: 'Database', visible: true, order: 11, category: 'Development' },
      { id: 'blueprint', label: 'Blueprint', iconName: 'Map', visible: true, order: 12, category: 'Management' },
      { id: 'installer', label: 'Wizard Installer', iconName: 'Package', visible: true, order: 13, category: 'PC Bridge' },
      { id: 'settings', label: 'Control Center', iconName: 'Settings', visible: true, order: 14, category: 'Management' },
      { id: 'links', label: 'Web Bookmarks', iconName: 'Globe', visible: true, order: 15, category: 'Documentation' },
      { id: 'logs', label: 'Event History', iconName: 'History', visible: true, order: 16, category: 'Utilities' },
    ];
  });

  const saveApps = (newApps: any) => {
    setApps(newApps);
    localStorage.setItem('nyx_os_custom_apps', JSON.stringify(newApps));
  };

  const toggleOSMode = () => {
    const nextMode = !isOsiOSMode;
    setIsOsiOSMode(nextMode);
    localStorage.setItem('nyx_os_is_ios_mode', String(nextMode));
    addNotification({
      title: nextMode ? 'NYX_OS_MOBILE_ACTIVE' : 'STANDARD_DASHBOARD_ACTIVE',
      message: nextMode 
        ? 'Interface converted to high-contrast iOS Springboard environment.' 
        : 'Reverting operating layout to standard control panels.',
      featureId: 'OS_MODE',
      type: 'info'
    });
  };

  const toggleLightMode = () => {
    const next = !isLightMode;
    setIsLightMode(next);
    localStorage.setItem('nyx_os_light_mode', String(next));
  };

  const moveApp = (idx: number, direction: 'up' | 'down') => {
    const newApps = [...apps];
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= newApps.length) return;
    
    // Swap orders
    const temp = newApps[idx].order;
    newApps[idx].order = newApps[targetIdx].order;
    newApps[targetIdx].order = temp;
    
    // Sort array
    newApps.sort((a, b) => a.order - b.order);
    
    // Re-index
    newApps.forEach((app, i) => {
      app.order = i + 1;
    });
    
    saveApps(newApps);
  };

  const toggleAppVisibility = (id: string) => {
    const newApps = apps.map((app: any) => {
      if (app.id === id) {
        return { ...app, visible: !app.visible };
      }
      return app;
    });
    saveApps(newApps);
  };

  const [currentTimeState, setCurrentTimeState] = React.useState(new Date());
  const [batteryPct, setBatteryPct] = React.useState<number>(88);
  const [isCharging, setIsCharging] = React.useState<boolean>(false);
  const [wifiType, setWifiType] = React.useState<string>('5G');
  const [networkStatus, setNetworkStatus] = React.useState<'online' | 'offline'>('online');

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTimeState(new Date()), 1000);

    // Physical Device Battery Level Sync (Web Battery Status API)
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryPct(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        const handleLevelChange = () => {
          setBatteryPct(Math.round(battery.level * 100));
        };
        const handleChargingChange = () => {
          setIsCharging(battery.charging);
        };

        battery.addEventListener('levelchange', handleLevelChange);
        battery.addEventListener('chargingchange', handleChargingChange);

        return () => {
          battery.removeEventListener('levelchange', handleLevelChange);
          battery.removeEventListener('chargingchange', handleChargingChange);
        };
      }).catch(() => {});
    }

    // Physical Host Wireless Connection Analyzer (Network Info / Online API)
    const updateNetworkInfo = () => {
      setNetworkStatus(navigator.onLine ? 'online' : 'offline');
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        if (conn.type === 'wifi') {
          setWifiType('WIFI');
        } else if (conn.type === 'cellular') {
          setWifiType(conn.effectiveType ? conn.effectiveType.toUpperCase() : 'CELLULAR');
        } else if (conn.type === 'ethernet') {
          setWifiType('ETHERNET');
        } else {
          setWifiType(conn.effectiveType ? conn.effectiveType.toUpperCase() : 'ONLINE');
        }
      } else {
        setWifiType(navigator.onLine ? 'WIFI' : 'DISCONNECTED');
      }
    };

    updateNetworkInfo();
    window.addEventListener('online', updateNetworkInfo);
    window.addEventListener('offline', updateNetworkInfo);

    const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    if (conn) {
      conn.addEventListener('change', updateNetworkInfo);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('online', updateNetworkInfo);
      window.removeEventListener('offline', updateNetworkInfo);
      if (conn) {
        conn.removeEventListener('change', updateNetworkInfo);
      }
    };
  }, []);

  const renderIOSModule = (tabId: string) => {
    switch (tabId) {
      case 'notes': return <NotesPanel />;
      case 'ai': return <AIPanel />;
      case 'terminal': return <TerminalPanel />;
      case 'media': return <ToolsPanel type="media" />;
      case 'vector': return <ToolsPanel type="vector" />;
      case 'links': return <LinksPanel />;
      case 'files': return <FileManagerPanel />;
      case 'scripts': return <ScriptEditorPanel />;
      case 'agents': return (
        <div className="h-full flex flex-col">
          <div className="flex border-b border-white/5 bg-black/40">
            <button 
              onClick={() => setAgentSubTab('list')}
              className={cn(
                "px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2",
                agentSubTab === 'list' ? "border-primary text-white" : "border-transparent text-white/40 hover:text-white"
              )}
            >
              Control Panel
            </button>
            <button 
              onClick={() => setAgentSubTab('topology')}
              className={cn(
                "px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2",
                agentSubTab === 'topology' ? "border-primary text-white" : "border-transparent text-white/40 hover:text-white"
              )}
            >
              Neural Topology
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            {agentSubTab === 'list' ? <AgentControllerPanel /> : <AgentTreeView />}
          </div>
        </div>
      );
      case 'dev': return <DevDirectory onNavigate={setActiveTab} />;
      case 'remote': return <RemoteDesk />;
      case 'audit': return <AuditSystem />;
      case 'installer': return <WizardInstallManager />;
      case 'blueprint': return <BlueprintExplorer />;
      case 'obdscan': return <OBDScan />;
      case 'settings': return <SettingsPanel />;
      case 'logs': return (
        <div className="p-8">
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2">
              <TerminalIcon size={24} className="text-neon-lime" />
              <h2 className="text-2xl font-bold tracking-tight uppercase">System Audit Logs</h2>
            </div>
            <p className="text-xs text-white/40">Secured events storage sandbox</p>
          </div>
          <div className="glass-card overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto font-mono text-xs p-6 space-y-3 bg-black/40 custom-scrollbar">
              {logs.filter(l => !searchQuery || l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                <div className="text-white/20 italic text-center py-20">No actions recorded matching query...</div>
              ) : (
                logs.filter(l => !searchQuery || l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase())).map((log) => (
                  <div key={log.id} className="flex items-start gap-6 group border-b border-white/5 pb-3">
                    <span className="text-white/30 whitespace-nowrap">[{new Date(log.timestamp).toLocaleString()}]</span>
                    <span className="text-neon-blue font-bold min-w-[120px]">{log.action}</span>
                    <span className="text-white/60 flex-1">{log.details}</span>
                    <button 
                      onClick={() => rollback(log.id)}
                      className="opacity-0 group-hover:opacity-100 text-neon-lime hover:underline transition-opacity px-3 py-1 bg-neon-lime/10 rounded"
                    >
                      Restore Point
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      );
      default: return (
        <div className="p-12 text-center text-white/45 font-bold uppercase tracking-widest text-xs">
          Modulo cargado: {tabId}
        </div>
      );
    }
  };

  const renderAppIconSvg = (name: string, size = 26, className = "") => {
    switch (name) {
      case 'Home': return <Home size={size} className={className} />;
      case 'Monitor': return <Monitor size={size} className={className} />;
      case 'MessageSquare': return <MessageSquare size={size} className={className} />;
      case 'Cpu': return <Cpu size={size} className={className} />;
      case 'Folder': return <Folder size={size} className={className} />;
      case 'Gauge': return <Gauge size={size} className={className} />;
      case 'FileText': return <FileText size={size} className={className} />;
      case 'TerminalIcon': return <TerminalIcon size={size} className={className} />;
      case 'FileCode': return <FileCode size={size} className={className} />;
      case 'ClipboardCheck': return <ClipboardCheck size={size} className={className} />;
      case 'Database': return <Database size={size} className={className} />;
      case 'Map': return <Map size={size} className={className} />;
      case 'Package': return <Package size={size} className={className} />;
      case 'Settings': return <Settings size={size} className={className} />;
      case 'Globe': return <Globe size={size} className={className} />;
      case 'History': return <History size={size} className={className} />;
      default: return <Smartphone size={size} className={className} />;
    }
  };

  useEffect(() => {
    if (user) {
      const unsubscribe = initializeFirebaseSubscriptions(user.uid);
      return () => unsubscribe();
    }
  }, [user, initializeFirebaseSubscriptions]);

  // Inject dynamic theme colors
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-neon-lime', theme.primary);
    root.style.setProperty('--color-neon-blue', theme.secondary);
    root.style.setProperty('--color-dashboard-bg', theme.background);
    root.style.setProperty('--color-card-bg', theme.cardBg);
  }, [theme]);

  React.useEffect(() => {
    const handleHomeNav = () => setActiveTab('home');
    const handleTabNav = (e: any) => setActiveTab(e.detail);
    window.addEventListener('nav-home', handleHomeNav);
    window.addEventListener('nav-tab', handleTabNav);
    return () => {
      window.removeEventListener('nav-home', handleHomeNav);
      window.removeEventListener('nav-tab', handleTabNav);
    };
  }, []);

  // No force redirect to agents if no agents - allow users to see Home/Dashboard
  React.useEffect(() => {
    if (isAuthReady && agents.length === 0 && activeTab === 'home') {
      // Just notify once, don't force page change if they want to see the dashboard
      /*
      addNotification({
        title: 'UNIFIED_INSTALLER_ACTIVE',
        message: 'No active nodes detected. Complete Local Hub Setup to bridge this instance.',
        featureId: 'INSTALLER_BANNER',
        type: 'warning'
      });
      */
    }
  }, [agents.length, isAuthReady]);

  if (!isAuthReady) {
    return (
      <div className="flex-1 flex items-center justify-center bg-dashboard-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-neon-lime border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Initializing OS...</p>
        </div>
      </div>
    );
  }

  const activeNodesCount = agents.filter(a => a.status === 'online').length;
  const historicNodesCount = agents.length;
  const recentLogsCount = logs.filter(l => Date.now() - l.timestamp < 24 * 60 * 60 * 1000).length;
  const missionProgress = missions.length > 0 
    ? Math.round((missions.filter(m => m.status === 'completed').length / missions.length) * 100)
    : 0;

  const filteredWidgets = widgets.filter(w => {
    const query = (searchQuery || '').toLowerCase();
    const title = (w.title || '').toLowerCase();
    const type = (w.type || '').toLowerCase();
    return title.includes(query) || type.includes(query);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Floating Tactical Switcher Button */}
      <div className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2">
        <motion.button
          onClick={toggleOSMode}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-3 rounded-full bg-black/80 hover:bg-black/95 backdrop-blur-3xl border border-white/10 hover:border-primary/50 text-white font-bold text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] group cursor-pointer"
        >
          <Smartphone size={14} className="text-primary group-hover:scale-110 transition-transform" />
          <span>{isOsiOSMode ? 'Vista Dashboard' : 'Vista iOS Mobile'}</span>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isOsiOSMode ? (
          <motion.div 
            key="ios-desktop"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className={cn(
              "flex-1 flex flex-col min-h-screen relative font-sans transition-all duration-500 overflow-x-hidden",
              isLightMode 
                ? "bg-slate-100 text-slate-800" 
                : "bg-[#090b14] text-white"
            )}
            style={{
              backgroundImage: isLightMode 
                ? 'radial-gradient(circle at 10% 20%, rgba(200, 230, 255, 0.4) 0%, rgba(255, 230, 240, 0.4) 90.1%)' 
                : 'radial-gradient(circle at top right, #120e20, #090b14 60%)'
            }}
          >
            {/* Embedded Ambient Blobs */}
            {!isLightMode && (
              <>
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-neon-blue/5 blur-[120px] pointer-events-none" />
              </>
            )}

            {/* iOS Top Status Bar */}
            <div className={cn(
              "h-8 px-8 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider select-none z-50 border-b",
              isLightMode ? "bg-white/40 border-black/5 text-slate-600" : "bg-black/40 border-white/5 text-slate-400"
            )}>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-mono">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full shadow-[0_0_8px_var(--color-primary)]",
                    networkStatus === 'online' ? "bg-primary" : "bg-red-500"
                  )} />
                  Operator: NYX
                </span>
                <Wifi size={12} className={cn("transition-opacity", networkStatus === 'online' ? "opacity-100 text-primary" : "opacity-30")} />
                <span className="text-[8px] px-1 bg-primary/20 text-primary border border-primary/30 rounded uppercase tracking-wider font-mono">
                  {wifiType}
                </span>
                {networkStatus === 'offline' && (
                  <span className="text-[8px] px-1 bg-red-500/20 text-red-500 border border-red-500/30 rounded uppercase tracking-wider font-mono">OFFLINE</span>
                )}
              </div>
              <div className="flex items-center gap-1.5 font-mono">
                <span>{currentTimeState.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <span className="opacity-30">•</span>
                <span>{currentTimeState.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
              </div>
              <div className="flex items-center gap-2">
                {/* OMNIPRESENT iOS CRYSTAL ADMIN MENU BUTTON WITH ACTIVE WHITE BACKLIGHT PULSE ON TAP */}
                <button
                  onClick={() => setIsAppAdminOpen(true)}
                  className="px-2 py-0.5 rounded bg-red-500/10 hover:bg-white text-red-400 hover:text-black border border-red-500/20 hover:border-white text-[8px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(255,255,255,0)] hover:shadow-[0_0_12px_rgba(255,255,255,0.7)] active:scale-95 duration-200"
                  title="Bypass Control Panel"
                  id="status-bar-admin-btn"
                >
                  <ShieldCheck size={9} />
                  <span>ADMIN</span>
                </button>
                <div className="h-3 w-[1px] bg-white/10 mx-1" />
                <button 
                  onClick={toggleLightMode}
                  className="p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
                  title="Alternar Light/Dark Mode"
                >
                  {isLightMode ? <Moon size={11} /> : <Sun size={11} />}
                </button>
                <span className="text-[9px] font-mono">{batteryPct}%</span>
                <Battery size={14} className={cn(
                  "text-primary",
                  isCharging ? "fill-primary/40 animate-pulse text-green-400" : "fill-primary/10"
                )} />
              </div>
            </div>

            {/* Main Springboard Area */}
            <div className="flex-1 px-8 py-10 max-w-6xl mx-auto w-full flex flex-col z-20 pb-40">
              <AnimatePresence mode="wait">
                {activeTab === 'home' ? (
                  <motion.div 
                    key="springboard-grid"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-10"
                  >
                    {/* iOS Style Glass Widgets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Analog Clock Widget */}
                      <div className={cn(
                        "rounded-[2.2rem] border p-6 flex items-center gap-6 shadow-xl relative overflow-hidden backdrop-blur-3xl transition-colors duration-500",
                        isLightMode ? "bg-white/30 border-black/5 text-slate-800" : "bg-black/37 border-white/5 text-white"
                      )}>
                        <AnalogClockWidget />
                        <div>
                          <h3 className="text-sm font-black tracking-widest uppercase mb-1">PULSO NYX</h3>
                          <p className="text-[9px] font-mono opacity-50 uppercase tracking-widest leading-none">OS_TIME_AGENT</p>
                          <div className="text-lg font-bold mt-2 font-mono">
                            {currentTimeState.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </div>
                        </div>
                      </div>

                      {/* AI Mind Status Widget */}
                      <div className={cn(
                        "rounded-[2.2rem] border p-6 flex flex-col justify-between shadow-xl relative overflow-hidden backdrop-blur-3xl transition-colors duration-500",
                        isLightMode ? "bg-white/30 border-black/5 text-slate-800" : "bg-black/37 border-white/5 text-white"
                      )}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 text-primary">NYX AI Mind Core</span>
                          <Sparkles size={14} className="text-primary animate-pulse" />
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-bold uppercase tracking-wider">Status: Listening</div>
                          <p className="text-[9px] opacity-60">Memory Sync: Active Logs Sandbox</p>
                        </div>
                        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-3">
                          <div className="h-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse" style={{ width: '80%' }} />
                        </div>
                      </div>

                      {/* Connected Nodes Tracker Widget */}
                      <div className={cn(
                        "rounded-[2.2rem] border p-6 flex flex-col justify-between shadow-xl relative overflow-hidden cursor-pointer backdrop-blur-3xl transition-colors duration-500",
                        isLightMode ? "bg-white/30 border-black/5 text-slate-800" : "bg-black/37 border-white/5 text-white"
                      )} onClick={() => setActiveTab('agents')}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50 text-primary">Nodos Activos</span>
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                        </div>
                        <div>
                          <div className="text-3xl font-black italic tracking-tighter text-primary">
                            {activeNodesCount}<span className="text-xs font-mono font-normal opacity-40 ml-1.5">/ {historicNodesCount} nodes</span>
                          </div>
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mt-1">Conexión Segura Canal Activo</p>
                        </div>
                      </div>
                    </div>

                    {/* Toolbar control banner */}
                    <div className="flex items-center justify-between border-b pb-4 border-white/5">
                      <div>
                        <h2 className="text-base font-black tracking-widest uppercase">Mis Aplicaciones</h2>
                        <p className="text-[9px] opacity-50 uppercase tracking-widest mt-1">Toca un módulo para iniciarlo. Ordena o configura visibilidad a tu gusto para acceso rápido.</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setIsEditingApps(!isEditingApps);
                            if (isEditingApps) {
                              addNotification({
                                title: 'ESCRITORIO_GUARDADO',
                                message: 'La disposición de iconos en tablero OS ha sido fijada con éxito.',
                                featureId: 'OS_EDIT',
                                type: 'success'
                              });
                            }
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all active:scale-95 flex items-center gap-2 cursor-pointer",
                            isEditingApps 
                              ? "bg-green-500 text-black border-transparent shadow-[0_0_15px_rgba(34,197,94,0.4)]"
                              : isLightMode 
                                ? "bg-black/5 hover:bg-black/10 border-black/10 text-slate-800" 
                                : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-primary/50 text-white"
                          )}
                        >
                          <Wand2 size={12} className={isEditingApps ? "animate-spin-slow text-black" : "text-primary"} />
                          <span>{isEditingApps ? '✓ Guardar Disposición' : '⚙ Personalizar OS'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Grid of icons */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-8 py-4">
                      {apps
                        .filter((app: any) => app.visible || isEditingApps)
                        .map((app: any, idx: number) => {
                          const isAppVisible = app.visible;
                          return (
                            <motion.div
                              key={app.id}
                              animate={isEditingApps ? { rotate: [0, -1, 1, -1, 0], y: [0, -1, 1, -1, 0] } : { rotate: 0, y: 0 }}
                              transition={isEditingApps ? { repeat: Infinity, duration: 0.22 } : {}}
                              className="relative group flex flex-col items-center justify-center pt-2"
                            >
                              {/* Jiggle Customization Controls Overlaid */}
                              {isEditingApps && (
                                <div className="absolute -top-3 right-1 z-30 flex flex-col gap-1.5 bg-black/95 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-2xl">
                                  {/* Eye toggle visibility */}
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); toggleAppVisibility(app.id); }}
                                    className={cn(
                                      "p-1 rounded cursor-pointer transition-colors hover:bg-white/10 text-center flex justify-center",
                                      isAppVisible ? "text-primary" : "text-white/40"
                                    )}
                                    title={isAppVisible ? "Ocultar Módulo" : "Mostrar Módulo"}
                                  >
                                    {isAppVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                                  </button>
                                  {/* Up order */}
                                  <button 
                                    disabled={idx === 0}
                                    onClick={(e) => { e.stopPropagation(); moveApp(idx, 'up'); }}
                                    className="p-1 rounded cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 text-white flex justify-center"
                                    title="Mover arriba"
                                  >
                                    <ArrowUp size={12} />
                                  </button>
                                  {/* Down order */}
                                  <button 
                                    disabled={idx === apps.length - 1}
                                    onClick={(e) => { e.stopPropagation(); moveApp(idx, 'down'); }}
                                    className="p-1 rounded cursor-pointer disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 text-white flex justify-center"
                                    title="Mover abajo"
                                  >
                                    <ArrowDown size={12} />
                                  </button>
                                </div>
                              )}

                              {/* Tactile IOS glass element */}
                              <motion.button
                                onClick={() => {
                                  if (isEditingApps) return;
                                  setActiveTab(app.id);
                                }}
                                whileTap={{ 
                                  scale: 0.92, 
                                  boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.95)"
                                }}
                                className={cn(
                                  "w-16 h-16 rounded-[1.3rem] flex items-center justify-center transition-all relative border overflow-hidden cursor-pointer",
                                  isLightMode
                                    ? isAppVisible 
                                      ? "bg-white/80 border-black/10 hover:bg-white text-slate-800 shadow-[0_4px_15px_rgba(0,0,0,0.05)]" 
                                      : "bg-white/20 border-dashed border-black/10 text-slate-400 opacity-60"
                                    : isAppVisible
                                      ? "bg-black/50 border-white/10 hover:border-primary/50 text-white hover:shadow-[0_0_20px_rgba(255,255,255,0.15)] bg-gradient-to-tr from-white/5" 
                                      : "bg-black/10 border-dashed border-white/5 text-white/20 opacity-60"
                                )}
                              >
                                {/* Backlight tap glow feedback overlay */}
                                <div className="absolute inset-0 bg-radial from-white to-transparent opacity-0 hover:opacity-15 transition-opacity" />
                                {renderAppIconSvg(app.iconName, 26, isAppVisible ? "text-primary group-hover:scale-105 transition-transform" : "text-neutral-500")}
                              </motion.button>
                              <span className={cn(
                                "text-[9px] font-black uppercase text-center mt-3 tracking-widest px-1 max-w-[85px] truncate",
                                isAppVisible ? "" : "text-white/40"
                              )}>
                                {app.label}
                              </span>
                            </motion.div>
                          );
                        })}
                    </div>
                  </motion.div>
                ) : (
                  /* Slide up inner application screen overlay */
                  <motion.div
                    key="active-app-viewport"
                    initial={{ opacity: 0, scale: 0.97, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 15 }}
                    transition={{ type: "spring", stiffness: 100, damping: 15 }}
                    className={cn(
                      "flex-1 rounded-[2.2rem] border p-6 flex flex-col relative overflow-hidden min-h-[75vh] shadow-[0_30px_70px_rgba(0,0,0,0.5)]",
                      isLightMode 
                        ? "bg-white/80 border-black/10 text-slate-800 backdrop-blur-3xl" 
                        : "bg-black/60 border-white/5 text-white backdrop-blur-3xl"
                    )}
                  >
                    {/* Compact Inner Application Header with skip setups trigger */}
                    <div className="flex items-center justify-between border-b pb-4 mb-4 border-white/5 select-none text-[10px] font-black uppercase tracking-wider">
                      <button 
                        onClick={() => setActiveTab('home')}
                        className="flex items-center gap-1.5 text-primary hover:underline transition-all cursor-pointer"
                      >
                        ← Minimizar a Inicio
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="opacity-40">Módulo:</span>
                        <span className="px-2.5 py-1 bg-primary/20 text-primary border border-primary/30 rounded">{apps.find((a: any) => a.id === activeTab)?.label || activeTab}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="opacity-40 hidden md:inline">Admin Mode:</span>
                        <button
                          onClick={() => setIsAppAdminOpen(true)}
                          className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-[0_4px_12px_rgba(239,68,68,0.15)]"
                        >
                          <ShieldAlert size={10} />
                          <span>Admin CP</span>
                        </button>
                        <AdminMenu isOpen={isAppAdminOpen} onClose={() => setIsAppAdminOpen(false)} />
                      </div>
                    </div>

                    {/* Outer Embedded Module Container Screen */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative pr-1">
                      {renderIOSModule(activeTab)}
                    </div>

                    {/* Classic Swipe Down Bar Return indicator */}
                    <div className="pt-6 border-t border-white/5 flex justify-center mt-2">
                      <button
                        onClick={() => setActiveTab('home')}
                        className="w-32 h-1.5 bg-white/20 hover:bg-white/40 rounded-full cursor-pointer transition-colors shadow-[0_0_10px_rgba(255,255,255,0.15)] animate-pulse"
                        title="Toca para salir a Inicio"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Simulating Floating iOS Dock (ALWAYS VISIBLE on Springboard) */}
            {activeTab === 'home' && (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 select-none">
                <div className={cn(
                  "px-6 py-4 rounded-[2.2rem] border shadow-2xl flex items-center gap-6 justify-center backdrop-blur-3xl transition-colors duration-500",
                  isLightMode ? "bg-white/55 border-black/10" : "bg-black/60 border-white/10"
                )}>
                  {[
                    { id: 'home', label: 'Inicio', icon: 'Home' },
                    { id: 'remote', label: 'RemoteDesk', icon: 'Monitor' },
                    { id: 'ai', label: 'Neural Chat', icon: 'MessageSquare' },
                    { id: 'obdscan', label: 'OBD Scan', icon: 'Gauge' },
                    { id: 'settings', label: 'Ajustes', icon: 'Settings' }
                  ].map((item) => (
                    <motion.button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      whileTap={{ scale: 0.90, boxShadow: "0px 0px 25px rgba(255, 255, 255, 0.85)" }}
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all relative cursor-pointer border",
                        activeTab === item.id 
                          ? "bg-primary text-black border-transparent shadow-[0_0_15px_rgba(212,255,0,0.4)]" 
                          : isLightMode 
                            ? "bg-white/30 text-slate-800 border-black/5 hover:bg-white/60" 
                            : "bg-black/40 text-white/50 border-white/5 hover:text-white"
                      )}
                    >
                      {renderAppIconSvg(item.icon, 20)}
                      {activeTab === item.id && (
                        <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-primary" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* STANDARD CLASSIC LAYOUT */
          <motion.div 
            key="classic-desktop"
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <TopBar />
            <div className="flex-1 overflow-hidden flex">
              <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
              <main className="flex-1 overflow-y-auto custom-scrollbar bg-dashboard-bg topo-bg">
                <AnimatePresence mode="wait">
                  {activeTab === 'home' && (
                    <motion.div 
                      key="home"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="pt-12 pb-24 px-6 max-w-5xl mx-auto space-y-12"
                    >
                      {/* Hero Section: Dynamic Metrics */}
                      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="glass-card neon-glow p-8 rounded-[2rem] flex flex-col items-center text-center">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold mb-4">Neural Activity (24h)</span>
                          <div className="text-4xl font-extrabold tracking-tighter mb-2">{recentLogsCount}</div>
                          <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Op_Logs_Synced</div>
                        </div>
                        <div className="glass-card neon-glow p-8 rounded-[2rem] flex flex-col items-center text-center">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold mb-4">Mission Completion</span>
                          <div className="text-4xl font-extrabold tracking-tighter text-primary mb-2">
                            {missions.length > 0 ? missionProgress : '--'}<span className="text-lg opacity-40 ml-1">%</span>
                          </div>
                          <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${missionProgress}%` }}></div>
                          </div>
                        </div>
                        <div className="glass-card neon-glow p-8 rounded-[2rem] flex flex-col items-center text-center">
                          <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold mb-4">Active Nodes</span>
                          <div className="text-4xl font-extrabold tracking-tighter mb-2">{activeNodesCount}</div>
                          <div className="flex -space-x-1.5 mt-2">
                            {Array.from({ length: Math.min(activeNodesCount, 5) }).map((_, i) => (
                              <div key={i} className="w-5 h-5 rounded-full bg-primary border border-dashboard-bg shadow-[0_0_10px_rgba(212,255,0,0.5)]"></div>
                            ))}
                            {activeNodesCount === 0 && <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20"></div>}
                          </div>
                        </div>
                      </section>

                      {/* Project Telemetry: Crystal HUD */}
                      <section className="glass-card rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden">
                        <div className="flex justify-between items-start mb-12">
                          <div>
                            <h2 className="text-xl font-bold tracking-tight text-white mb-1">Project Telemetry</h2>
                            <p className="text-on-surface-variant text-xs tracking-wide">Processing velocity per sector</p>
                          </div>
                          <span className="text-[9px] font-black border border-primary/40 text-primary px-3 py-1 rounded-full uppercase tracking-widest">Live Stream</span>
                        </div>
                        <div className="h-48 flex items-end gap-4 px-2">
                          <div className="flex-1 bg-white/5 h-[30%] rounded-full"></div>
                          <div className="flex-1 bg-white/5 h-[60%] rounded-full"></div>
                          <div className="flex-1 bg-white/5 h-[45%] rounded-full"></div>
                          <div className="flex-1 bg-primary h-[85%] rounded-full shadow-[0_0_20px_rgba(207,248,12,0.3)]"></div>
                          <div className="flex-1 bg-white/5 h-[40%] rounded-full"></div>
                          <div className="flex-1 bg-white/5 h-[70%] rounded-full"></div>
                          <div className="flex-1 bg-white/5 h-[50%] rounded-full"></div>
                        </div>
                        <div className="mt-8 flex justify-between text-[10px] text-on-surface-variant/40 font-bold tracking-widest uppercase px-2">
                          <span>06:00</span><span>12:00</span><span>18:00</span><span>00:00</span>
                        </div>
                      </section>

                      {/* Dashboard Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <h2 className="text-xl font-bold tracking-tight uppercase">
                            {isCarMode ? 'Vehicle Systems' : 'Active Modules'}
                          </h2>
                          <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
                            <button 
                              onClick={() => setViewMode('grid')}
                              className={cn("p-1.5 rounded-md transition-colors cursor-pointer", viewMode === 'grid' ? "bg-white/10 text-primary" : "text-white/40 hover:text-white")}
                            >
                              <LayoutGrid size={14} />
                            </button>
                            <button 
                              onClick={() => setViewMode('list')}
                              className={cn("p-1.5 rounded-md transition-colors cursor-pointer", viewMode === 'list' ? "bg-white/10 text-primary" : "text-white/40 hover:text-white")}
                            >
                              <List size={14} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/40">
                          <History size={12} />
                          <span>Last sync: 2 mins ago</span>
                        </div>
                      </div>

                      {/* Widgets Grid */}
                      <div className={cn(
                        "grid gap-8",
                        viewMode === 'grid' 
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                          : "grid-cols-1"
                      )}>
                        <AnimatePresence mode="popLayout">
                          {filteredWidgets.map((widget) => (
                            <WidgetCard key={widget.id} widget={widget} />
                          ))}
                          {filteredWidgets.length === 0 && (
                            <div className="col-span-full py-12 text-center text-white/40 font-bold uppercase tracking-widest text-xs">
                              No modules found matching "{searchQuery}"
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Lower Section: Agents and Logs */}
                      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between ml-2">
                             <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/60">Nyx Agents</h3>
                             <button 
                               onClick={() => setActiveTab('agents')}
                               className="text-[10px] text-primary font-bold hover:underline tracking-widest uppercase"
                             >
                               Manage All
                             </button>
                          </div>
                          <div className="space-y-3">
                            {agents.length > 0 ? agents.slice(0, 2).map(agent => (
                              <div 
                                key={agent.id}
                                onClick={() => {
                                  setActiveTab('agents');
                                }}
                                className="glass-card hover:bg-white/5 transition-all p-4 rounded-2xl flex items-center justify-between cursor-pointer group"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Cpu className="text-primary text-xl" size={20} />
                                  </div>
                                  <div>
                                    <div className="text-sm font-bold text-white uppercase">{agent.name}</div>
                                    <div className={cn(
                                      "text-[10px] font-medium uppercase",
                                      agent.status === 'online' ? "text-primary/70" : "text-white/30"
                                    )}>{agent.status === 'online' ? 'ACTIVE_LINK' : 'OFFLINE'}</div>
                                  </div>
                                </div>
                                <ChevronRight className="text-on-surface-variant/40 group-hover:text-primary transition-colors" size={16} />
                              </div>
                            )) : (
                              <div className="glass-card p-6 text-center opacity-40 border-dashed">
                                <p className="text-[10px] uppercase font-bold tracking-widest">No agents connected</p>
                              </div>
                            )}
                          </div>
                          <button 
                            onClick={() => setActiveTab('agents')}
                            className="w-full py-4 bg-white/5 border border-white/10 hover:border-primary/50 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                          >
                            + Connect Agent
                          </button>
                        </div>
                        <div className="glass-card rounded-2xl p-6 flex flex-col">
                          <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/60 mb-6 font-bold">Terminal Output</h3>
                          <div className="font-mono text-[11px] space-y-3 opacity-80 flex-1">
                            {logs.slice(-5).map((log, i) => (
                              <div key={i} className="flex gap-4">
                                <span className="text-on-surface-variant">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                                <span className={cn(
                                  log.action.includes('ERROR') ? "text-neon-pink" : "text-primary"
                                )}>
                                  {log.action}: {log.details.substring(0, 40)}...
                                </span>
                              </div>
                            ))}
                            {logs.length === 0 && (
                              <>
                                <div className="flex gap-4"><span className="text-on-surface-variant">14:02</span> <span className="text-primary">CORE_INIT: OK</span></div>
                                <div className="flex gap-4"><span className="text-on-surface-variant">14:05</span> <span className="text-white/60">NODE_SCAN: 100%</span></div>
                                <div className="flex gap-4"><span className="text-on-surface-variant">14:12</span> <span className="text-neon-pink">UPSTREAM_LAG: 42ms</span></div>
                              </>
                            )}
                          </div>
                          <div className="mt-auto pt-6 border-t border-white/5">
                            <div className="text-[9px] text-on-surface-variant uppercase tracking-widest">System Health: Nominal</div>
                          </div>
                        </div>
                      </section>

                      {/* Car Mode Visualization */}
                      {isCarMode && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-12 glass-card p-10 bg-gradient-to-b from-card-bg to-black overflow-hidden relative rounded-[2.5rem]"
                        >
                          <div className="absolute top-0 left-0 w-full h-1 bg-primary neon-glow" />
                          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="flex-1 space-y-8">
                              <div className="space-y-2">
                                <h3 className="text-5xl font-black tracking-tighter italic">NEON VELOCITY</h3>
                                <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase">Simulated Neural Drive</p>
                              </div>
                              <div className="grid grid-cols-2 gap-8">
                                <div>
                                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
                                    {obd?.pids.find(p => p.code === '0104')?.name || 'Engine Load'}
                                  </div>
                                  <div className="text-4xl font-black italic tracking-tighter">
                                    {obd?.pids.find(p => p.code === '0104')?.value || '0'}%
                                  </div>
                                  <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-primary transition-all duration-300 shadow-[0_0_10px_#cff80c]" 
                                      style={{ width: `${obd?.pids.find(p => p.code === '0104')?.value || 0}%` }}
                                    />
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">
                                    {obd?.pids.find(p => p.code === '0105')?.name || 'Coolant'}
                                  </div>
                                  <div className={cn(
                                    "text-4xl font-black italic tracking-tighter",
                                    Number(obd?.pids.find(p => p.code === '0105')?.value || 0) > 100 ? "text-red-500 animate-pulse" : "text-white"
                                  )}>
                                    {obd?.pids.find(p => p.code === '0105')?.value || '0'}<span className="text-lg ml-1 opacity-50">°C</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="relative w-full max-w-md aspect-video flex items-center justify-center">
                               <div className="w-64 h-32 bg-primary/5 rounded-full blur-3xl absolute animate-pulse" />
                               <img 
                                 src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY1kufC0qMbXkUOa--qjRwdqi3epYolVeK2PUlUBWRYBy-8r7GtSL6MywDdKgKC8r_WZsxOdiGTvke4hBdIY6pN60F14bBY0svYlMB4dl87TjdRtACF6gh5c6oJdFxh-xzSae_fAbudFUx6X6YUJ4BdojwWmeOsGxwoUbGqo-DijewTNPeR4qpOoSbDFW6mJj6u3CeNrK0y_EsNOpUJmJLzUKt-4F3vxGFuuffywllmTBkWX5jfdFrg7gRnpkF2RrkhRWkUt5RFDc" 
                                 alt="Car" 
                                 className={cn(
                                   "w-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(207,248,12,0.3)] transition-transform duration-300",
                                   (obd?.pids.find(p => p.code === '010C')?.value as number || 0) > 3000 ? "scale-105" : "scale-100"
                                 )}
                                 referrerPolicy="no-referrer"
                               />
                            </div>

                            <div className="flex-1 flex flex-col items-end gap-4">
                              <div className="text-right">
                                <div className="text-7xl font-black italic neon-text">
                                  {obd?.pids.find(p => p.code === '010D')?.value || '0'}
                                </div>
                                <div className="text-xs text-white/40 uppercase tracking-[0.3em] font-bold">KM/H</div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-black italic text-white/40">
                                   {obd?.pids.find(p => p.code === '010C')?.value || '0'}
                                </div>
                                <div className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">RPM</div>
                              </div>
                              <div className="flex gap-2">
                                 {[1,2,3,4,5].map(i => (
                                   <div key={i} className={cn("w-2 h-10 rounded-sm", i < 3 ? "bg-primary" : "bg-white/10")} />
                                 ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}

                  {activeTab === 'notes' && (
                    <motion.div 
                      key="notes"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <NotesPanel />
                    </motion.div>
                  )}

                  {activeTab === 'ai' && (
                    <motion.div 
                      key="ai"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <AIPanel />
                    </motion.div>
                  )}

                  {activeTab === 'terminal' && (
                    <motion.div 
                      key="terminal"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <TerminalPanel />
                    </motion.div>
                  )}

                  {activeTab === 'media' && (
                    <motion.div 
                      key="media"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <ToolsPanel type="media" />
                    </motion.div>
                  )}

                  {activeTab === 'vector' && (
                    <motion.div 
                      key="vector"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <ToolsPanel type="vector" />
                    </motion.div>
                  )}

                  {activeTab === 'links' && (
                    <motion.div 
                      key="links"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <LinksPanel />
                    </motion.div>
                  )}

                  {activeTab === 'files' && (
                    <motion.div 
                      key="files"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <FileManagerPanel />
                    </motion.div>
                  )}

                  {activeTab === 'scripts' && (
                    <motion.div 
                      key="scripts"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <ScriptEditorPanel />
                    </motion.div>
                  )}

                  {activeTab === 'agents' && (
                    <motion.div 
                      key="agents"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full flex flex-col"
                    >
                      <div className="flex border-b border-white/5 bg-black/40">
                        <button 
                          onClick={() => setAgentSubTab('list')}
                          className={cn(
                            "px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer",
                            agentSubTab === 'list' ? "border-primary text-white" : "border-transparent text-white/40 hover:text-white"
                          )}
                        >
                          Control Panel
                        </button>
                        <button 
                          onClick={() => setAgentSubTab('topology')}
                          className={cn(
                            "px-6 py-4 text-[11px] font-black uppercase tracking-widest transition-all border-b-2 cursor-pointer",
                            agentSubTab === 'topology' ? "border-primary text-white" : "border-transparent text-white/40 hover:text-white"
                          )}
                        >
                          Neural Topology
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {agentSubTab === 'list' ? <AgentControllerPanel /> : <AgentTreeView />}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'dev' && (
                    <motion.div 
                      key="dev"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <DevDirectory onNavigate={setActiveTab} />
                    </motion.div>
                  )}

                  {activeTab === 'remote' && (
                    <motion.div 
                      key="remote"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <RemoteDesk />
                    </motion.div>
                  )}

                  {activeTab === 'audit' && (
                    <motion.div 
                      key="audit"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <AuditSystem />
                    </motion.div>
                  )}

                  {activeTab === 'installer' && (
                    <motion.div 
                      key="installer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <WizardInstallManager />
                    </motion.div>
                  )}

                  {activeTab === 'blueprint' && (
                    <motion.div 
                      key="blueprint"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <BlueprintExplorer />
                    </motion.div>
                  )}

                  {activeTab === 'obdscan' && (
                    <motion.div 
                      key="obdscan"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-full"
                    >
                      <OBDScan />
                    </motion.div>
                  )}

                  {activeTab === 'settings' && (
                    <motion.div 
                      key="settings"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-8"
                    >
                      <SettingsPanel />
                    </motion.div>
                  )}

                  {activeTab === 'logs' && (
                    <motion.div 
                      key="logs"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-8"
                    >
                      <div className="flex items-center gap-2 mb-6 text-white">
                        <TerminalIcon size={24} className="text-neon-lime" />
                        <h2 className="text-2xl font-bold tracking-tight uppercase">System Audit Logs</h2>
                      </div>
                      <div className="glass-card overflow-hidden">
                        <div className="max-h-[70vh] overflow-y-auto font-mono text-xs p-6 space-y-3 bg-black/40 custom-scrollbar">
                          {logs.filter(l => !searchQuery || l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                            <div className="text-white/20 italic text-center py-20">No actions recorded matching query...</div>
                          ) : (
                            logs.filter(l => !searchQuery || l.action.toLowerCase().includes(searchQuery.toLowerCase()) || l.details.toLowerCase().includes(searchQuery.toLowerCase())).map((log) => (
                              <div key={log.id} className="flex items-start gap-6 group border-b border-white/5 pb-3">
                                <span className="text-white/30 whitespace-nowrap">[{new Date(log.timestamp).toLocaleString()}]</span>
                                <span className="text-neon-blue font-bold min-w-[120px]">{log.action}</span>
                                <span className="text-white/60 flex-1">{log.details}</span>
                                <button 
                                  onClick={() => rollback(log.id)}
                                  className="opacity-0 group-hover:opacity-100 text-neon-lime hover:underline transition-opacity px-3 py-1 bg-neon-lime/10 rounded cursor-pointer"
                                >
                                  Restore Point
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </main>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <DashboardContent />
        <AutopilotController />
        <GuidanceSystem />
        <FloatingAssistant />
      </div>
    </DashboardProvider>
  );
}


