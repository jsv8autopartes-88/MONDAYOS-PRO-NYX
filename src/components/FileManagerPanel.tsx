import React, { useState } from 'react';
import { Folder, FileText, Code, FileJson, Image as ImageIcon, Plus, Trash2, Save, Play } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-tomorrow.css';

export const FileManagerPanel: React.FC = () => {
  const { files, addFile, updateFile, deleteFile, addLog } = useDashboard();
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState<'script' | 'md' | 'json' | 'svg'>('script');

  const activeFile = files.find(f => f.id === activeFileId);

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
        const fn = new Function(activeFile.content);
        fn();
        addLog('RUN_SCRIPT', `Executed script: ${activeFile.name}`);
      } catch (err: any) {
        console.error("Script execution error:", err);
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 border-r border-card-border bg-card-bg/30 flex flex-col">
        <div className="p-4 border-b border-card-border">
          <div className="flex items-center gap-2 mb-4">
            <Folder size={20} className="text-neon-blue" />
            <h2 className="font-bold uppercase tracking-widest text-sm">Library</h2>
          </div>
          <form onSubmit={handleCreateFile} className="flex flex-col gap-2">
            <input 
              type="text" 
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="New file name..."
              className="bg-white/5 border border-card-border rounded px-2 py-1 text-xs"
            />
            <div className="flex gap-2">
              <select 
                value={newFileType} 
                onChange={e => setNewFileType(e.target.value as any)}
                className="bg-white/5 border border-card-border rounded px-2 py-1 text-xs flex-1"
              >
                <option value="script">Script (.js)</option>
                <option value="md">Markdown (.md)</option>
                <option value="json">JSON (.json)</option>
                <option value="svg">Vector (.svg)</option>
              </select>
              <button type="submit" className="bg-neon-blue text-black p-1 rounded hover:bg-neon-blue/80">
                <Plus size={16} />
              </button>
            </div>
          </form>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`flex items-center justify-between p-2 rounded cursor-pointer group ${activeFileId === file.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {getIconForType(file.type)}
                <span className="text-xs truncate">{file.name}</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); deleteFile(file.id); if(activeFileId === file.id) setActiveFileId(null); }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-400 p-1"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {files.length === 0 && (
            <div className="text-center text-white/30 text-xs mt-4">No files in library</div>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col bg-dashboard-bg/50">
        {activeFile ? (
          <>
            <div className="h-12 border-b border-card-border flex items-center justify-between px-4 bg-card-bg/50">
              <div className="flex items-center gap-2">
                {getIconForType(activeFile.type)}
                <span className="font-mono text-sm">{activeFile.name}</span>
              </div>
              <div className="flex gap-2">
                {activeFile.type === 'script' && (
                  <button 
                    onClick={handleRunScript}
                    className="flex items-center gap-1 px-3 py-1 bg-neon-lime/20 text-neon-lime rounded text-xs hover:bg-neon-lime/30 transition-colors"
                  >
                    <Play size={12} /> Run
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-auto font-mono text-sm p-4">
              <Editor
                value={activeFile.content}
                onValueChange={(code) => updateFile(activeFile.id, { content: code })}
                highlight={code => highlight(code, getLanguageForType(activeFile.type), activeFile.type === 'md' ? 'markdown' : 'javascript')}
                padding={10}
                className="min-h-full outline-none"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 14,
                }}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/20">
            <Folder size={48} className="mb-4 opacity-50" />
            <p>Select a file to edit or create a new one</p>
          </div>
        )}
      </div>
    </div>
  );
};
