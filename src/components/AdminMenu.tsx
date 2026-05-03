import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  X, 
  Activity, 
  Terminal, 
  Database, 
  Gauge, 
  Zap, 
  Smartphone, 
  MessageSquare,
  Globe,
  Settings,
  History,
  Car
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useDashboard } from '../store/DashboardContext';

export const AdminMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { toggleCarMode, isCarMode } = useDashboard();

  const modules = [
    { id: 'home', label: 'Main Dashboard', icon: Activity, desc: 'Global system overview' },
    { id: 'obdscan', label: 'OBD Diagnostics', icon: Gauge, desc: 'Real-time vehicle telemetry' },
    { id: 'agents', label: 'Neural Agents', icon: Zap, desc: 'Node control and orchestration' },
    { id: 'blueprint', label: 'System Explorer', icon: Database, desc: 'Architecture and data mapping' },
    { id: 'terminal', label: 'Root Console', icon: Terminal, desc: 'Direct CLI access' },
    { id: 'ai', label: 'Neural Chat', icon: MessageSquare, desc: 'AI assistant interface' },
    { id: 'installer', label: 'Unified Setup', icon: Smartphone, desc: 'Bridges and local install' },
    { id: 'logs', label: 'Security Audit', icon: History, desc: 'Immutable event logs' },
    { id: 'settings', label: 'Control Center', icon: Settings, desc: 'Globals and theme variables' },
  ];

  const navigateTo = (tabId: string) => {
    window.dispatchEvent(new CustomEvent('nav-tab', { detail: tabId }));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-[9998]"
          />
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="fixed top-0 right-0 w-[400px] h-full bg-black/90 border-l border-white/10 z-[9999] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-red-500/10 to-transparent">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Admin_Portal</h2>
                    <p className="text-[10px] text-red-500/60 font-black tracking-[0.2em] uppercase leading-none">Super_User_Access</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>
              <p className="text-xs text-white/40 leading-relaxed font-mono italic">
                Advanced navigator for direct access to all system modules. Bypasses standard workflows and introductory sequences.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="p-6 bg-white/5 border-b border-white/5 grid grid-cols-2 gap-3">
               <button 
                 onClick={() => { toggleCarMode(); onClose(); }}
                 className={cn(
                   "p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all active:scale-95",
                   isCarMode ? "bg-primary border-primary text-black" : "bg-white/5 border-white/10 text-white/60 hover:text-white"
                 )}
               >
                 <Car size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Car Mode: {isCarMode ? 'ON' : 'OFF'}</span>
               </button>
               <button 
                 onClick={() => navigateTo('settings')}
                 className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center gap-3 text-white/60 hover:text-white transition-all active:scale-95"
               >
                 <Globe size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest">Emergency Root</span>
               </button>
            </div>

            {/* Modules List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] block mb-4 ml-2">Indexed Systems</span>
               {modules.map(mod => (
                 <button
                   key={mod.id}
                   onClick={() => navigateTo(mod.id)}
                   className="w-full p-4 glass-card bg-white/5 border border-white/5 hover:border-primary/40 hover:bg-white/10 transition-all rounded-2xl flex items-center gap-5 group text-left relative overflow-hidden"
                 >
                   <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors">
                     <mod.icon size={24} />
                   </div>
                   <div className="flex-1">
                     <h3 className="text-sm font-black text-white uppercase tracking-wider group-hover:text-primary transition-colors">{mod.label}</h3>
                     <p className="text-[10px] text-white/30 font-medium italic mt-0.5">{mod.desc}</p>
                   </div>
                   <div className="text-[9px] font-mono text-white/10 absolute top-2 right-4">SEC_LVL_0[X]</div>
                 </button>
               ))}
            </div>

            {/* Footer Status */}
            <div className="p-8 border-t border-white/10 bg-black/40">
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-white/40">Auth: Verified Admin</span>
                </div>
                <div className="text-white/20">NYX_CORE_v2.0.4</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
