import React, { useState } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { Key, Save, Download, Upload, RefreshCw, ShieldCheck, Palette, Cpu, Monitor, Zap, FileJson } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import firebaseConfig from '../../firebase-applet-config.json';

export const SettingsPanel: React.FC = () => {
  const { credentials, updateCredential, addLog, theme, updateTheme, user } = useDashboard();
  const [newKey, setNewKey] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
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

  const generateLocalPackage = async () => {
    if (!user) return;
    setIsDeploying(true);
    addLog('DEPLOY_LOCAL', 'Generating local Windows deployment package');

    try {
      const zip = new JSZip();
      const folder = zip.folder("NYX_AGENT_HUB");

      // 1. Config File
      const localConfig = {
        firebase: firebaseConfig,
        userId: user.uid,
        agentId: `LOCAL_HOST_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        timestamp: new Date().toISOString()
      };
      folder?.file("nyx-config.json", JSON.stringify(localConfig, null, 2));

      // 2. Launcher / Installer (.bat)
      const batScript = `@echo off
title NYX OS - EXPONENTIAL AGENT CORE
color 0B
echo ===================================================
echo   NYX OS - EXPONENTIAL LOCAL HUB v5.0
echo   UNIFIED ARCHITECTURE: CHIEF EXECUTIVE + VISION
echo ===================================================
echo.
echo [1/4] VERIFYING SYSTEM ENVIRONMENT...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is required. Download from https://nodejs.org/
    pause
    exit /b
)

echo [2/4] INITIALIZING MODULAR KERNEL...
if not exist node_modules (
    echo [STATUS] First run detected. Syncing core dependencies...
    call npm install firebase @google/genai screenshot-desktop
)

echo [3/4] ESTABLISHING QUANTUM CLOUD LINK...
echo [AUTH] Node Identity: ${localConfig.agentId}
echo [LINK] User Context: ${user.uid}
echo.
echo ===================================================
echo   NYX AGENT IS LIVE // MONITORING 24/7
echo ===================================================
node nyx-agent.js
pause
`;
      folder?.file("NYX_OS_LAUNCHER.bat", batScript);

      // 3. Agent Script (Node.js)
      const agentJs = `
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc, collection, setDoc } = require('firebase/firestore');
const { exec } = require('child_process');
const os = require('os');
const config = require('./nyx-config.json');

console.log("Starting Nyx Exponential Core: " + config.agentId);

const app = initializeApp(config.firebase);
const db = getFirestore(app);

const agentRef = doc(db, "users", config.userId, "agents", config.agentId);

// Modular Skill Map
const skills = {
  system: async (args) => {
    return { 
      platform: os.platform(), 
      arch: os.arch(), 
      cpus: os.cpus().length,
      uptime: os.uptime()
    };
  },
  vision: async () => {
    try {
      const screenshot = require('screenshot-desktop');
      const img = await screenshot({ format: 'png' });
      return { type: 'image', data: img.toString('base64'), status: 'captured' };
    } catch (e) {
      return { error: 'Vision module failed: ' + e.message };
    }
  },
  exec: async (args) => {
    return new Promise((resolve) => {
      exec(args[0], (err, stdout, stderr) => {
        resolve(stdout || stderr || (err ? err.message : 'Exited with success.'));
      });
    });
  }
};

async function syncStatus() {
  const info = {
    cpu: Math.round(os.loadavg()[0] * 10 / os.cpus().length),
    ram: Math.round((os.totalmem() - os.freemem()) / (1024 * 1024 * 1024) * 10) / 10,
    hostname: os.hostname(),
    os: os.type()
  };

  try {
    await updateDoc(agentRef, {
      status: "online",
      lastHeartbeat: Date.now(),
      platform: os.type() + " " + os.release(),
      systemInfo: info
    });
  } catch (e) {
    await setDoc(agentRef, {
      id: config.agentId,
      name: "Exponential_Host_" + os.hostname(),
      status: "online",
      platform: os.type(),
      lastHeartbeat: Date.now(),
      ownerId: config.userId,
      systemInfo: info
    });
  }
}

// Initial Sync
syncStatus();
setInterval(syncStatus, 30000);

// Global Command Processor
console.log("[-] READY: Orchestration Channel Active");
onSnapshot(collection(db, "users", config.userId, "agents", config.agentId, "commands"), (snap) => {
  snap.docs.forEach(async (d) => {
    const data = d.data();
    if (data.status === 'pending') {
      console.log(\`[CMD] Received: \$\{data.cmd\}\`);
      await updateDoc(d.ref, { status: 'executing' });

      let result;
      try {
        if (data.cmd.startsWith('module:')) {
          const [_, mod, ...args] = data.cmd.split(':');
          if (skills[mod]) {
            result = JSON.stringify(await skills[mod](args || data.args), null, 2);
          } else {
            result = "Error: Module [" + mod + "] not found.";
          }
        } else {
          // Default fallback to shell exec for backward compatibility
          result = await skills.exec([data.cmd]);
        }
        
        await updateDoc(d.ref, { 
          status: 'completed', 
          result,
          completedAt: Date.now()
        });
      } catch (err) {
        await updateDoc(d.ref, { status: 'failed', result: err.message });
      }
    }
  });
});
`;
      folder?.file("nyx-agent.js", agentJs);

      // 4. README
      const readme = `NYX OS - LOCAL DEPLOYMENT HUB
==============================

INSTRUCTIONS:
1. Extract this folder to your Desktop.
2. Install Node.js if you don't have it (https://nodejs.org).
3. Double-click 'NYX_OS_LAUNCHER.bat'.
4. Go to your dashboard 'Nodes' tab and you will see 'Windows Desktop Host' online.

SECURITY:
This package contains your unique Cloud Security Token.
Do not share this folder with anyone.
`;
      folder?.file("README.txt", readme);

      // 5. Build and Save
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `NYX_LOCAL_HUB_${new Date().toISOString().split('T')[0]}.zip`);
      
      addLog('DEPLOY_COMPLETE', 'Local Hub ZIP generated successfully');
    } catch (error) {
      console.error("Failed to generate zip:", error);
      alert("Deployment failed to generate. Check console.");
    } finally {
      setIsDeploying(false);
    }
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
          <Monitor size={18} className="text-primary" />
          <h3 className="font-bold uppercase tracking-widest text-sm">Local Hub Deployment</h3>
        </div>
        <p className="text-xs text-white/40">
          Download a pre-configured Windows installer to link this dashboard directly to your local machine. 
          Enables remote execution of scripts, local app control, and system monitoring.
        </p>
        <button 
          onClick={generateLocalPackage}
          disabled={isDeploying || !user}
          className="w-full flex items-center justify-center gap-3 p-6 glass-card bg-primary/5 border-primary/20 hover:bg-primary/10 transition-all group overflow-hidden relative"
        >
          {isDeploying ? (
            <RefreshCw size={24} className="animate-spin text-primary" />
          ) : (
            <Zap size={24} className="text-primary group-hover:scale-125 transition-transform" />
          )}
          <div className="text-left relative z-10">
            <div className="text-sm font-black uppercase tracking-widest text-primary">Download Local Setup (.ZIP)</div>
            <div className="text-[10px] text-white/40 font-bold">INCLUDES PRE-CONFIGURED NYX_AGENT + INSTALLER.BAT</div>
          </div>
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Download size={80} />
          </div>
        </button>
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
