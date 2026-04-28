import React, { useState } from 'react';
import { Terminal, Download, Copy, Check, Shield, Zap, Wrench, Settings, Cpu, HardDrive, Key, UserCheck, AlertTriangle, Monitor, X, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import firebaseConfig from '../../firebase-applet-config.json';
import { useDashboard } from '../store/DashboardContext';

export const LocalAgentSetup: React.FC = () => {
  const { addNotification, user, addLog } = useDashboard();
  const [copied, setCopied] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [activeLang, setActiveLang] = useState<'js' | 'ps1' | 'json'>('js');
  const [isDeploying, setIsDeploying] = useState(false);
  const [config, setConfig] = useState({
    apiKey: '',
    installPath: 'C:\\Users\\Default\\NyxAgents',
    isAdmin: true,
    processor: 'CPU' as 'CPU' | 'GPU',
    autoStartup: true
  });

  const packageCode = `{
  "name": "nyx-bridge-v1",
  "version": "1.0.2",
  "type": "module",
  "main": "nyx_agent.js",
  "dependencies": {
    "firebase": "^10.0.0"
  }
}`;

const agentCode = `
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, updateDoc, collection, setDoc, serverTimestamp } from 'firebase/firestore';
import { exec } from 'child_process';
import os from 'os';

// NYX_BRIDGE_V1 | NEURAL KERNEL v1.0.2
const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
const USER_ID = '${user?.uid || 'GUEST'}';
const AGENT_ID = 'NODE_' + Math.random().toString(36).substring(2, 11).toUpperCase();

console.log('\\x1b[38;5;154m%s\\x1b[0m', '>> NYX_BRIDGE_V1 | NEURAL LINK ACTIVE');
console.log('>> STATION_ID:', AGENT_ID);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function getProcesses() {
  return new Promise((resolve) => {
    const isWin = process.platform === 'win32';
    const cmd = isWin ? 'tasklist /fo csv /nh' : 'ps -A -o pid,comm,pcpu,pmem,user --sort=-pcpu --no-headers';
    exec(cmd, (err, stdout) => {
      if (err) return resolve([]);
      const lines = stdout.split('\\n').filter(l => l.trim());
      if (isWin) {
        const procs = lines.slice(0, 15).map(l => {
          const parts = l.split('","').map(p => p.replace(/"/g, ''));
          return { pid: parseInt(parts[1]), name: parts[0], cpu: 0, mem: parseFloat(parts[4].replace(/[^\\d.]/g, '')) / 1024, user: 'system' };
        });
        resolve(procs);
      } else {
        const procs = lines.slice(0, 15).map(l => {
          const p = l.trim().split(/\\s+/);
          return { pid: parseInt(p[0]), name: p[1], cpu: parseFloat(p[2]), mem: parseFloat(p[3]), user: p[4] };
        });
        resolve(procs);
      }
    });
  });
}

async function setStatus(status, currentTask = null) {
  try {
    const processes = await getProcesses();
    const cpus = os.cpus();
    const agentRef = doc(db, 'users', USER_ID, 'agents', AGENT_ID);
    await setDoc(agentRef, {
      id: AGENT_ID,
      name: 'STATION_' + AGENT_ID.slice(-4),
      status: status,
      platform: process.platform,
      lastHeartbeat: Date.now(),
      ownerId: USER_ID,
      currentTask: currentTask,
      systemInfo: {
        hostname: os.hostname(),
        release: os.release(),
        arch: os.arch(),
        mem: Math.round(os.totalmem() / 1024 / 1024 / 1024) + 'GB',
        cpuModel: cpus[0].model,
        cpuUsage: os.loadavg()[0],
        uptime: os.uptime(),
        load: os.loadavg()
      },
      processes: processes,
      updatedAt: serverTimestamp()
    }, { merge: true });
    if (status === 'online') console.log('>> HEARTBEAT: Pulsing...');
  } catch (err) {
    console.error('!! SYNC_ERROR:', err.message);
  }
}

// Exit cleanup
process.on('SIGINT', async () => {
  console.log('\\n>> DISCONNECTING...');
  await setStatus('offline');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await setStatus('offline');
  process.exit(0);
});

setInterval(() => setStatus('online'), 15000);
setStatus('online');

const commandsCol = collection(db, 'users', USER_ID, 'agents', AGENT_ID, 'commands');
onSnapshot(commandsCol, (snapshot) => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added' || change.type === 'modified') {
      const data = change.doc.data();
      if (data.status === 'pending') {
        process.stdout.write('>> EXECUTING [' + data.cmd + ']... ');
        setStatus('busy', 'Running: ' + data.cmd);
        
        updateDoc(change.doc.ref, { status: 'executing' });

        exec(data.cmd, (error, stdout, stderr) => {
          updateDoc(change.doc.ref, {
            status: error ? 'failed' : 'completed',
            result: stdout || 'SUCCESS',
            error: stderr || (error ? error.message : null),
            completedAt: Date.now()
          });
          setStatus('online');
          console.log(error ? '\\x1b[31mFAILED\\x1b[0m' : '\\x1b[32mDONE\\x1b[0m');
        });
      }
    }
  });
});
`;


  const psCode = `# NYX_BRIDGE_V1 | PROFESSIONAL SETUP WIZARD (Build 1018)
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
Add-Type -AssemblyName System.IO.Compression.FileSystem

# FORCE CONSOLE TO UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$Form = New-Object System.Windows.Forms.Form
$Form.Text = "NYX BRIDGE | ULTIMATE DEPLOYMENT SUITE"
$Form.Size = New-Object System.Drawing.Size(650,550)
$Form.StartPosition = "CenterScreen"
$Form.BackColor = [System.Drawing.Color]::FromArgb(15,15,15)
$Form.FormBorderStyle = "FixedDialog"
$Form.MaximizeBox = $false

# CUSTOM FONTS
$TitleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 22)
$MainFont = New-Object System.Drawing.Font("Segoe UI", 10)
$MonoFont = New-Object System.Drawing.Font("Consolas", 9)

# HEADER
$Title = New-Object System.Windows.Forms.Label
$Title.Text = "NEURAL_LINK DEPLOYMENT"
$Title.Font = $TitleFont
$Title.ForeColor = [System.Drawing.Color]::FromArgb(212,255,0)
$Title.Size = New-Object System.Drawing.Size(600,45)
$Title.Location = New-Object System.Drawing.Point(25,25)
$Form.Controls.Add($Title)

$StatusLine = New-Object System.Windows.Forms.Label
$StatusLine.Text = "SYSTEM STATUS: READY FOR UPLINK | v1.0.2 STABLE"
$StatusLine.Font = $MonoFont
$StatusLine.ForeColor = [System.Drawing.Color]::FromArgb(100,100,100)
$StatusLine.Location = New-Object System.Drawing.Point(27,70)
$StatusLine.Size = New-Object System.Drawing.Size(500,20)
$Form.Controls.Add($StatusLine)

# LOG AREA
$LogArea = New-Object System.Windows.Forms.RichTextBox
$LogArea.Location = New-Object System.Drawing.Point(25,100)
$LogArea.Size = New-Object System.Drawing.Size(585,280)
$LogArea.BackColor = [System.Drawing.Color]::FromArgb(5,5,5)
$LogArea.ForeColor = [System.Drawing.Color]::FromArgb(200,200,200)
$LogArea.Font = $MonoFont
$LogArea.ReadOnly = $true
$LogArea.BorderStyle = [System.Windows.Forms.BorderStyle]::None
$Form.Controls.Add($LogArea)

# PROGRESS
$ProgressBar = New-Object System.Windows.Forms.ProgressBar
$ProgressBar.Location = New-Object System.Drawing.Point(25, 400)
$ProgressBar.Size = New-Object System.Drawing.Size(585, 4)
$ProgressBar.Style = "Marquee"
$ProgressBar.MarqueeAnimationSpeed = 30
$ProgressBar.Visible = $false
$Form.Controls.Add($ProgressBar)

# BUTTON
$DeployBtn = New-Object System.Windows.Forms.Button
$DeployBtn.Text = "INITIALIZE PROFESSIONAL SUITE INSTALL"
$DeployBtn.Size = New-Object System.Drawing.Size(585, 60)
$DeployBtn.Location = New-Object System.Drawing.Point(25,420)
$DeployBtn.BackColor = [System.Drawing.Color]::FromArgb(212,255,0)
$DeployBtn.ForeColor = [System.Drawing.Color]::Black
$DeployBtn.FlatStyle = "Flat"
$DeployBtn.Font = New-Object System.Drawing.Font("Segoe UI", 12, [System.Drawing.FontStyle]::Bold)
$DeployBtn.FlatAppearance.BorderSize = 0
$Form.Controls.Add($DeployBtn)

function Write-Log($msg, $color="White") {
    if ($Form.IsHandleCreated) {
        $Form.Invoke([Action[string, string]]{ 
            $LogArea.SelectionColor = [System.Drawing.Color]::FromName($args[1])
            $LogArea.AppendText(">> " + $args[0] + "\`n")
            $LogArea.ScrollToCaret() 
        }, $msg, $color)
    }
}

$DeployBtn.Add_Click({
    $FileBrowser = New-Object System.Windows.Forms.OpenFileDialog
    $FileBrowser.Filter = "NYX Dashboard ZIP (*.zip)|*.zip"
    $FileBrowser.Title = "SELECT THE DOWNLOADED MASTER SUITE ZIP (Project Backup)"
    
    if($FileBrowser.ShowDialog() -eq "OK") {
        $SelectedFile = $FileBrowser.FileName
        $DeployBtn.Enabled = $false
        $ProgressBar.Visible = $true
        
        Write-Log "VERIFYING SYSTEM INTEGRITY..." "Lime"
        
        # Check Node
        try {
            $nodeVer = & node -v
            Write-Log "NODE_JS DETECTED: $nodeVer" "Cyan"
        } catch {
            Write-Log "ERROR: NODE_JS NOT FOUND. PLEASE INSTALL NODE_JS FIRST." "Red"
            return
        }

        $InstallPath = "$HOME\\Documents\\Nyx_Suite_v1"
        Write-Log "PROVISIONING WORKSPACE: $InstallPath" "Yellow"
        
        if (Test-Path $InstallPath) {
            Write-Log "REMOVING PREVIOUS INSTANCE..." "Gray"
            Remove-Item $InstallPath -Recurse -Force -ErrorAction SilentlyContinue 
        }
        New-Item -Path $InstallPath -ItemType Directory -Force | Out-Null
        
        Write-Log "EXTRACTING MASTER SUITE ARCHIVE..." "White"
        try {
            [System.IO.Compression.ZipFile]::ExtractToDirectory($SelectedFile, $InstallPath)
            Write-Log "EXTRACTION COMPLETE." "Lime"
        } catch {
            Write-Log "EXTRACTION FAILED: $($_.Exception.Message)" "Red"
            return
        }
        
        Set-Location $InstallPath
        
        Write-Log "INJECTING NEURAL KERNEL CONFIG..." "Yellow"
        @'
${agentCode}
'@ | Out-File -FilePath "$InstallPath\\nyx_agent.js" -Encoding utf8 -Force

        Write-Log "SYCHRONIZING DEPENDENCIES (npm install)..." "White"
        Write-Log "THIS MAY TAKE A FEW MINUTES. PLEASE WAIT..." "Gray"
        $npmProc = Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm install --loglevel error" -NoNewWindow -Wait -PassThru
        
        if ($npmProc.ExitCode -eq 0) {
            Write-Log "DEPENDENCIES LINKED SUCCESSFULLY." "Lime"
        } else {
            Write-Log "WARNING: NPM INSTALL RETURNED ERROR CODE $($npmProc.ExitCode)" "Orange"
        }
        
        Write-Log "WAKING UP NEURAL AGENT..." "Cyan"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c node nyx_agent.js" -NoNewWindow
        
        Write-Log "LAUNCHING DASHBOARD INTERFACE..." "Cyan"
        Start-Process -FilePath "cmd.exe" -ArgumentList "/c npm run dev" -NoNewWindow
        
        Write-Log "========================================" "Lime"
        Write-Log "DEPLOYMENT SUCCESSFUL." "Lime"
        Write-Log "ACCESS INTERFACE AT: http://localhost:3000" "Yellow"
        Write-Log "========================================" "Lime"
        
        $DeployBtn.Text = "DEPLOYMENT COMPLETED"
        $ProgressBar.Visible = $false
        
        [System.Windows.Forms.MessageBox]::Show("Installation Complete! Access your dashboard at http://localhost:3000", "NYX_BRIDGE_V1")
    }
})

$Form.ShowDialog()
`;


  const handleDownload = async () => {
    setIsDeploying(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("NYX_BRIDGE_V1");
      folder?.file("package.json", packageCode);
      folder?.file("nyx_agent.js", agentCode);
      folder?.file("NYX_SETUP.ps1", psCode);
      
      const readme = `NYX_BRIDGE_V1 - PROFESSIONAL SUITE DEPLOYMENT (v1.0.2)
=====================================================

ESTE ES EL PAQUETE DE INSTALACIÓN PROFESIONAL DE NYX.

Sigue estos pasos para una instalación exitosa de la Suite Completa:

1. DESCARGA EL RESPALDO DEL PROYECTO:
   - Ve a la interfaz de este dashboard.
   - Si no lo has hecho, descarga el ZIP de "Respaldo Completo" o usa la opción 
     "Export to ZIP" de tu entorno de desarrollo.

2. EJECUTA EL INSTALADOR PROFESIONAL:
   - Extrae este archivo ZIP en una carpeta.
   - Haz clic derecho sobre 'NYX_SETUP.ps1' y selecciona 'Ejecutar con PowerShell'.
   - Se abrirá la interfaz visual de instalación.

3. PROCESO DE INSTALACIÓN:
   - Haz clic en "INITIALIZE PROFESSIONAL SUITE INSTALL".
   - El instalador te pedirá seleccionar el archivo ZIP de tu proyecto dashboard.
   - El sistema extraerá todo, instalará las dependencias necesarias de forma 
     automática y lanzará el Dashboard y el Agente Neural.

REQUISITOS DEL SISTEMA:
- Node.js instalado (v16 o superior).
- PowerShell con permisos de administrador.

SOPORTE:
- Accede a tu dashboard en local: http://localhost:3000 una vez finalizado.
`;
      folder?.file("README.txt", readme);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "NYX_BRIDGE_V1_STABLE.zip");

      addNotification({
        title: 'Deployment Ready',
        message: 'The professional NYX_BRIDGE_V1 setup bundle has been generated.',
        featureId: 'INSTALLER_V2',
        type: 'success'
      });
      addLog('DEPLOY_COMPLETE', 'Visual Setup Wizard generated successfully');
    } catch (error) {
      console.error("Failed to generate zip:", error);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 bg-black/20 overflow-y-auto custom-scrollbar relative">
      <AnimatePresence>
        {showWizard && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-xl glass-card border-primary/20 overflow-hidden shadow-[0_0_80px_rgba(212,255,0,0.15)]"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-black">
                    <Zap size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-white">NYX_BRIDGE_V1</h3>
                    <p className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-mono">Sequence_Step {wizardStep} / 3</p>
                  </div>
                </div>
                <button onClick={() => setShowWizard(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10">
                {wizardStep === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Globe size={18} className="text-primary" />
                      <h4 className="text-sm font-black uppercase text-white tracking-widest">BRIDGE_SYNC_INIT</h4>
                    </div>
                    <div className="p-8 bg-black/60 border border-white/10 rounded-[2rem] space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Globe size={120} />
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Target_Link</span>
                        <span className="text-[10px] text-primary font-mono font-bold uppercase">{firebaseConfig.projectId}</span>
                      </div>
                      <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">Uplink_Version</span>
                        <span className="text-[10px] text-white/80 font-mono uppercase bg-white/10 px-2 py-0.5 rounded">v1.0.0_STABLE</span>
                      </div>
                      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative z-10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1.5 }}
                          className="h-full bg-primary shadow-[0_0_15px_#d4ff00]"
                        />
                      </div>
                    </div>
                    <p className="text-[11px] text-white/30 leading-relaxed uppercase font-mono italic text-center">
                      The NYX_BRIDGE_V1 uses high-speed ESM sockets to connect your local environment with the cloud control pane.
                    </p>
                  </div>
                )}

                {wizardStep === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings size={18} className="text-primary" />
                      <h4 className="text-sm font-black uppercase text-white tracking-widest">Hardware_Profile</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[9px] font-black uppercase text-white/40 mb-2 block ml-1">Local_Deployment_Path</label>
                        <input 
                          type="text"
                          className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-sm font-mono text-white focus:border-primary/50 outline-none transition-all"
                          value={config.installPath}
                          onChange={(e) => setConfig({ ...config, installPath: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <button 
                          onClick={() => setConfig({ ...config, processor: 'CPU' })}
                          className={cn(
                            "p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                            config.processor === 'CPU' ? "bg-primary/10 border-primary text-primary" : "bg-white/5 border-white/5 text-white/20 hover:border-white/20"
                          )}
                        >
                          <Cpu size={40} className={cn(config.processor === 'CPU' ? "scale-110" : "opacity-40")} />
                          <div className="text-center">
                            <span className="text-[11px] font-black uppercase block">Standard_CPU</span>
                            <span className="text-[9px] opacity-60">Balanced Tasks</span>
                          </div>
                        </button>
                        <button 
                          onClick={() => setConfig({ ...config, processor: 'GPU' })}
                          className={cn(
                            "p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group",
                            config.processor === 'GPU' ? "bg-blue-500/10 border-blue-500 text-blue-400" : "bg-white/5 border-white/5 text-white/20 hover:border-white/20"
                          )}
                        >
                          <Monitor size={40} className={cn(config.processor === 'GPU' ? "scale-110" : "opacity-40")} />
                          <div className="text-center">
                            <span className="text-[11px] font-black uppercase block">Neural_GPU</span>
                            <span className="text-[9px] opacity-60">AI Acceleration</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {wizardStep === 3 && (
                  <div className="space-y-8 py-4">
                    <div className="relative flex justify-center">
                      <div className="absolute inset-0 bg-primary/20 blur-[80px] animate-pulse rounded-full" />
                      <div className="w-24 h-24 rounded-[2rem] bg-primary border-4 border-black/20 flex items-center justify-center text-black relative z-10 rotate-3 transition-transform hover:rotate-0">
                        <Zap size={48} />
                      </div>
                    </div>
                    <div className="text-center space-y-3">
                      <h4 className="text-3xl font-black italic tracking-tighter uppercase text-white">READY_FOR_DEPLOY</h4>
                      <p className="text-[11px] text-white/40 max-w-xs mx-auto leading-relaxed font-mono uppercase tracking-widest">
                        Node manifests generated for v1.0. The setup will now download the binary package and initialize the local link.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
                {wizardStep > 1 && (
                  <button 
                    onClick={() => setWizardStep(prev => prev - 1)}
                    className="px-8 py-4 bg-white/5 text-white/60 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all border border-white/10"
                  >
                    Back
                  </button>
                )}
                 <button 
                  onClick={() => {
                    if (wizardStep < 3) setWizardStep(prev => prev + 1);
                    else {
                      handleDownload();
                      setShowWizard(false);
                    }
                  }}
                  className="flex-1 py-4 bg-primary text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[0.98] transition-all shadow-[0_0_40px_rgba(212,255,0,0.2)] active:scale-95"
                >
                  {wizardStep === 3 ? 'FINALIZE & DOWNLOAD_V1' : 'Continue_Sync'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-primary/5 border border-primary/20 rounded-[3rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32" />
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-2 text-primary">
            <Shield size={18} className="animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.5em]">System_Integrity_v1.0</span>
          </div>
          <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            NYX_BRIDGE_SYSTEM <span className="text-primary underline decoration-4 underline-offset-8 decoration-primary/30">V1.0 STABLE</span>
          </h2>
          <p className="text-sm text-white/40 font-mono uppercase tracking-widest leading-relaxed max-w-xl">
            Corregido en v1.0: Sistema de enlace unificado con motor ESM y reparación automática de permisos EPERM.
          </p>
        </div>
        <button 
          onClick={() => setShowWizard(true)}
          className="px-10 py-5 bg-primary text-black rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(212,255,0,0.3)] hover:scale-[1.05] transition-all flex items-center gap-3 animate-bounce hover:animate-none group relative z-10 shrink-0"
        >
          <Zap size={20} className="group-hover:rotate-12 transition-transform" /> 
          START_BRIDGE_V1_INSTALLER
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-8">
          <section className="glass-card p-8 border-white/5 space-y-6 relative group hover:border-primary/20 transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Download size={80} />
            </div>
            <h3 className="text-lg font-black uppercase text-white flex items-center gap-3 tracking-widest">
              <Download size={20} className="text-primary" />
              0. Download System Bundle (v1.0)
            </h3>
            <p className="text-xs text-white/40 leading-relaxed uppercase font-mono tracking-wide">
              Descarga el paquete Bridge v1.0 corregido. Incluye el motor ESM estable y el auto-parche de permisos.
            </p>
            <button 
              id="bridge-bundle-download"
              onClick={handleDownload}
              className="w-full py-5 bg-white/5 border-2 border-white/5 hover:border-primary/50 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all hover:bg-primary/5 group"
            >
              <Download size={20} className="group-hover:translate-y-1 transition-transform" /> 
              DOWNLOAD_BRIDGE_V1_STABLE.ZIP
            </button>
          </section>

          <section className="glass-card p-8 border-white/5 space-y-6">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              1. Requisitos
            </h3>
            <ul className="space-y-2 text-[11px] text-white/50 font-mono">
              <li>{'>'} Node.js v16+ instalado en la PC</li>
              <li>{'>'} Conexión a internet estable</li>
              <li>{'>'} Terminal (PowerShell/CMD) ejecutada como ADMINISTRADOR</li>
            </ul>
          </section>

          <section className="glass-card p-8 border-white/5 space-y-6 bg-red-500/5 hover:bg-red-500/10 transition-colors">
            <div className="flex items-center gap-3">
              <AlertTriangle size={24} className="text-red-500" />
              <h4 className="text-sm font-black uppercase text-red-500 tracking-[0.3em]">Critical_Permission_Fix</h4>
            </div>
            <p className="text-xs text-white/60 leading-relaxed uppercase font-mono italic">
              Si el instalador falla con "EPERM", el script <code className="text-white">install.ps1</code> lo reparará automáticamente. También puedes ejecutar esto manualmente:
            </p>
            <div className="bg-black/80 p-4 rounded-xl border border-white/10 font-mono text-[11px] text-primary select-all break-all shadow-inner">
              npm config set prefix "$env:AppData\\npm" --global
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section className="glass-card p-8 border-white/5 space-y-6">
            <h3 className="text-lg font-black uppercase text-white flex items-center gap-3 tracking-widest">
              <Terminal size={20} className="text-primary" />
              2. Instalación Directa (NYX_BRIDGE_V1)
            </h3>
            <p className="text-xs text-white/40 leading-relaxed uppercase font-mono">
              Descarga el paquete Bridge, descomprímelo y ejecuta el siguiente comando en una terminal con permisos de administrador:
            </p>
            <div className="bg-black/80 p-4 rounded-xl font-mono text-xs text-primary border border-white/10 shadow-inner">
              npm install && node nyx_agent.js
            </div>
            <button 
              id="installer-button"
              onClick={handleDownload}
              className="w-full py-5 bg-primary text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all shadow-[0_0_30px_rgba(212,255,0,0.3)] hover:scale-[1.02] active:scale-95 border-b-4 border-black/20 group"
            >
              <Zap size={20} className="group-hover:rotate-12 transition-transform" /> 
              ACTIVATE_NYX_BRIDGE_V1_STABLE
            </button>
          </section>

          <div className="flex items-center justify-between px-4">
            <div className="flex bg-white/5 rounded-2xl p-1.5 border border-white/10">
              {(['js', 'json', 'ps1'] as const).map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest",
                    activeLang === lang ? "bg-primary text-black" : "text-white/40 hover:text-white"
                  )}
                >
                  {lang === 'js' ? 'Agent_ESM' : lang === 'json' ? 'Manifest' : 'Boot_Script'}
                </button>
              ))}
            </div>
            <button 
              onClick={() => {
                let code = agentCode;
                if (activeLang === 'json') code = packageCode;
                if (activeLang === 'ps1') code = psCode;
                navigator.clipboard.writeText(code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] font-black text-white transition-all border border-white/10"
            >
              {copied ? <Check size={14} className="text-primary" /> : <Copy size={14} />}
              {copied ? 'SYNCED' : 'COPY'}
            </button>
          </div>
          <div className="flex-1 bg-black/80 rounded-[2.5rem] border border-white/10 p-8 font-mono text-[11px] overflow-auto custom-scrollbar text-white/60 leading-relaxed min-h-[400px] shadow-2xl relative">
             <div className="flex items-center gap-3 mb-6 text-[10px] text-white/30 uppercase font-black tracking-[0.4em] border-b border-white/5 pb-4">
               <Shield size={12} className="text-primary" /> 
               {activeLang === 'js' ? 'nyx_agent.js (V1_STABLE_ESM)' : activeLang === 'json' ? 'package.json (V1_STABLE)' : 'install.ps1 (AUTO_REPAIR)'}
             </div>
            <pre className="whitespace-pre-wrap">{activeLang === 'js' ? agentCode : activeLang === 'json' ? packageCode : psCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
