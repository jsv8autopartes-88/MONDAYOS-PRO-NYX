import React from 'react';
import { DashboardProvider, useDashboard } from './store/DashboardContext';
import { Sidebar, TopBar } from './components/Navigation';
import { WidgetCard } from './components/WidgetCard';
import { SettingsPanel } from './components/SettingsPanel';
import { NotesPanel } from './components/NotesPanel';
import { AIPanel } from './components/AIPanel';
import { TerminalPanel } from './components/TerminalPanel';
import { ToolsPanel } from './components/ToolsPanel';
import { LinksPanel } from './components/LinksPanel';
import { FileManagerPanel } from './components/FileManagerPanel';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutGrid, 
  List, 
  Activity, 
  Cpu, 
  Database, 
  Globe,
  History,
  Terminal as TerminalIcon
} from 'lucide-react';
import { cn } from './lib/utils';

const DashboardContent: React.FC = () => {
  const { widgets, isCarMode, viewMode, setViewMode, logs, rollback, searchQuery } = useDashboard();
  const [activeTab, setActiveTab] = React.useState('home');

  const filteredWidgets = widgets.filter(w => {
    const query = (searchQuery || '').toLowerCase();
    const title = (w.title || '').toLowerCase();
    const type = (w.type || '').toLowerCase();
    return title.includes(query) || type.includes(query);
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar />
      
      <div className="flex-1 overflow-hidden flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-dashboard-bg/50">
          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8"
              >
                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  {[
                    { label: 'CPU Usage', value: '24%', icon: Cpu, color: 'text-neon-blue' },
                    { label: 'Memory', value: '4.2GB', icon: Database, color: 'text-neon-pink' },
                    { label: 'Network', value: '120Mb/s', icon: Globe, color: 'text-neon-lime' },
                    { label: 'Uptime', value: '12d 4h', icon: Activity, color: 'text-white' },
                  ].map((stat, i) => (
                    <div key={i} className="glass-card p-4 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">{stat.label}</p>
                        <p className={cn("text-xl font-bold font-mono", stat.color)}>{stat.value}</p>
                      </div>
                      <stat.icon size={24} className="text-white/20" />
                    </div>
                  ))}
                </div>

                {/* Dashboard Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold tracking-tight">
                      {isCarMode ? 'Vehicle Systems' : 'Main Dashboard'}
                    </h2>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-card-border">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white/10 text-neon-lime" : "text-white/40 hover:text-white")}
                      >
                        <LayoutGrid size={16} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white/10 text-neon-lime" : "text-white/40 hover:text-white")}
                      >
                        <List size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <History size={14} />
                    <span>Last sync: 2 mins ago</span>
                  </div>
                </div>

                {/* Widgets Grid */}
                <div className={cn(
                  "grid gap-6",
                  viewMode === 'grid' 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
                    : "grid-cols-1"
                )}>
                  <AnimatePresence mode="popLayout">
                    {filteredWidgets.map((widget) => (
                      <WidgetCard key={widget.id} widget={widget} />
                    ))}
                    {filteredWidgets.length === 0 && (
                      <div className="col-span-full py-12 text-center text-white/40">
                        No widgets found matching "{searchQuery}"
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Car Mode Visualization */}
                {isCarMode && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 glass-card p-8 bg-gradient-to-b from-card-bg to-black overflow-hidden relative"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-neon-lime neon-glow" />
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                      <div className="flex-1 space-y-8">
                        <div className="space-y-2">
                          <h3 className="text-4xl font-black tracking-tighter italic">E-TRON GT</h3>
                          <p className="text-neon-lime text-sm font-bold tracking-[0.3em] uppercase">Performance Mode Active</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <div className="text-xs text-white/40 uppercase mb-1">Battery</div>
                            <div className="text-3xl font-mono">84%</div>
                            <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                              <div className="h-full bg-neon-lime w-[84%]" />
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-white/40 uppercase mb-1">Range</div>
                            <div className="text-3xl font-mono">342<span className="text-sm ml-1">km</span></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative w-full max-w-md aspect-video flex items-center justify-center">
                         <div className="w-64 h-32 bg-white/5 rounded-full blur-3xl absolute animate-pulse" />
                         <img 
                           src="https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800" 
                           alt="Car" 
                           className="w-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(212,255,0,0.2)]"
                           referrerPolicy="no-referrer"
                         />
                      </div>

                      <div className="flex-1 flex flex-col items-end gap-4">
                        <div className="text-right">
                          <div className="text-6xl font-black italic neon-text">124</div>
                          <div className="text-sm text-white/40 uppercase tracking-widest">KM/H</div>
                        </div>
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(i => (
                             <div key={i} className={cn("w-2 h-8 rounded-sm", i < 4 ? "bg-neon-lime" : "bg-white/10")} />
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
                <div className="flex items-center gap-2 mb-6">
                  <TerminalIcon size={24} className="text-neon-lime" />
                  <h2 className="text-2xl font-bold tracking-tight uppercase">System Audit Logs</h2>
                </div>
                <div className="glass-card overflow-hidden">
                  <div className="max-h-[70vh] overflow-y-auto font-mono text-xs p-6 space-y-3 bg-black/40 custom-scrollbar">
                    {logs.length === 0 ? (
                      <div className="text-white/20 italic text-center py-20">No actions recorded yet...</div>
                    ) : (
                      logs.map((log) => (
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
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <DashboardProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar is now inside DashboardContent to handle activeTab state easily */}
        <DashboardContent />
      </div>
    </DashboardProvider>
  );
}


