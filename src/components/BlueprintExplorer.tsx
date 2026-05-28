import { useAppStore } from '../store/appStore';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode2, 
  Download, 
  Map, 
  Cpu, 
  Layers, 
  Code2, 
  CheckCircle2, 
  Info,
  ChevronRight,
  ExternalLink,
  BookOpen,
  ShieldCheck,
  Zap,
  Terminal,
  Settings,
  Database,
  History,
  FileText,
  Target,
  Smartphone,
  Gauge
} from 'lucide-react';
import { cn } from '../lib/utils';
import { APP_BLUEPRINT } from '../constants';
import { useDashboard } from '../store/DashboardContext';

export const BlueprintExplorer: React.FC = () => {
  const { addLog } = useAppStore();
  const [activeView, setActiveView] = useState<'map' | 'tips' | 'export'>('map');
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const modules = [
    { label: 'Neural Chat', id: 'ai', icon: Zap },
    { label: 'Agent Skills', id: 'skills', icon: ShieldCheck, sub: true },
    { label: 'Mission Goal', id: 'missions', icon: Target, sub: true },
    { label: 'Network Graph', id: 'nodes', icon: Database, sub: true },
    { label: 'Local Bridge', id: 'setup', icon: Smartphone, sub: true },
    { label: 'Setup Wizard', id: 'wizard', icon: Settings },
    { label: 'OBD Scan', id: 'obdscan', icon: Gauge },
    { label: 'Core Terminal', id: 'terminal', icon: Terminal },
    { label: 'Event Logs', id: 'logs', icon: History },
  ];

  const jumpToModule = (id: string, isSub: boolean = false) => {
    if (isSub) {
      window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'agents' }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('nav-subtab', { detail: id }));
      }, 300);
    } else {
      window.dispatchEvent(new CustomEvent('nav-tab', { detail: id }));
    }
    
    addLog('ADMIN_COMMAND', `Bypassed flow to module: ${id}`);
    setShowAdminMenu(false);
  };

  const downloadBlueprint = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(APP_BLUEPRINT, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "nyx_system_blueprint.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="h-full flex flex-col p-8 space-y-6 overflow-hidden">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center text-primary">
            <Map size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">System Blueprint</h1>
            <p className="text-xs text-white/40 font-mono tracking-widest uppercase mt-1">Architecture & Code Mapping</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowAdminMenu(!showAdminMenu)}
              className={cn(
                "px-6 py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-primary hover:text-black transition-all flex items-center gap-2",
                showAdminMenu ? "bg-primary text-black" : ""
              )}
            >
              <ShieldCheck size={16} />
              Admin Mode
            </button>
            
            <AnimatePresence>
              {showAdminMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-64 glass-card p-2 rounded-2xl border border-primary/20 shadow-2xl z-[100]"
                >
                  <div className="px-4 py-2 border-b border-white/5 mb-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">Jump to Module</span>
                  </div>
                  <div className="space-y-1">
                    {modules.map(mod => (
                      <button
                        key={mod.id}
                        onClick={() => jumpToModule(mod.id, (mod as any).sub)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 text-white/60 hover:text-primary transition-all text-left"
                      >
                        <mod.icon size={16} />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{mod.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            onClick={downloadBlueprint}
            className="px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-colors flex items-center gap-2"
          >
            <Download size={16} />
            Export JSON Mapping
          </button>
        </div>
      </header>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Navigation Sidebar */}
        <div className="w-64 shrink-0 flex flex-col space-y-2">
          {[
            { id: 'map', icon: Layers, label: 'System Map' },
            { id: 'tips', icon: BookOpen, label: 'Developer Tips' },
            { id: 'export', icon: Code2, label: 'Standard Stack' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id as any)}
              className={cn(
                "p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all",
                activeView === view.id 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(207,248,12,0.1)]" 
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent"
              )}
            >
              <view.icon size={16} />
              {view.label}
            </button>
          ))}

          <div className="mt-auto p-4 glass-card bg-primary/5 border-primary/20">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Build Stats</h4>
            <div className="space-y-1 font-mono text-[9px] text-white/60">
              <div className="flex justify-between"><span>MODULARITY</span> <span className="text-primary">100%</span></div>
              <div className="flex justify-between"><span>TYPE SAFE</span> <span className="text-primary">TRUE</span></div>
              <div className="flex justify-between"><span>CODENAME</span> <span>{APP_BLUEPRINT.codename}</span></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-8 overflow-y-auto custom-scrollbar relative">
          
          <AnimatePresence mode="wait">
            {activeView === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">File & Logic Mapping</h2>
                  <p className="text-[10px] text-white/40 font-mono mt-1">Detailed directory structure and function responsibilities</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {APP_BLUEPRINT.structure.map((file, i) => (
                    <div key={i} className="group p-5 bg-black/40 border border-white/5 rounded-xl hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/5 rounded-lg text-white/60 group-hover:text-primary transition-colors">
                            <FileCode2 size={18} />
                          </div>
                          <span className="font-mono text-xs text-white/90 group-hover:text-white">{file.path}</span>
                        </div>
                        <span className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Active Component</span>
                      </div>
                      
                      <p className="text-xs text-white/50 leading-relaxed pl-11 mb-4">
                        {file.description}
                      </p>

                      {file.functions && (
                        <div className="pl-11 flex flex-wrap gap-2 mb-4">
                          {file.functions.map((fn, fi) => (
                            <span key={fi} className="px-2 py-1 bg-primary/5 border border-primary/20 text-primary text-[9px] font-mono rounded">
                              {fn}
                            </span>
                          ))}
                        </div>
                      )}

                      {file.tips && (
                        <div className="pl-11 space-y-2">
                          {file.tips.map((tip, ti) => (
                            <div key={ti} className="flex gap-2 items-start text-[10px] text-white/30 italic">
                              <Info size={12} className="shrink-0 mt-0.5 text-primary/50" />
                              <span>{tip}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'tips' && (
              <motion.div
                key="tips"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Customization Guide</h2>
                  <p className="text-[10px] text-white/40 font-mono mt-1">Instructions for scaling and modifying the system</p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {APP_BLUEPRINT.customization_guide.map((guide, i) => (
                    <div key={i} className="p-6 bg-white/5 rounded-2xl border border-white/5 space-y-4">
                      <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {guide.title}
                      </h3>
                      <div className="space-y-3">
                        {guide.steps ? (
                          guide.steps.map((step, si) => (
                            <div key={si} className="text-[11px] text-white/60 font-mono flex gap-3">
                              <span className="text-primary font-bold">{si + 1}.</span>
                              {step}
                            </div>
                          ))
                        ) : (
                          guide.tips?.map((tip, ti) => (
                            <div key={ti} className="text-[11px] text-white/60 font-mono flex gap-3 items-start">
                              <ChevronRight size={14} className="text-primary shrink-0 mt-0.5" />
                              {tip}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-black">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Developer Mode Activated</h3>
                      <p className="text-xs text-white/60 mt-1 uppercase tracking-wider font-mono">Use CMD+K to access neural shortcuts through the AI Interface.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'export' && (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Technical Stack</h2>
                    <p className="text-[10px] text-white/40 font-mono mt-1">Core dependencies and orchestration tools</p>
                  </div>
                  <span className="text-[10px] font-mono bg-white/10 px-3 py-1 rounded text-white/60 uppercase">Runtime: {APP_BLUEPRINT.architecture.split(' ')[0]} v18</span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {APP_BLUEPRINT.core_stack.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-xs font-mono text-white/80">{item}</span>
                      </div>
                      <CheckCircle2 size={14} className="text-primary/40" />
                    </div>
                  ))}
                </div>

                <div className="p-8 border-2 border-dashed border-white/10 rounded-2xl text-center space-y-4">
                  <BookOpen size={32} className="mx-auto text-white/20" />
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-widest">Extended Documentation</p>
                    <p className="text-[10px] text-white/40 font-mono mt-1 uppercase">Access full system specifications in the root 'AGENTS.md' file.</p>
                  </div>
                  <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Open Readme
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
