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
  const { widgets, isCarMode, viewMode, setViewMode, logs, rollback, searchQuery, isAuthReady, addWidget } = useDashboard();
  const [activeTab, setActiveTab] = React.useState('home');

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
                {/* Hero Section: Simplified Minimal Metrics */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="glass-card neon-glow p-8 rounded-[2rem] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold mb-4">Daily Logic</span>
                    <div className="text-4xl font-extrabold tracking-tighter mb-2">1,284</div>
                    <div className="text-[10px] text-primary font-bold">+14.2% FLOW</div>
                  </div>
                  <div className="glass-card neon-glow p-8 rounded-[2rem] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold mb-4">Core Velocity</span>
                    <div className="text-4xl font-extrabold tracking-tighter text-primary mb-2">98.4<span className="text-lg opacity-40 ml-1">/100</span></div>
                    <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                      <div className="w-[98%] h-full bg-primary"></div>
                    </div>
                  </div>
                  <div className="glass-card neon-glow p-8 rounded-[2rem] flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-on-surface-variant font-bold mb-4">Active Nodes</span>
                    <div className="text-4xl font-extrabold tracking-tighter mb-2">24</div>
                    <div className="flex -space-x-1.5 mt-2">
                      <div className="w-5 h-5 rounded-full bg-white/10 border border-white/20"></div>
                      <div className="w-5 h-5 rounded-full bg-primary/40 border border-white/20"></div>
                      <div className="w-5 h-5 rounded-full bg-primary border border-white/20"></div>
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
                        className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white/10 text-primary" : "text-white/40 hover:text-white")}
                      >
                        <LayoutGrid size={14} />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white/10 text-primary" : "text-white/40 hover:text-white")}
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
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/60 ml-2">Nyx Agents</h3>
                    <div className="space-y-3">
                      <div className="glass-card hover:bg-white/5 transition-all p-4 rounded-2xl flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Cpu className="text-primary text-xl" size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">NYX_AUTO_01</div>
                            <div className="text-[10px] text-primary/70 font-medium">OPTIMIZING</div>
                          </div>
                        </div>
                        <List className="text-on-surface-variant/40 group-hover:text-primary transition-colors" size={16} />
                      </div>
                      <div className="glass-card hover:bg-white/5 transition-all p-4 rounded-2xl flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <Database className="text-on-surface-variant text-xl" size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">SENTINEL_SEC</div>
                            <div className="text-[10px] text-on-surface-variant font-medium">MONITORING</div>
                          </div>
                        </div>
                        <List className="text-on-surface-variant/40 group-hover:text-primary transition-colors" size={16} />
                      </div>
                    </div>
                    <button 
                      onClick={() => addWidget({})}
                      className="w-full py-4 bg-white/5 border border-white/10 hover:border-primary/50 text-white rounded-2xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
                    >
                      + New Instance
                    </button>
                  </div>
                  <div className="glass-card rounded-2xl p-6 flex flex-col">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-on-surface-variant/60 mb-6">Terminal Output</h3>
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
                          <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase">Performance Mode Active</p>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Battery</div>
                            <div className="text-4xl font-black italic tracking-tighter">84%</div>
                            <div className="w-full h-1 bg-white/10 mt-2 rounded-full overflow-hidden">
                              <div className="h-full bg-primary w-[84%] shadow-[0_0_10px_#cff80c]" />
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest mb-1">Range</div>
                            <div className="text-4xl font-black italic tracking-tighter">342<span className="text-lg ml-1 opacity-50">km</span></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative w-full max-w-md aspect-video flex items-center justify-center">
                         <div className="w-64 h-32 bg-primary/5 rounded-full blur-3xl absolute animate-pulse" />
                         <img 
                           src="https://lh3.googleusercontent.com/aida-public/AB6AXuCY1kufC0qMbXkUOa--qjRwdqi3epYolVeK2PUlUBWRYBy-8r7GtSL6MywDdKgKC8r_WZsxOdiGTvke4hBdIY6pN60F14bBY0svYlMB4dl87TjdRtACF6gh5c6oJdFxh-xzSae_fAbudFUx6X6YUJ4BdojwWmeOsGxwoUbGqo-DijewTNPeR4qpOoSbDFW6mJj6u3CeNrK0y_EsNOpUJmJLzUKt-4F3vxGFuuffywllmTBkWX5jfdFrg7gRnpkF2RrkhRWkUt5RFDc" 
                           alt="Car" 
                           className="w-full object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(207,248,12,0.3)]"
                           referrerPolicy="no-referrer"
                         />
                      </div>

                      <div className="flex-1 flex flex-col items-end gap-4">
                        <div className="text-right">
                          <div className="text-7xl font-black italic neon-text">124</div>
                          <div className="text-xs text-white/40 uppercase tracking-[0.3em] font-bold">KM/H</div>
                        </div>
                        <div className="flex gap-2">
                           {[1,2,3,4,5].map(i => (
                             <div key={i} className={cn("w-2 h-10 rounded-sm", i < 4 ? "bg-primary" : "bg-white/10")} />
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


