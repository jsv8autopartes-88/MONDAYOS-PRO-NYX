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
  ClipboardCheck,
  Package,
  Map,
  ShieldCheck,
  X,
  Gauge
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { AIWave } from './AIWave';
import { AdminMenu } from './AdminMenu';

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
    { icon: Gauge, label: 'OBD Scan', id: 'obdscan' },
    { icon: Globe, label: 'RemoteDesk', id: 'remote' },
    { icon: ClipboardCheck, label: 'Audit System', id: 'audit' },
    { icon: Database, label: 'Dev Directory', id: 'dev' },
    { icon: Terminal, label: 'Core Terminal', id: 'terminal' },
    { icon: Map, label: 'System Blueprint', id: 'blueprint' },
    { icon: Package, label: 'Wizard Builder', id: 'installer' },
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

import { motion, AnimatePresence } from 'motion/react';

// At the top where TopBar is defined
export const TopBar: React.FC = () => {
  const { isCarMode, searchQuery, setSearchQuery, user, login, logout, isAuthReady, notifications, clearNotification, setTutorial } = useDashboard();
  const [isNotificationsOpen, setIsNotificationsOpen] = React.useState(false);
  const [isAdminOpen, setIsAdminOpen] = React.useState(false);
  const unreadCount = notifications.length;

  const searchItems = [
    { icon: Home, label: 'Dashboard', id: 'home', keywords: ['home', 'start', 'main', 'dashboard'] },
    { icon: Zap, label: 'Network Control', id: 'agents', keywords: ['agents', 'network', 'node', 'control'] },
    { icon: MessageSquare, label: 'Neural Chat', id: 'ai', keywords: ['chat', 'neural', 'assistant', 'ai'] },
    { icon: Folder, label: 'Asset Library', id: 'files', keywords: ['library', 'files', 'assets', 'manager'] },
    { icon: FileText, label: 'Technical Notes', id: 'notes', keywords: ['notes', 'documents', 'kb'] },
    { icon: Globe, label: 'External Links', id: 'links', keywords: ['links', 'urls', 'web', 'bookmarks'] },
    { icon: PenTool, label: 'Autopilot', id: 'autopilot', keywords: ['autopilot', 'automation', 'tasks', 'agents'] },
    { icon: Gauge, label: 'OBD Scanner', id: 'obdscan', keywords: ['obd', 'scan', 'car', 'diagnostics', 'engine', 'dtc', 'elm327', 'vehicle'] },
    { icon: Globe, label: 'RemoteDesk', id: 'remote', keywords: ['remote', 'desktop', 'vnc', 'viewer'] },
    { icon: ClipboardCheck, label: 'Audit System', id: 'audit', keywords: ['audit', 'system', 'check', 'inventory'] },
    { icon: Database, label: 'Dev Directory', id: 'dev', keywords: ['developer', 'directory', 'code', 'snippets'] },
    { icon: Terminal, label: 'Core Terminal', id: 'terminal', keywords: ['terminal', 'cli', 'console', 'commands'] },
    { icon: Map, label: 'System Blueprint', id: 'blueprint', keywords: ['blueprint', 'map', 'architecture', 'docs', 'structure'] },
    { icon: Package, label: 'Wizard Builder', id: 'installer', keywords: ['installer', 'wizard', 'setup', 'manager', 'windows', 'build'] },
    { icon: Settings, label: 'Control Center', id: 'settings', keywords: ['config', 'settings', 'options', 'preferences', 'theme', 'account', 'credentials'] },
    { icon: History, label: 'Event Logs', id: 'logs', keywords: ['logs', 'history', 'events', 'actions'] },
  ];

  const searchResults = searchQuery.trim() ? searchItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.keywords.some(k => k.includes(searchQuery.toLowerCase()))
  ) : [];

  return (
    <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-black/40 backdrop-blur-xl sticky top-0 z-50 shadow-[0_0_15px_rgba(207,248,12,0.1)]">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.dispatchEvent(new CustomEvent('nav-home'))}>
        <Zap className="text-primary" size={20} fill="currentColor" />
        <h1 className="text-primary font-black italic tracking-tighter text-lg">MONDAYOS-PRO-NYX</h1>
      </div>

      <div className="flex items-center gap-6 flex-1 max-w-md mx-8 relative">
        <div className="relative flex-1 group">
          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 transition-colors", searchQuery ? "text-primary animate-pulse" : "text-neutral-500")} size={14} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="QUERY_SYSTEM... (Global Search)"
            className={cn(
              "w-full bg-black border rounded-lg py-1.5 pl-10 pr-8 text-xs font-mono text-on-surface-variant focus:outline-none transition-colors",
              searchQuery ? "border-primary/50 shadow-[0_0_10px_rgba(207,248,12,0.2)]" : "border-white/5 focus:border-primary/50"
            )}
          />
          <AnimatePresence>
            {searchQuery && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-white z-10"
              >
                <X size={12} />
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {searchQuery && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute left-0 right-0 top-full mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-[100]"
              >
                <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                  <span className="text-[10px] font-black uppercase text-white/50 tracking-widest">System Shortcuts</span>
                </div>
                <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                  {searchResults.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('nav-tab', { detail: item.id }));
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-white/10 transition-colors group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-3">
                        <item.icon size={16} className="text-white/40 group-hover:text-primary transition-colors" />
                        <div>
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider">{item.label}</p>
                          <p className="text-[9px] text-white/40 font-mono italic">module://{item.id}</p>
                        </div>
                      </div>
                      <span className="text-[9px] bg-primary/20 text-primary px-2 py-0.5 rounded font-black opacity-0 group-hover:opacity-100 transition-opacity">
                        JUMP
                      </span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsAdminOpen(true)}
          className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center gap-2"
          title="Admin_Bypass"
        >
          <ShieldCheck size={14} />
          ADMIN
        </button>

        <AdminMenu isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />

        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'blueprint' }))}
          className="p-2 text-white/40 hover:text-primary hover:bg-primary/10 rounded-full transition-all active:scale-95"
          title="Admin_System_Mapping"
        >
          <ShieldCheck size={18} />
        </button>

        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className={cn("relative p-2 transition-colors rounded-full active:scale-95", isNotificationsOpen ? "bg-white/10 text-white" : "text-neutral-400 hover:text-primary")}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-neon-pink rounded-full" />}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto custom-scrollbar glass-card rounded-xl border border-white/10 shadow-2xl z-[100]"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-black/40 sticky top-0 z-10">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Notifications</h3>
                  <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">{notifications.length}</span>
                </div>
                <div className="p-2 space-y-2">
                  {notifications.length === 0 ? (
                    <div className="text-[10px] text-white/40 text-center py-8 font-mono uppercase tracking-widest">No new alerts</div>
                  ) : notifications.map(notif => (
                    <div 
                      key={notif.id}
                      className="p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group relative"
                      onClick={() => {
                        setTutorial(notif.featureId);
                        setIsNotificationsOpen(false);
                      }}
                    >
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1">{notif.title}</h4>
                      <p className="text-[10px] text-white/60 leading-relaxed font-mono">{notif.message}</p>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-white/40 hover:text-white transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
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
