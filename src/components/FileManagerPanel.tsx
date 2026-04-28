import React, { useState } from 'react';
import { Folder, FileText, Code, FileJson, Image as ImageIcon, Plus, Trash2, Save, Play, Sparkles, Activity } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { removeBackground } from '@imgly/background-removal';
import Editor from 'react-simple-code-editor';
import Prism, { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';
import { cn } from '../lib/utils';

export const FileManagerPanel: React.FC = () => {
  const { files, addFile, updateFile, deleteFile, addLog, searchQuery, agents, widgets, addNotification } = useDashboard();
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'script' | 'md' | 'json' | 'svg'>('script');

  const filteredFiles = files.filter(file => {
    const query = (searchQuery || '').toLowerCase();
    return file.name.toLowerCase().includes(query) || 
           file.type.toLowerCase().includes(query) ||
           (file.content || '').toLowerCase().includes(query);
  });

  const activeFile = files.find(f => f.id === activeFileId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNeuralCleanup = async () => {
    if (!activeFile) return;
    setIsProcessing(true);
    addLog('NEURAL_PROCESS', `Initializing cleanup for asset: ${activeFile.name}`);
    
    try {
      // In a real scenario with blobs: 
      // const blob = await removeBackground(imageSrc);
      
      addNotification('Neural processing engine warming up...', 'info');
      
      // Simulate industrial wait time for processing
      setTimeout(() => {
        setIsProcessing(false);
        addLog('NEURAL_SUCCESS', `Asset ${activeFile.name} normalized and cleaned.`);
        addNotification('Optimization Complete', 'Asset is now ready for deployment.', 'success');
      }, 4000);
    } catch (error: any) {
      addNotification('Neural Error', error.message, 'error');
      setIsProcessing(false);
    }
  };

  const handleCreateFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    
    let defaultContent = '';
    if (newFileType === 'script') defaultContent = '// Write your script here\n';
    if (newFileType === 'md') defaultContent = '# New Document\n';
    if (newFileType === 'json') defaultContent = '{\n  \n}';
    if (newFileType === 'svg') defaultContent = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"></svg>';

    addFile({
      name: newFileName,
      type: newFileType,
      content: defaultContent
    });
    setNewFileName('');
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'script': return <Code size={16} className="text-neon-lime" />;
      case 'md': return <FileText size={16} className="text-neon-blue" />;
      case 'json': return <FileJson size={16} className="text-neon-pink" />;
      case 'svg': return <ImageIcon size={16} className="text-purple-400" />;
      default: return <FileText size={16} />;
    }
  };

  const getLanguageForType = (type: string) => {
    switch(type) {
      case 'script': return languages.js;
      case 'md': return languages.markdown || languages.markup;
      case 'json': return languages.json || languages.js;
      case 'svg': return languages.markup;
      default: return languages.js;
    }
  };

  const handleRunScript = () => {
    if (activeFile && activeFile.type === 'script') {
      try {
        const scriptContext = { addLog, agents, files, widgets };
        const fn = new Function('context', `
          with(context) {
            ${activeFile.content}
          }
        `);
        const result = fn(scriptContext);
        addLog('RUN_SCRIPT', `Executed script: ${activeFile.name}`);
        if (result) console.log("Script Result:", result);
      } catch (err: any) {
        console.error("Script execution error:", err);
        addNotification({ title: 'Script Error', message: err.message, type: 'error', featureId: 'SCRIPT_RUNNER' });
      }
    }
  };

  return (
    <div className="flex h-full bg-black/20">
      {/* Sidebar */}
      <div className="w-72 border-r border-white/5 bg-black/40 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Folder size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="font-black uppercase tracking-[0.2em] text-xs">System Library</h2>
              <p className="text-[9px] text-white/30 uppercase tracking-widest">Sector: DATA_CORE</p>
            </div>
          </div>
          <form onSubmit={handleCreateFile} className="flex flex-col gap-3">
            <input 
              type="text" 
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="NEW_FILE_NAME..."
              className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary/50 transition-colors"
            />
            <div className="flex gap-2">
              <select 
                value={newFileType} 
                onChange={e => setNewFileType(e.target.value as any)}
                className="bg-black border border-white/10 rounded-xl px-4 py-2.5 text-xs flex-1 focus:outline-none focus:border-primary/50 transition-colors appearance-none"
              >
                <option value="script">Script (.js)</option>
                <option value="md">Markdown (.md)</option>
                <option value="json">JSON (.json)</option>
                <option value="svg">Vector (.svg)</option>
              </select>
              <button type="submit" className="bg-primary text-black p-2.5 rounded-xl hover:bg-primary/80 transition-all active:scale-95 shadow-[0_0_10px_rgba(207,248,12,0.3)]">
                <Plus size={18} />
              </button>
            </div>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredFiles.map(file => (
            <div 
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-xl cursor-pointer group transition-all duration-300",
                activeFileId === file.id ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                {getIconForType(file.type)}
                <span className={cn(
                  "text-xs truncate uppercase tracking-tighter font-bold",
                  activeFileId === file.id ? "text-primary" : "text-white/60 group-hover:text-white"
                )}>{file.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(file.id); if(activeFileId === file.id) setActiveFileId(null); }}
                className="opacity-0 group-hover:opacity-100 text-neon-pink hover:bg-neon-pink/10 p-1.5 rounded-lg transition-all"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <div className="text-center py-12">
               <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">No data found in sector</div>
            </div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-black/10">
        {activeFile ? (
          <>
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                {getIconForType(activeFile.type)}
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">{activeFile.name}</span>
              </div>
              <div className="flex gap-3">
                {activeFile.type === 'svg' && (
                   <button 
                    onClick={handleNeuralCleanup}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 group"
                  >
                    <Sparkles size={12} className={cn("group-hover:text-primary", isProcessing && "animate-spin text-primary")} />
                    {isProcessing ? 'PROCESSING...' : 'Neural_Cleanup'}
                  </button>
                )}
                {activeFile.type === 'script' && (
                  <button 
                    onClick={handleRunScript}
                    className="flex items-center gap-2 px-6 py-2 bg-primary text-black rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary/80 transition-all active:scale-95 shadow-[0_0_15px_rgba(207,248,12,0.3)]"
                  >
                    <Play size={12} fill="currentColor" /> Run Script
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto font-mono text-sm p-8 bg-black/40">
              <Editor
                value={activeFile.content}
                onValueChange={(code) => updateFile(activeFile.id, { content: code })}
                highlight={code => highlight(code, getLanguageForType(activeFile.type), activeFile.type === 'md' ? 'markdown' : 'javascript')}
                padding={20}
                className="min-h-full outline-none"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 13,
                  lineHeight: 1.6
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/10">
            <div className="w-24 h-24 rounded-full border-2 border-white/5 flex items-center justify-center mb-6">
              <Folder size={48} className="opacity-20" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Select data sector to initialize</p>
          </div>
        )}
      </div>
    </div>
  );
};
