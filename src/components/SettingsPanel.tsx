import React, { useState } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { 
  Key, 
  Save, 
  Download, 
  Upload, 
  RefreshCw, 
  ShieldCheck, 
  Palette, 
  Cpu, 
  Monitor, 
  Zap, 
  FileJson, 
  Brain, 
  Network, 
  HardDrive, 
  Activity,
  ChevronRight,
  Database,
  Lock,
  Globe,
  Settings as SettingsIcon,
  Cloud,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { cn } from '../lib/utils';
import firebaseConfig from '../../firebase-applet-config.json';

type SettingsTab = 'general' | 'neural' | 'remote' | 'vault' | 'visual' | 'assistant';

export const SettingsPanel: React.FC = () => {
  const { credentials, updateCredential, addLog, theme, updateTheme, user, assistantSettings, updateAssistantSettings } = useDashboard();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  
  const [primaryColor, setPrimaryColor] = useState(theme.primary);
  const [secondaryColor, setSecondaryColor] = useState(theme.secondary);
  const [bgColor, setBgColor] = useState(theme.background);
  const [cardColor, setCardColor] = useState(theme.cardBg);

  const tabs: { id: SettingsTab; label: string; icon: any; color: string }[] = [
    { id: 'general', label: 'System_Core', icon: Activity, color: 'text-primary' },
    { id: 'neural', label: 'Neural_IA', icon: Brain, color: 'text-cyan-400' },
    { id: 'remote', label: 'Remote_Bridge', icon: Globe, color: 'text-neon-pink' },
    { id: 'vault', label: 'Data_Vault', icon: Lock, color: 'text-yellow-400' },
    { id: 'assistant', label: 'Nyx_Assistant', icon: MessageSquare, color: 'text-neon-blue' },
    { id: 'visual', label: 'Biometric_UI', icon: Palette, color: 'text-cyan-400' },
  ];

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
    
    const mdContent = `# OmniDash Configuration Backup\nGenerated on: ${new Date().toLocaleString()}\n\n## Configuration Data\n\`\`\`json\n${state}\n\`\`\`\n`;
    const blob = new Blob([mdContent], { type: 'text/markdown' });
    saveAs(blob, `omnidash-backup-${new Date().toISOString().split('T')[0]}.md`);
    addLog('EXPORT_CONFIG', 'Exported configuration to MD file');
  };

  const generateLocalPackage = async () => {
    if (!user) return;
    setIsDeploying(true);
    addLog('DEPLOY_LOCAL', 'Generating NYX_BRIDGE_V1 Stable Deployment Bundle');

    try {
      const zip = new JSZip();
      
      // Configuration Manifest
      const manifest = {
        version: '1.0.0',
        generatedAt: new Date().toISOString(),
        identity: user.email,
        environment: 'stable-production',
        credentials: Object.keys(credentials)
      };

      zip.file('nexus_manifest.json', JSON.stringify(manifest, null, 2));
      
      // README / INSTALLER INSTRUCTIONS
      const readme = `# Nyx_Nexus Local Bridge Installer\n\n1. Extract this zip.\n2. Run install.sh (Linux/MacOS) or install.bat (Windows).\n3. Use your ID: ${user.uid} to bridge your local machine to this dashboard.\n`;
      zip.file('README.md', readme);

      // Dummy scripts for the installer
      zip.file('install.bat', 'echo "Nyx_Nexus Installer initializing..."\npause');
      zip.file('install.sh', '#!/bin/bash\necho "Nyx_Nexus Installer initializing..."');

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `nyx-bridge-bundle-${new Date().getTime()}.zip`);
      
      addLog('DEPLOY_COMPLETE', 'Deployment bundle created and downloaded successfully.');
    } catch (error) {
      console.error(error);
      addLog('DEPLOY_ERROR', 'Failed to generate deployment package.');
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-black/40 backdrop-blur-md">
      {/* PROFESSIONAL HEADER */}
      <header className="p-8 border-b border-white/5 bg-gradient-to-r from-primary/5 via-transparent to-transparent shrink-0">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <SettingsIcon size={16} className="text-primary animate-spin-slow" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40">Nexus_Command_Center_v2.0</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              ORCHESTRATION <span className="text-primary">SETTINGS</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right px-4 border-r border-white/10 hidden md:block">
              <div className="text-[9px] font-black text-white/20 uppercase tracking-widest">Uplink_Identity</div>
              <div className="text-xs font-mono text-primary">{user?.email || 'OFFLINE_OPERATOR'}</div>
            </div>
            <ShieldCheck size={32} className="text-primary/20" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* VERTICAL TAB NAVIGATION */}
        <aside className="w-64 border-r border-white/5 p-4 flex flex-col gap-2 bg-black/20 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "group w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 relative overflow-hidden",
                activeTab === tab.id 
                  ? "bg-primary text-black" 
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              )}
            >
              {activeTab === tab.id && (
                <motion.div layoutId="active-tab" className="absolute inset-0 bg-primary" />
              )}
              <tab.icon size={18} className={cn("relative z-10", activeTab === tab.id ? "text-black" : tab.color)} />
              <span className="relative z-10 text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
              <ChevronRight size={14} className={cn("ml-auto relative z-10", activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
            </button>
          ))}
          
          <div className="mt-auto p-4 glass-card border-primary/10 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={12} className="text-primary" />
              <span className="text-[8px] font-black uppercase text-white/60">System_Health</span>
            </div>
            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary"
                animate={{ width: ['40%', '90%', '65%'] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
            </div>
          </div>
        </aside>

        {/* TAB CONTENT AREA */}
        <main className="flex-1 overflow-y-auto custom-scrollbar bg-black/10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-12 min-h-full"
            >
              {activeTab === 'general' && (
                <div className="space-y-12">
                   <header className="space-y-4">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">System_Core <span className="text-primary">Status</span></h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest">Global orchestration parameters and security context.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 border-white/5 bg-white/[0.02] space-y-6">
                      <div className="flex items-center gap-3">
                        <Lock size={20} className="text-primary" />
                        <h3 className="text-sm font-black uppercase text-white">Encrypted_Vault</h3>
                      </div>
                      <div className="space-y-3">
                        {Object.entries(credentials).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl">
                            <div>
                              <div className="text-[8px] text-white/20 font-black uppercase">{k}</div>
                              <div className="text-xs font-mono text-white/60">••••••••••••••••</div>
                            </div>
                            <RefreshCw size={12} className="text-white/20" />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          placeholder="KEY_ID"
                          value={newKey}
                          onChange={e => setNewKey(e.target.value)}
                          className="bg-black/60 border border-white/5 rounded-xl p-3 text-[10px] font-mono text-white outline-none focus:border-primary/50"
                        />
                        <input 
                          type="password"
                          placeholder="TOKEN"
                          value={newValue}
                          onChange={e => setNewValue(e.target.value)}
                          className="bg-black/60 border border-white/5 rounded-xl p-3 text-[10px] font-mono text-white outline-none focus:border-primary/50"
                        />
                      </div>
                      <button onClick={handleAddCredential} className="w-full py-4 bg-white/5 border border-white/10 hover:bg-primary hover:text-black transition-all rounded-xl text-[10px] font-black uppercase">Add_To_Vault</button>
                    </div>

                    <div className="glass-card p-8 border-white/5 bg-white/[0.02] space-y-6">
                      <div className="flex items-center gap-3">
                        <Layers size={20} className="text-primary" />
                        <h3 className="text-sm font-black uppercase text-white">System_Modules</h3>
                      </div>
                      <div className="space-y-4">
                        {[
                          { id: 'neural', name: 'Neural_Uplink', status: true },
                          { id: 'remote', name: 'Remote_Bridge_Beta', status: false },
                          { id: 'asset', name: 'Asset_Manager', status: true },
                          { id: 'event', name: 'Event_Log_Monitor', status: true }
                        ].map((mod) => (
                          <div key={mod.id} className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/60 uppercase">{mod.name}</span>
                            <div className={cn("w-10 h-5 rounded-full p-1 cursor-pointer transition-colors", mod.status ? "bg-primary/20" : "bg-white/5")}>
                              <div className={cn("w-3 h-3 rounded-full transition-all", mod.status ? "bg-primary ml-auto" : "bg-white/20")} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'neural' && (
                <div className="space-y-12">
                   <header className="space-y-4">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Neural_IA <span className="text-cyan-400">Integrations</span></h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest">Connect and configure LLM endpoints (Claude, Ollama, OpenAI).</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { id: 'claude', label: 'Anthropic Claude', icon: Brain, status: 'Ready' },
                      { id: 'ollama', label: 'Ollama Local', icon: Cpu, status: 'Not Connected' },
                      { id: 'openclaw', label: 'OpenClaw Bridge', icon: Network, status: 'Emulation' },
                      { id: 'gemini', label: 'Google Gemini', icon: Zap, status: 'Active' }
                    ].map((ai) => (
                      <div key={ai.id} className={cn(
                        "glass-card p-6 border-white/5 bg-white/[0.02] hover:border-cyan-400/30 transition-all group cursor-pointer",
                        ai.status === 'Active' && "border-cyan-400/50 bg-cyan-400/5"
                      )}>
                        <ai.icon size={24} className="text-cyan-400 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xs font-black text-white uppercase mb-1">{ai.label}</h3>
                        <div className="flex items-center gap-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", ai.status === 'Active' ? 'bg-green-500' : 'bg-white/10')} />
                          <span className="text-[9px] font-mono text-white/40 uppercase">{ai.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="glass-card p-10 border-white/5 bg-black/40 space-y-8">
                    <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-4">Endpoint_Orchestration</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                        <label className="text-[9px] font-black text-white/30 uppercase block">Ollama_Endpoint_URL</label>
                        <input type="text" placeholder="http://localhost:11434" className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-cyan-400/50" />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-white/30 uppercase block">Claude_Default_Model</label>
                        <select className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-cyan-400/50">
                          <option>claude-3-5-sonnet-20240620</option>
                          <option>claude-3-opus-20240229</option>
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[9px] font-black text-white/30 uppercase block">OpenClaw_Gateway</label>
                        <input type="text" placeholder="https://openclaw.gateway.local" className="w-full bg-black border border-white/10 rounded-xl p-4 text-xs font-mono text-white outline-none focus:border-cyan-400/50" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'remote' && (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-8">
                  <Globe size={80} className="text-neon-pink/20 animate-pulse" />
                  <div className="space-y-4">
                    <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Remote_Bridge <span className="text-neon-pink">v2.0</span></h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest max-w-lg">
                      Secure encrypted P2P tunnel for remote system control and desktop observation.
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button className="px-10 py-5 bg-neon-pink text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-[0_0_40px_rgba(255,0,255,0.2)]">
                      Initialize_Bridge
                    </button>
                    <button className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
                      Scan_Network
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'vault' && (
                <div className="space-y-12">
                   <header className="space-y-4">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Data_Vault <span className="text-yellow-400">&</span> <span className="text-primary">Deploy</span></h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest">Global backup systems and professional installers.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-10 border-white/5 bg-black/20 space-y-8">
                       <div className="flex items-center gap-4">
                        <div className="p-4 bg-yellow-400/10 rounded-2xl">
                          <ShieldCheck size={32} className="text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white uppercase italic">Snapshot_Rescue</h3>
                          <span className="text-[10px] text-white/40 font-mono">Respaldo total del sistema</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={exportConfig} className="flex-1 py-4 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-xl font-black text-[10px] uppercase hover:bg-yellow-500/30 transition-all">Create_Backup</button>
                        <label className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl font-black text-[10px] uppercase cursor-pointer text-center flex items-center justify-center">
                          Restore_Data
                          <input type="file" className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div className="glass-card p-10 border-primary/20 bg-primary/5 space-y-8">
                       <div className="flex items-center gap-4">
                        <div className="p-4 bg-primary/10 rounded-2xl">
                          <Zap size={32} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white uppercase italic">Bundle_Installer</h3>
                          <span className="text-[10px] text-white/40 font-mono">Empaquetador profesional estable</span>
                        </div>
                      </div>
                      <button 
                        onClick={generateLocalPackage}
                        disabled={isDeploying}
                        className="w-full py-6 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_0_30px_rgba(212,255,0,0.2)] hover:scale-[0.98] transition-all flex items-center justify-center gap-4"
                      >
                         {isDeploying ? <RefreshCw className="animate-spin" /> : <Layers size={20} />}
                         Build_Distribution_ZIP
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assistant' && (
                <div className="space-y-12">
                  <header className="space-y-4">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Nyx_Assistant <span className="text-neon-blue">Neural_Config</span></h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest">Behavioral parameters for the floating autonomous entity.</p>
                  </header>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="glass-card p-8 border-white/5 bg-white/[0.02] space-y-6">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Core_Behavior</h3>
                      
                      <div className="space-y-6">
                        <div className="flex items-center justify-between group">
                          <div>
                            <div className="text-[10px] font-black text-white uppercase">Neural_Draggable</div>
                            <div className="text-[8px] text-white/20 uppercase font-mono mt-1">Allow manual movement of the entity</div>
                          </div>
                          <button 
                            onClick={() => updateAssistantSettings({ isDraggable: !assistantSettings.isDraggable })}
                            className={cn(
                              "w-12 h-6 rounded-full p-1 transition-all",
                              assistantSettings.isDraggable ? "bg-neon-blue" : "bg-white/10"
                            )}
                          >
                            <motion.div 
                              className="w-4 h-4 bg-white rounded-full"
                              animate={{ x: assistantSettings.isDraggable ? 24 : 0 }}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between group">
                          <div>
                            <div className="text-[10px] font-black text-white uppercase">Voice_Wave_Sync</div>
                            <div className="text-[8px] text-white/20 uppercase font-mono mt-1">Synchronize UI waves with neural activity</div>
                          </div>
                          <button 
                            onClick={() => updateAssistantSettings({ voiceWaveEnabled: !assistantSettings.voiceWaveEnabled })}
                            className={cn(
                              "w-12 h-6 rounded-full p-1 transition-all",
                              assistantSettings.voiceWaveEnabled ? "bg-neon-blue" : "bg-white/10"
                            )}
                          >
                            <motion.div 
                              className="w-4 h-4 bg-white rounded-full"
                              animate={{ x: assistantSettings.voiceWaveEnabled ? 24 : 0 }}
                            />
                          </button>
                        </div>

                        <div className="flex items-center justify-between group">
                          <div>
                            <div className="text-[10px] font-black text-white uppercase">Auto_Expand_Log</div>
                            <div className="text-[8px] text-white/20 uppercase font-mono mt-1">Open logs automatically on neural events</div>
                          </div>
                          <button 
                            className="w-12 h-6 rounded-full p-1 bg-white/10"
                          >
                            <div className="w-4 h-4 bg-white/20 rounded-full" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card p-8 border-white/5 bg-white/[0.02] space-y-6">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-4">Interaction_Model</h3>
                      <div className="space-y-4">
                         <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                            <div className="text-[9px] font-black text-neon-blue uppercase mb-2">Default_Voice_Engine</div>
                            <select className="w-full bg-transparent text-xs font-mono text-white/60 outline-none">
                              <option>Neural_Echo_v4 (Stable)</option>
                              <option>Cyber_Nova_v1 (Beta)</option>
                              <option>System_Oracle (Enterprise)</option>
                            </select>
                         </div>
                         <div className="p-4 bg-black/40 border border-white/5 rounded-xl">
                            <div className="text-[9px] font-black text-neon-blue uppercase mb-2">Thinking_Priority</div>
                            <div className="flex gap-2">
                               {['Latency', 'Accuracy', 'Neural_Flow'].map(t => (
                                 <button key={t} className="flex-1 py-2 text-[8px] font-black uppercase text-white/30 border border-white/5 rounded-lg hover:border-neon-blue/30 hover:text-white transition-all">{t}</button>
                               ))}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'visual' && (
                <div className="space-y-12">
                   <header className="space-y-4">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Biometric_UI <span className="text-cyan-400">Sync</span></h2>
                    <p className="text-sm text-white/40 font-mono uppercase tracking-widest">Theming, floating assistant settings, and visual orchestration.</p>
                  </header>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Palette size={14} className="text-cyan-400" /> Interface_Colors
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { label: 'Neural_Primary', value: primaryColor, setter: setPrimaryColor },
                          { label: 'Neural_Secondary', value: secondaryColor, setter: setSecondaryColor },
                          { label: 'Core_Background', value: bgColor, setter: setBgColor },
                        ].map((color) => (
                          <div key={color.label} className="flex items-center gap-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                            <input type="color" value={color.value} onChange={e => color.setter(e.target.value)} className="w-12 h-12 bg-transparent cursor-pointer" />
                            <div className="flex-1">
                              <div className="text-[9px] text-white/30 font-black uppercase mb-1">{color.label}</div>
                              <div className="text-xs font-mono text-white/80">{color.value}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onClick={handleSaveTheme} className="w-full py-5 bg-cyan-400/20 text-cyan-400 border border-cyan-400/30 rounded-2xl font-black text-xs uppercase hover:bg-cyan-400/30 transition-all mt-4">Sync_Visual_Matrix</button>
                    </div>
                    
                    <div className="space-y-8">
                      <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Sparkles size={14} className="text-cyan-400" /> Assistant_Behavior
                      </h3>
                      <div className="glass-card p-8 border-white/5 bg-white/[0.02] space-y-6">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/60 uppercase">Voice_Wave_Animation</span>
                            <div className="w-10 h-5 bg-primary/20 rounded-full p-1 cursor-pointer">
                              <div className="w-3 h-3 bg-primary rounded-full ml-auto" />
                            </div>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-white/60 uppercase">Manual_Draggable_Focus</span>
                            <div className="w-10 h-5 bg-white/5 rounded-full p-1 cursor-pointer">
                              <div className="w-3 h-3 bg-white/20 rounded-full" />
                            </div>
                         </div>
                         <div className="pt-4 border-t border-white/5">
                           <p className="text-[9px] font-mono text-white/20 uppercase italic">// Settings for the floating Nyx_Assistant system.</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
