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
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-neon-blue/20 rounded-lg">
          <Globe className="text-neon-blue" size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight uppercase">Web Mirror & Links</h2>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Quick Access Bookmarks</p>
        </div>
      </div>

      <form onSubmit={handleAdd} className="glass-card p-4 mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">Title</label>
          <input 
            type="text" 
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            className="w-full bg-white/5 border border-card-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
            placeholder="e.g. My Server"
          />
        </div>
        <div className="flex-1">
          <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-1">URL</label>
          <input 
            type="text" 
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            className="w-full bg-white/5 border border-card-border rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-neon-blue/50 transition-colors"
            placeholder="e.g. example.com"
          />
        </div>
        <button 
          type="submit"
          className="bg-neon-blue text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-neon-blue/80 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Add
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map(link => (
          <div key={link.id} className="glass-card p-4 flex items-center justify-between group hover:border-neon-blue/50 transition-colors">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center shrink-0">
                <Globe size={16} className="text-white/60" />
              </div>
              <div className="truncate">
                <h4 className="font-bold text-sm truncate">{link.title}</h4>
                <p className="text-[10px] text-white/40 truncate">{link.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <a 
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-1.5 hover:bg-white/10 rounded text-neon-blue transition-colors"
              >
                <ExternalLink size={14} />
              </a>
              <button 
                onClick={() => handleDelete(link.id)}
                className="p-1.5 hover:bg-red-500/20 rounded text-red-500 transition-colors"
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
