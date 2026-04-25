import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Code, 
  Book, 
  Terminal, 
  ExternalLink, 
  Package, 
  History, 
  Database, 
  Eye, 
  ChevronRight,
  Monitor,
  Cpu,
  Layers,
  Zap,
  Activity,
  FileCode,
  ShieldCheck,
  Search,
  FolderOpen,
  Target,
  Wrench,
  Layout,
  Copy,
  Edit,
  Sparkles,
  RefreshCcw,
  Download,
  Bug,
  Info,
  List,
  Check,
  Play,
  Settings,
  AlertTriangle,
  Smartphone,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-tsx';

interface VersionInfo {
  version: string;
  date: string;
  changes: string[];
  techDeclaration: string;
}

interface ModuleInfo {
  id: string;
  title: string;
  type: 'component' | 'service' | 'module' | 'hook';
  description: string;
  previewDesc: string;
  code: string;
  fullCode?: string;
  dependencies: string[];
  lastLogs: string[];
  backups: string[];
  moreInfo: string;
  icon: any;
  targetTab?: string;
  installSteps: string[];
  versions: VersionInfo[];
  diagnostics: {
    status: 'healthy' | 'warning' | 'error';
    uptime: string;
    load: string;
    errors: number;
  };
}

const APP_MODULES: ModuleInfo[] = [
  {
    id: 'agent_controller',
    title: 'AgentControllerPanel',
    type: 'component',
    description: 'Núcleo de orquestación para el manejo de agentes autónomos, misiones y evolución de habilidades.',
    previewDesc: 'Panel multitab con Navigation Rail, Mission Control y Visualizador de Evolución.',
    code: '// Fragmento de AgentControllerPanel.tsx\nexport const AgentControllerPanel: React.FC = () => {\n  const [activeTab, setActiveTab] = useState("nodes");\n  // ... orchestration logic\n}',
    fullCode: `import React, { useState, useEffect } from 'react';\nimport { Cpu, Target, Wrench, Zap, Smartphone } from 'lucide-react';\n// ... logic for managing agents via Firestore and D3\nexport const AgentControllerPanel = () => {\n  const { agents, missions } = useDashboard();\n  const [activeTab, setActiveTab] = useState('nodes');\n  return (\n    <div className="flex-1 flex overflow-hidden">\n      {/* Navigation Rail */}\n      <div className="w-20 bg-black/40 border-r border-white/5 ...">...</div>\n    </div>\n  );\n};`,
    dependencies: ['lucide-react', 'motion/react', 'firebase/firestore', '@google/genai'],
    lastLogs: ['[14:20] Mission adaptive update triggered.', '[14:25] Neural link status synced.'],
    backups: ['BK_ACP_20260420_0700', 'BK_ACP_20260419_1200'],
    moreInfo: 'Implementa el patrón de Microfrontends para aislamiento de lógica de agentes.',
    icon: Monitor,
    installSteps: [
      "npm install lucide-react motion/react firebase @google/genai",
      "Importar AgentControllerPanel en App.tsx",
      "Configurar credenciales de Firebase en firebase-applet-config.json"
    ],
    versions: [
      {
        version: "v2.5.0",
        date: "2026-04-20",
        changes: ["Added Node Topology Graph", "Improved Mission Progress Tracking"],
        techDeclaration: "Usa React 19 y Framer Motion para orquestación de UI."
      }
    ],
    diagnostics: {
      status: 'healthy',
      uptime: '99.9%',
      load: '12%',
      errors: 0
    }
  },
  {
    id: 'dashboard_context',
    title: 'DashboardContext',
    type: 'service',
    description: 'Capa de gestión de estado global y sincronización con Cloud Firestore.',
    previewDesc: 'Context Provider con persistencia de tiempo real y hooks de acceso.',
    code: 'export const DashboardProvider: React.FC = ({ children }) => {\n  const [user, setUser] = useState<User | null>(null);\n  // Firebase onSnapshot logic\n}',
    fullCode: `// store/DashboardContext.tsx\nexport const DashboardProvider = ({ children }) => {\n  const [state, setState] = useState(INITIAL_STATE);\n  // Realtime listeners for widgets, agents, and logs\n  useEffect(() => {\n    if (!user) return;\n    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snap) => {\n      if (snap.exists()) setState(prev => ({ ...prev, ...snap.data() }));\n    });\n    return () => unsubProfile();\n  }, [user]);\n  return <DashboardContext.Provider value={...}>...</DashboardContext.Provider>;\n};`,
    dependencies: ['react', 'firebase/firestore', 'firebase/auth'],
    lastLogs: ['[14:30] Firestore cache hit.', '[14:32] Auth state transition completed.'],
    backups: ['BK_CTX_STABLE_V1'],
    moreInfo: 'Maneja el lifecycle de la base de datos y la autenticación del usuario.',
    icon: Database,
    installSteps: [
      "Configurar Firebase Project en la consola",
      "Habilitar Firestore y Google Auth",
      "Encapsular App con <DashboardProvider>"
    ],
    versions: [
      {
        version: "v1.8.2",
        date: "2026-04-15",
        changes: ["Fixed race condition on auth check", "Optimized log buffering"],
        techDeclaration: "Stateful context with local persistence fallback using localStorage."
      }
    ],
    diagnostics: {
      status: 'healthy',
      uptime: '100%',
      load: '4%',
      errors: 0
    }
  },
  {
    id: 'local_setup',
    title: 'LocalAgentSetup',
    type: 'component',
    description: 'Guía interactiva y generador de scripts para conectar hardware físico al ecosistema NYX_CORE.',
    previewDesc: 'Generador de nyx_agent.js con credenciales inyectadas y guía de instalación.',
    code: '// Local Agent Bridge\nconst agentCode = `\nconst { initializeApp } = require("firebase/app");\n// ... startup logic\n`;',
    fullCode: `import React, { useState } from 'react';\nimport { Terminal, Download, Copy } from 'lucide-react';\nimport firebaseConfig from '../../firebase-applet-config.json';\n\nexport const LocalAgentSetup = () => {\n  const agentCode = \`const { initializeApp } = require('firebase/app');\\nconst firebaseConfig = \${JSON.stringify(firebaseConfig)};\\n// ... startup firebase and listen for commands\`;\n  return (\n    <div className="p-8 space-y-8">\n      <h2 className="text-2xl font-black">LOCAL_NODE_SETUP</h2>\n      <pre className="p-4 bg-black/60 rounded-xl">{agentCode}</pre>\n    </div>\n  );\n};`,
    dependencies: ['lucide-react', 'motion/react'],
    lastLogs: ['[15:10] Script generated for node ID: PC_7H2G', '[15:15] Copy to clipboard successful.'],
    backups: ['BK_SETUP_GUIDE_V1'],
    moreInfo: 'Permite la ejecución remota de comandos en el host a través de Firestore listeners.',
    icon: Smartphone,
    targetTab: 'setup',
    installSteps: [
      "Copiar el script generado desde el panel de Setup",
      "Crear un archivo nyx_agent.js en tu PC local",
      "Instalar dependencias: npm install firebase",
      "Ejecutar el nodo: node nyx_agent.js"
    ],
    versions: [
      {
        version: "v1.0.0",
        date: "2026-04-22",
        changes: ["Initial Release", "Supports remote shell execution using node child_process"],
        techDeclaration: "Secure bidirectional bridge between Cloud and Local OS."
      }
    ],
    diagnostics: {
      status: 'healthy',
      uptime: '100%',
      load: '2%',
      errors: 0
    }
  },
  {
    id: 'app_core',
    title: 'App_Main_Entry',
    type: 'component',
    description: 'Punto de entrada principal de la aplicaci\u00f3n que orquestra el ruteo y el layout global.',
    previewDesc: 'Shell de la aplicaci\u00f3n con Sidebar, TopBar y Main Content dynamic viewport.',
    code: 'export default function App() {\n  return (\n    <DashboardProvider>\n      <DashboardContent />\n    </DashboardProvider>\n  );\n}',
    fullCode: `import React from 'react';\nimport { DashboardProvider, useDashboard } from './store/DashboardContext';\nimport { Sidebar, TopBar } from './components/Navigation';\n// ... Full App Entry implementation`,
    dependencies: ['react', 'lucide-react', 'motion/react'],
    lastLogs: ['[15:40] Hot reload successful.', '[15:42] New tab "Local Setup" registered.'],
    backups: ['BK_APP_V2_STABLE'],
    moreInfo: 'Utiliza el patr\u00f3n de Provider Pattern para inyectar el estado global.',
    icon: Layout,
    installSteps: [
      "Clonar repositorio",
      "npm install",
      "npm run dev"
    ],
    versions: [
      {
        version: "v2.0.0",
        date: "2026-04-25",
        changes: ["Added PWA support", "Integrated DevDirectory"],
        techDeclaration: "Main shell with AnimatePresence for tab transitions."
      }
    ],
    diagnostics: {
      status: 'healthy',
      uptime: '99.9%',
      load: '5%',
      errors: 0
    }
  },
  {
    id: 'terminal_logs',
    title: 'TerminalPanel_v2',
    type: 'component',
    description: 'Consola de comandos de bajo nivel con monitoreo de logs en tiempo real.',
    previewDesc: 'Output monospaced con filtrado por severidad y autoscroll.',
    code: 'export const TerminalPanel = () => {\n  const { logs } = useDashboard();\n  return <div className="font-mono">...</div>\n}',
    fullCode: `import React, { useRef, useEffect } from 'react';\nimport { Terminal as TerminalIcon, Search, Trash2 } from 'lucide-react';\n// ... Full Terminal implementation with virtual scroll support`,
    dependencies: ['lucide-react', 'prismjs'],
    lastLogs: ['[15:45] Log buffer cleared.', '[15:48] Filter: "ERROR" applied.'],
    backups: ['BK_TERM_CORE'],
    moreInfo: 'Optimizado para manejar grandes vol\u00famenes de datos sin lag.',
    icon: Terminal,
    installSteps: [
      "Importar TerminalPanel en DashboardContent",
      "Configurar Prism.js para highlight de logs"
    ],
    versions: [
      {
        version: "v1.2.5",
        date: "2026-04-18",
        changes: ["Added log filtering", "Improved autoscroll performance"],
        techDeclaration: "Uses useRef for DOM manipulation in terminal streaming."
      }
    ],
    diagnostics: {
      status: 'healthy',
      uptime: '100%',
      load: '8%',
      errors: 0
    }
  },
  {
    id: 'cicd_pipeline',
    title: 'CloudBuild_Pipeline',
    type: 'module',
    description: 'Pipeline de Integración y Despliegue Continuo (CI/CD) automatizado en Google Cloud Platform.',
    previewDesc: 'Orquestación de builds en Docker, push a Artifact Registry y despliegue en Cloud Run.',
    code: 'steps:\n  - name: "gcr.io/cloud-builders/docker"\n    args: ["build", "-t", "frontend-service", "."]\n  # ... deployment steps',
    fullCode: `steps:\n  # Paso 1: Construir la imagen del contenedor\n  - name: 'gcr.io/cloud-builders/docker'\n    args: [\n      'build', \n      '-t', 'us-east1-docker.pkg.dev/gen-lang-client-0497669167/app-repo/frontend-service:$COMMIT_SHA', \n      '.'\n    ]\n\n  # Paso 2: Subir la imagen al Artifact Registry\n  - name: 'gcr.io/cloud-builders/docker'\n    args: [\n      'push', \n      'us-east1-docker.pkg.dev/gen-lang-client-0497669167/app-repo/frontend-service:$COMMIT_SHA'\n    ]\n\n  # Paso 3: Desplegar la nueva imagen en Cloud Run\n  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'\n    entrypoint: gcloud\n    args:\n      - 'run'\n      - 'deploy'\n      - 'frontend-service'\n      - '--image'\n      - 'us-east1-docker.pkg.dev/gen-lang-client-0497669167/app-repo/frontend-service:$COMMIT_SHA'\n      - '--region'\n      - 'us-east1'\n      - '--platform'\n      - 'managed'\n      - '--allow-unauthenticated'\n\nimages:\n  - 'us-east1-docker.pkg.dev/gen-lang-client-0497669167/app-repo/frontend-service:$COMMIT_SHA'`,
    dependencies: ['Google Cloud Build', 'Docker', 'Google Cloud Run'],
    lastLogs: ['[16:00] Build triggered by commit.', '[16:05] Push to Artifact Registry completed.', '[16:10] Cloud Run deployment successful.'],
    backups: ['BK_PIPELINE_V1'],
    moreInfo: 'Automatiza el ciclo de vida de producci\u00f3n asegurando despliegues zero-downtime.',
    icon: RefreshCcw,
    installSteps: [
      "Instalar Google Cloud SDK (gcloud CLI)",
      "Autenticar gcloud: gcloud auth login",
      "Configurar Artifact Registry en GCP",
      "Habilitar Cloud Build API",
      "Ejecutar build manual: gcloud builds submit --config cloudbuild.yaml ."
    ],
    versions: [
      {
        version: "v1.0.0",
        date: "2026-04-25",
        changes: ["Initial Pipeline Setup", "Dockerized Vite App", "Cloud Run deployment integrated"],
        techDeclaration: "Pipeline agn\u00f3stico basado en contenedores Docker."
      }
    ],
    diagnostics: {
      status: 'healthy',
      uptime: '100%',
      load: 'N/A',
      errors: 0
    }
  }
];

