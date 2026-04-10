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
  Folder
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { AIWave } from './AIWave';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { isCarMode, toggleCarMode, addWidget } = useDashboard();

  const navItems = [
    { icon: Home, label: 'Dashboard', id: 'home' },
    { icon: MessageSquare, label: 'AI Assistant', id: 'ai' },
    { icon: Folder, label: 'Library', id: 'files' },
    { icon: FileText, label: 'Notes', id: 'notes' },
    { icon: Globe, label: 'Web Links', id: 'links' },
    { icon: ImageIcon, label: 'Media', id: 'media' },
    { icon: PenTool, label: 'Vector', id: 'vector' },
    { icon: Terminal, label: 'Terminal', id: 'terminal' },
    { icon: History, label: 'Logs', id: 'logs' },
    { icon: Settings, label: 'Settings', id: 'settings' },
  ];

  return (
    <div className="w-20 lg:w-64 bg-card-bg border-r border-card-border flex flex-col h-full transition-all duration-300">
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 bg-neon-lime rounded-xl flex items-center justify-center shadow-lg shadow-neon-lime/20">
          <Zap className="text-black" size={24} fill="currentColor" />
        </div>
        <h1 className="hidden lg:block font-bold text-xl tracking-tighter">OMNIDASH<span className="text-neon-lime">AI</span></h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300 group",
              activeTab === item.id ? "bg-neon-lime/10 text-neon-lime" : "hover:bg-white/5 text-white/60 hover:text-white"
            )}
          >
            <item.icon size={20} className={cn(activeTab === item.id ? "text-neon-lime" : "text-white/60 group-hover:text-neon-lime")} />
            <span className="hidden lg:block text-sm font-medium">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-4 border-t border-card-border">
        <button
          onClick={toggleCarMode}
          className={cn(
            "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-300",
            isCarMode ? "bg-neon-lime text-black shadow-lg shadow-neon-lime/20" : "bg-white/5 text-white/60 hover:bg-white/10"
          )}
        >
          <Car size={20} />
          <span className="hidden lg:block text-sm font-bold uppercase tracking-widest">Car Mode</span>
        </button>

        <button
          onClick={() => addWidget({})}
          className="w-full flex items-center justify-center gap-2 p-3 bg-white text-black rounded-xl font-bold hover:bg-neon-lime transition-colors"
        >
          <Plus size={20} />
          <span className="hidden lg:block text-sm">Add Widget</span>
        </button>
      </div>
    </div>
  );
};

export const TopBar: React.FC = () => {
  const { isCarMode, searchQuery, setSearchQuery } = useDashboard();

  return (
    <div className="h-20 border-b border-card-border flex items-center justify-between px-8 bg-card-bg/50 backdrop-blur-md">
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search functions, files, or ask AI..."
            className="w-full bg-white/5 border border-card-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-neon-lime/50 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col items-end">
          <div className="text-xs font-bold text-neon-lime uppercase tracking-widest">AI Status</div>
          <AIWave isListening={true} />
        </div>
        
        <div className="h-8 w-[1px] bg-card-border" />

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-white/5 rounded-full transition-colors">
            <Bell size={20} className="text-white/60" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-neon-lime rounded-full border-2 border-dashboard-bg" />
          </button>
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold">Admin User</div>
              <div className="text-[10px] text-white/40 uppercase tracking-tighter">Pro Developer</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-lime to-neon-blue p-[2px]">
              <div className="w-full h-full rounded-full bg-dashboard-bg flex items-center justify-center overflow-hidden">
                <User size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
