import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  X, 
  Activity, 
  Terminal, 
  Database, 
  Gauge, 
  Zap, 
  MessageSquare,
  Globe,
  Settings,
  History,
  Car,
  Sun,
  Moon,
  Laptop,
  PlaySquare,
  Folder,
  FileText,
  FileCode,
  ShieldCheck,
  Map,
  ClipboardCheck
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useDashboard } from '../store/DashboardContext';
import { useAppStore } from '../store/appStore';

export const AdminMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { toggleCarMode, isCarMode, theme, updateTheme, addNotification } = useDashboard();
  const { agents, logs, clearAutopilotQueue, addAutopilotTask } = useAppStore();

  // Determine if we're in iOS Light/Dark theme right now
  const isLight = theme.background === '#f5f6f8';

  const toggleLocalTheme = () => {
    if (isLight) {
      updateTheme({
        background: '#0a0a0c',
        cardBg: '#151619'
      });
      addNotification({
        title: 'THEME_UPDATE',
        message: 'Onyx Dark glass theme enabled.',
        type: 'info',
        featureId: 'THEME_ENGINE'
      });
    } else {
      updateTheme({
        background: '#f5f6f8',
        cardBg: 'rgba(255, 255, 255, 0.4)'
      });
      addNotification({
        title: 'THEME_UPDATE',
        message: 'iOS White Crystal Blur theme enabled.',
        type: 'info',
        featureId: 'THEME_ENGINE'
      });
    }
  };

  const fastForwardBypass = (actionType: 'agents' | 'terminal' | 'clear') => {
    if (actionType === 'agents') {
      window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'agents' }));
      addNotification({
        title: 'ADMIN_BYPASS_ENGAGED',
        message: 'Skipped to Neural Agents list configuration steps.',
        type: 'success',
        featureId: 'ADMIN_PORTAL'
      });
    } else if (actionType === 'terminal') {
      window.dispatchEvent(new CustomEvent('nav-tab', { detail: 'terminal' }));
      addNotification({
        title: 'ADMIN_BYPASS_ENGAGED',
        message: 'Direct Route Console bypass activated.',
        type: 'success',
        featureId: 'ADMIN_PORTAL'
      });
    } else if (actionType === 'clear') {
      clearAutopilotQueue();
      addNotification({
        title: 'ADMIN_QUEUE_CLEARED',
        message: 'All Autopilot pending steps purged immediately.',
        type: 'info',
        featureId: 'ADMIN_PORTAL'
      });
    }
    onClose();
  };

  const modulesGrouped = [
    {
      category: 'Core System & Metrics',
      items: [
        { id: 'home', label: 'Main Dashboard', icon: Activity, desc: 'Global system telemetries' },
        { id: 'blueprint', label: 'Blueprint Map', icon: Map, desc: 'Database schema & mappings' },
        { id: 'audit', label: 'Audit System', icon: ClipboardCheck, desc: 'Immutable check logs' },
      ]
    },
    {
      category: 'AI Assistant & Automation',
      items: [
        { id: 'autopilot', label: 'Autopilot Controller', icon: PlaySquare, desc: 'Automator pipeline state' },
        { id: 'ai', label: 'Neural Chat Bot', icon: MessageSquare, desc: 'Live Gemini conversation' },
        { id: 'scripts', label: 'Code Script Hub', icon: FileCode, desc: 'Sandbox logical IDE' },
      ]
    },
    {
      category: 'Hardware & Transceivers',
      items: [
        { id: 'obdscan', label: 'OBD diagnostics', icon: Gauge, desc: 'Vehicle CAN parameters' },
        { id: 'remote', label: 'RemoteDesk VNC', icon: Laptop, desc: 'Low-latency PC mirror' },
        { id: 'agents', label: 'Neural Stations', icon: Zap, desc: 'Local daemon links' },
      ]
    },
    {
      category: 'File Library & Packaging',
      items: [
        { id: 'installer', label: 'Unified Setup IDE', icon: Globe, desc: 'Installer package generator' },
        { id: 'files', label: 'Asset Cabinet', icon: Folder, desc: 'Stored documents & logs' },
        { id: 'settings', label: 'Control Center', icon: Settings, desc: 'Theme constants & keys' },
        { id: 'logs', label: 'Event Audits', icon: History, desc: 'Audit compliance histories' },
      ]
    }
  ];

  const navigateTo = (tabId: string) => {
    window.dispatchEvent(new CustomEvent('nav-tab', { detail: tabId }));
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop screen blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9998]"
          />
          <motion.div 
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className={cn(
              "fixed top-0 right-0 w-[450px] h-full z-[9999] shadow-2xl flex flex-col overflow-hidden transition-all duration-300",
              isLight 
                ? "bg-white/90 text-slate-800 border-l border-white/80 backdrop-blur-2xl" 
                : "bg-black/90 text-white border-l border-white/10 backdrop-blur-2xl"
            )}
          >
            {/* Header portion with White backlight tap-responsive properties & iOS elegance */}
            <div className={cn(
              "p-8 border-b relative overflow-hidden shrink-0",
              isLight ? "border-slate-200 bg-slate-50/50" : "border-white/5 bg-gradient-to-r from-red-500/10 to-transparent"
            )}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    isLight ? "bg-red-50 text-red-500 shadow-md shadow-red-500/5" : "bg-red-500/15 text-red-400"
                  )}>
                    <ShieldAlert size={22} className="stroke-[1.5]" />
                  </div>
                  <div>
                    {/* TODO(Daemon): Allow daemon to remote-lock or unlock ADMIN override over `ws://localhost:3389/control` */}
                    <h2 className="text-lg font-black italic tracking-tighter uppercase">Admin_Bypass_Core</h2>
                    <p className={cn(
                      "text-[9px] font-black tracking-[0.22em] uppercase leading-none",
                      isLight ? "text-red-600" : "text-red-400"
                    )}>SYS_ROOT_ACCESS</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {/* iOS Style light-dark switcher */}
                  <button 
                    onClick={toggleLocalTheme}
                    className={cn(
                      "p-2 rounded-xl transition-all active:scale-95 border active:shadow-[0_0_15px_rgba(255,255,255,0.8)]",
                      isLight 
                        ? "bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700" 
                        : "bg-white/5 hover:bg-white/10 border-white/10 text-white"
                    )}
                    title="Toggle iOS light/dark crystal glass"
                  >
                    {isLight ? <Moon size={16} className="stroke-[1.5]" /> : <Sun size={16} className="stroke-[1.5]" />}
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className={cn(
                      "p-2 rounded-xl transition-all hover:bg-black/5 active:scale-95",
                      isLight ? "text-slate-400 hover:text-slate-800" : "text-white/40 hover:text-white"
                    )}
                  >
                    <X size={20} className="stroke-[1.5]" />
                  </button>
                </div>
              </div>

              <p className={cn(
                "text-[11px] leading-relaxed font-mono italic",
                isLight ? "text-slate-500" : "text-white/40"
              )}>
                Advanced administrative mapper. Instantly skips introductory sequences, logins, and registers modules to preview layouts without delays.
              </p>
            </div>

            {/* Quick action shortcuts row */}
            <div className={cn(
              "p-6 border-b grid grid-cols-3 gap-3 shrink-0",
              isLight ? "bg-slate-50/30 border-slate-200" : "bg-white/5 border-white/5"
            )}>
              <button 
                onClick={() => fastForwardBypass('agents')}
                className={cn(
                  "p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 active:shadow-[0_0_20px_rgba(255,255,255,1)]",
                  isLight 
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm" 
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                )}
              >
                <Zap size={15} className="stroke-[1.5] text-amber-500" />
                <span className="text-[8px] font-black uppercase tracking-wider block">Bypass_Agent</span>
              </button>
              
              <button 
                onClick={() => fastForwardBypass('terminal')}
                className={cn(
                  "p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 active:shadow-[0_0_20px_rgba(255,255,255,1)]",
                  isLight 
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm" 
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                )}
              >
                <Terminal size={15} className="stroke-[1.5] text-blue-500" />
                <span className="text-[8px] font-black uppercase tracking-wider block">Direct Console</span>
              </button>

              <button 
                onClick={() => fastForwardBypass('clear')}
                className={cn(
                  "p-3 rounded-xl border text-center flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 active:shadow-[0_0_20px_rgba(255,255,255,1)]",
                  isLight 
                    ? "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 shadow-sm" 
                    : "bg-white/5 border-white/10 text-white/80 hover:bg-white/10"
                )}
              >
                <X size={15} className="stroke-[1.5] text-red-500" />
                <span className="text-[8px] font-black uppercase tracking-wider block">Purge Autopilot</span>
              </button>
            </div>

            {/* Modules List indexer separated by category */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
              {modulesGrouped.map((grp, gId) => (
                <div key={gId} className="space-y-2">
                  <h3 className={cn(
                    "text-[9px] font-black uppercase tracking-[0.25em] pl-2",
                    isLight ? "text-slate-400" : "text-white/20"
                  )}>
                    {grp.category}
                  </h3>
                  
                  <div className="space-y-1.5">
                    {grp.items.map(item => (
                      <button
                        key={item.id}
                        onClick={() => navigateTo(item.id)}
                        className={cn(
                          "w-full p-3 transition-all rounded-xl flex items-center justify-between border relative overflow-hidden group text-left active:scale-[0.98] active:shadow-[0_0_25px_rgba(255,255,255,0.73)] active:border-white focus:outline-none",
                          isLight 
                            ? "bg-white/40 border-slate-200/60 hover:bg-white hover:border-slate-300 text-slate-800" 
                            : "bg-white/[0.03] border-white/5 hover:bg-white/[0.08] hover:border-white/15 text-white"
                        )}
                      >
                        {/* Interactive backlight reflection */}
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                            isLight 
                              ? "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-primary" 
                              : "bg-white/5 text-white/40 group-hover:text-primary group-hover:bg-primary/10"
                          )}>
                            <item.icon size={16} className="stroke-[1.5]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider">{item.label}</h4>
                            <p className={cn("text-[10px] italic", isLight ? "text-slate-400" : "text-white/30")}>
                              {item.desc}
                            </p>
                          </div>
                        </div>

                        <span className={cn(
                          "text-[8px] font-mono",
                          isLight ? "text-slate-300 group-hover:text-slate-500" : "text-white/10 group-hover:text-white/40"
                        )}>
                          JUMP_TO
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer with compliance & state verification */}
            <div className={cn(
              "p-6 border-t shrink-0",
              isLight ? "bg-slate-50 border-slate-200" : "bg-black/60 border-white/10"
            )}>
              <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className={isLight ? "text-slate-400" : "text-white/40"}>Status: Bypass Connected</span>
                </div>
                <div className={isLight ? "text-slate-400" : "text-white/20"}>NYX_OS_V2</div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

