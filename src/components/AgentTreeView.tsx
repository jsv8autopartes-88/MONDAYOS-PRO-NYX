import React from 'react';
import { motion } from 'motion/react';
import { Network, Server, User, Zap, ChevronRight, Activity } from 'lucide-react';
import { RemoteAgent } from '../types';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';

export const AgentTreeView: React.FC = () => {
  const { agents } = useDashboard();

  return (
    <div className="space-y-4 p-4 overflow-y-auto max-h-[600px] custom-scrollbar">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neon-blue/20 flex items-center justify-center border border-neon-blue/30 shadow-[0_0_15px_rgba(30,144,255,0.2)]">
            <Network className="text-neon-blue" size={20} />
          </div>
          <div>
            <h3 className="text-[14px] font-black uppercase text-white tracking-widest">Nexo Prime Topology</h3>
            <p className="text-[10px] text-white/40 uppercase font-mono">Neural Node Hierarchy</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5">
          <Activity size={12} className="text-green-500 animate-pulse" />
          <span className="text-[10px] font-black text-white/60 uppercase">{agents.length} Online Nodes</span>
        </div>
      </div>

      <div className="relative pl-8 border-l border-white/5 space-y-6">
        {/* Master Hub Node */}
        <div className="absolute -left-[17px] top-0">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-black text-black">
            <Zap size={14} />
          </div>
        </div>
        <div className="mb-8">
          <h4 className="text-[11px] font-black uppercase text-primary tracking-widest mb-1">NYX_MASTER_HUB</h4>
          <p className="text-[9px] text-white/20 uppercase font-mono">Orchestrator Level 0</p>
        </div>

        {/* Dynamic Nodes */}
        {agents.map((agent, idx) => (
          <motion.div 
            key={agent.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="relative"
          >
            <div className="absolute -left-[33px] top-1/2 -translate-y-1/2 w-4 border-t border-white/5" />
            
            <div className="glass-card hover:border-primary/40 transition-all p-3 group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center border transition-all",
                    agent.status === 'online' ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-red-500/10 border-red-500/30 text-red-500"
                  )}>
                    <Server size={14} />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-black uppercase text-white group-hover:text-primary transition-colors">{agent.name}</h5>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] text-white/40 uppercase font-mono">ID: {agent.id.slice(0, 8)}</span>
                       <span className="w-1 h-1 rounded-full bg-white/10" />
                       <span className={cn(
                         "text-[8px] uppercase font-black",
                         agent.status === 'online' ? "text-green-500" : "text-red-500"
                       )}>{agent.status}</span>
                    </div>
                  </div>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-lg text-white/20 hover:text-white transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Sub-Agentes (Simulated Hierachy) */}
              {idx === 0 && (
                <div className="mt-4 ml-6 space-y-3 border-l border-white/5 pl-4 relative">
                  <div className="absolute left-0 top-0 w-2 h-2 -translate-x-1/2 rounded-full border border-white/10 bg-black" />
                  <div className="flex items-center gap-2 text-white/60">
                    <User size={12} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Watcher de Telegram (Sub-01)</span>
                    <span className="text-[8px] text-green-500 font-mono animate-pulse">ACTIVE</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <User size={12} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-tighter">Scraper de Precios (Sub-02)</span>
                    <span className="text-[8px] text-white/20 font-mono">IDLE</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {agents.length === 0 && (
          <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-2xl">
            <Server size={32} className="text-white/10 mb-2" />
            <p className="text-[10px] text-white/20 uppercase font-black tracking-widest text-center">
              No active nodes detected.<br/>Run installer script in setup.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
