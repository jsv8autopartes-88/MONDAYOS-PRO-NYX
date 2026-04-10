import React, { useState } from 'react';
import { Globe, Plus, ExternalLink, Trash2 } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export const LinksPanel: React.FC = () => {
  const { addLog } = useDashboard();
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('omnidash_links');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'GitHub', url: 'https://github.com' },
      { id: '2', title: 'Vite Docs', url: 'https://vitejs.dev' }
    ];
  });
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');

  const saveLinks = (newLinks: LinkItem[]) => {
    setLinks(newLinks);
    localStorage.setItem('omnidash_links', JSON.stringify(newLinks));
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newUrl) return;
    
    let formattedUrl = newUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    const newLink = { id: Math.random().toString(36).substr(2, 9), title: newTitle, url: formattedUrl };
    saveLinks([...links, newLink]);
    setNewTitle('');
    setNewUrl('');
    addLog('ADD_LINK', `Added web link: ${newTitle}`);
  };

  const handleDelete = (id: string) => {
    saveLinks(links.filter(l => l.id !== id));
    addLog('DELETE_LINK', `Deleted web link`);
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Globe className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">Web Mirror & Links</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Quick Access Bookmarks</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Sync</span>
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        </div>
      </div>

      <form onSubmit={handleAdd} className="glass-card p-6 flex flex-wrap md:flex-nowrap gap-6 items-end border-white/5 bg-white/[0.02]">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-white/40 mb-2">Title</label>
          <input 
            type="text" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="e.g. My Server"
          />
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-white/40 mb-2">URL</label>
          <input 
            type="text" 
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
            placeholder="e.g. example.com"
          />
        </div>
        <button 
          type="submit"
          className="bg-primary text-black px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary/80 transition-all active:scale-95 shadow-[0_0_15px_rgba(207,248,12,0.3)]"
        >
          Add Link
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {links.map(link => (
          <div key={link.id} className="glass-card p-6 flex items-center justify-between group hover:neon-glow hover:border-primary/30 transition-all duration-500 border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-4 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <Globe size={18} className="text-white/40 group-hover:text-primary transition-colors" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-sm truncate uppercase tracking-tight">{link.title}</h4>
                <p className="text-[10px] text-white/30 truncate font-mono">{link.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 hover:bg-white/5 rounded-lg text-primary transition-all"
              >
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => handleDelete(link.id)}
                className="p-2 hover:bg-white/5 rounded-lg text-neon-pink transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
