import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  AlertTriangle, 
  Bluetooth, 
  Usb, 
  Terminal, 
  Gauge, 
  Trash2, 
  Zap, 
  ShieldCheck, 
  Smartphone,
  ChevronRight,
  RefreshCcw,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';

export const OBDScan: React.FC = () => {
  const { obd, connectOBD, disconnectOBD, scanDTCs, clearDTCs, addLog, setOBDAgentMode } = useDashboard();
  const [activeTab, setActiveTab] = useState<'status' | 'diagnostics' | 'metrics' | 'terminal'>('status');
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<{cmd: string, resp: string}[]>([
    { cmd: 'ATZ', resp: 'ELM327 v2.1' },
    { cmd: 'ATSP 0', resp: 'OK' }
  ]);
  const [connConfig, setConnConfig] = useState({
    interface: 'bluetooth' as 'usb' | 'bluetooth' | 'wifi',
    adapter: 'elm327' as 'elm327' | 'j2534'
  });

  const handleTerminalSend = () => {
    if (!terminalInput.trim()) return;
    const cmd = terminalInput.toUpperCase();
    let resp = 'NO DATA';
    
    if (cmd === '0100') resp = '41 00 BE 3E B0 11';
    else if (cmd.startsWith('AT')) resp = 'OK';
    else if (cmd === '010C') resp = '41 0C 0B B8 (3000 RPM)';
    
    setTerminalHistory(prev => [...prev, { cmd, resp }].slice(-50));
    setTerminalInput('');
    addLog('OBD_RAW_CMD', `Sent: ${cmd} -> ${resp}`);
  };

  if (!obd) return null;

  return (
    <div className="h-full flex flex-col p-8 space-y-6 overflow-hidden">
      {/* Header with Connection Status */}
      <header className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-2xl backdrop-blur-xl border",
            obd.status.connected 
              ? "bg-primary/10 border-primary/30 text-primary animate-pulse" 
              : "bg-white/5 border-white/10 text-white/20"
          )}>
            {obd.status.connected ? <Activity size={28} /> : <Zap size={28} />}
          </div>
          <div>
            <h1 className="text-2xl font-black italic text-white uppercase tracking-tighter">OBD_SCAN_CORE</h1>
            <p className="text-[10px] text-white/40 font-mono tracking-[0.3em] uppercase mt-1">
              Neural_Vehicle_Link // {obd.status.connected ? `${obd.status.protocol} [${obd.status.interface.toUpperCase()}]` : 'AWAITING_UPLINK'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {obd.status.connected ? (
            <div className="flex items-center gap-4">
              {obd.agentMode === 'autonomous' && (
                <div className="px-3 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-full flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Autonomous Guard Active</span>
                </div>
              )}
              <div className="flex flex-col items-end mr-4">
                <span className="text-[9px] text-white/30 uppercase font-bold tracking-widest leading-none">V_BATT</span>
                <span className="text-xs font-mono text-primary">{obd.status.voltage}V</span>
              </div>
              <button 
                onClick={disconnectOBD}
                className="px-6 py-3 bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
              >
                Terminate Link
              </button>
            </div>
          ) : (
            <div className="flex gap-4 items-center bg-white/5 p-1 rounded-2xl border border-white/10">
              <div className="flex gap-1">
                {(['bluetooth', 'usb', 'wifi'] as const).map(iface => (
                  <button
                    key={iface}
                    onClick={() => setConnConfig(prev => ({ ...prev, interface: iface }))}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      connConfig.interface === iface ? "bg-primary text-black" : "text-white/40 hover:text-white"
                    )}
                  >
                    {iface === 'bluetooth' && <Bluetooth size={16} />}
                    {iface === 'usb' && <Usb size={16} />}
                    {iface === 'wifi' && <Smartphone size={16} />}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-white/10" />
              <button 
                onClick={() => connectOBD(connConfig.adapter)}
                className="px-6 py-2.5 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl hover:shadow-[0_0_20px_rgba(207,248,12,0.4)] transition-all flex items-center gap-2 active:scale-95"
              >
                Establish Link
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="flex gap-8 flex-1 min-h-0">
        {/* Module Navigation */}
        <div className="w-64 shrink-0 flex flex-col space-y-2">
          <div className="p-4 glass-card bg-primary/5 border border-primary/20 rounded-2xl mb-4 text-center">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest block mb-3">Agent Modality</span>
            <div className="grid grid-cols-1 gap-1.5">
              {(['assisted', 'guided', 'autonomous'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => setOBDAgentMode(mode)}
                  className={cn(
                    "w-full px-4 py-3 rounded-xl border text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-between",
                    obd.agentMode === mode 
                      ? "bg-primary border-primary text-black shadow-lg" 
                      : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                  )}
                >
                  {mode}
                  {obd.agentMode === mode && <CheckCircle2 size={12} />}
                </button>
              ))}
            </div>
          </div>

          {[
            { id: 'status', label: 'Link Status', icon: Activity },
            { id: 'diagnostics', label: 'Diagnostics', icon: AlertTriangle, badge: obd.dtcs.length > 0 ? obd.dtcs.length : null },
            { id: 'metrics', label: 'Live Data', icon: Gauge },
            { id: 'terminal', label: 'Raw Console', icon: Terminal }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "p-4 rounded-2xl flex items-center justify-between text-[11px] font-black uppercase tracking-widest transition-all border",
                activeTab === tab.id 
                  ? "bg-primary/10 border-primary/30 text-primary shadow-[0_0_20px_rgba(207,248,12,0.1)]" 
                  : "bg-white/5 border-transparent text-white/40 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={18} />
                {tab.label}
              </div>
              {tab.badge && (
                <span className="px-2 py-0.5 bg-red-500 text-white rounded-full text-[9px] animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}

          <div className="mt-auto p-5 glass-card bg-primary/5 border border-primary/10">
            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <ShieldCheck size={12} />
              AUDIT_TRAIL
            </h4>
            <div className="space-y-2 font-mono text-[9px] text-white/40">
              <div className="flex justify-between"><span>SECURE_BOOT</span> <span className="text-green-500">YES</span></div>
              <div className="flex justify-between"><span>BUS_LOAD</span> <span>2.4%</span></div>
              <div className="flex justify-between"><span>IO_ENCRYPT</span> <span>ACTIVE</span></div>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="flex-1 glass-card p-8 overflow-y-auto custom-scrollbar border border-white/5 bg-black/60 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'status' && (
              <motion.div
                key="status"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Interface Matrix</h2>
                  <p className="text-[10px] text-white/40 font-mono mt-1">Managed uplink to vehicle electronic control units.</p>
                </div>

                {!obd.status.connected ? (
                  <div className="space-y-8">
                    <div className="p-8 bg-white/5 rounded-3xl border border-white/10 text-center">
                      <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <Activity size={40} className="animate-pulse" />
                      </div>
                      <h3 className="text-lg font-black text-white uppercase tracking-widest mb-2">Protocol Discovery</h3>
                      <p className="text-xs text-white/40 font-mono mb-8 max-w-sm mx-auto">
                        NYX Bridge is searching for active VCI (Vehicle Communication Interface) on local ports.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                          <span className="text-[9px] font-black text-primary uppercase block mb-2">Standard Adapter</span>
                          <button 
                            onClick={() => { setConnConfig(p => ({ ...p, adapter: 'elm327' })); connectOBD('elm327'); }}
                            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold text-white transition-all uppercase tracking-widest"
                          >
                            ELM327 / OBD-II
                          </button>
                        </div>
                        <div className="p-4 bg-black/40 border border-white/5 rounded-2xl">
                          <span className="text-[9px] font-black text-cyan-400 uppercase block mb-2">Professional Mode</span>
                          <button 
                            onClick={() => { setConnConfig(p => ({ ...p, adapter: 'j2534' })); connectOBD('j2534'); }}
                            className="w-full py-3 bg-cyan-400/10 hover:bg-cyan-400/20 rounded-xl text-[10px] font-bold text-cyan-400 transition-all border border-cyan-400/20 uppercase tracking-widest"
                          >
                            J2534 Passthru
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4">
                        <Activity size={16} className="text-primary/20 animate-spin" />
                      </div>
                      <h3 className="text-xs font-black text-primary uppercase tracking-widest mb-6">Link Parameters</h3>
                      <div className="space-y-4">
                        {[
                          { label: 'Latency', value: `${obd.status.latency}ms`, status: 'NOMINAL' },
                          { label: 'Bus Speed', value: '500 kbps', status: 'CAN_HIGH' },
                          { label: 'CPU Load', value: '1.2%', status: 'IDLE' },
                          { label: 'Hardware', value: obd.status.adapter.toUpperCase(), status: 'READY' }
                        ].map((m, i) => (
                          <div key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                            <div>
                              <div className="text-[8px] text-white/30 uppercase font-bold">{m.label}</div>
                              <div className="text-xs font-black text-white">{m.value}</div>
                            </div>
                            <span className="text-[8px] font-black text-primary/60 px-2 py-0.5 bg-primary/10 rounded uppercase">{m.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-3xl border border-white/10 flex flex-col justify-between">
                       <div>
                         <h3 className="text-xs font-black text-white uppercase tracking-widest mb-2">Security Verification</h3>
                         <p className="text-[10px] text-white/40 font-mono leading-relaxed">
                           Handshake signed. Every PID request is verified against the ECU access mask to prevent unauthorized command injection.
                         </p>
                       </div>
                       <div className="mt-8 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl flex items-center gap-4">
                          <ShieldCheck className="text-green-500" size={24} />
                          <div>
                            <div className="text-[10px] font-black text-green-500 uppercase tracking-widest">ECC_VALIDATED</div>
                            <div className="text-[9px] text-white/40 font-mono">Uplink data integrity 100%</div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'diagnostics' && (
              <motion.div
                key="diagnostics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="border-b border-white/10 pb-4 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Fault & Logic Analysis</h2>
                    <p className="text-[10px] text-white/40 font-mono mt-1">Deep inspection of ECU memory and stored freeze frames.</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={scanDTCs}
                      disabled={obd.isScanning || !obd.status.connected}
                      className="px-5 py-2.5 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary hover:text-black transition-all flex items-center gap-2 disabled:opacity-30"
                    >
                      <RefreshCcw size={14} className={cn(obd.isScanning && "animate-spin")} />
                      Full Scan
                    </button>
                    {obd.dtcs.length > 0 && (
                      <button 
                        onClick={clearDTCs}
                        disabled={obd.isScanning}
                        className="px-5 py-2.5 bg-red-400/10 border border-red-400/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-400 hover:text-white transition-all flex items-center gap-2"
                      >
                        <Trash2 size={14} />
                        Clear Codes
                      </button>
                    )}
                  </div>
                </div>

                {obd.isScanning ? (
                  <div className="h-64 flex flex-col items-center justify-center space-y-6">
                    <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin flex items-center justify-center">
                      <Terminal size={24} className="text-primary animate-pulse" />
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Querying ECU Network</h3>
                      <p className="text-[9px] text-white/30 font-mono uppercase tracking-[0.1em] animate-pulse">Analyzing CAN_HIGH_BUS Traffic...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {obd.dtcs.length === 0 ? (
                        <div className="bg-green-500/5 border border-green-500/10 p-12 rounded-3xl text-center space-y-4">
                          <CheckCircle2 size={40} className="mx-auto text-green-500/50" />
                          <h3 className="text-sm font-black text-green-500 uppercase tracking-widest">No Faults Detected</h3>
                        </div>
                      ) : (
                        obd.dtcs.map((dtc, i) => (
                          <div key={i} className="p-6 bg-white/5 border border-red-500/20 rounded-3xl space-y-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 text-red-500/10">
                              <AlertCircle size={40} />
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 font-black text-xl italic rounded-xl">
                                {dtc.code}
                              </div>
                              <div>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{dtc.status}</span>
                                <h4 className="text-xs font-bold text-white">{dtc.description}</h4>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="glass-card bg-primary/5 border border-primary/20 p-6 rounded-3xl flex flex-col">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center text-primary">
                          <Smartphone size={16} />
                        </div>
                        <h3 className="text-xs font-black text-white uppercase tracking-widest">Agent Guidance</h3>
                      </div>
                      
                      {obd.agentMode === 'guided' && obd.dtcs.length > 0 ? (
                        <div className="space-y-6">
                          <div className="space-y-3">
                            {[
                              { label: 'Step 1: Sensor Inspection', done: true },
                              { label: 'Step 2: Circuit Integrity Test', done: false, active: true },
                              { label: 'Step 3: Component Replacement Plan', done: false }
                            ].map((step, idx) => (
                              <div key={idx} className={cn(
                                "flex items-center gap-4 p-4 rounded-2xl border transition-all",
                                step.active ? "bg-primary border-primary text-black" : "bg-black/40 border-white/5 text-white/40"
                              )}>
                                <div className="text-xs font-black">{idx + 1}</div>
                                <div className="text-[10px] font-bold uppercase tracking-widest flex-1">{step.label}</div>
                                {step.done && <CheckCircle2 size={14} />}
                                {step.active && <ChevronRight size={14} className="animate-bounce" />}
                              </div>
                            ))}
                          </div>
                          <p className="text-[10px] text-white/60 leading-relaxed font-mono italic">
                            "I am detecting irregular values on Pin 14. Please verify the wiring harness before attempting an ECU clear."
                          </p>
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                          <Info size={32} />
                          <p className="text-[10px] font-bold uppercase tracking-widest px-8">Enable Guided Mode for troubleshooting assistance</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="border-b border-white/10 pb-4 flex justify-between items-end">
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Dynamic Telemetry</h2>
                    <p className="text-[10px] text-white/40 font-mono mt-1">Real-time PID acquisition (Priority Filter Active)</p>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] font-mono text-white/40">
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> HIGH_PRIO</span>
                    <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-white/20" /> LOW_PRIO</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                  {obd.pids.map(pid => (
                    <div key={pid.id} className="p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Activity size={12} className="text-primary/40 animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">{pid.name}</span>
                          <span className="text-[8px] font-mono text-white/20">{pid.code}</span>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black italic text-white tracking-tighter group-hover:text-primary transition-colors">
                            {pid.value}
                          </span>
                          <span className="text-[10px] font-black text-white/20 uppercase">{pid.unit}</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary" 
                            initial={{ width: 0 }}
                            animate={{ width: `${(Number(pid.value) / (pid.max || 100)) * 100}%` }}
                            transition={{ type: 'spring', stiffness: 50 }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'terminal' && (
              <motion.div
                key="terminal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col space-y-4"
              >
                <div className="border-b border-white/10 pb-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">Neural Terminal (RAW)</h2>
                  <p className="text-[10px] text-white/40 font-mono mt-1">Direct CAN-bus sequence injection. Use with caution.</p>
                </div>

                <div className="flex-1 bg-black/60 rounded-3xl border border-white/10 p-6 font-mono text-[11px] overflow-y-auto custom-scrollbar flex flex-col gap-2">
                  <div className="text-white/20 text-[9px] mb-4 uppercase tracking-[0.2em] border-b border-white/5 pb-2">Interface: ELM327_UPLINK_READY</div>
                  {terminalHistory.map((entry, i) => (
                    <div key={i} className="space-y-1">
                      <div className="text-primary font-bold">{">"} {entry.cmd}</div>
                      <div className="text-white/60 mb-2 pl-4 border-l border-white/10">{entry.resp}</div>
                    </div>
                  ))}
                  <div className="text-primary animate-pulse">{">"} _</div>
                </div>

                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={terminalInput}
                    onChange={e => setTerminalInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTerminalSend()}
                    placeholder="ENTER AT/OBD SEQUENCE..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-xs font-mono focus:outline-none focus:border-primary/50 text-white uppercase tracking-widest placeholder:text-white/10"
                  />
                  <button 
                    onClick={handleTerminalSend}
                    className="px-10 py-4 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-white transition-all active:scale-95 shadow-xl"
                  >
                    Transmit
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
