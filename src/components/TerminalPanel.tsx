import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ChevronRight, Play, Trash2 } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';

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
      <div className="flex items-center gap-2">
        <TerminalIcon size={24} className="text-neon-blue" />
        <h2 className="text-xl font-bold tracking-tight uppercase">System Terminal</h2>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 glass-card bg-black/80 font-mono text-sm p-6 overflow-hidden flex flex-col">
          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 custom-scrollbar mb-4">
            {history.map((line, i) => (
              <div key={i} className={line.startsWith('>') ? "text-neon-lime" : "text-white/80 whitespace-pre-wrap"}>
                {line}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-white/10 pt-4">
            <ChevronRight size={18} className="text-neon-lime" />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommand(input)}
              className="flex-1 bg-transparent outline-none border-none"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="w-80 flex flex-col gap-4">
          <div className="glass-card p-4 flex flex-col h-full">
            <h3 className="font-bold text-sm uppercase tracking-widest text-neon-lime mb-4">Command Shortcuts</h3>
            
            <form onSubmit={handleAddShortcut} className="space-y-2 mb-6">
              <input 
                type="text" 
                placeholder="Command (e.g. sync)"
                value={newShortcutCmd}
                onChange={e => setNewShortcutCmd(e.target.value)}
                className="w-full bg-white/5 border border-card-border rounded px-3 py-2 text-xs"
              />
              <select 
                value={newShortcutScriptId}
                onChange={e => setNewShortcutScriptId(e.target.value)}
                className="w-full bg-white/5 border border-card-border rounded px-3 py-2 text-xs"
              >
                <option value="">Select Script...</option>
                {files.filter(f => f.type === 'script').map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button 
                type="submit"
                disabled={!newShortcutCmd || !newShortcutScriptId}
                className="w-full bg-neon-lime text-black font-bold py-2 rounded text-xs disabled:opacity-50"
              >
                Add Shortcut
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
              {shortcuts.map(s => {
                const file = files.find(f => f.id === s.scriptId);
                return (
                  <div key={s.command} className="bg-white/5 p-2 rounded flex items-center justify-between group">
                    <div>
                      <div className="text-xs font-bold text-neon-lime">{s.command}</div>
                      <div className="text-[10px] text-white/40 truncate w-32">{file?.name || 'Unknown Script'}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleCommand(s.command)}
                        className="p-1 hover:text-neon-lime transition-colors"
                      >
                        <Play size={14} />
                      </button>
                      <button 
                        onClick={() => removeShortcut(s.command)}
                        className="p-1 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {shortcuts.length === 0 && (
                <div className="text-center text-white/30 text-xs mt-4">No shortcuts defined</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
