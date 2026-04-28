import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  MousePointer2, 
  Keyboard, 
  Wifi, 
  Lock, 
  Maximize2, 
  Settings, 
  Power, 
  RefreshCw,
  Layout,
  Terminal,
  Activity,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';

export const RemoteDesk: React.FC = () => {
  const { addLog, agents } = useDashboard();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [latency, setLatency] = useState(24);
  const [bitrate, setBitrate] = useState(1200);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const connectToAgent = (agentId: string) => {
    setIsConnecting(true);
    addLog('REMOTE_BRIDGE', `Initializing P2P Tunnel for agent: ${agentId}`);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setStreamUrl('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=2000');
      addLog('REMOTE_SUCCESS', `Tunnel established. Latency: 24ms`);
    }, 2000);
  };

  const disconnect = () => {
    setIsConnected(false);
    setStreamUrl(null);
    addLog('REMOTE_DISCONNECT', 'Bridge terminated by operator.');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] p-6 gap-6 h-full overflow-hidden">
      {/* HEADER CONTROLS */}
      <div className="flex items-center justify-between glass-card p-4 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-neon-pink/10 rounded-xl">
            <Monitor size={24} className="text-neon-pink" />
          </div>
          <div>
            <h2 className="text-xl font-black italic text-white tracking-tighter uppercase leading-none">
              REMOTE_<span className="text-neon-pink">BRIDGE</span>_v2
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={cn("w-1.5 h-1.5 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-white/10")} />
              <span className="text-[9px] font-mono font-black text-white/40 uppercase tracking-widest">
                {isConnected ? 'ENCRYPTED_UPLINK_STABLE' : 'WAITING_FOR_HANDSHAKE'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isConnected && (
            <div className="hidden md:flex items-center gap-6 px-6 border-r border-white/10">
              <div className="text-center">
                <div className="text-[8px] text-white/30 uppercase font-black">LATENCY</div>
                <div className="text-xs font-mono text-cyan-400">{latency}ms</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-white/30 uppercase font-black">BITRATE</div>
                <div className="text-xs font-mono text-cyan-400">{bitrate}kbps</div>
              </div>
            </div>
          )}
          
          <select 
            onChange={(e) => setSelectedAgent(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-black text-white/60 outline-none hover:border-neon-pink/30 uppercase"
          >
            <option value="">SELECT_TARGET</option>
            {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {isConnected ? (
            <button onClick={disconnect} className="p-3 bg-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
              <Power size={18} />
            </button>
          ) : (
            <button 
              onClick={() => selectedAgent && connectToAgent(selectedAgent)}
              disabled={!selectedAgent || isConnecting}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-xs tracking-widest uppercase transition-all",
                isConnecting ? "bg-white/5 text-white/20" : "bg-neon-pink text-black hover:scale-105"
              )}
            >
              {isConnecting ? <RefreshCw size={14} className="animate-spin" /> : <Wifi size={14} />}
              Initialize_Tunnel
            </button>
          )}
        </div>
      </div>

      {/* MAIN BRIDGE DISPLAY */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* VIEWPORT */}
        <div className="flex-[3] relative glass-card border-white/5 bg-black overflow-hidden group">
          {!isConnected ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Monitor size={120} className="text-white/[0.03]" />
                {isConnecting && (
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    <Zap size={48} className="text-neon-pink" />
                  </motion.div>
                )}
              </div>
              <div className="text-center space-y-1">
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.3em]">No Active Video Feed</p>
                {isConnecting && <p className="text-[9px] font-black text-neon-pink uppercase animate-pulse">Running Handshake Protocol...</p>}
              </div>
            </div>
          ) : (
            <div className="w-full h-full relative cursor-none">
               <img 
                src={streamUrl || ''} 
                className="w-full h-full object-cover opacity-60 mix-blend-screen"
                alt="Remote Stream"
              />
              <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
              <div className="absolute inset-0 pointer-events-none border-[20px] border-black/50 border-double opacity-20" />
              
              {/* OSD (On-Screen Display) */}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                 <div className="bg-black/80 backdrop-blur-md px-3 py-1 flex items-center gap-2 rounded border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                    <span className="text-[10px] font-black text-white tracking-widest uppercase">REC</span>
                 </div>
                 <div className="bg-black/80 backdrop-blur-md px-3 py-1 flex items-center gap-2 rounded border border-white/10">
                    <ShieldAlert size={12} className="text-yellow-400" />
                    <span className="text-[10px] font-black text-white/60 tracking-widest uppercase">P2P_TUNNEL_SECURE</span>
                 </div>
              </div>

              {/* MOUSE EMULATOR */}
              <motion.div 
                className="absolute text-cyan-400 pointer-events-none filter drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                animate={{ x: [100, 300, 200, 500], y: [100, 200, 400, 300] }}
                transition={{ duration: 10, repeat: Infinity }}
              >
                <MousePointer2 size={24} />
              </motion.div>
            </div>
          )}

          {/* VIEWPORT CONTROLS */}
          <div className="absolute bottom-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
            <button className="p-3 bg-black/80 backdrop-blur-md text-white/60 rounded-xl border border-white/10 hover:text-white hover:border-primary transition-all">
              <Maximize2 size={18} />
            </button>
            <button className="p-3 bg-black/80 backdrop-blur-md text-white/60 rounded-xl border border-white/10 hover:text-white hover:border-primary transition-all">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* REMOTE MODULES BOARD */}
        <div className="flex-1 flex flex-col gap-6 w-96">
          {/* TERMINAL ACCESS */}
          <div className="flex-1 glass-card border-white/5 bg-white/[0.02] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase text-white tracking-widest">Target_Shell</span>
              </div>
              <Activity size={12} className="text-primary animate-pulse" />
            </div>
            <div className="flex-1 p-4 font-mono text-[10px] text-primary/60 space-y-1 overflow-y-auto">
              <div>&gt; Connecting to P2P-GATEWAY...</div>
              {isConnected ? (
                <>
                  <div className="text-white/40">Uplink established.</div>
                  <div className="text-white/40">Authenticated as: SYSTEM_ROOT</div>
                  <div className="text-cyan-400/60 mt-2">Checking target dependencies...</div>
                  <div className="text-cyan-400/60">VULKAN_READY: TRUE</div>
                  <div className="text-cyan-400/60">P2P_SYNC_READY: TRUE</div>
                  <div className="mt-4 flex gap-2">
                    <span className="text-primary uppercase font-black animate-pulse">_</span>
                  </div>
                </>
              ) : (
                <div className="text-white/20 italic animate-pulse">Listening for bridge signal...</div>
              )}
            </div>
            <div className="p-3 bg-black/40 border-t border-white/5">
              <input 
                placeholder="ROOT@BRIDGE:~$" 
                className="w-full bg-transparent border-none outline-none text-[10px] font-mono text-white/60"
                disabled={!isConnected}
              />
            </div>
          </div>

          {/* QUICK COMMAND GRID */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'perf', label: 'Monitor_Perf', icon: Activity },
              { id: 'fs', label: 'File_Explorer', icon: Layout },
              { id: 'kb', label: 'Virtual_KB', icon: Keyboard },
              { id: 'sys', label: 'Sys_Info', icon: Monitor }
            ].map((cmd) => (
              <button 
                key={cmd.id}
                disabled={!isConnected}
                className="flex items-center gap-3 p-4 glass-card border-white/5 hover:border-primary/30 transition-all text-white/40 hover:text-primary group"
              >
                <cmd.icon size={16} className="group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase tracking-widest">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
