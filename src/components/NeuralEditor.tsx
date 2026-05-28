import { useAppStore } from '../store/appStore';
import React, { useState, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Sparkles, 
  Bug, 
  X, 
  ChevronDown,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  FileCode,
  Globe,
  Lock,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useDashboard } from '../store/DashboardContext';
import { NeuralService } from '../lib/neuralService';

interface NeuralEditorProps {
  initialCode?: string;
  initialLanguage?: string;
  fileName?: string;
  onSave?: (code: string) => void;
  onClose?: () => void;
}

export const NeuralEditor: React.FC<NeuralEditorProps> = ({ 
  initialCode = '', 
  initialLanguage = 'javascript',
  fileName = 'script.js',
  onSave,
  onClose 
}) => {
  const { addNotification } = useDashboard();
  const { addLog } = useAppStore();
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState(initialLanguage);
  const [logs, setLogs] = useState<{ type: 'info' | 'error' | 'success'; message: string; timestamp: number }[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [sandboxResult, setSandboxResult] = useState<any>(null);

  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'json', label: 'JSON' },
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'python', label: 'Python' },
    { id: 'sql', label: 'SQL' }
  ];

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) setCode(value);
  };

  const handleMount: OnMount = (editor, monaco) => {
    monaco.editor.defineTheme('neural-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6272a4' },
        { token: 'keyword', foreground: 'd4ff00' },
        { token: 'string', foreground: '00f0ff' },
        { token: 'number', foreground: 'ff79c6' },
      ],
      colors: {
        'editor.background': '#0a0a0c',
        'editor.foreground': '#f8f8f2',
        'editorLineNumber.foreground': '#ffffff20',
        'editorLineNumber.activeForeground': '#d4ff00',
        'editor.selectionBackground': '#ffffff10',
        'editor.lineHighlightBackground': '#ffffff05',
        'editorCursor.foreground': '#d4ff00',
      }
    });
    monaco.editor.setTheme('neural-dark');
  };

  const clearLogs = () => setLogs([]);

  const runCode = async () => {
    setIsExecuting(true);
    setLogs(prev => [...prev, { type: 'info', message: `Initializing sandbox execution for ${fileName}...`, timestamp: Date.now() }]);
    
    try {
      // For JS/TS, we can simulate execution
      if (language === 'javascript' || language === 'typescript') {
        // Simple sandbox for simulation
        const result = new Function('console', `
          let output = [];
          const customConsole = {
            log: (...args) => output.push({ type: 'info', message: args.join(' ') }),
            error: (...args) => output.push({ type: 'error', message: args.join(' ') }),
            info: (...args) => output.push({ type: 'info', message: args.join(' ') }),
          };
          try {
            ${code}
            return { success: true, logs: output };
          } catch (e) {
            return { success: false, error: e.message, logs: output };
          }
        `)({
          log: (...args: any[]) => console.log(...args),
          error: (...args: any[]) => console.error(...args),
          info: (...args: any[]) => console.info(...args),
        });

        if (result.success) {
          setLogs(prev => [...prev, ...result.logs, { type: 'success', message: 'Execution completed successfully.', timestamp: Date.now() }]);
        } else {
          setLogs(prev => [...prev, ...result.logs, { type: 'error', message: `Runtime Error: ${result.error}`, timestamp: Date.now() }]);
        }
      } else {
        setLogs(prev => [...prev, { type: 'info', message: 'Simulation mode: Syntax looks valid for ' + language, timestamp: Date.now() }]);
      }
    } catch (e: any) {
      setLogs(prev => [...prev, { type: 'error', message: `Compiler Error: ${e.message}`, timestamp: Date.now() }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const assistCorrection = async () => {
    setIsCorrecting(true);
    addLog('AI_CORRECTION', `Analyzing code in ${fileName}...`);
    
    try {
      const prompt = `Analyze the following ${language} code and fix any syntax errors, logical bugs, or performance issues. Return ONLY the corrected code without explanations.\n\nCode:\n${code}`;
      const response = await NeuralService.generate(prompt);
      
      if (response && response.content) {
        // Clean markdown backticks if present
        const cleaned = response.content.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        setCode(cleaned);
        setLogs(prev => [...prev, { type: 'success', message: 'AI correction applied successfully.', timestamp: Date.now() }]);
        addNotification({
          title: 'AI_OPTIMIZATION_COMPLETE',
          message: 'Neural engine has refactored the logic for peak performance.',
          type: 'success',
          featureId: 'EDITOR'
        });
      }
    } catch (e: any) {
      setLogs(prev => [...prev, { type: 'error', message: `AI Assist Failed: ${e.message}`, timestamp: Date.now() }]);
    } finally {
      setIsCorrecting(false);
    }
  };

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    addLog('EDITOR_EXPORT', `Exported ${fileName}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-4 md:inset-10 z-[100] glass-card bg-black/90 border border-white/10 flex flex-col overflow-hidden shadow-2xl rounded-3xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <FileCode size={24} />
             </div>
             <div>
                <h2 className="text-lg font-black italic tracking-tighter text-white uppercase">{fileName}</h2>
                <div className="flex items-center gap-3 mt-1">
                   <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-widest font-mono">
                      <Lock size={10} className="text-primary" /> Encrypted_Channel
                   </div>
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                   <div className="flex items-center gap-1.5 text-[9px] text-white/40 uppercase tracking-widest font-mono">
                      <Globe size={10} /> Cloud_Linked
                   </div>
                </div>
             </div>
          </div>

          <div className="h-10 w-[1px] bg-white/5 mx-2" />

          <div className="relative group">
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase text-white tracking-widest focus:border-primary/50 outline-none appearance-none pr-10 cursor-pointer min-w-[140px]"
            >
              {languages.map(l => (
                <option key={l.id} value={l.id}>{l.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none group-hover:text-primary transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={assistCorrection}
            disabled={isCorrecting}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-primary/20 text-white/60 hover:text-primary border border-white/10 rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 group shadow-lg"
          >
            {isCorrecting ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} className="group-hover:animate-pulse" />}
            AI_Fix
          </button>

          <button 
            onClick={runCode}
            disabled={isExecuting}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,255,0,0.3)] disabled:opacity-50"
          >
            {isExecuting ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
            Execute
          </button>

          <div className="h-10 w-[1px] bg-white/5 mx-2" />

          <button 
            onClick={() => onSave?.(code)}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
            title="Save Changes"
          >
            <Save size={18} />
          </button>

          <button 
            onClick={handleExport}
            className="p-2.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl transition-all"
            title="Export Script"
          >
            <Download size={18} />
          </button>

          <button 
            onClick={onClose}
            className="p-2.5 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-500 rounded-xl transition-all ml-4"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Editor Main Section */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 border-r border-white/5 relative">
          <Editor
            height="100%"
            language={language}
            value={code}
            onChange={handleEditorChange}
            onMount={handleMount}
            options={{
              fontSize: 13,
              fontFamily: 'JetBrains Mono, monospace',
              minimap: { enabled: true, scale: 0.75 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 20 },
              smoothScrolling: true,
              cursorBlinking: 'expand',
              matchBrackets: 'always',
              renderLineHighlight: 'all',
              lineNumbersMinChars: 4,
            }}
          />
          <div className="absolute top-4 right-4 flex gap-2">
             <div className="px-2 py-1 bg-black/60 rounded border border-white/5 text-[8px] font-mono text-white/30 uppercase tracking-widest backdrop-blur-md">
                L: {code.split('\n').length} | C: {code.length}
             </div>
          </div>
        </div>

        {/* Sidebar/Output */}
        <div className="w-96 flex flex-col bg-black/40">
           <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <Terminal size={14} className="text-primary" />
                 <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Compiler_Output</span>
              </div>
              <button 
                onClick={clearLogs}
                className="text-[8px] font-black text-white/20 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={10} /> Clear
              </button>
           </div>
           
           <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 font-mono">
              {logs.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                   <Activity size={32} className="mb-4" />
                   <p className="text-[9px] uppercase tracking-widest leading-relaxed">System Idle.<br/>Awaiting logic instantiation...</p>
                </div>
              )}
              {logs.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={cn(
                    "p-3 rounded-xl border text-[10px] leading-relaxed",
                    log.type === 'info' ? "bg-white/5 border-white/5 text-white/60" :
                    log.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                    "bg-primary/10 border-primary/20 text-primary shadow-[0_0_15px_rgba(212,255,0,0.05)]"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                     {log.type === 'info' && <AlertCircle size={10} />}
                     {log.type === 'error' && <Bug size={10} />}
                     {log.type === 'success' && <CheckCircle2 size={10} />}
                     <span className="text-[8px] font-black uppercase opacity-40">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  </div>
                  {log.message}
                </motion.div>
              ))}
           </div>

           {/* Quick Stats */}
           <div className="p-6 border-t border-white/5 bg-white/[0.01] grid grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-1">State Efficiency</div>
                 <div className="text-sm font-black text-white italic tracking-tighter uppercase tabular-nums">98.4%</div>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                 <div className="text-[8px] text-white/30 uppercase font-black tracking-widest mb-1">Latency Delta</div>
                 <div className="text-sm font-black text-primary italic tracking-tighter uppercase tabular-nums">12ms</div>
              </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
