import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboard } from '../store/DashboardContext';
import { Package, Download, Cpu, HardDrive, Settings, ShieldAlert, MonitorUp, Terminal, FileCode2, PlaySquare, Settings2, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { AIWave } from './AIWave';

type WizardStep = 'general' | 'files' | 'system' | 'advanced' | 'build';

export const WizardInstallManager: React.FC = () => {
  const { addLog, addNotification } = useDashboard();
  const [activeStep, setActiveStep] = useState<WizardStep>('general');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  
  const [config, setConfig] = useState({
    appName: 'NYX_BRIDGE_V1',
    appVersion: '1.0.0-STABLE',
    publisher: 'NYX_CORE_SYSTEMS',
    architecture: '64-bit (x64)',
    osCompatibility: ['Windows 10', 'Windows 11'],
    uacLevel: 'requireAdministrator',
    installPath: 'C:\\Program Files\\NYX_BRIDGE_V1',
    createShortcut: true,
    runAfterInstall: true,
    includeUninstaller: true,
    enableLogging: true,
  });

  const handleConfigChange = (key: keyof typeof config, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const startBuild = () => {
    if (!config.appName || !config.publisher) {
      addNotification({ title: 'Validation Failed', message: 'App Name and Publisher are required.', type: 'error', featureId: 'WIZARD_BUILDER' });
      return;
    }

    setActiveStep('build');
    setIsBuilding(true);
    setBuildLogs(['Initializing Wizard Builder compiler...', `Target: ${config.architecture} PE Executable`]);

    const buildSequence = [
      'Validating binary dependencies...',
      'Packing source files and assets...',
      'Injecting UAC Manifest (Level: ' + config.uacLevel + ')...',
      'Configuring Registry Keys and System Variables...',
      'Compiling Uninstaller module...',
      'Applying cryptographic signatures and checksums...',
      'Finalizing deployment package...'
    ];

    let delay = 1000;
    buildSequence.forEach((log, index) => {
      setTimeout(() => {
        setBuildLogs(prev => [...prev, log]);
      }, delay);
      delay += Math.random() * 800 + 400; // random delay between 400ms and 1200ms
    });

    setTimeout(() => {
      setBuildLogs(prev => [...prev, `Build successful! Generated ${config.appName}_${config.appVersion}_setup.exe`]);
      setIsBuilding(false);
      addNotification({ title: 'Build Successful', message: 'Installer package compiled successfully.', type: 'success', featureId: 'WIZARD_BUILDER' });
      addLog('INSTALLER', `Generated executable package for ${config.appName} v${config.appVersion}`);
    }, delay + 500);
  };

  return (
    <div className="h-full flex flex-col p-8 space-y-6 overflow-y-auto custom-scrollbar">
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-center text-primary">
            <Package size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">Wizard Install Manager</h1>
            <p className="text-xs text-white/40 font-mono tracking-widest uppercase mt-1">Windows OS MSI/EXE Compiler</p>
          </div>
        </div>
        <button 
          onClick={startBuild}
          disabled={isBuilding}
          className="px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-white hover:text-black transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isBuilding ? <AIWave isProcessing /> : <PlaySquare size={16} />}
          {isBuilding ? 'Compiling...' : 'Compile Package'}
        </button>
      </header>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Sidebar Nav */}
        <div className="w-64 shrink-0 flex flex-col space-y-2">
          {[
            { id: 'general', icon: Settings, label: 'General Info' },
            { id: 'files', icon: HardDrive, label: 'Files & Directories' },
            { id: 'system', icon: Cpu, label: 'System Configuration' },
            { id: 'advanced', icon: Settings2, label: 'Advanced Options' },
            { id: 'build', icon: Terminal, label: 'Compiler Output' }
          ].map(step => (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id as WizardStep)}
              className={cn(
                "p-4 rounded-xl flex items-center gap-3 text-xs font-bold uppercase tracking-widest transition-all",
                activeStep === step.id 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(207,248,12,0.1)]" 
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white border border-transparent"
              )}
            >
              <step.icon size={16} />
              {step.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-8 overflow-y-auto custom-scrollbar relative min-h-[500px]">
          
          <AnimatePresence mode="wait">
            {activeStep === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-2xl"
              >
                <h2 className="text-xl font-black text-white uppercase tracking-wider border-b border-white/10 pb-4 mb-6">Application Identity</h2>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Application Name</label>
                    <input 
                      type="text" 
                      value={config.appName}
                      onChange={(e) => handleConfigChange('appName', e.target.value)}
                      placeholder="e.g. My Awesome App"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Version</label>
                    <input 
                      type="text" 
                      value={config.appVersion}
                      onChange={(e) => handleConfigChange('appVersion', e.target.value)}
                      placeholder="1.0.0"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Publisher / Organization</label>
                    <input 
                      type="text" 
                      value={config.publisher}
                      onChange={(e) => handleConfigChange('publisher', e.target.value)}
                      placeholder="Acme Corp LLC"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Default Installation Path</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={config.installPath}
                        onChange={(e) => handleConfigChange('installPath', e.target.value)}
                        className="flex-1 bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors"
                      />
                      <button className="px-4 bg-white/5 border border-white/10 rounded-lg text-white/40 hover:text-white uppercase text-[10px] font-bold tracking-widest transition-colors">
                        Browse
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 'system' && (
              <motion.div
                key="system"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-2xl"
              >
                <h2 className="text-xl font-black text-white uppercase tracking-wider border-b border-white/10 pb-4 mb-6">OS Integration & Security</h2>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert size={16} /> User Account Control (UAC)
                    </h3>
                    <select 
                      value={config.uacLevel}
                      onChange={(e) => handleConfigChange('uacLevel', e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none cursor-pointer"
                    >
                      <option value="asInvoker">Run as original user (No Admin prompt)</option>
                      <option value="highestAvailable">Highest Available Privileges</option>
                      <option value="requireAdministrator">Require Administrator Rights (Recommended for System Installs)</option>
                    </select>
                    <p className="text-[10px] text-white/40 font-mono">Defines the manifest level injected into the installer stub. Integrity verification is automatically applied for elevated execution.</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <MonitorUp size={16} /> Architecture Compatibility
                    </h3>
                    <div className="flex gap-4">
                      {['32-bit (x86)', '64-bit (x64)', 'ARM64'].map(arch => (
                        <button
                          key={arch}
                          onClick={() => handleConfigChange('architecture', arch)}
                          className={cn(
                            "flex-1 p-3 rounded-lg border text-xs font-bold uppercase tracking-widest transition-all",
                            config.architecture.includes(arch.split(' ')[0]) 
                              ? "bg-primary/10 border-primary text-primary" 
                              : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {arch}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                      <Settings size={16} /> Advanced OS Hooks
                    </h3>
                    
                    <div className="bg-black/30 border border-white/10 rounded-lg p-4 space-y-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Environment Variables</label>
                        <textarea 
                          placeholder="e.g. PATH=$PATH;C:\Program Files\[AppName]\bin"
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors h-20 resize-none custom-scrollbar"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Registry Keys (HKLM/HKCU)</label>
                        <textarea 
                          placeholder="HKCU\Software\[Publisher]\[AppName]"
                          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-primary/50 outline-none transition-colors h-20 resize-none custom-scrollbar"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 'advanced' && (
              <motion.div
                key="advanced"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-2xl"
              >
                <h2 className="text-xl font-black text-white uppercase tracking-wider border-b border-white/10 pb-4 mb-6">Experience & Persistence</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'createShortcut', label: 'Create Desktop Shortcut', desc: 'Adds a .lnk file to the user\'s desktop automatically.' },
                    { key: 'runAfterInstall', label: 'Run After Installation', desc: 'Prompts to launch the application immediately after the wizard completes.' },
                    { key: 'includeUninstaller', label: 'Generate System Uninstaller', desc: 'Creates removal routines and registers with Windows \'Programs and Features\'.' },
                    { key: 'enableLogging', label: 'Enable Installation Logs', desc: 'Persists detailed deployment logs to %TEMP% directory for debugging.' }
                  ].map(option => (
                    <label key={option.key} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-black/20 hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="mt-1">
                        <input 
                          type="checkbox" 
                          checked={config[option.key as keyof typeof config] as boolean}
                          onChange={(e) => handleConfigChange(option.key as any, e.target.checked)}
                          className="w-4 h-4 rounded appearance-none border border-white/20 checked:bg-primary checked:border-primary relative
                            after:content-[''] after:absolute after:inset-0 after:flex after:items-center after:justify-center
                            checked:after:content-['✔'] checked:after:text-black checked:after:text-[10px] checked:after:font-black"
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest">{option.label}</h4>
                        <p className="text-[10px] text-white/40 font-mono mt-1">{option.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {activeStep === 'files' && (
              <motion.div
                key="files"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 h-full flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Payload Assembly</h2>
                  <button className="px-4 py-2 bg-white/10 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors">
                    + Add Directory
                  </button>
                </div>
                
                <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center bg-black/20 relative group overflow-hidden">
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <div className="text-center space-y-4">
                    <FileCode2 size={48} className="mx-auto text-white/20 group-hover:text-primary transition-colors" />
                    <div>
                      <p className="text-sm font-bold text-white uppercase tracking-widest">Drag & Drop Release Binaries</p>
                      <p className="text-[10px] text-white/40 font-mono mt-2 flex items-center justify-center gap-2">
                        <span>Select the compiled .exe and asset folders</span>
                      </p>
                    </div>
                    <button className="px-6 py-2 bg-primary/20 text-primary border border-primary/40 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-colors mt-4 inline-block">
                      Browse Files
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeStep === 'build' && (
              <motion.div
                key="build"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full flex flex-col"
              >
                <div className="bg-black/90 flex-1 rounded-xl border border-white/10 overflow-hidden flex flex-col">
                  <div className="bg-white/5 border-b border-white/10 p-3 flex px-4 items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <span className="ml-4 text-[10px] font-mono text-white/40 uppercase">Compiler.stdout</span>
                  </div>
                  <div className="p-6 font-mono text-[11px] leading-loose flex-1 overflow-y-auto custom-scrollbar space-y-1">
                    {buildLogs.length === 0 && !isBuilding ? (
                      <p className="text-white/30 italic">No build output. Configure settings and click 'Compile Package'.</p>
                    ) : (
                      buildLogs.map((log, i) => (
                        <div key={i} className="flex gap-4">
                          <span className="text-white/20 shrink-0">[{new Date().toISOString().split('T')[1].slice(0, 12)}]</span>
                          <span className={cn(
                            log.includes('successful') ? 'text-primary font-bold' : 
                            log.includes('Failed') ? 'text-neon-pink' : 
                            'text-white/70'
                          )}>
                            {log}
                          </span>
                        </div>
                      ))
                    )}
                    {isBuilding && (
                      <div className="flex gap-4 items-center mt-4 text-primary animate-pulse">
                        <span className="text-white/20">[{new Date().toISOString().split('T')[1].slice(0, 12)}]</span>
                        <span>_</span>
                      </div>
                    )}
                  </div>
                  
                  {!isBuilding && buildLogs.some(l => l.includes('successful')) && (
                    <div className="p-4 bg-primary/10 border-t border-primary/20 flex items-center justify-between">
                      <div className="flex items-center gap-3 text-primary">
                        <Download size={20} />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest">Setup Binary Ready</p>
                          <p className="text-[10px] font-mono text-primary/70">{config.appName}_Setup.exe (Approx. 45 MB)</p>
                        </div>
                      </div>
                      <button className="px-6 py-2 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-lg hover:bg-white transition-colors">
                        Download Artifact
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};
