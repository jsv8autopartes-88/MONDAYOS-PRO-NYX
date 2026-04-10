import React from 'react';
import { useDashboard } from '../store/DashboardContext';
import ReactMarkdown from 'react-markdown';
import { Edit3, Eye, Save } from 'lucide-react';

export const NotesPanel: React.FC = () => {
  const { notes, updateNotes, addLog } = useDashboard();
  const [isEditing, setIsEditing] = React.useState(false);

  const handleSave = () => {
    setIsEditing(false);
    addLog('UPDATE_NOTES', 'Updated quick notes');
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Edit3 className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">System Documentation</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Persistent Memory Storage</p>
          </div>
        </div>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-white/5"
        >
          {isEditing ? <><Save size={14} className="text-primary" /> Save</> : <><Edit3 size={14} className="text-primary" /> Edit</>}
        </button>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col border-white/5">
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            className="flex-1 w-full bg-black/40 p-8 outline-none font-mono text-sm leading-relaxed text-white/80 resize-none custom-scrollbar"
            placeholder="Write your notes here (Markdown supported)..."
          />
        ) : (
          <div className="flex-1 p-8 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar bg-black/20">
            {notes ? (
              <ReactMarkdown>{notes}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 italic">
                <Eye size={48} className="mb-4 opacity-5" />
                <p className="text-[10px] uppercase tracking-widest font-bold">No data found in sector</p>
              </div>
            )}
          </div>
        )}
        <div className="p-4 border-t border-white/5 bg-white/[0.02] flex justify-between items-center px-8">
          <div className="text-[9px] text-white/30 uppercase tracking-[0.2em]">
            Sector: MEM_CORE_01 // Size: {notes.length} bytes
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[9px] font-bold text-primary uppercase tracking-widest">Sync Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
