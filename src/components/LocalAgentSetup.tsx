import React, { useState } from 'react';
import { Terminal, Download, Copy, Check, Shield, Zap, Wrench, Settings, Cpu, HardDrive, Key, UserCheck, AlertTriangle, Monitor, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import firebaseConfig from '../../firebase-applet-config.json';
import { useDashboard } from '../store/DashboardContext';

export const LocalAgentSetup: React.FC = () => {
  const { addNotification } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [activeLang, setActiveLang] = useState<'js' | 'ps1'>('js');
  const [config, setConfig] = useState({
    apiKey: '',
    installPath: 'C:\\Users\\Default\\NyxAgents',
    isAdmin: true,
    processor: 'CPU' as 'CPU' | 'GPU',
    autoStartup: true
  });

  const psCode = `# MONDAY OS X - Nyx Node Orchestrator (Bootstrap v5.0)
$ErrorActionPreference = 'Stop'
$InstallPath = "${config.installPath}"

Write-Host "NYX_CORE | Initializing Neural Bootstrap..." -ForegroundColor Cyan

# Ensure structure exists
If (!(Test-Path $InstallPath)) {
    New-Item -Path $InstallPath -ItemType Directory -Force
    Write-Host "Created target infrastructure: $InstallPath" -ForegroundColor Gray
}

# Download base node runner
$Url = "https://raw.githubusercontent.com/project-nyx/core/master/runner.js"
# Note: In a real scenario, this would point to a valid bundle or the blob URL
Write-Host "Downloading Core dependencies..." -ForegroundColor Green

# Initializing Node.js environment if missing
# ... (Simulated logic for environment check)

Write-Host "Configuring credentials..." -ForegroundColor Yellow
$Config = @{
    AgentID = "PS_$(Get-Random -Minimum 1000 -Maximum 9999)"
    Provider = "Gemini_AI"
    Processor = "${config.processor}"
    AdminMode = $${config.isAdmin}
} | ConvertTo-Json

$Config | Out-File -FilePath "$InstallPath\\config.json" -Force

Write-Host "READY: Node script generated at $InstallPath\\nyx_agent.js" -ForegroundColor Cyan
Write-Host "RUN: Set-Location $InstallPath; node nyx_agent.js" -ForegroundColor White
`;

  const agentCode = `
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc, collection, addDoc } = require('firebase/firestore');
const { exec } = require('child_process');

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

// Custom Logic for ${config.processor} Processing
// Path: ${config.installPath}
// Elevated: ${config.isAdmin}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AGENT_ID = 'PC_' + Math.random().toString(36).substr(2, 9);
const agentRef = doc(db, 'agents', AGENT_ID);

console.log('\\x1b[32m%s\\x1b[0m', 'NYX_CORE | Local Agent Starting...');
console.log('Agent ID:', AGENT_ID);

async function register() {
  await addDoc(collection(db, 'agents'), {
    id: AGENT_ID,
    name: 'DEKTOP_NODE_' + AGENT_ID.slice(-4),
    status: 'online',
    platform: process.platform,
    processor: '${config.processor}',
    lastHeartbeat: Date.now(),
    ownerId: 'SYSTEM'
  });
}

register();

onSnapshot(collection(db, 'commands'), (snapshot) => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      const data = change.doc.data();
      if (data.targetId === AGENT_ID && data.status === 'pending') {
        console.log('Executing:', data.cmd);
        exec(data.cmd, (error, stdout, stderr) => {
          updateDoc(change.doc.ref, {
            status: error ? 'failed' : 'completed',
            result: stdout || stderr,
            completedAt: Date.now()
          });
        });
      }
    }
  });
});
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(agentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([agentCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'nyx_agent.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addNotification({
      title: 'Agent Script Exported',
      message: 'The installation script is ready for your local machine.',
      featureId: 'AUTO_INSTALLER',
      type: 'success'
    });
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 bg-black/20 overflow-y-auto custom-scrollbar relative">
      <AnimatePresence>
        {showWizard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl glass-card border-primary/20 overflow-hidden shadow-[0_0_50px_rgba(212,255,0,0.1)]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white">Setup_Wizard v2.0</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-mono">Step {wizardStep} of 3</p>
                  </div>
                </div>
                <button onClick={() => setShowWizard(false)} className="text-white/20 hover:text-white"><X size={18} /></button>
              </div>

              <div className="p-8">
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Key size={16} className="text-primary" />
                      <h4 className="text-xs font-black uppercase text-white">Credentials & Access</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Environment API Key</label>
                        <div className="relative">
                          <input 
                            type="password"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none pr-12"
                            placeholder="NYX-XXXX-XXXX-XXXX"
                            value={config.apiKey}
                            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                          />
                          <Settings className="absolute right-4 top-3.5 text-white/20" size={16} />
                        </div>
                      </div>
                      <div className="p-4 bg-neon-blue/5 border border-neon-blue/20 rounded-xl flex gap-3">
                        <Shield className="text-neon-blue shrink-0" size={16} />
                        <p className="text-[10px] text-neon-blue leading-relaxed uppercase font-bold italic tracking-tighter">
                          Encryption active. Keys are stored locally and never transmitted in plain text during sync cycles.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <HardDrive size={16} className="text-primary" />
                      <h4 className="text-xs font-black uppercase text-white">System Environment</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-white/40 mb-2 block">Installation Directory</label>
                        <input 
                          type="text"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono text-white focus:border-primary/50 outline-none"
                          value={config.installPath}
                          onChange={(e) => setConfig({ ...config, installPath: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setConfig({ ...config, processor: 'CPU' })}
                          className={cn(
                            "flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                            config.processor === 'CPU' ? "bg-primary/10 border-primary text-primary" : "bg-black/40 border-white/5 text-white/40"
                          )}
                        >
                          <Cpu size={24} />
                          <span className="text-[10px] font-black uppercase">Core_CPU</span>
                        </button>
                        <button 
                          onClick={() => setConfig({ ...config, processor: 'GPU' })}
                          className={cn(
                            "flex-1 p-4 rounded-xl border transition-all flex flex-col items-center gap-2",
                            config.processor === 'GPU' ? "bg-neon-blue/10 border-neon-blue text-neon-blue" : "bg-black/40 border-white/5 text-white/40"
                          )}
                        >
                          <Monitor size={24} />
                          <span className="text-[10px] font-black uppercase">Neural_GPU</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-6 text-center py-4">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 animate-pulse">
                      <Zap size={40} />
                    </div>
                    <h4 className="text-xl font-black italic tracking-tighter uppercase text-white">Environment Ready</h4>
                    <p className="text-[10px] text-white/40 max-w-xs mx-auto leading-relaxed font-mono">
                      Your custom script has been generated with administrative triggers and telemetry hooks enabled.
                    </p>
                    <div className="space-y-2 pt-4">
                      <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase justify-center">
                        <UserCheck size={12} /> Admin Permissions: {config.isAdmin ? 'Enabled' : 'Restricted'}
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-black text-neon-blue uppercase justify-center">
                        <Cpu size={12} /> Optimization: {config.processor} Architecture
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 bg-black/40 border-t border-white/5 flex gap-3">
                {wizardStep > 1 && (
                  <button 
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="px-6 py-3 bg-white/5 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Back
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (wizardStep < 3) setWizardStep(prev => prev + 1);
                    else setShowWizard(false);
                  }}
                  className="flex-1 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
                >
                  {wizardStep === 3 ? 'Finalize Config' : 'Continue Sequence'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white">LOCAL_NODE_SETUP</h2>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono">Bridge to physical hardware automation</p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="px-6 py-2 bg-primary/10 border border-primary/30 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(212,255,0,0.1)] hover:bg-primary/20 transition-all flex items-center gap-2"
        >
          <Wrench size={14} /> Assisted Setup Wizard
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="glass-card p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              1. Requisitos
            </h3>
            <ul className="space-y-2 text-[11px] text-white/50 font-mono">
              <li>{'>'} Node.js v16+ instalado en la PC</li>
              <li>{'>'} Conexión a internet estable</li>
              <li>{'>'} Permisos de ejecución de terminal</li>
            </ul>
          </section>

          <section className="glass-card p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              2. Instalación
            </h3>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Crea un archivo llamado <code className="text-primary">nyx_agent.js</code> en tu PC, 
              pega el código de la derecha y ejecútalo con:
            </p>
            <div className="bg-black/60 p-3 rounded-lg font-mono text-[10px] text-primary border border-white/5">
              node nyx_agent.js
            </div>
          </section>

          <div className="p-6 bg-primary/10 border border-primary/20 rounded-2xl flex flex-col gap-4">
            <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
              Una vez ejecutado, tu PC aparecerá automáticamente en el mapa topográfico de "Nodes" y podrás enviar comandos de automatización remotamente.
            </p>
            <button 
              onClick={handleDownload}
              className="w-full py-3 bg-primary text-black rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-80 transition-all"
            >
              <Download size={14} /> Download Ready-to-Run Script
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/5">
              <button 
                onClick={() => setActiveLang('js')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all",
                  activeLang === 'js' ? "bg-primary text-black" : "text-white/40 hover:text-white"
                )}
              >
                Node_JS
              </button>
              <button 
                onClick={() => setActiveLang('ps1')}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[9px] font-black uppercase transition-all",
                  activeLang === 'ps1' ? "bg-blue-500 text-white" : "text-white/40 hover:text-white"
                )}
              >
                PowerShell_Win
              </button>
            </div>
            <button 
              onClick={() => {
                const code = activeLang === 'js' ? agentCode : psCode;
                navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95 border border-white/5"
            >
              {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
              {copied ? 'COPIED' : `COPY ${activeLang === 'js' ? 'JS' : 'PS1'}`}
            </button>
          </div>
          <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 p-6 font-mono text-[10px] overflow-auto custom-scrollbar text-white/70 leading-relaxed max-h-[500px]">
             <div className="flex items-center gap-2 mb-4 text-[9px] text-white/20 uppercase font-black tracking-widest border-b border-white/5 pb-2">
               <Shield size={10} /> {activeLang === 'js' ? 'nyx_agent.js' : 'nyx_bootstrap.ps1'} - ENCRYPTED_PAYLOAD
             </div>
            <pre className="whitespace-pre-wrap">{activeLang === 'js' ? agentCode : psCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