export const DevDirectory: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [search, setSearch] = useState('');
  const [activeDetailTab, setActiveDetailTab] = useState<'summary' | 'code' | 'install' | 'versions' | 'diagnostics'>('summary');
  const [copying, setCopying] = useState(false);

  useEffect(() => {
    if (selectedModule && activeDetailTab === 'code') {
      Prism.highlightAll();
    }
  }, [selectedModule, activeDetailTab]);

  const filteredModules = APP_MODULES.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleCopyCode = () => {
    if (!selectedModule) return;
    const codeToCopy = selectedModule.fullCode || selectedModule.code;
    navigator.clipboard.writeText(codeToCopy);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const navTabs = [
    { id: 'summary', label: 'Resumen', icon: Info },
    { id: 'code', label: 'Código Completo', icon: Code },
    { id: 'install', label: 'Instalación', icon: Download },
    { id: 'versions', label: 'Historial', icon: History },
    { id: 'diagnostics', label: 'Diagnóstico', icon: Activity },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Sidebar Directory */}
      <div className="w-1/3 border-r border-white/5 flex flex-col bg-black/20 overflow-y-auto custom-scrollbar">
        <div className="p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-3 mb-2">
            <FolderOpen className="text-primary" size={18} />
            <h2 className="text-sm font-black tracking-widest text-white uppercase">DIRECTORIO_DEV</h2>
          </div>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em]">Index de módulos y componentes</p>
        </div>

        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" size={12} />
            <input 
              type="text" 
              placeholder="BUSCAR_MODULO..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-[10px] font-mono focus:border-primary/50 outline-none"
            />
          </div>
        </div>

        <div className="p-4 space-y-1">
          {filteredModules.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                setSelectedModule(mod);
                setActiveDetailTab('summary');
              }}
              className={cn(
                "w-full text-left p-3 rounded-xl transition-all flex items-center gap-3 group",
                selectedModule?.id === mod.id ? "bg-primary/10 border border-primary/20" : "hover:bg-white/5 border border-transparent"
              )}
            >
              <div className={cn(
                "p-2 rounded-lg transition-colors",
                selectedModule?.id === mod.id ? "bg-primary text-black" : "bg-white/5 text-white/40 group-hover:text-white"
              )}>
                <mod.icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-black text-white uppercase truncate">{mod.title}</div>
                <div className="text-[9px] text-white/30 font-mono uppercase truncate">{mod.type}</div>
              </div>
              <ChevronRight size={12} className={cn("transition-transform", selectedModule?.id === mod.id ? "rotate-90 text-primary" : "text-white/20")} />
            </button>
          ))}
        </div>
      </div>

      {/* Detail View */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-black/10">
        <AnimatePresence mode="wait">
          {selectedModule ? (
            <motion.div
              key={selectedModule.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Header */}
              <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <selectedModule.icon className="text-primary" size={24} />
                       <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">{selectedModule.title}</h1>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed max-w-2xl">{selectedModule.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 text-white/60 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 transition-all">
                      <Bug size={14} />
                      Diagnóstico
                    </button>
                    {selectedModule.targetTab ? (
                      <button 
                        onClick={() => onNavigate?.(selectedModule.targetTab!)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-all shadow-[0_0_15px_rgba(207,248,12,0.3)]"
                      >
                        <ExternalLink size={14} />
                        Acceso Directo
                      </button>
                    ) : (
                      <button className="flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase hover:bg-primary/30 transition-all">
                        <ExternalLink size={14} />
                        Acceso Directo
                      </button>
                    )}
                  </div>
                </div>

                {/* Sub Navigation Tabs */}
                <div className="flex bg-black/20 p-1 border border-white/5 rounded-xl self-start">
                  {navTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveDetailTab(tab.id as any)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                        activeDetailTab === tab.id ? "bg-primary text-black" : "text-white/40 hover:text-white"
                      )}
                    >
                      <tab.icon size={12} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeDetailTab === 'summary' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="glass-card p-6 border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Eye className="text-neon-blue" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Preview Interface</span>
                      </div>
                      <div className="aspect-video bg-black/40 rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                        <Monitor size={32} className="text-white/10 mb-3" />
                        <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">{selectedModule.previewDesc}</p>
                      </div>
                    </div>

                    <div className="glass-card p-6 border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <Package className="text-neon-lime" size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Dependencies</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedModule.dependencies.map(dep => (
                          <span key={dep} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/60 italic">
                            {dep}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-full glass-card p-6 border-white/5 space-y-6">
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <Activity className="text-primary" size={14} />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Testing & Diagnostics Suite</span>
                         </div>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                            <ExternalLink size={24} className="text-neon-blue group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase text-white/60">Pop Out Test</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                            <Play size={24} className="text-neon-lime group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase text-white/60">Full Suite Test</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                            <Bug size={24} className="text-neon-pink group-hover:scale-110 transition-transform" />
                            <span className="text-[9px] font-black uppercase text-white/60">Deep Audit</span>
                          </button>
                          <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all group">
                            <RefreshCcw size={24} className="text-primary group-hover:rotate-180 transition-transform duration-500" />
                            <span className="text-[9px] font-black uppercase text-white/60">Hot Reload</span>
                          </button>
                       </div>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'code' && (
                  <div className="glass-card border-white/5 overflow-hidden">
                    <div className="flex items-center justify-between p-4 bg-black/40 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-neon-lime" />
                          <span className="text-[9px] font-black uppercase text-white/40 tracking-widest">{selectedModule.title}.tsx</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={handleCopyCode}
                            className={cn(
                              "p-2 rounded-lg transition-all flex items-center gap-2 text-[10px] font-bold uppercase",
                              copying ? "bg-neon-lime/20 text-neon-lime" : "text-white/40 hover:text-white"
                            )}
                          >
                            {copying ? <Check size={14} /> : <Copy size={14} />}
                            {copying ? 'Copiado' : 'Copiar'}
                          </button>
                          <button className="p-2 rounded-lg text-white/40 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase">
                            <Edit size={14} />
                            Editar
                          </button>
                          <button className="p-2 rounded-lg text-white/40 hover:text-white transition-all flex items-center gap-2 text-[10px] font-bold uppercase">
                            <Sparkles size={14} />
                            AI Assist
                          </button>
                        </div>
                      </div>
                      <span className="text-[9px] text-primary/40 font-mono uppercase">Full_Context_Indexed</span>
                    </div>
                    <div className="p-6 bg-black/60 overflow-x-auto custom-scrollbar">
                      <pre className="text-[11px] leading-relaxed font-mono">
                        <code className="language-tsx">
                          {selectedModule.fullCode || selectedModule.code}
                        </code>
                      </pre>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'install' && (
                  <div className="glass-card p-10 border-white/5 space-y-10">
                    <div className="flex items-start gap-6">
                      <div className="p-4 bg-primary/10 rounded-2xl">
                        <Download className="text-primary" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black italic tracking-tighter text-white uppercase mb-2">Local Deployment Protocol</h3>
                        <p className="text-sm text-white/40 leading-relaxed">Follow these steps to instantiate this module on physical hardware.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {selectedModule.installSteps.map((step, i) => (
                        <div key={i} className="flex gap-4 items-center p-4 bg-white/5 border border-white/5 rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary shrink-0">{i+1}</div>
                          <p className="text-[11px] text-white/70 font-mono tracking-tight">{step}</p>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-neon-blue/10 rounded-xl">
                            <Download className="text-neon-blue" size={20} />
                         </div>
                         <div>
                            <span className="text-[9px] font-black uppercase text-white/30 tracking-widest">Package Distribution</span>
                            <p className="text-xs font-bold text-white uppercase tracking-wider">{selectedModule.title}_CORE.zip</p>
                         </div>
                       </div>
                       <button className="px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-white/10 transition-all group-hover:border-neon-blue/40">
                         Download Binary
                       </button>
                    </div>
                  </div>
                )}

                {activeDetailTab === 'versions' && (
                  <div className="space-y-4">
                    {selectedModule.versions.map((v, i) => (
                      <div key={i} className="glass-card p-6 border-white/5 flex flex-col gap-6 group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-primary text-black rounded-full text-[10px] font-black uppercase">{v.version}</div>
                            <span className="text-[10px] text-white/30 font-mono">{v.date}</span>
                          </div>
                          <span className="text-[9px] text-white/20 font-black uppercase tracking-widest italic group-hover:text-primary transition-colors">Technical_Declaration</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <ul className="space-y-2">
                             {v.changes.map((c, ci) => (
                               <li key={ci} className="text-[11px] text-white/60 flex gap-2">
                                 <span className="text-primary">-</span> {c}
                               </li>
                             ))}
                          </ul>
                          <div className="p-4 bg-black/40 rounded-xl border border-white/5">
                             <p className="text-[10px] text-white/40 font-mono leading-relaxed">{v.techDeclaration}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeDetailTab === 'diagnostics' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="glass-card p-8 border-white/5 flex flex-col items-center text-center">
                      <div className={cn(
                        "w-16 h-16 rounded-full flex items-center justify-center mb-6 shadow-2xl",
                        selectedModule.diagnostics.status === 'healthy' ? "bg-neon-lime/10 text-neon-lime" : "bg-neon-pink/10 text-neon-pink"
                      )}>
                        <Activity size={32} />
                      </div>
                      <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">State Efficiency</span>
                      <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">{selectedModule.diagnostics.status}</h4>
                    </div>

                    <div className="glass-card p-8 border-white/5 flex flex-col items-center text-center">
                       <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/40">
                         <RefreshCcw size={32} />
                       </div>
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Uptime Record</span>
                       <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">{selectedModule.diagnostics.uptime}</h4>
                    </div>

                    <div className="glass-card p-8 border-white/5 flex flex-col items-center text-center">
                       <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6 text-white/40">
                         <AlertTriangle size={32} className={selectedModule.diagnostics.errors > 0 ? "text-neon-pink" : ""} />
                       </div>
                       <span className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">Anomalies Detected</span>
                       <h4 className="text-xl font-black italic tracking-tighter text-white uppercase">{selectedModule.diagnostics.errors} ERRS</h4>
                    </div>

                    <div className="col-span-full glass-card p-10 border-white/5 text-center">
                       <h3 className="text-sm font-black italic tracking-widest text-white uppercase mb-4">Run Autonomous Stress Test</h3>
                       <button className="px-10 py-3 bg-neon-pink/20 text-neon-pink border border-neon-pink/20 rounded-xl font-black uppercase text-[11px] hover:bg-neon-pink/30 hover:shadow-[0_0_20px_rgba(255,0,111,0.2)] transition-all">
                         Launch Stress Simulation
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30 mt-[-4rem]">
              <Layers size={64} className="mb-6 text-white/20" />
              <h2 className="text-2xl font-black italic tracking-tighter uppercase mb-2">SELECCIONE_UN_MODULO</h2>
              <p className="text-xs uppercase tracking-widest max-w-sm">Explora el ecosistema de desarrollo de la plataforma NYX_CORE.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
