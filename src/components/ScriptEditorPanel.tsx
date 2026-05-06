import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileCode, 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Upload, 
  ChevronRight,
  MoreVertical,
  Play,
  FileJson,
  FileText,
  FileSignature,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  Code2
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { NeuralEditor } from './NeuralEditor';
import { AppFile } from '../types';

export const ScriptEditorPanel: React.FC = () => {
  const { files, addFile, updateFile, deleteFile, addLog } = useDashboard();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'script' | 'json' | 'md'>('all');
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const filteredFiles = files.filter(f => {
    const matchesSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || f.type === filter;
    return matchesSearch && matchesFilter;
  });

  const selectedFile = files.find(f => f.id === selectedFileId);

  const handleCreateFile = () => {
    const name = `new_script_${Date.now().toString().slice(-4)}.js`;
    addFile({
      name,
      content: '// Neural_Control_Logic: Init\n\nmodule.exports = async (ctx) => {\n  console.log("Hello NYX_CORE");\n};',
      type: 'script'
    });
    addLog('SCRIPT_CREATED', `New script initialized: ${name}`);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const type = file.name.endsWith('.json') ? 'json' : file.name.endsWith('.md') ? 'md' : 'script';
      addFile({
        name: file.name,
        content,
        type
      });
      addLog('SCRIPT_IMPORT', `Imported external script: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleSave = (newCode: string) => {
    if (selectedFileId) {
      updateFile(selectedFileId, { content: newCode });
      addLog('SCRIPT_SAVE', `Saved changes to ${selectedFile?.name}`);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* File List */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-black/20">
        <div className="p-6 border-b border-white/5 bg-black/40">
           <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(212,255,0,0.5)]" />
                 <h2 className="text-sm font-black tracking-widest text-white uppercase italic">Neural_REPO</h2>
              </div>
              <button 
                onClick={handleCreateFile}
                className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-lg transition-all"
              >
                <Plus size={16} />
              </button>
           </div>
           
           <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
              <input 
                type="text" 
                placeholder="SEARCH_LOGIC..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-[10px] font-mono focus:border-primary/50 outline-none"
              />
           </div>

           <div className="flex gap-2">
              {(['all', 'script', 'json', 'md'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest transition-all",
                    filter === f ? "bg-white/10 text-primary border border-primary/20" : "text-white/20 hover:text-white"
                  )}
                >
                  {f === 'all' ? <Layers size={10} /> : f === 'script' ? <Code2 size={10} /> : <FileText size={10} />}
                </button>
              ))}
           </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {filteredFiles.map((file) => (
            <button
              key={file.id}
              onClick={() => setSelectedFileId(file.id)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl transition-all group",
                selectedFileId === file.id ? "bg-primary/10 border border-primary/20 shadow-[0_0_20px_rgba(212,255,0,0.05)]" : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                selectedFileId === file.id ? "bg-primary text-black" : "bg-white/5 text-white/30 group-hover:text-primary"
              )}>
                {file.type === 'script' ? <FileSignature size={16} /> : 
                 file.type === 'json' ? <FileJson size={16} /> : <FileText size={16} />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className={cn("text-[11px] font-black uppercase tracking-tight truncate", selectedFileId === file.id ? "text-white" : "text-white/40")}>
                  {file.name}
                </div>
                <div className="text-[8px] text-white/20 font-mono italic flex items-center gap-2">
                   {file.type.toUpperCase()} <span className="opacity-30">|</span> {file.content.length} bytes
                </div>
              </div>
              <ChevronRight size={10} className={cn("transition-transform", selectedFileId === file.id ? "rotate-90 text-primary" : "text-white/10")} />
            </button>
          ))}

          {filteredFiles.length === 0 && (
            <div className="h-40 flex flex-col items-center justify-center text-center opacity-20">
               <Layers size={32} className="mb-4" />
               <p className="text-[9px] uppercase tracking-widest px-8">Repository is void. Initialize new logic core.</p>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/5 bg-black/40">
           <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/5 border border-dashed border-white/10 rounded-xl text-[9px] font-black uppercase text-white/30 hover:bg-white/10 hover:text-white transition-all cursor-pointer">
              <Upload size={14} /> Import_External
              <input type="file" className="hidden" onChange={handleImport} accept=".js,.ts,.json,.md,.txt" />
           </label>
        </div>
      </div>

      {/* Main View */}
      <div className="flex-1 flex flex-col bg-black/10">
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div 
              key={selectedFile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col h-full"
            >
              <div className="p-10 flex flex-col gap-8">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <FileCode className="text-primary" size={28} />
                       <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">{selectedFile.name}</h1>
                    </div>
                    <p className="text-sm text-white/40 leading-relaxed font-mono italic max-w-2xl">
                      NYX_SYSTEM_ENCRYPTION: SH256_ACTIVE // REPOSITORY_PATH: /neural_core/v4/{selectedFile.name}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      onClick={() => deleteFile(selectedFile.id)}
                      className="p-3 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button 
                      onClick={() => setIsEditorOpen(true)}
                      className="px-8 py-3 bg-primary text-black rounded-xl font-black text-xs uppercase hover:scale-105 transition-all shadow-[0_0_30px_rgba(212,255,0,0.2)] flex items-center gap-3 active:scale-95"
                    >
                      <Play size={16} fill="currentColor" /> Open_IDE
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                     { label: 'Security_Status', value: 'Verified', icon: Sparkles, color: 'text-primary' },
                     { label: 'Uplink_Node', value: 'Edge_Server_ST-4', icon: RefreshCw, color: 'text-neon-blue' },
                     { label: 'Execution_Priority', value: 'Tier_1_Critical', icon: Layers, color: 'text-neon-pink' }
                   ].map((stat, i) => (
                     <div key={i} className="glass-card p-6 border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                           <stat.icon size={14} className={stat.color} />
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/30">{stat.label}</span>
                        </div>
                        <div className="text-sm font-black text-white italic tracking-widest uppercase">{stat.value}</div>
                     </div>
                   ))}
                </div>

                <div className="flex-1 glass-card p-8 border-white/5 bg-black/40 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                  <div className="flex items-center justify-between mb-4">
                     <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Logic_Blueprint_PREVIEW</span>
                     <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                     </div>
                  </div>
                  <pre className="text-xs font-mono text-white/20 bg-black/40 p-6 rounded-2xl border border-white/5 max-h-96 overflow-hidden select-none">
                     {selectedFile.content}
                  </pre>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end justify-center pb-12 pointer-events-none">
                     <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Neural_Link_Encrypted</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
               <FileCode size={64} className="mb-6 text-white/20 animate-pulse" />
               <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Initialize_Logic_Link</h2>
               <p className="text-xs uppercase tracking-[0.3em] max-w-sm leading-relaxed">Select a logic core from the repository to initiate neural synchronization.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isEditorOpen && selectedFile && (
          <NeuralEditor 
            fileName={selectedFile.name}
            initialCode={selectedFile.content}
            initialLanguage={selectedFile.type === 'script' ? 'javascript' : selectedFile.type}
            onSave={handleSave}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
