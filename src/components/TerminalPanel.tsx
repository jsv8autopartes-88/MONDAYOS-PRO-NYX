import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Play, Trash2 } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';

export const TerminalPanel: React.FC = () => {
  const { widgets, logs, isCarMode, toggleCarMode, addLog, shortcuts, addShortcut, removeShortcut, files } = useDashboard();
  const [history, setHistory] = useState<string[]>(['OmniDash Terminal v1.0.0', 'Type "help" for a list of commands.']);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const [newShortcutCmd, setNewShortcutCmd] = useState('');
  const [newShortcutScriptId, setNewShortcutScriptId] = useState('');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;
    const newHistory = [...history, `> ${cmd}`];
    
    // Check shortcuts first
    const shortcut = shortcuts.find(s => s.command === cmd);
    if (shortcut) {
      const file = files.find(f => f.id === shortcut.scriptId);
      if (file && file.type === 'script') {
        try {
          const fn = new Function(file.content);
          const result = fn();
          newHistory.push(`Executed shortcut script: ${file.name}`);
          if (result) newHistory.push(String(result));
          addLog('EXECUTE_SHORTCUT', `Executed shortcut: ${cmd}`);
        } catch (err: any) {
          newHistory.push(`Script Error: ${err.message}`);
        }
      } else {
        newHistory.push(`Shortcut script not found or invalid.`);
      }
      setHistory(newHistory);
      setInput('');
      return;
    }

    switch (cmd.toLowerCase()) {
      case 'help':
        newHistory.push('Available commands: help, clear, status, widgets, logs, carmode');
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'status':
        newHistory.push(`System: Operational`, `Memory: 4.2GB / 16GB`, `CPU: 24%`, `Network: Connected`, `Active Widgets: ${widgets.length}`, `Car Mode: ${isCarMode ? 'ON' : 'OFF'}`);
        break;
      case 'widgets':
        newHistory.push(`Widgets:\n${widgets.map(w => `- [${w.type}] ${w.title} (${w.isVisible ? 'visible' : 'hidden'})`).join('\n')}`);
        break;
      case 'logs':
        newHistory.push(`Recent Logs:\n${logs.slice(0, 5).map(l => `- ${l.action}: ${l.details}`).join('\n')}`);
        break;
      case 'carmode':
        toggleCarMode();
        newHistory.push(`Car Mode toggled to ${!isCarMode ? 'ON' : 'OFF'}`);
        addLog('TERMINAL_COMMAND', 'Toggled Car Mode via terminal');
        break;
      default:
        newHistory.push(`Command not found: ${cmd}`);
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
    <div className="h-full flex flex-col p-6 max-w-6xl mx-auto gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <TerminalIcon size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">System Terminal</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">MONDAYOS-PRO-NYX // ROOT_ACCESS</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-neon-pink" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 glass-card bg-black/80 font-mono text-xs p-6 overflow-hidden flex flex-col border-white/5">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar mb-4">
            {history.map((line, i) => (
              <div key={i} className={cn(
                "group",
                line.startsWith('>') ? "text-primary font-bold" : "text-white/80 whitespace-pre-wrap"
              )}>
                {!line.startsWith('>') && <span className="text-primary opacity-30 mr-2">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>}
                {line}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 pt-4 bg-white/[0.02] -mx-6 -mb-6 p-6">
            <ChevronRight size={18} className="text-primary" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommand(input)}
              className="flex-1 bg-transparent outline-none border-none text-sm font-mono text-white"
              placeholder="ENTER_COMMAND..."
              autoFocus
            />
            <button 
              onClick={() => handleCommand(input)}
              className="bg-primary text-black px-6 py-1.5 rounded font-black text-[10px] tracking-widest uppercase hover:bg-primary/80 transition-all active:scale-95 shadow-[0_0_15px_rgba(207,248,12,0.3)]"
            >
              RUN
            </button>
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="w-80 flex flex-col gap-4">
          <div className="glass-card p-6 flex flex-col h-full border-white/5">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-primary mb-6">Command Shortcuts</h3>
            
            <form onSubmit={handleAddShortcut} className="space-y-3 mb-8">
              <input 
                type="text" 
                placeholder="Command (e.g. sync)"
                value={newShortcutCmd}
                onChange={e => setNewShortcutCmd(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
              />
              <select 
                value={newShortcutScriptId}
                onChange={e => setNewShortcutScriptId(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors appearance-none"
              >
                <option value="" className="bg-black">Select Script...</option>
                {files.filter(f => f.type === 'script').map(f => (
                  <option key={f.id} value={f.id} className="bg-black">{f.name}</option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={!newShortcutCmd || !newShortcutScriptId}
                className="w-full bg-white/5 border border-white/10 hover:border-primary/50 text-white font-bold py-3 rounded-xl text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all active:scale-95"
              >
                Add Shortcut
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-2">
              {shortcuts.map(s => {
                const file = files.find(f => f.id === s.scriptId);
                return (
                  <div key={s.command} className="glass-card bg-white/[0.02] p-4 rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-primary">{s.command}</div>
                      <div className="text-[10px] text-white/40 truncate w-32 uppercase tracking-tighter">{file?.name || 'Unknown Script'}</div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCommand(s.command)}
                        className="p-1.5 hover:bg-primary/20 text-primary rounded-lg transition-all"
                      >
                        <Play size={14} />
                      </button>
                      <button 
                        onClick={() => removeShortcut(s.command)}
                        className="p-1.5 hover:bg-neon-pink/20 text-neon-pink rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {shortcuts.length === 0 && (
                <div className="text-center text-white/20 text-[10px] font-bold uppercase tracking-widest mt-8">No shortcuts defined</div>
              )}
            </div>
            <div className="mt-6 pt-6 border-t border-white/5">
               <div className="text-[9px] text-on-surface-variant uppercase tracking-widest">System Health: Nominal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
