import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Play, Trash2, Activity, Globe, Wifi } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AgentCommand } from '../types';

export const TerminalPanel: React.FC = () => {
  const { widgets, logs, isCarMode, toggleCarMode, addLog, shortcuts, addShortcut, removeShortcut, files, sendCommand, agents, user } = useDashboard();
  const [history, setHistory] = useState<string[]>(['OmniDash Terminal v1.1.0', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [connectedAgentId, setConnectedAgentId] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [newShortcutCmd, setNewShortcutCmd] = useState('');
  const [newShortcutScriptId, setNewShortcutScriptId] = useState('');
  const [editingShortcut, setEditingShortcut] = useState<string | null>(null);

  const modules = [
    { id: 'dashboard', label: 'Main', desc: 'System status' },
    { id: 'nodes', label: 'Nodes', desc: 'Agent management' },
    { id: 'missions', label: 'Tactical', desc: 'Mission control' },
    { id: 'scripts', label: 'Scripts', desc: 'Code repository' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  // Handle live logs
  useEffect(() => {
    if (isLiveMode && logs.length > 0) {
      const lastLog = logs[0];
      setHistory(prev => {
        // Avoid duplicate log entries if we just added them manually
        const lastEntry = prev[prev.length - 1];
        if (lastEntry && lastEntry.includes(lastLog.details)) return prev;
        
        return [...prev, `[LOG] ${lastLog.action}: ${lastLog.details}`].slice(-100);
      });
    }
  }, [logs, isLiveMode]);

  // Handle agent command results if connected
  useEffect(() => {
    if (!user || !connectedAgentId) return;

    const commandsColRef = collection(db, 'users', user.uid, 'agents', connectedAgentId, 'commands');
    const q = query(commandsColRef, orderBy('createdAt', 'desc'), limit(5));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'modified') {
          const cmd = change.doc.data() as AgentCommand;
          if (cmd.status === 'completed' || cmd.status === 'failed') {
            setHistory(prev => {
              const agent = agents.find(a => a.id === connectedAgentId);
              const status = cmd.status === 'completed' ? 'SUCCESS' : 'FAILED';
              const out = cmd.result || cmd.error || 'No output';
              return [...prev, `[NODE:${agent?.name}] ${cmd.cmd} -> ${status}`, `[OUT] ${out.substring(0, 500)}${out.length > 500 ? '...' : ''}`].slice(-100);
            });
          }
        }
      });
    });

    return () => unsubscribe();
  }, [user, connectedAgentId, agents]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, cmdHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIndex = historyIndex - 1;
        setHistoryIndex(nextIndex);
        setInput(cmdHistory[cmdHistory.length - 1 - nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const handleCommand = async (cmd: string) => {
    if (!cmd.trim()) return;
    setCmdHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);
    const newHistory = [...history, `> ${cmd}`];
    
    const parts = cmd.split(' ');
    const baseCmd = parts[0].toLowerCase();

    // Check shortcuts first
    const shortcut = shortcuts.find(s => s.command === cmd);
    if (shortcut) {
      const file = files.find(f => f.id === shortcut.scriptId);
      if (file && file.type === 'script') {
        try {
          const scriptContext = { addLog, agents, widgets, toggleCarMode, sendCommand };
          const fn = new Function('context', `
            with(context) {
              ${file.content}
            }
          `);
          const result = fn(scriptContext);
          newHistory.push(`[EXEC] Executed shortcut script: ${file.name}`);
          if (result) newHistory.push(`[OUT] ${String(result)}`);
          addLog('EXECUTE_SHORTCUT', `Executed shortcut: ${cmd}`);
        } catch (err: any) {
          newHistory.push(`[ERR] Script Error: ${err.message}`);
        }
      } else {
        newHistory.push(`[ERR] Shortcut script not found or invalid.`);
      }
      setHistory(newHistory);
      setInput('');
      return;
    }

    switch (baseCmd) {
      case 'help':
        newHistory.push(
          'AVAILABLE_COMMANDS:',
          '  help      - Show this manual',
          '  clear     - Wipe terminal history',
          '  status    - View system health & metrics',
          '  widgets   - List active dashboard components',
          '  logs      - Print recent subsystem logs',
          '  agents    - List all active neural nodes',
          '  live      - Toggle live log monitoring (ON/OFF)',
          '  connect   - Attach terminal to agent (ex: connect alpha)',
          '  disconnect- Detach from current agent',
          '  carmode   - Toggle minimalist UI (focus mode)',
          '  /agent    - Send remote command (ex: /agent alpha ls)'
        );
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'status':
        newHistory.push(
          `SYSTEM_HEALTH: NOMINAL`,
          `MEMORY_LOAD: ${(Math.random() * 20 + 10).toFixed(1)}GB / 64GB`,
          `CPU_USAGE: ${Math.floor(Math.random() * 15 + 5)}%`,
          `UPLINK: ${connectedAgentId ? agents.find(a => a.id === connectedAgentId)?.name?.toUpperCase() : 'CLOUD_ONLY'}`,
          `CONNECTED_AGENTS: ${agents.length}`,
          `LIVE_MONITOR: ${isLiveMode ? 'ACTIVE' : 'IDLE'}`
        );
        break;
      case 'live':
        setIsLiveMode(!isLiveMode);
        newHistory.push(`Live logs ${!isLiveMode ? 'ENABLED' : 'DISABLED'}.`);
        break;
      case 'connect':
        if (parts[1]) {
          const target = agents.find(a => a.id === parts[1] || a.name.toLowerCase() === parts[1].toLowerCase());
          if (target) {
            setConnectedAgentId(target.id);
            newHistory.push(`[OK] Attached to node: ${target.name} [${target.id.substring(0,6)}]`);
          } else {
            newHistory.push(`[ERR] Node "${parts[1]}" not found.`);
          }
        } else {
          newHistory.push('Usage: connect [agentName/id]');
        }
        break;
      case 'disconnect':
        setConnectedAgentId(null);
        newHistory.push('[OK] Detached from remote node. Local mode active.');
        break;
      case 'agents':
        if (agents.length === 0) {
          newHistory.push('No agents connected to core.');
        } else {
          newHistory.push(`NEURAL_NODES_ONLINE (${agents.length}):`, ...agents.map(a => `  - [${a.id.substring(0,6)}] ${a.name} (${a.status})`));
        }
        break;
      case 'widgets':
        newHistory.push(`SUBSYSTEM_WIDGETS:\n${widgets.map(w => `  ${w.isVisible ? '●' : '○'} [${w.type.toUpperCase()}] ${w.title}`).join('\n')}`);
        break;
      case 'logs':
        newHistory.push(`RECENT_LOGS:\n${logs.slice(0, 8).map(l => `  [${new Date(l.timestamp).toLocaleTimeString()}] ${l.action}: ${l.details}`).join('\n')}`);
        break;
      case 'carmode':
        toggleCarMode();
        newHistory.push(`CMD: Toggled Car Mode focus.`);
        break;
      case '/agent':
        if (parts.length >= 3) {
          const agentId = parts[1];
          const remoteCmd = parts.slice(2).join(' ');
          const target = agents.find(a => a.id === agentId || a.name.toLowerCase() === agentId.toLowerCase());
          if (target) {
            await sendCommand(target.id, remoteCmd);
            newHistory.push(`[UPLINK] Sent to ${target.name}: ${remoteCmd}`);
          } else {
            newHistory.push(`[ERROR] Agent [${agentId}] not found.`);
          }
        } else {
          newHistory.push('Usage: /agent [id/name] [command]');
        }
        break;
      default:
        // If connected to an agent, send command to agent by default?
        if (connectedAgentId) {
          await sendCommand(connectedAgentId, cmd);
          newHistory.push(`[REMOTE_DISPATCH] Sent to ${agents.find(a => a.id === connectedAgentId)?.name}: ${cmd}`);
        } else {
          newHistory.push(`[ERR] Unknown sequence: ${cmd}. Type 'help' for local commands.`);
        }
    }
    
    setHistory(newHistory);
    setInput('');
  };

  const handleAddShortcut = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShortcutCmd && newShortcutScriptId) {
      addShortcut(newShortcutCmd, newShortcutScriptId);
      setNewShortcutCmd('');
      setNewShortcutScriptId('');
      addLog('ADD_SHORTCUT', `Added terminal shortcut: ${newShortcutCmd}`);
    }
  };

  return (
    <div className="h-full flex flex-col p-8 max-w-7xl mx-auto gap-8 overflow-hidden bg-transparent">
      {/* Header */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(207,248,12,0.15)] backdrop-blur-xl">
            <TerminalIcon size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">System Terminal</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-bold">Neural_Link_V2 // SECURE_SHELL</p>
          </div>
        </div>
        <div className="flex gap-1.5 p-2 bg-white/5 rounded-full border border-white/5">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-pink/50 blur-[1px]" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50 blur-[1px]" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/50 blur-[1px]" />
        </div>
      </header>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 glass-card bg-black/90 font-mono text-xs p-6 overflow-hidden flex flex-col border-white/5 relative group">
          <div className="absolute top-4 right-6 flex items-center gap-4 z-10">
            {connectedAgentId && (
              <div className="flex items-center gap-2 bg-primary/10 border border-primary/30 px-3 py-1 rounded-full text-[9px] text-primary font-black animate-pulse">
                <Globe size={10} />
                ATTACHED: {agents.find(a => a.id === connectedAgentId)?.name.toUpperCase()}
              </div>
            )}
            <div className={cn(
              "flex items-center gap-2 border px-3 py-1 rounded-full text-[9px] font-black transition-all",
              isLiveMode ? "bg-neon-blue/10 border-neon-blue/30 text-neon-blue" : "bg-white/5 border-white/10 text-white/20"
            )}>
              <Activity size={10} className={isLiveMode ? "animate-bounce" : ""} />
              LIVE_FEED: {isLiveMode ? 'ON' : 'OFF'}
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar mb-4 pr-4">
            {history.map((line, i) => {
              const isCmd = line.startsWith('>');
              const isLog = line.startsWith('[LOG]');
              const isErr = line.startsWith('[ERR]');
              const isExec = line.startsWith('[EXEC]');
              const isOut = line.startsWith('[OUT]');
              const isNode = line.startsWith('[NODE');

              return (
                <div key={i} className={cn(
                  "flex gap-3 leading-relaxed",
                  isCmd ? "text-primary font-bold bg-primary/5 p-1 rounded -ml-1 border-l-2 border-primary" : "text-white/60"
                )}>
                  {!isCmd && (
                    <span className="text-white/10 shrink-0 text-[10px]">
                      {new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <span className={cn(
                    "flex-1",
                    isLog && "text-neon-blue/70 italic",
                    isErr && "text-neon-pink font-bold",
                    isExec && "text-yellow-400/80",
                    isOut && "text-green-400/60 font-mono pl-4 opacity-100",
                    isNode && "text-primary/80 font-bold border-l border-primary/20 pl-4"
                  )}>
                    {line}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 border-t border-white/5 pt-4 bg-white/[0.01] -mx-6 -mb-6 p-6">
            <ChevronRight size={18} className="text-primary animate-pulse" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onKeyUp={(e) => e.key === 'Enter' && handleCommand(input)}
              className="flex-1 bg-transparent outline-none border-none text-sm font-mono text-white placeholder:text-white/10"
              placeholder="ENTER_SEQUENCE_COMMAND..."
              autoFocus
            />
            <div className="flex gap-2">
              <span className="text-[10px] text-white/20 font-mono hidden sm:block">CMD_HISTORY [↑↓]</span>
              <button 
                onClick={() => handleCommand(input)}
                className="bg-primary text-black px-6 py-2 rounded-xl font-black text-[10px] tracking-widest uppercase hover:bg-white hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all active:scale-95"
              >
                Execute
              </button>
            </div>
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="w-80 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col h-full border-white/5 bg-black/40">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-3 bg-primary rounded-full" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-white/80">Command_Aliases</h3>
              </div>
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('nav-subtab', { detail: 'directory' }))}
                className="text-[8px] font-black text-primary hover:underline uppercase tracking-widest"
              >
                Repo_OS
              </button>
            </div>
            
            <form onSubmit={handleAddShortcut} className="space-y-4 mb-8 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="space-y-1.5">
                <label className="text-[9px] text-white/30 uppercase font-black tracking-widest pl-1">Alias_Token</label>
                <input 
                  type="text" 
                  placeholder="e.g. sync_all"
                  value={newShortcutCmd}
                  onChange={e => setNewShortcutCmd(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] text-white/30 uppercase font-black tracking-widest pl-1">Target_Executable</label>
                <select 
                  value={newShortcutScriptId}
                  onChange={e => setNewShortcutScriptId(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-primary/50 transition-colors appearance-none cursor-pointer font-mono"
                >
                  <option value="" className="bg-[#0a0a0c]">Select Script...</option>
                  {files.filter(f => f.type === 'script').map(f => (
                    <option key={f.id} value={f.id} className="bg-[#0a0a0c]">{f.name}</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit"
                disabled={!newShortcutCmd || !newShortcutScriptId}
                className="w-full bg-primary text-black font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] disabled:opacity-20 transition-all active:scale-95 shadow-[0_0_20px_rgba(207,248,12,0.2)]"
              >
                Map_Command
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {shortcuts.map(s => {
                const file = files.find(f => f.id === s.scriptId);
                const isActive = editingShortcut === s.command;
                return (
                  <div 
                    key={s.command} 
                    className={cn(
                      "group glass-card bg-white/[0.01] p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden",
                      isActive ? "border-primary/50 bg-primary/5" : "border-white/5 hover:border-primary/30"
                    )}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-black text-white tracking-tight flex items-center gap-2">
                          <span className="text-primary opacity-50">{'>'}</span>
                          {s.command.toUpperCase()}
                        </div>
                        <div className="text-[9px] text-white/30 truncate w-full uppercase font-mono mt-1 italic">
                          exec:: {file?.name || 'ERR_LINK_BROKEN'}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0 ml-4">
                        <button 
                          onClick={() => handleCommand(s.command)}
                          className="p-2.5 bg-white/5 hover:bg-primary text-white hover:text-black rounded-xl transition-all"
                          title="Run Sequence"
                        >
                          <Play size={12} fill="currentColor" />
                        </button>
                        <button 
                          onClick={() => removeShortcut(s.command)}
                          className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-xl transition-all"
                          title="Unmap Command"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {shortcuts.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl p-6 text-center opacity-40">
                  <Activity size={24} className="mb-3 text-white/20 animate-pulse" />
                  <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">System awaiting custom instruction sets.</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
               <div className="text-[9px] text-white/20 uppercase tracking-widest font-black">Link_Status: <span className="text-primary">Secured</span></div>
               <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
