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
    <div className="h-full flex flex-col p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold uppercase tracking-widest text-sm text-neon-lime">Quick Notes & Documentation</h3>
        <button 
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold"
        >
          {isEditing ? <><Save size={14} /> Save</> : <><Edit3 size={14} /> Edit</>}
        </button>
      </div>

      <div className="flex-1 glass-card overflow-hidden flex flex-col">
        {isEditing ? (
          <textarea
            value={notes}
            onChange={(e) => updateNotes(e.target.value)}
            className="flex-1 w-full bg-transparent p-6 outline-none font-mono text-sm resize-none custom-scrollbar"
            placeholder="Write your notes here (Markdown supported)..."
          />
        ) : (
          <div className="flex-1 p-6 overflow-y-auto prose prose-invert prose-sm max-w-none custom-scrollbar">
            {notes ? (
              <ReactMarkdown>{notes}</ReactMarkdown>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20 italic">
                <Eye size={48} className="mb-4 opacity-10" />
                <p>No notes yet. Click edit to start writing.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
