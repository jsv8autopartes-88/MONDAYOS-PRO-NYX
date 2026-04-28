import React from 'react';
import { 
  Home, 
  MessageSquare, 
  Settings, 
  History, 
  LayoutGrid, 
  List, 
  Car, 
  Plus, 
  Search,
  User,
  Bell,
  Cloud,
  Terminal,
  FileText,
  Image as ImageIcon,
  PenTool,
  Zap,
  Globe,
  Folder,
  Activity,
  Database,
  ClipboardCheck
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { AIWave } from './AIWave';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isCarMode, toggleCarMode, addWidget, isAutopilotActive, agents } = useDashboard();
  const onlineAgents = agents.filter(a => a.status === 'online').length;

  const navItems = [
    { icon: Home, label: 'Dashboard', id: 'home' },
    { icon: Zap, label: 'Network Control', id: 'agents', badge: onlineAgents > 0 ? onlineAgents : undefined },
    { icon: MessageSquare, label: 'Neural Chat', id: 'ai' },
    { icon: Folder, label: 'Asset Library', id: 'files' },
    { icon: FileText, label: 'Technical Notes', id: 'notes' },
    { icon: Globe, label: 'External Links', id: 'links' },
    { icon: activityIcon(), label: 'Autopilot', id: 'autopilot', active: isAutopilotActive },
    { icon: Globe, label: 'RemoteDesk', id: 'remote' },
    { icon: ClipboardCheck, label: 'Audit System', id: 'audit' },
    { icon: Database, label: 'Dev Directory', id: 'dev' },
    { icon: Terminal, label: 'Core Terminal', id: 'terminal' },
    { icon: Settings, label: 'Control Center', id: 'settings' },
    { icon: History, label: 'Event Logs', id: 'logs' },
  ];

  function activityIcon() {
    return isAutopilotActive ? Activity : PenTool;
  }

  return (
    <div className="w-[82px] lg:w-64 bg-black border-r border-white/5 flex flex-col h-full transition-all duration-300 shadow-[10px_0_30px_-15px_rgba(207,248,12,0.05)]">
      <div className="p-6 flex flex-col gap-1 items-center lg:items-start">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <h2 className="text-primary font-black tracking-[0.2em] uppercase text-[10px] lg:text-sm text-center lg:text-left">NYX_OS_PRO</h2>
        </div>
        <p className="text-neutral-600 font-bold text-[8px] lg:text-[10px] tracking-[0.2em] hidden lg:block uppercase">Security Auditor Edition</p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar font-bold tracking-widest uppercase text-[10px]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center justify-center lg:justify-start gap-4 py-3.5 px-0 lg:px-6 transition-all duration-300 group relative",
              activeTab === item.id 
                ? "text-primary bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary" 
                : "text-neutral-600 hover:text-neutral-300 hover:bg-white/5"
            )}
          >
            <div className="relative">
              <item.icon size={20} className={cn(
                "transition-all duration-300",
                activeTab === item.id ? "text-primary scale-110" : "text-neutral-600 group-hover:text-primary",
                item.id === 'autopilot' && isAutopilotActive ? "animate-spin-slow text-neon-lime" : ""
              )} />
              {item.badge !== undefined && (
                <span className="absolute -top-2 -right-2 bg-primary text-black text-[8px] px-1 rounded-sm min-w-[12px] flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </div>
            <span className={cn("hidden lg:block transition-colors", activeTab === item.id ? "text-white" : "")}>
              {item.label}
            </span>
            {item.id === 'autopilot' && isAutopilotActive && (
              <div className="absolute right-4 hidden lg:block">
                <div className="flex gap-0.5">
                  <div className="w-0.5 h-3 bg-neon-lime animate-pulse" />
                  <div className="w-0.5 h-3 bg-neon-lime animate-pulse delay-75" />
                  <div className="w-0.5 h-3 bg-neon-lime animate-pulse delay-150" />
                </div>
              </div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4 border-t border-white/5">
        <button
          onClick={toggleCarMode}
          className={cn(
            "w-full flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all duration-300",
            isCarMode ? "active-glow" : "bg-white/5 text-white/60 hover:bg-white/10"
          )}
        >
          <Car size={24} />
          <span className="hidden lg:block text-[11px] font-bold uppercase tracking-widest">Car Mode</span>
        </button>

        <button
          onClick={() => addWidget({})}
          className="w-full flex items-center justify-center lg:justify-start gap-2 p-3 bg-white/5 border border-white/10 hover:border-primary/50 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest transition-all active:scale-95"
        >
          <Plus size={24} />
          <span className="hidden lg:block">New Instance</span>
        </button>
      </div>
    </div>
  );
};

export const TopBar: React.FC = () => {
  const { isCarMode, searchQuery, setSearchQuery, user, login, logout, isAuthReady } = useDashboard();
  
  // Use a hacky way to access setActiveTab since it's in App.tsx
  // Actually, better to just let Navigation.tsx handle it or use a global state if needed
  // But usually Navigation TopBar is part of the layout.
  
  return (
    <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-50 shadow-[0_0_15px_rgba(207,248,12,0.1)]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('nav-home'))}>
        <Zap className="text-primary" size={20} fill="currentColor" />
        <h1 className="text-primary font-black italic tracking-tighter text-lg">MONDAYOS-PRO-NYX</h1>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-md mx-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={14} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="QUERY_SYSTEM..."
            className="w-full bg-black border border-white/5 rounded-lg py-1.5 pl-10 pr-4 text-xs font-mono text-on-surface-variant focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-neutral-400 hover:text-primary transition-colors rounded-full active:scale-95">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-neon-pink rounded-full" />
        </button>
        
        <div className="flex items-center gap-3 pl-2">
          {!isAuthReady ? (
            <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-[10px] font-bold text-white truncate max-w-[100px] uppercase tracking-tighter">{user.displayName || 'Operator'}</div>
                <button 
                  onClick={logout}
                  className="text-[9px] text-primary uppercase tracking-widest hover:underline block"
                >
                  Logout
                </button>
              </div>
              <div className="w-8 h-8 rounded-full border border-primary/30 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-dashboard-bg flex items-center justify-center">
                    <User size={16} className="text-primary" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button 
              onClick={login}
              className="flex items-center gap-2 px-4 py-1.5 bg-primary text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-primary/80 transition-all active:scale-95 shadow-[0_0_15px_rgba(207,248,12,0.3)]"
            >
              <Cloud size={12} />
              Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
