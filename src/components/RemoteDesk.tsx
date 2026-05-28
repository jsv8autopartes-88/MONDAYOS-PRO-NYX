import { useAppStore } from '../store/appStore';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  MousePointer2, 
  Keyboard, 
  Wifi, 
  Lock, 
  Maximize2, 
  Settings, 
  Power, 
  RefreshCw,
  Layout,
  Terminal as TerminalIcon,
  Activity,
  Zap,
  ShieldAlert,
  Folder,
  FileText,
  ChevronRight,
  Check,
  Play,
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  Search,
  Briefcase,
  ShoppingCart,
  MessageSquare,
  Plus,
  CornerDownRight,
  Eye,
  Settings2,
  CloudLightning,
  ShieldCheck,
  Sun,
  Moon,
  Database,
  Trash2,
  Server,
  Network,
  Bell,
  Cpu
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';

export const RemoteDesk: React.FC = () => {
  const { addLog, agents, files: storeFiles, addFile, deleteFile, obd } = useAppStore();
  const { theme, updateTheme, addNotification } = useDashboard();
  
  // Tabs: live, setup, nyx
  const [activeTab, setActiveTab] = useState<'live' | 'setup' | 'nyx'>('live');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [latency, setLatency] = useState(24);
  const [bitrate, setBitrate] = useState(1200);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  
  // Theme check
  const isLight = theme.background === '#f5f6f8';

  const [mousePos, setMousePos] = useState({ x: 120, y: 150 });
  const [mouseClickLog, setMouseClickLog] = useState<{x: number, y: number, time: string}[]>([]);
  const [terminalLines, setTerminalLines] = useState<string[]>([
    'SYSTEM_BRIDGE_V2: Initializing virtual shell connection...',
    'SHELL: Connected to Windows PC core'
  ]);
  const [cliInput, setCliInput] = useState('');
  
  // Mock File Directory
  const [currentPath, setCurrentPath] = useState('C:\\Users\\Admin\\Desktop');
  const [mockFiles, setMockFiles] = useState([
    { name: 'nyx_agent.js', size: '12 KB', type: 'script', modified: '2026-05-27 12:30' },
    { name: 'inventarios_autopartes.xlsx', size: '4.2 MB', type: 'spreadsheet', modified: '2026-05-27 18:42' },
    { name: 'cotizaciones_pendientes.pdf', size: '920 KB', type: 'document', modified: '2026-05-27 19:10' },
    { name: 'mercadolibre_token.json', size: '1.2 KB', type: 'config', modified: '2026-05-25 09:12' },
    { name: 'ventas_mes.csv', size: '120 KB', type: 'data', modified: '2026-05-26 21:00' }
  ]);

  // Calibration checklist representing the hardware/software wizard steps
  const [setupStep, setSetupStep] = useState<1 | 2 | 3 | 4>(1);
  const [wizardChecklist, setWizardChecklist] = useState({
    daemonDownloaded: false,
    daemonRunning: false,
    obdPaired: false,
    canTelemetryCalibrated: false,
    firebaseTokenSync: false,
    nyxBrainMapped: false
  });

  // Automatically sync with real active OBD connection state from the master store to bypass manual simulation
  useEffect(() => {
    if (obd.status.connected) {
      setWizardChecklist(prev => ({
        ...prev,
        daemonDownloaded: true,
        daemonRunning: true,
        obdPaired: true,
        canTelemetryCalibrated: true,
        firebaseTokenSync: true
      }));
    }
  }, [obd.status.connected]);

  // NYX Personal AI Agent Workspace, inventory and proactive messaging simulations
  const [nyxMood, setNyxMood] = useState<'focused' | 'proactive' | 'observing' | 'syncing'>('proactive');
  const [salesChannels, setSalesChannels] = useState([
    { platform: 'MercadoLibre', user: 'Carlos M.', product: 'Faro Derecho Civic 2012', msg: 'Aún lo tienes disponible? Viene con focos?', time: 'Hace 2 min', status: 'unanswered', replyDraft: 'Hola Carlos! Sí, está disponible para envío inmediato. Ya incluye los bulbos halógenos estándar de fábrica listos para conectar. Te adjunto link!' },
    { platform: 'WhatsApp Business', user: 'Taller Mendoza', product: 'Par Amortiguadores Sentra 2017', msg: 'Me urge cotizar amortiguadores traseros para un Sentra 2017, tendrás en marca KYB?', time: 'Hace 5 min', status: 'unanswered', replyDraft: 'Hola Mendoza! Sí tenemos marca KYB en stock local con código de parte #343431. Precio especial taller: $85 USD por el par con envío gratis local hoy mismo. ¿Te levanto el pedido?' },
    { platform: 'Amazon Auto', user: 'Ana G.', product: 'Filtro de Aire Alto Flujo K&N', msg: 'Facturan la compra? El envío llega mañana?', time: 'Hace 11 min', status: 'unanswered', replyDraft: 'Hola Ana, claro que sí! Facturamos de inmediato al confirmar tus datos de Constancia CSF. Si compras antes de las 6:30 PM, Amazon Prime lo entrega mañana mismo en tu domicilio.' }
  ]);

  const [digitalInventory, setDigitalInventory] = useState([
    { partNo: 'ML-88741-CV', name: 'Faro Izquierdo Honda Civic 12/15', stock: 6, location: 'Rack A-Tier 2', price: '$120 USD' },
    { partNo: 'KYB-343431-S', name: 'Amortiguadores Sentra Traseros Pair', stock: 12, location: 'Rack D-Tier 1', price: '$85 USD' },
    { partNo: 'KN-332304-F', name: 'Filtro Aire Alto Flujo K&N', stock: 2, location: 'Rack B-Tier 4', price: '$65 USD', lowStock: true }
  ]);

  const [activityLogs, setActivityLogs] = useState([
    { id: 'act-1', ts: '19:02', title: 'Registro Autónomo', type: 'info', details: 'Bitácora NYX: Indexados 3 nuevos mensajes de canales de venta.' },
    { id: 'act-2', ts: '19:05', title: 'Autopilot Sync', type: 'success', details: 'Sincronizado archivo de inventarios con Base de Datos Cloud Run.' },
    { id: 'act-3', ts: '19:12', title: 'Escáner de Cotizaciones', type: 'system', details: 'Guardado reporte preliminar de cotizaciones de refacciones en C:\\NYX_Data' }
  ]);

  const connectToAgent = (agentId: string) => {
    setIsConnecting(true);
    addLog('REMOTE_BRIDGE', `Establishing encrypted VNC peer-link for node: ${agentId}`);
    
    setTimeout(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setStreamUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000');
      
      const updatedLines = [
        ...terminalLines,
        `[HANDSHAKE_COMPLETE] Cryptographic certificate accepted.`,
        `[VNC_SESSION] Screen resolution synchronized (1920x1080@60Hz)`,
        `[SYSTEM] Windows shell ready. Authenticated as: Administrator@NYX-CORE-PC`
      ];
      setTerminalLines(updatedLines);

      addNotification({
        title: 'REMOTE_TUNNEL_ESTABLISHED',
        message: 'low-latency secure mirror connection authenticated via local daemon.',
        type: 'success',
        featureId: 'REMOTE_BRIDGE'
      });
    }, 1500);
  };

  const disconnect = () => {
    setIsConnected(false);
    setStreamUrl(null);
    addLog('REMOTE_DISCONNECT', 'Bridge session terminated by user request.');
    setTerminalLines([
      'SYSTEM_BRIDGE_V2: Initializing virtual shell connection...',
      'SHELL: Disconnected.'
    ]);
  };

  const handleViewportClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isConnected) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1920);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 1080);
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    
    const clickTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setMouseClickLog(prev => [{x, y, time: clickTime}, ...prev].slice(0, 10));
    
    // Add command simulation
    setTerminalLines(prev => [...prev, `[CMD_INJECT_CLICK] Mouse coord dispatch: X:${x} Y:${y} px`]);
    addLog('VNC_MOUSE_INPUT', `Injected click gesture coordinates: X:${x} Y:${y}`);
  };

  const executeCliCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim() || !isConnected) return;
    
    const inputCmd = cliInput.trim();
    let response = '';

    if (inputCmd === 'help') {
      response = 'Available bridging tools:\n- get-inventory: reads local PC inventarios_autopartes.xlsx\n- update-channel: sync active sales channels\n- systeminfo: retrieves OS metadata\n- cat rml_token: extracts security token';
    } else if (inputCmd === 'get-inventory') {
      response = 'Reading local Excel...\n[OK] Found 3 categories, 20 items. SYNC: 100% complete.';
    } else if (inputCmd === 'systeminfo') {
      response = 'OS: Windows 11 Pro v23H2 (x64)\nNode Host: NYX-GATEWAY-CORE\nCPU: AMD Ryzen 7 5800X @ 3.8GHz\nMemory: 32GB DDR4\nUptime: 2 days, 14 hours';
    } else if (inputCmd === 'update-channel') {
      response = 'Interrogating platform hooks...\nMercadoLibre Hook: ACTIVE\nWhatsApp Hook: SYNCED\nAmazon Hook: ENCRYPTED';
    } else {
      response = `Command executed: '${inputCmd}'. Result: success (simulated code pipeline returned 0)`;
    }

    setTerminalLines(prev => [...prev, `Administrator@NYX-CORE-PC:~$ ${inputCmd}`, response]);
    setCliInput('');
    addLog('VNC_CLI_EXEC', `Command disatched: ${inputCmd}`);
  };

  // Autopilot action triggering mouse trace + keys
  const triggerAutopilotByNyx = (index: number, actionName: string, replyContent: string) => {
    addNotification({
      title: 'NYX_AUTOPILOT_ENGAGED',
      message: `NYX AI is taking manual PC control to process client request...`,
      type: 'info',
      featureId: 'AUTOPILOT_CONTROLLER'
    });

    // Animate mouse across the screen mock
    let i = 0;
    const interval = setInterval(() => {
      setMousePos({ x: 100 + i * 25, y: 150 + Math.sin(i) * 50 });
      i++;
      if (i > 10) {
        clearInterval(interval);
        // Process complete
        setSalesChannels(prev => {
          const list = [...prev];
          list[index].status = 'answered';
          return list;
        });

        // Add to historical bitacora
        const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setActivityLogs(prev => [
          {
            id: `act-${Date.now()}`,
            ts,
            title: 'IA Control Directo',
            type: 'success',
            details: `NYX procesó respuesta en ${salesChannels[index].platform} de ${salesChannels[index].user} para el artículo "${salesChannels[index].product}".`
          },
          ...prev
        ]);

        addNotification({
          title: 'VENTA_GESTIONADA',
          message: `Respuesta automatizada enviada con éxito a ${salesChannels[index].user}.`,
          type: 'success',
          featureId: 'REMOTE_BRIDGE'
        });

        setTerminalLines(prev => [
          ...prev,
          `[NYX_AUTOPILOT] Simulated system execution: Auto-Open File inventories`,
          `[NYX_AUTOPILOT] Injected keystroke characters into client browser`,
          `[NYX_AUTOPILOT] Dispatched outbound WhatsApp/API socket payload`
        ]);
        
        addLog('NYX_AUTOPILOT_SUCCESS', `Successfully auto-replied and recorded workflow step.`);
      }
    }, 150);
  };

  return (
    <div className={cn(
      "flex-1 flex flex-col p-6 gap-6 h-full overflow-hidden transition-all duration-300",
      isLight ? "bg-[#f5f6f8] text-slate-800" : "bg-[#08080a] text-white"
    )}>
      {/* GLOW BACKGROUND EFFECT FOR CRYSTAL BLUR */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-80 h-80 bg-cyan-400/5 rounded-full blur-[120px] pointer-events-none" />

      {/* HEADER SECTION */}
      <div className={cn(
        "flex flex-col md:flex-row items-start md:items-center justify-between p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden shrink-0",
        isLight 
          ? "bg-white/40 border-slate-200/80 shadow-md shadow-slate-200/10 backdrop-blur-2xl" 
          : "bg-[#14151a]/90 border-white/5 shadow-2xl backdrop-blur-2xl"
      )}>
        {/* Soft interactive white backlight element */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center gap-4 relative z-10">
          <div className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-inner",
            isLight ? "bg-slate-100 text-slate-700" : "bg-white/5 text-primary"
          )}>
            <Monitor size={22} className="stroke-[1.5]" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tighter uppercase leading-none flex items-center gap-2">
              REMOTE_<span className="text-primary font-black italic">DESK_V2_PRO</span>
            </h1>
            <p className={cn("text-[10px] font-mono tracking-widest mt-1", isLight ? "text-slate-400" : "text-white/40")}>
              P2P WINDOWS BRIDGE DAEMON & CO-PILOT ADVISOR NYX
            </p>
          </div>
        </div>

        {/* TABS CONTROL */}
        <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0 relative z-10">
          <div className={cn(
            "p-1 rounded-2xl border flex items-center gap-1",
            isLight ? "bg-slate-200/60 border-slate-300" : "bg-black/50 border-white/5"
          )}>
            {[
              { id: 'live', label: 'LIVE MIRROR', icon: Monitor },
              { id: 'setup', label: 'SETUP WIZARD', icon: Settings2 },
              { id: 'nyx', label: 'NYX ASSISTANT', icon: Sparkles }
            ].map(tb => (
              <button
                key={tb.id}
                onClick={() => setActiveTab(tb.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer active:scale-95 active:shadow-[0_0_15px_rgba(255,255,255,0.7)] outline-none border border-transparent",
                  activeTab === tb.id
                    ? isLight 
                      ? "bg-white text-slate-800 shadow-md shadow-slate-300/40 border-slate-200" 
                      : "bg-primary text-black font-extrabold shadow-[0_0_20px_rgba(212,255,0,0.25)]"
                    : isLight ? "text-slate-500 hover:text-slate-800" : "text-white/40 hover:text-white"
                )}
              >
                <tb.icon size={13} className="stroke-[2]" />
                {tb.label}
              </button>
            ))}
          </div>

          {/* Quick theme toggler */}
          <button 
            onClick={() => {
              if (isLight) {
                updateTheme({ background: '#0a0a0c', cardBg: '#151619' });
              } else {
                updateTheme({ background: '#f5f6f8', cardBg: 'rgba(255, 255, 255, 0.4)' });
              }
            }}
            className={cn(
              "p-3 rounded-2xl border transition-all active:scale-95 flex items-center justify-center cursor-pointer outline-none",
              isLight 
                ? "bg-white border-slate-300 text-slate-700 shadow-sm hover:bg-slate-50" 
                : "bg-white/5 border-white/10 text-white hover:bg-white/10"
            )}
            title="Toggle App Theme"
          >
            {isLight ? <Moon size={14} className="stroke-[1.5]" /> : <Sun size={14} className="stroke-[1.5]" />}
          </button>
        </div>
      </div>

      {/* COMPILATION & LIVE PIPELINES CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0 overflow-hidden">
        
        {activeTab === 'live' && (
          <>
            {/* VIEWPORT CONTROLS */}
            <div className="flex-[5] flex flex-col gap-6 min-h-0 overflow-hidden">
              <div className={cn(
                "flex-1 border rounded-[2.5rem] relative overflow-hidden flex flex-col shadow-2xl transition-all duration-300",
                isLight ? "bg-white border-slate-200/80 shadow-slate-200/10" : "bg-[#0d0d11] border-white/5"
              )}>
                {/* Viewport header connection indicators */}
                <div className={cn(
                  "p-4 border-b flex items-center justify-between shrink-0",
                  isLight ? "bg-slate-50/50 border-slate-200" : "bg-white/[0.01] border-white/5"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full", isConnected ? "bg-green-500 animate-pulse" : "bg-red-500 animate-pulse")} />
                    <span className="text-[10px] font-mono uppercase tracking-widest font-black">
                      {isConnected ? 'ENCRYPTED_UPLINK_STABLE (PC MIRROR)' : 'UPLINK_STANDBY'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select 
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      value={selectedAgent || ''}
                      className={cn(
                        "rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-wider outline-none border transition-colors cursor-pointer",
                        isLight 
                          ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200" 
                          : "bg-black/50 border-white/10 text-white/80 hover:border-primary/20"
                      )}
                    >
                      <option value="">SELECT WIN NODE</option>
                      {agents.length > 0 ? (
                        agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.status})</option>)
                      ) : (
                        <option value="nyx-pc">NYX_CORE_PC (Simulated Node)</option>
                      )}
                    </select>

                    {isConnected ? (
                      <button 
                        onClick={disconnect}
                        className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <button 
                        onClick={() => connectToAgent(selectedAgent || 'nyx-pc')}
                        className="px-4 py-2 bg-primary text-black hover:bg-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95"
                      >
                        Launch Tunnel
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated VNC Remote Viewport */}
                <div 
                  onClick={handleViewportClick}
                  className="flex-1 relative bg-black overflow-hidden cursor-crosshair flex items-center justify-center"
                  style={{ minHeight: '300px' }}
                >
                  {isConnected && streamUrl ? (
                    <>
                      <img 
                        src={streamUrl} 
                        className="absolute inset-0 w-full h-full object-cover opacity-80 transition-opacity filter saturate-[0.85]"
                        alt="Simulated Desktop"
                      />
                      
                      {/* VNC Ambient Scanlines */}
                      <div className="absolute inset-0 bg-scanlines mix-blend-overlay pointer-events-none opacity-15" />
                      
                      {/* Interactive Cursor Pointer */}
                      <motion.div 
                        className="absolute text-primary pointer-events-none filter drop-shadow-[0_0_12px_rgba(212,255,0,0.8)]"
                        animate={{ x: mousePos.x, y: mousePos.y }}
                        transition={{ type: "spring", damping: 25, stiffness: 180 }}
                      >
                        <MousePointer2 size={24} className="fill-current" />
                        <span className="bg-black/80 text-[8px] text-primary px-1.5 py-0.5 rounded ml-4 font-mono font-black select-none uppercase border border-primary/20 shadow-lg">
                          X:{Math.round(mousePos.x * 3.4)} Y:{Math.round(mousePos.y * 3.4)}
                        </span>
                      </motion.div>

                      {/* Video resolution tag UI element */}
                      <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-cyan-400 px-3 py-1.5 rounded-xl uppercase flex items-center gap-2">
                        <Activity size={10} className="animate-pulse" />
                        Live Frame Capturer (60fps)
                      </div>

                      <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 text-[9px] font-mono text-primary px-3 py-1.5 rounded-xl uppercase flex items-center gap-2">
                        <ShieldCheck size={10} />
                        Local Daemon Tunnel: Active
                      </div>

                      {/* Display click tracking markers on mirror screen */}
                      {mouseClickLog.slice(0, 1).map((click, i) => (
                        <div 
                          key={i}
                          style={{ left: mousePos.x - 10, top: mousePos.y - 10 }}
                          className="absolute w-5 h-5 border-2 border-primary rounded-full animate-ping pointer-events-none"
                        />
                      ))}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
                      <div className="w-20 h-20 bg-white/[0.02] border border-white/10 rounded-[2rem] flex items-center justify-center text-white/20 animate-pulse">
                        <Monitor size={44} className="stroke-[1.2]" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs uppercase tracking-[0.25em] font-black text-white/40">Remote Session Offline</p>
                        <p className="text-[10px] font-mono text-white/20 uppercase">SELECT NODE AND CLICK "LAUNCH TUNNEL" TO ESTABLISH COMPANION PORT BRIDGE</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Host telemetry indicators below viewport */}
                {isConnected && (
                  <div className={cn(
                    "p-4 border-t grid grid-cols-2 sm:grid-cols-4 gap-4 text-center shrink-0",
                    isLight ? "bg-slate-50/50 border-slate-200 text-slate-800" : "bg-white/[0.01] border-white/5"
                  )}>
                    <div>
                      <div className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest">TRANSMISSION LINK</div>
                      <div className="text-sm font-black font-mono mt-0.5 text-primary flex items-center justify-center gap-1">
                        <Wifi size={13} />
                        CRYPT_P2P
                      </div>
                    </div>
                    <div>
                      <div className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest">AVERAGE LATENCY</div>
                      <div className="text-sm font-black font-mono mt-0.5 text-cyan-400">22.4 ms</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest">VIDEO CODES</div>
                      <div className="text-sm font-black font-mono mt-0.5 text-pink-500">H.265 / VULKAN</div>
                    </div>
                    <div>
                      <div className="text-[8px] text-zinc-500 uppercase font-black font-mono tracking-widest">BRIDGE PROCESS</div>
                      <div className="text-sm font-black font-mono mt-0.5 text-green-500 uppercase">dae_sync_js</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SIDEBAR TERMINAL & FILE DIRECTORY WINDOWS CODES */}
            <div className="flex-[3] flex flex-col gap-6 min-h-0 overflow-hidden">
              {/* VIRTUAL TERMINAL */}
              <div className={cn(
                "flex-1 border rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-300",
                isLight ? "bg-white border-slate-200" : "bg-[#14151a]/40 border-white/5"
              )}>
                <div className={cn(
                  "p-4 border-b flex items-center justify-between shrink-0",
                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
                )}>
                  <span className="text-[9px] font-black uppercase tracking-widest font-mono">REMOTE COMMAND EXEC shell</span>
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                </div>

                <div 
                  className="flex-1 p-6 font-mono text-[10px] space-y-1.5 overflow-y-auto custom-scrollbar"
                  style={{ backgroundColor: '#070709', color: '#a3e635' }}
                >
                  {terminalLines.map((line, lIdx) => (
                    <div key={lIdx} className="leading-relaxed whitespace-pre-wrap break-all">
                      {line.startsWith('A') || line.startsWith('[') ? (
                        <span className="text-white/60">{line}</span>
                      ) : line.startsWith('SYSTEM') ? (
                        <span className="text-cyan-400 font-bold">{line}</span>
                      ) : (
                        <span>{line}</span>
                      )}
                    </div>
                  ))}
                  {!isConnected && (
                    <div className="text-white/20 italic animate-pulse">[Connection standby. Execute tunnel handshake to initialize terminal shell]</div>
                  )}
                </div>

                <form onSubmit={executeCliCommand} className="p-3 bg-black border-t border-white/5 flex gap-2">
                  <span className="text-primary font-mono text-[11px] select-none font-bold">~$</span>
                  <input 
                    type="text"
                    value={cliInput}
                    onChange={(e) => setCliInput(e.target.value)}
                    placeholder={isConnected ? "Escribe 'help' para comandos, presiona Enter..." : 'VNC Offline'} 
                    disabled={!isConnected}
                    className="flex-1 bg-transparent border-none outline-none text-[10px] font-mono text-white placeholder-zinc-700"
                  />
                </form>
              </div>

              {/* WINDOWS DIRECTORY FILE MANAGER PANEL */}
              <div className={cn(
                "flex-1 border rounded-[2.5rem] flex flex-col overflow-hidden transition-all duration-300",
                isLight ? "bg-white border-slate-200" : "bg-[#14151a]/40 border-white/5"
              )}>
                <div className={cn(
                  "p-4 border-b flex items-center justify-between shrink-0",
                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.01] border-white/5"
                )}>
                  <div className="flex items-center gap-2">
                    <Folder size={14} className="text-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest font-mono">FILE_MANAGER_DAEMON</span>
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">{mockFiles.length} FILES</span>
                </div>

                <div className={cn(
                  "p-3 border-b flex items-center justify-between text-[11px] font-mono shrink-0",
                  isLight ? "bg-slate-50 border-slate-200 text-slate-700" : "bg-black/30 border-white/5 text-zinc-400"
                )}>
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <span className="text-zinc-500 select-none">&gt;</span>
                    <span className="truncate">{currentPath}</span>
                  </div>
                  <button 
                    onClick={() => {
                      if (!isConnected) return;
                      addNotification({
                        title: 'FILES_RE_INDEXED',
                        message: 'Scanning directories via P2P link...',
                        type: 'info',
                        featureId: 'REMOTE_BRIDGE'
                      });
                    }}
                    disabled={!isConnected}
                    className="p-1 hover:bg-white/5 rounded text-primary transition-all disabled:opacity-35"
                  >
                    <RefreshCw size={11} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1">
                  {mockFiles.map((f, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-2.5 rounded-xl border flex items-center justify-between text-xs hover:scale-[0.99] transition-all cursor-pointer group active:scale-95 active:shadow-[0_0_15px_rgba(255,255,255,0.7)] outline-none relative",
                        isLight 
                          ? "bg-slate-50/50 border-slate-100 hover:bg-slate-100 hover:border-slate-200" 
                          : "bg-white/[0.01] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                      )}
                    >
                      {/* Active click decoration */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="flex items-center gap-3 relative z-10 truncate mr-2">
                        <FileText size={16} className="text-amber-500 stroke-[1.5]" />
                        <div className="truncate">
                          <h4 className="font-bold truncate text-[11px] uppercase tracking-wide">{f.name}</h4>
                          <span className="text-[9px] text-zinc-500 font-mono italic">{f.size} — {f.modified}</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (!isConnected) return;
                          
                          // Handle simulated local database registration/file creation
                          const fileTypeMapping: Record<string, 'script' | 'md' | 'json' | 'svg'> = {
                            'script': 'script',
                            'config': 'json',
                            'spreadsheet': 'json',
                            'document': 'md',
                            'data': 'json'
                          };

                          addFile({
                            name: f.name,
                            content: `// Dynamic Bridge Sync of file: \n// Original name: ${f.name}\n// Local File Size: ${f.size}\n// Timestamp synced: ${new Date().toISOString()}\n\nconst content_payload = "Encrypted PC Data Payload";`,
                            type: fileTypeMapping[f.type] || 'md'
                          });

                          addNotification({
                            title: 'DOCK_FILE_DOWNLOADED',
                            message: `Decoded file "${f.name}" registered to Workspace state successfully.`,
                            type: 'success',
                            featureId: 'REMOTE_BRIDGE'
                          });
                        }}
                        disabled={!isConnected}
                        className={cn(
                          "px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg border transition-all pointer-events-auto relative z-20 shrink-0",
                          isLight 
                            ? "bg-white border-slate-300 hover:bg-slate-200 text-slate-700" 
                            : "bg-white/5 border-white/10 text-white hover:border-primary/40 hover:text-primary"
                        )}
                        title="Download file to dashboard environment"
                      >
                        SYNC WORKSPACE
                      </button>
                    </div>
                  ))}
                  
                  {/* Option to create a sync file */}
                  {isConnected && (
                    <button
                      onClick={() => {
                        const newName = prompt('Nombre del nuevo archivo simulado en Windows Desktop:');
                        if (!newName) return;
                        setMockFiles(prev => [
                          ...prev,
                          {
                            name: newName.toLowerCase().endsWith('.xlsx') || newName.toLowerCase().endsWith('.pdf') ? newName : `${newName}.txt`,
                            size: '1.5 KB',
                            type: 'document',
                            modified: new Date().toISOString().replace('T', ' ').substring(0, 16)
                          }
                        ]);
                        addNotification({
                          title: 'MOCK_PC_FILE_CREATED',
                          message: `File created directly inside host Windows File System simulation.`,
                          type: 'success',
                          featureId: 'REMOTE_BRIDGE'
                        });
                      }}
                      className="w-full mt-2 py-2 border-2 border-dashed border-zinc-700 hover:border-primary rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-primary transition-all cursor-pointer"
                    >
                      <Plus size={12} />
                      Crear archivo en Escritorio Windows
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SETUP WIZARD AND DIRECT CALIBRATOR MODULE */}
        {activeTab === 'setup' && (
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-y-auto custom-scrollbar">
            {/* Calibration details */}
            <div className="flex-[3] flex flex-col gap-6">
              <div className={cn(
                "p-8 border rounded-[2.5rem] space-y-4 transition-all duration-300 relative overflow-hidden",
                isLight 
                  ? "bg-white border-slate-200 shadow-md shadow-slate-200/10" 
                  : "bg-[#14151a]/90 border-white/5 shadow-2xl"
              )}>
                {/* Visual backlight aura for setup panels */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Cpu size={18} />
                  </div>
                  <h3 className="text-base font-black uppercase tracking-widest">
                    Paso {setupStep} de 4: {
                      setupStep === 1 ? 'Instalar Daemon Local en Windows' :
                      setupStep === 2 ? 'Calibración & Enlace OBD CAN' :
                      setupStep === 3 ? 'Sincronizar Cloud Handshake Token' :
                      'Inicializar Contexto de IA NYX'
                    }
                  </h3>
                </div>

                <p className={cn("text-xs leading-relaxed font-mono", isLight ? "text-slate-600" : "text-white/50")}>
                  {setupStep === 1 && 'Para comenzar el control remoto y auditoría de archivos, debes lanzar el agente unificado en la PC Windows. El instalador descargará las librerías nativas compatibles con tu procesador Intel/AMD.'}
                  {setupStep === 2 && 'Vincular el módulo OBD transceptor con la centralita del coche. NYX utilizará la telemetría CAN-bus para contrastar velocidades, revoluciones de motor, rendimiento y consumos en simultáneo.'}
                  {setupStep === 3 && 'Almacenamiento e inmunidad a desconexiones. El handshake por Firebase Firestore garantiza que los comandos disparados desde la tablet o móvil Android lleguen a la PC en menos de 50ms.'}
                  {setupStep === 4 && 'La unidad proactiva de IA requiere indexar tus canales de venta (WhatsApp/MercadoLibre) y tus inventarios guardados localmente para asistirte y cotizar de inmediato.'}
                </p>

                {/* Sub configuration options for steps */}
                {setupStep === 1 && (
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={cn("p-4 rounded-2xl border", isLight ? "bg-slate-50 border-slate-200" : "bg-black/30 border-white/5")}>
                        <div className="text-[10px] text-zinc-500 font-extrabold font-mono tracking-wider">APP DEPLOY NAME</div>
                        <div className="text-xs font-mono text-cyan-400 mt-1 uppercase font-black">nyx_bridge_v2.exe</div>
                      </div>
                      <div className={cn("p-4 rounded-2xl border", isLight ? "bg-slate-50 border-slate-200" : "bg-black/30 border-white/5")}>
                        <div className="text-[10px] text-zinc-500 font-extrabold font-mono tracking-wider">PROCESS SYSTEM SECURITY</div>
                        <div className="text-xs font-mono text-green-400 mt-1 uppercase font-bold">Admin UAC Manifest Enabled</div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => {
                          setWizardChecklist(prev => ({ ...prev, daemonDownloaded: true }));
                          addNotification({
                            title: 'DAEMON_DOWNLOAD_SIMULATED',
                            message: 'Simulated installer bundle downloaded to Windows host downloads folder.',
                            type: 'success',
                            featureId: 'REMOTE_BRIDGE'
                          });
                        }}
                        className={cn(
                          "flex-1 py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 active:shadow-[0_0_15px_rgba(255,255,255,0.7)] cursor-pointer outline-none",
                          wizardChecklist.daemonDownloaded 
                            ? "bg-green-500/10 border-green-500 text-green-400" 
                            : isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        {wizardChecklist.daemonDownloaded ? '✓ Installer Package Ready' : 'Descargar nyx_bridge_v2.msi'}
                      </button>

                      <button 
                        onClick={() => {
                          if (!wizardChecklist.daemonDownloaded) {
                            alert('Primero debes simular la descarga del instalador daemon.');
                            return;
                          }
                          setWizardChecklist(prev => ({ ...prev, daemonRunning: true }));
                          addNotification({
                            title: 'DAEMON_PROCESS_ONLINE',
                            message: 'Local background agent server connected on port 3389.',
                            type: 'success',
                            featureId: 'REMOTE_BRIDGE'
                          });
                        }}
                        className={cn(
                          "flex-grow py-4 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 active:shadow-[0_0_15px_rgba(255,255,255,0.7)] cursor-pointer outline-none",
                          wizardChecklist.daemonRunning 
                            ? "bg-green-500 text-black font-extrabold" 
                            : isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-white/5 border-white/10 hover:bg-white/10"
                        )}
                      >
                        {wizardChecklist.daemonRunning ? '✓ Daemon Online (Port 3389)' : 'Iniciar Ejecución Daemon'}
                      </button>
                    </div>
                  </div>
                )}

                {setupStep === 2 && (
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button 
                        onClick={() => {
                          setWizardChecklist(prev => ({ ...prev, obdPaired: true }));
                          addNotification({
                            title: 'OBD_PAIRED_CALIBRAR',
                            message: 'Transceptor ELM327 vinculado por canal serial.',
                            type: 'success',
                            featureId: 'REMOTE_BRIDGE'
                          });
                        }}
                        className={cn(
                          "p-4 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer outline-none active:scale-95",
                          wizardChecklist.obdPaired ? "bg-primary/10 border-primary text-primary" : "bg-black/30 border-white/5"
                        )}
                      >
                        <div>
                          <div className="text-[10px] text-zinc-500 font-extrabold tracking-wider">VÍNCULO FÍSICO OBD</div>
                          <div className="text-xs font-bold font-mono mt-0.5">{wizardChecklist.obdPaired ? '✓ ELM327 Bluetooth Pareado' : 'Pendiente Vincular'}</div>
                        </div>
                        <Plus size={14} />
                      </button>

                      <button 
                        onClick={() => {
                          if (!wizardChecklist.obdPaired) {
                            alert('Vincule primero el adaptador OBD.');
                            return;
                          }
                          setWizardChecklist(prev => ({ ...prev, canTelemetryCalibrated: true }));
                          addNotification({
                            title: 'TELEMETRÍA_COMPLETADA',
                            message: 'Ruta e interceptores de CAN calibrados correctamente.',
                            type: 'success',
                            featureId: 'REMOTE_BRIDGE'
                          });
                        }}
                        className={cn(
                          "p-4 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer outline-none active:scale-95",
                          wizardChecklist.canTelemetryCalibrated ? "bg-primary/10 border-primary text-primary" : "bg-black/30 border-white/5"
                        )}
                      >
                        <div>
                          <div className="text-[10px] text-zinc-500 font-extrabold tracking-wider">CALIBRACIÓN CAN-bus</div>
                          <div className="text-xs font-bold font-mono mt-0.5">{wizardChecklist.canTelemetryCalibrated ? '✓ Calibrado: RPM y Velocidad' : 'Pendiente Calibración'}</div>
                        </div>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {setupStep === 3 && (
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <p className="text-[11px] font-mono text-zinc-500 uppercase leading-relaxed">
                      El sistema utiliza un token único de autenticación de un solo uso de Firebase Auth para mapear de manera inequívoca tu celular iPad/Android con el PC puente Windows.
                    </p>

                    <div className="flex gap-2">
                      <div className={cn(
                        "flex-1 p-4 rounded-2xl border font-mono text-xs select-all break-all uppercase tracking-wider text-center font-bold",
                        isLight ? "bg-slate-100 border-slate-200 text-slate-800" : "bg-black/50 border-white/10 text-primary"
                      )}>
                        NYX-HANDSHAKE-UPLINK-KEY-55992x
                      </div>

                      <button
                        onClick={() => {
                          setWizardChecklist(prev => ({ ...prev, firebaseTokenSync: true }));
                          addNotification({
                            title: 'HANDSHAKE_TOKEN_VALIDO',
                            message: 'Enlace bidireccional registrado en base de datos.',
                            type: 'success',
                            featureId: 'REMOTE_BRIDGE',
                          });
                        }}
                        className="px-6 bg-[#22d3ee] hover:bg-white text-black font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 cursor-pointer outline-none transition-all"
                      >
                        {wizardChecklist.firebaseTokenSync ? '✓ Synced' : 'Sync Handshake'}
                      </button>
                    </div>
                  </div>
                )}

                {setupStep === 4 && (
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <p className="text-[11px] font-mono text-zinc-500 uppercase leading-relaxed">
                      Calibración final del cerebro proactivo de NYX. Esto le otorga permisos para auditar e indexar los archivos locales, cotizaciones XML y bases de datos guardadas en el disco duro.
                    </p>

                    <button
                      onClick={() => {
                        setWizardChecklist(prev => ({ ...prev, nyxBrainMapped: true }));
                        addNotification({
                          title: 'NYX_BRAIN_ACTIVATED',
                          message: 'Personal proactive context vector database indexed.',
                          type: 'success',
                          featureId: 'REMOTE_BRIDGE'
                        });
                      }}
                      className="w-full py-4 bg-primary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 cursor-pointer outline-none transition-all"
                    >
                      {wizardChecklist.nyxBrainMapped ? '✓ Cerebro NYX mapeado e indexado' : 'Indexar contexto comercial e Inventarios en Disco Duro'}
                    </button>
                  </div>
                )}

                {/* Steps Navigator */}
                <div className="flex justify-between items-center pt-6 border-t border-zinc-800 shrink-0">
                  <button 
                    disabled={setupStep === 1}
                    onClick={() => setSetupStep(prev => (prev - 1) as any)}
                    className={cn(
                      "px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer outline-none active:scale-95 border",
                      isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-white/5 border-white/10 text-white"
                    )}
                  >
                    Atrás
                  </button>

                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(idx => (
                      <div 
                        key={idx}
                        className={cn(
                          "w-5 h-1.5 rounded-full transition-colors",
                          setupStep === idx ? "bg-primary" : "bg-zinc-700"
                        )}
                      />
                    ))}
                  </div>

                  {setupStep < 4 ? (
                    <button 
                      onClick={() => setSetupStep(prev => (prev + 1) as any)}
                      className="px-6 py-3 bg-primary text-black font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 cursor-pointer outline-none transition-all"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        // Validate all completed
                        const isAllDone = Object.values(wizardChecklist).every(val => val === true);
                        if (!isAllDone) {
                          addNotification({
                            title: 'CALIBRACIÓN_INCOMPLETA',
                            message: 'Por favor complete todos los pasos del asistente de la lista lateral primero.',
                            type: 'warning',
                            featureId: 'REMOTE_BRIDGE'
                          });
                          return;
                        }

                        // Complete entire setup and turn on connection
                        setIsConnected(true);
                        setStreamUrl('https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2000');
                        setActiveTab('live');
                        addNotification({
                          title: 'DISPOSITIVOS_ESTABLECIDOS',
                          message: 'Calibración general completada. NYX y el puente de escritorio están conectados para control remoto.',
                          type: 'success',
                          featureId: 'REMOTE_BRIDGE'
                        });
                      }}
                      className="px-6 py-3 bg-green-500 text-black font-black uppercase tracking-widest text-[10px] rounded-2xl active:scale-95 cursor-pointer outline-none transition-all"
                    >
                      Finalizar Calibración
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Step Checklists Status on the side */}
            <div className="flex-1 flex flex-col gap-6">
              <div className={cn(
                "p-8 border rounded-[2.5rem] space-y-6 transition-all duration-300 relative overflow-hidden",
                isLight ? "bg-white border-slate-200" : "bg-[#14151a]/40 border-white/5"
              )}>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 block">Esm Setup Walkthrough Checklist</span>

                <div className="space-y-4">
                  {[
                    { key: 'daemonDownloaded', label: 'Daemon descargado en Windows' },
                    { key: 'daemonRunning', label: 'Proceso nyx_agent.js Online' },
                    { key: 'obdPaired', label: 'Adaptador Bluetooth OBD' },
                    { key: 'canTelemetryCalibrated', label: 'Calibrar telemetría CAN-bus' },
                    { key: 'firebaseTokenSync', label: 'Token de sincronización Cloud' },
                    { key: 'nyxBrainMapped', label: 'Indexar contexto analítico en PC' }
                  ].map(chk => {
                    const isDone = wizardChecklist[chk.key as keyof typeof wizardChecklist];
                    return (
                      <div 
                        key={chk.key}
                        className={cn(
                          "p-3 rounded-xl border flex items-center justify-between text-xs transition-all",
                          isDone 
                            ? isLight ? "bg-green-50/50 border-green-200 text-green-700" : "bg-green-500/10 border-green-500/20 text-green-400"
                            : isLight ? "bg-slate-50 border-slate-100 text-slate-400" : "bg-white/[0.01] border-white/5 text-white/30"
                        )}
                      >
                        <span className="font-bold uppercase tracking-wider">{chk.label}</span>
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center border",
                          isDone ? "border-green-500 bg-green-500/10 text-green-400" : "border-zinc-700 text-zinc-700"
                        )}>
                          {isDone ? <Check size={10} strokeWidth={3} /> : null}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setWizardChecklist({
                      daemonDownloaded: true,
                      daemonRunning: true,
                      obdPaired: true,
                      canTelemetryCalibrated: true,
                      firebaseTokenSync: true,
                      nyxBrainMapped: true
                    });
                    addNotification({
                      title: 'BYPASS_CONFIGURAR_RAPIDO',
                      message: 'Sincronizador acelerado activado. Todos los pasos están listos para simulación.',
                      type: 'success',
                      featureId: 'REMOTE_BRIDGE'
                    });
                  }}
                  className="w-full py-3.5 border-2 border-dashed border-red-500/30 hover:border-red-500 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase text-red-500 transition-all cursor-pointer outline-none active:scale-95"
                >
                  <ShieldCheck size={14} />
                  Bypass Total (Modo Admin)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NYX IA ASSISTANT ACTIVE WORKSPACE (CONTEXT BITÁCORA / SELLING CHANNELS / INVENTORIES / QUOTATIONS) */}
        {activeTab === 'nyx' && (
          <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0 overflow-y-auto custom-scrollbar">
            
            {/* Left Column: Proactive Notifications from sales channels + response drafts */}
            <div className="flex-[3] flex flex-col gap-6 min-h-0">
              <div className={cn(
                "p-8 border rounded-[2.5rem] flex flex-col transition-all duration-300 relative overflow-hidden",
                isLight ? "bg-white border-slate-200" : "bg-[#14151a]/40 border-white/5"
              )}>
                <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/5 blur-[80px] -mr-16 -mt-16 pointer-events-none" />

                <div className="flex items-center justify-between border-b pb-4 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-pink-500/10 text-pink-500 rounded-xl">
                      <Bell size={18} className="animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase tracking-widest">Canales de Venta & Mensajes Activos</h3>
                      <p className="text-[10px] text-zinc-500 font-mono tracking-wide">NOTIFICACIONES DE MERCADOLIBRE, AMAZON Y WHATSAPP BUSINESS</p>
                    </div>
                  </div>
                  <span className="text-[9px] bg-pink-500/20 text-pink-500 px-2 py-0.5 rounded-full font-black">
                    {salesChannels.filter(sc => sc.status === 'unanswered').length} NUEVOS
                  </span>
                </div>

                <div className="flex-1 p-2 space-y-4 pt-6 overflow-y-auto custom-scrollbar">
                  {salesChannels.map((sc, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group flex flex-col gap-4",
                        sc.status === 'answered'
                          ? "opacity-50 grayscale bg-zinc-900/[0.02] border-zinc-700/20"
                          : isLight 
                            ? "bg-slate-50 border-slate-200/80 hover:bg-slate-100/50" 
                            : "bg-[#14151a]/80 border-white/5 hover:border-white/10"
                      )}
                    >
                      {/* Active backlight reflection */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent pointer-events-none" />

                      <div className="flex items-start justify-between relative z-10 shrink-0">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[10px]",
                            sc.platform === 'MercadoLibre' ? "bg-amber-500/20 text-amber-500" :
                            sc.platform === 'WhatsApp Business' ? "bg-green-500/20 text-green-500" :
                            "bg-blue-500/20 text-blue-500"
                          )}>
                            {sc.platform[0]}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider">{sc.user}</h4>
                            <span className="text-[9px] font-mono text-zinc-500">{sc.platform} • {sc.time}</span>
                          </div>
                        </div>

                        {sc.status === 'unanswered' ? (
                          <span className="text-[9px] bg-red-500/20 text-red-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                            Esperando Respuesta
                          </span>
                        ) : (
                          <span className="text-[9px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                            Respondido por NYX ✓
                          </span>
                        )}
                      </div>

                      <div className={cn(
                        "p-3 rounded-xl font-mono text-xs italic border",
                        isLight ? "bg-white border-slate-200 text-slate-700" : "bg-black/40 border-white/5 text-zinc-300"
                      )}>
                        "{sc.msg}"
                      </div>

                      {sc.status === 'unanswered' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-secondary">
                            <Sparkles size={11} />
                            Propuesta de respuesta sugerida por IA NYX:
                          </div>
                          <p className={cn(
                            "text-xs font-mono p-3.5 rounded-xl border leading-relaxed",
                            isLight ? "bg-zinc-100/50 border-zinc-200 text-zinc-700" : "bg-primary/5 border-primary/10 text-white"
                          )}>
                            {sc.replyDraft}
                          </p>

                          <div className="flex gap-2 pt-2">
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(sc.replyDraft);
                                addNotification({
                                  title: 'DRAFT_COPIED',
                                  message: 'Borrador copiado al portapapeles.',
                                  type: 'info',
                                  featureId: 'REMOTE_BRIDGE',
                                });
                              }}
                              className={cn(
                                "py-2.5 px-4 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95",
                                isLight ? "bg-white hover:bg-slate-100 border-slate-300 text-slate-700" : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                              )}
                            >
                              Copiar Borrador
                            </button>

                            <button
                              onClick={() => triggerAutopilotByNyx(index, sc.product, sc.replyDraft)}
                              className="flex-1 py-2.5 px-6 bg-primary hover:bg-white text-black font-extrabold uppercase text-[9px] tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Zap size={12} />
                              ⚡ Autopilot Completo (NYX Control de PC + Enviar)
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Digital inventories & custom context workspace bitácora */}
            <div className="flex-1 flex flex-col gap-6 lg:max-w-md">
              {/* CURRENT DIGITAL INVENTORY */}
              <div className={cn(
                "p-8 border rounded-[2.5rem] space-y-4 transition-all duration-300 relative overflow-hidden",
                isLight ? "bg-white border-slate-200" : "bg-[#14151a]/40 border-white/5"
              )}>
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-secondary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">Inventario de Auto Partes</span>
                </div>

                <div className="space-y-3">
                  {digitalInventory.map((di, diIdx) => (
                    <div 
                      key={diIdx}
                      className={cn(
                        "p-3.5 rounded-xl border text-xs flex justify-between items-center transition-all duration-200",
                        di.lowStock 
                          ? "bg-red-500/5 border-red-500/20" 
                          : isLight ? "bg-slate-50 border-slate-200/60" : "bg-white/[0.01] border-white/5"
                      )}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold uppercase text-[10px] tracking-wider">{di.partNo}</span>
                          {di.lowStock && (
                            <span className="text-[8px] bg-red-500/20 text-red-500 px-1.5 py-0.2 rounded font-black tracking-widest uppercase">
                              Stock Mínimo
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-mono mt-1 text-zinc-500 truncate max-w-[200px]">{di.name}</h4>
                        <span className="text-[8px] uppercase tracking-wide text-zinc-500">{di.location}</span>
                      </div>

                      <div className="text-right">
                        <div className="font-black text-sm">{di.price}</div>
                        <div className={cn("text-[10px] font-bold font-mono", di.lowStock ? "text-red-500" : "text-primary")}>
                          {di.stock} Unids
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTEXT BITÁCORA INTERACTIVE TRACK LOGS */}
              <div className={cn(
                "p-8 border rounded-[2.5rem] flex-1 flex flex-col transition-all duration-300 relative overflow-hidden",
                isLight ? "bg-white border-slate-200" : "bg-[#14151a]/40 border-white/5"
              )}>
                <span className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 block">Bitácora de Sucesos y Tareas de IA</span>

                <div className="flex-1 space-y-3.5 pt-4 overflow-y-auto custom-scrollbar">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex gap-3 text-xs leading-relaxed items-start">
                      <span className="text-[9px] font-mono text-zinc-500 select-none pt-0.5">{log.ts}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black uppercase tracking-wider text-[10px] text-zinc-400">{log.title}</span>
                        </div>
                        <p className={cn("text-[11px] font-mono mt-0.5", isLight ? "text-slate-600" : "text-white/40")}>{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-zinc-800 flex gap-2 shrink-0">
                  <button 
                    onClick={() => {
                      const title = prompt('Título para la bitácora manual:');
                      const details = prompt('Detalle de la interacción registrada:');
                      if (!title || !details) return;

                      const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      setActivityLogs(prev => [
                        { id: `manual-${Date.now()}`, ts, title, type: 'info', details },
                        ...prev
                      ]);
                      addNotification({
                        title: 'BITACORA_EDITADA',
                        message: 'Se ha agregado una nueva entrada a la libreta personal.',
                        type: 'success',
                        featureId: 'REMOTE_BRIDGE'
                      });
                    }}
                    className="w-full py-3 bg-secondary text-black font-black uppercase text-[10px] tracking-widest rounded-2xl active:scale-95 cursor-pointer outline-none transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                  >
                    <Plus size={14} />
                    Añadir Registro a Bitácora
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
