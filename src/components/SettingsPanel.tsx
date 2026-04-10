import React, { useState } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { Key, Save, Download, Upload, RefreshCw, ShieldCheck, Palette } from 'lucide-react';

export const SettingsPanel: React.FC = () => {
  const { credentials, updateCredential, addLog, theme, updateTheme } = useDashboard();
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  
  const [primaryColor, setPrimaryColor] = useState(theme.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.secondary);
  const [bgColor, setBgColor] = useState(theme.background);
  const [cardColor, setCardColor] = useState(theme.cardBg);

  const handleAddCredential = () => {
    if (newKey && newValue) {
      updateCredential(newKey, newValue);
      setNewKey('');
      setNewValue('');
      addLog('UPDATE_CREDENTIAL', `Added/Updated credential: ${newKey}`);
    }
  };

  const handleSaveTheme = () => {
    updateTheme({
      primary: primaryColor,
      secondary: secondaryColor,
      background: bgColor,
      cardBg: cardColor
    });
    addLog('UPDATE_THEME', 'Updated UI Theme Colors');
  };

  const exportConfig = () => {
    const state = localStorage.getItem('omnidash_state');
    if (!state) return;
    
    // Create MD format with embedded JSON
    const mdContent = `# OmniDash Configuration Backup
Generated on: ${new Date().toLocaleString()}

## Directory Index
- /widgets
- /assets
- /logs
- /settings

## Configuration Data
\`\`\`json
${state}
\`\`\`
`;

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `omnidash-backup-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    addLog('EXPORT_CONFIG', 'Exported configuration to MD file');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        // Extract JSON from MD block
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          localStorage.setItem('omnidash_state', jsonMatch[1]);
          addLog('IMPORT_CONFIG', 'Imported configuration from MD file');
          window.location.reload();
        } else {
          alert('Invalid backup file format. Could not find JSON data block.');
        }
      } catch (error) {
        console.error('Failed to parse config:', error);
        alert('Failed to import configuration.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 p-6">
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-card-border pb-2">
          <Palette size={18} className="text-neon-pink" />
          <h3 className="font-bold uppercase tracking-widest text-sm">UI Theme Customization</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest">Primary Color (Neon Lime)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-10 rounded bg-transparent border-none cursor-pointer"
              />
              <input 
                type="text" 
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 text-sm focus:border-neon-pink/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest">Secondary Color (Neon Blue)</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-10 rounded bg-transparent border-none cursor-pointer"
              />
              <input 
                type="text" 
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 text-sm focus:border-neon-pink/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest">Background Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-10 h-10 rounded bg-transparent border-none cursor-pointer"
              />
              <input 
                type="text" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 text-sm focus:border-neon-pink/50 transition-colors"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/40 uppercase tracking-widest">Card Background</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                className="w-10 h-10 rounded bg-transparent border-none cursor-pointer"
              />
              <input 
                type="text" 
                value={cardColor}
                onChange={(e) => setCardColor(e.target.value)}
                className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 text-sm focus:border-neon-pink/50 transition-colors"
              />
            </div>
          </div>
        </div>
        <button 
          onClick={handleSaveTheme}
          className="mt-4 flex items-center gap-2 bg-neon-pink text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-neon-pink/80 transition-colors"
        >
          <Save size={16} /> Apply Theme
        </button>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-card-border pb-2">
          <Key size={18} className="text-neon-lime" />
          <h3 className="font-bold uppercase tracking-widest text-sm">Service Credentials</h3>
        </div>
        <p className="text-xs text-white/40">Store your API keys and secrets securely. These are stored locally in your browser.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(credentials).map(([key, value]) => (
            <div key={key} className="glass-card p-3 flex items-center justify-between bg-white/5">
              <div>
                <div className="text-[10px] text-white/40 uppercase font-bold">{key}</div>
                <div className="text-sm font-mono">••••••••••••••••</div>
              </div>
              <button 
                onClick={() => updateCredential(key, '')}
                className="text-red-500 hover:text-red-400 text-xs"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <input 
            type="text" 
            placeholder="Service Name (e.g. GEMINI_API_KEY)"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 py-2 text-sm"
          />
          <input 
            type="password" 
            placeholder="Value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="flex-1 bg-white/5 border border-card-border rounded-lg px-3 py-2 text-sm"
          />
          <button 
            onClick={handleAddCredential}
            className="bg-neon-lime text-black font-bold px-4 py-2 rounded-lg hover:bg-neon-lime/80 transition-colors"
          >
            <Save size={18} />
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-card-border pb-2">
          <ShieldCheck size={18} className="text-neon-blue" />
          <h3 className="font-bold uppercase tracking-widest text-sm">Backups & Sync</h3>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={exportConfig}
            className="flex-1 flex items-center justify-center gap-2 p-4 glass-card hover:bg-white/5 transition-colors"
          >
            <Download size={20} />
            <div className="text-left">
              <div className="text-sm font-bold">Export Backup (MD)</div>
              <div className="text-[10px] text-white/40">Download full config as Markdown</div>
            </div>
          </button>
          <label className="flex-1 flex items-center justify-center gap-2 p-4 glass-card hover:bg-white/5 transition-colors cursor-pointer">
            <Upload size={20} />
            <div className="text-left">
              <div className="text-sm font-bold">Import Backup (MD)</div>
              <div className="text-[10px] text-white/40">Restore from Markdown file</div>
            </div>
            <input type="file" accept=".md" className="hidden" onChange={handleImport} />
          </label>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-card-border pb-2">
          <RefreshCw size={18} className="text-neon-pink" />
          <h3 className="font-bold uppercase tracking-widest text-sm">System Reset</h3>
        </div>
        <button 
          onClick={() => {
            if(confirm('Are you sure you want to clear all data? This cannot be undone.')) {
              localStorage.removeItem('omnidash_state');
              window.location.reload();
            }
          }}
          className="w-full p-3 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors text-sm font-bold"
        >
          Factory Reset Dashboard
        </button>
      </section>
    </div>
  );
};
