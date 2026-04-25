import React, { useState } from 'react';
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
  Layout
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ModuleInfo {
  id: string;
  title: string;
  type: 'component' | 'service' | 'module' | 'hook';
  description: string;
  previewDesc: string;
  code: string;
  dependencies: string[];
  lastLogs: string[];
  backups: string[];
  moreInfo: string;
  icon: any;
  targetTab?: string;
}

const APP_MODULES: ModuleInfo[] = [
  {
    id: 'agent_controller',
    title: 'AgentControllerPanel',
    type: 'component',
    description: 'Núcleo de orquestación para el manejo de agentes autónomos, misiones y evolución de habilidades.',
    previewDesc: 'Panel multitab con Navigation Rail, Mission Control y Visualizador de Evolución.',
    code: '// Código de AgentControllerPanel.tsx (Fragmento)\nexport const AgentControllerPanel: React.FC = () => {\n  const { agents, missions, skills } = useDashboard();\n  // ... lógica de orquestación\n}',
    dependencies: ['lucide-react', 'motion/react', 'firebase/firestore', '@google/genai'],
    lastLogs: ['[14:20] Mission adaptive update triggered.', '[14:25] Neural link status synced.'],
    backups: ['BK_ACP_20260420_0700', 'BK_ACP_20260419_1200'],
    moreInfo: 'Implementa el patrón de Microfrontends para aislamiento de lógica de agentes.',
    icon: Monitor
  },
  {
    id: 'network_graph',
    title: 'AgentNetworkGraph',
    type: 'component',
    description: 'Visualización topológica de la red de agentes utilizando D3.js con simulación de fuerzas.',
    previewDesc: 'Grafo dinámico con Neural Glow y selección de nodos por colisión.',
    code: '// Fragmento D3\nd3.forceSimulation(nodes)\n  .force("charge", d3.forceManyBody().strength(-400))\n  .on("tick", () => { /* update positions */ });',
    dependencies: ['d3', 'lucide-react'],
    lastLogs: ['[14:15] Topology stabilized in 340ms.', '[14:18] New node added to graph.'],
    backups: ['BK_ANG_20260420_BASE'],
    moreInfo: 'Optimizado para renderizado SVG con ResizeObserver dinámico.',
    icon: Activity
  },
  {
    id: 'dashboard_context',
    title: 'DashboardContext',
    type: 'service',
    description: 'Capa de gestión de estado global y sincronización con Cloud Firestore.',
    previewDesc: 'Context Provider con persistencia de tiempo real y hooks de acceso.',
    code: 'export const DashboardProvider: React.FC = ({ children }) => {\n  const [agents, setAgents] = useState<RemoteAgent[]>([]);\n  // Firebase onSnapshot logic\n}',
    dependencies: ['react', 'firebase/firestore', 'firebase/auth'],
    lastLogs: ['[14:30] Firestore cache hit.', '[14:32] Auth state transition completed.'],
    backups: ['BK_CTX_STABLE_V1'],
    moreInfo: 'Maneja el lifecycle de la base de datos y la autenticación del usuario.',
    icon: Database
  },
  {
    id: 'evolution_engine',
    title: 'EvolutionModule',
    type: 'module',
    description: 'Módulo de autodesarrollo de IA que procesa el feedback para mejorar habilidades.',
    previewDesc: 'Log de evolución en streaming con métricas de estabilidad.',
    code: 'const evolveSkill = async (skill: AgentSkill) => {\n  const result = await ai.generateContent("Optimize: " + skill.code);\n  // save new version\n}',
    dependencies: ['@google/genai'],
    lastLogs: ['[14:28] Skill "Data Mining" evolved to v3.2', '[14:35] Stability check passed.'],
    backups: ['BK_EVO_GEN_42'],
    moreInfo: 'Basado en el modelo Gemini-1.5-Flash para generación de refactorizaciones rápidas.',
    icon: Zap,
    targetTab: 'evolution'
  },
  {
    id: 'ai_panel',
    title: 'AIPanel',
    type: 'component',
    description: 'Interfaz de interacción directa con modelos LLM para procesamiento de lenguaje natural y generación de contenido.',
    previewDesc: 'Chat interactivo con soporte para streaming y renderizado de Markdown.',
    code: 'export const AIPanel: React.FC = () => {\n  const { generateAIResponse } = useDashboard();\n  // ... handling chat history\n}',
    dependencies: ['react-markdown', 'lucide-react', 'motion/react'],
    lastLogs: ['[14:40] AI prompt sent.', '[14:41] Response stream started.'],
    backups: ['BK_AI_V2_STABLE'],
    moreInfo: 'Optimizado para latencia baja y renderizado progresivo.',
    icon: Book
  },
  {
    id: 'missions_control',
    title: 'MissionsEngine',
    type: 'module',
    description: 'Gestor de tareas autónomas con capacidades de adaptación y tracking de progreso visual.',
    previewDesc: 'Dashboard de misiones con barras de progreso y estados codificados por colores.',
    code: 'const planMission = async (goal: string) => {\n  const tasks = await ai.generateMissions(goal);\n  saveToFirestore(tasks);\n}',
    dependencies: ['firebase/firestore', 'motion/react'],
    lastLogs: ['[15:05] Mission plan accepted.', '[15:10] Subtask "Init DB" completed.'],
    backups: ['BK_MISS_CORE_GOLD'],
    moreInfo: 'Utiliza el patrón Task-Tree para ejecuciones paralelas.',
    icon: Target,
    targetTab: 'missions'
  },
  {
    id: 'skills_vault',
    title: 'SkillsVault',
    type: 'module',
    description: 'Biblioteca de funciones ejecutables por agentes con versionado y autodesarrollo.',
    previewDesc: 'Listado de habilidades con buscador y etiquetas de categoría.',
    code: 'export interface AgentSkill {\n  name: string;\n  code: string;\n  trigger: "manual" | "auto";\n}',
    dependencies: ['prismjs', 'lucide-react'],
    lastLogs: ['[15:15] New skill "WebScraper" added.', '[15:20] Indexing finished.'],
    backups: ['BK_SKILLS_V3'],
    moreInfo: 'Las habilidades se inyectan dinámicamente en el runtime del agente.',
    icon: Wrench,
    targetTab: 'skills'
  },
  {
    id: 'nodes_topology',
    title: 'NodeNetwork',
    type: 'module',
    description: 'Visualizador de topología física y lógica de nodos conectados mediante D3.',
    previewDesc: 'Grafo de red con Neural Glow y detección de colisiones.',
    code: 'simulation.force("link", d3.forceLink(links).id(d => d.id))',
    dependencies: ['d3'],
    lastLogs: ['[15:25] Network ping: 24ms avg.', '[15:28] Node "Worker_7" connected.'],
    backups: ['BK_TOPO_STABLE'],
    moreInfo: 'Escalable hasta 500 nodos simultáneos.',
    icon: Layout,
    targetTab: 'nodes'
  },
  {
    id: 'project_structure',
    title: 'FullProjectCode',
    type: 'module',
    description: 'Acceso completo a la estructura del código fuente de la aplicación, indexando todos los componentes y servicios.',
    previewDesc: 'Mapa jerárquico de archivos en /src con detalles de rutas y propósitos.',
    code: '// Estructura del Proyecto\n/src\n  /components\n    AIPanel.tsx\n    AgentControllerPanel.tsx\n    DevDirectory.tsx\n    ...\n  /store\n    DashboardContext.tsx\n  /lib\n    firebase.ts\n    utils.ts',
    dependencies: ['React', 'Vite', 'Lucide-React'],
    lastLogs: ['[15:30] Source index updated.', '[15:35] Dependency graph verified.'],
    backups: ['FULL_BUNDLE_AUTO_BK'],
    moreInfo: 'Todos los archivos están desarrollados en TypeScript con tipado estricto.',
    icon: Code
  },
  {
    id: 'navigation_system',
    title: 'NavigationSet',
    type: 'component',
    description: 'Componentes de navegación global, incluyendo el Sidebar y el TopBar con búsqueda integrada.',
    previewDesc: 'Barra lateral reactiva y barra superior con métricas de sistema.',
    code: 'export const Sidebar: React.FC = () => {\n  return <aside>...</aside>\n}',
    dependencies: ['lucide-react', 'motion/react'],
    lastLogs: ['[15:38] Navigation context optimized.', '[15:40] Search event listener registered.'],
    backups: ['BK_NAV_V2'],
    moreInfo: 'Utiliza Framer Motion para las transiciones de estado de los tabs.',
    icon: Monitor
  }
];

export const DevDirectory: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  const [selectedModule, setSelectedModule] = useState<ModuleInfo | null>(null);
  const [search, setSearch] = useState('');

  const filteredModules = APP_MODULES.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.type.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

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
              onClick={() => setSelectedModule(mod)}
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
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <selectedModule.icon className="text-primary" size={24} />
                    <h1 className="text-2xl font-black italic tracking-tighter text-white uppercase">{selectedModule.title}</h1>
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed max-w-2xl">{selectedModule.description}</p>
                </div>
                {selectedModule.targetTab ? (
                  <button 
                    onClick={() => onNavigate?.(selectedModule.targetTab!)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-[10px] font-black uppercase hover:scale-105 transition-all"
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

              {/* Grid Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview Section */}
                <div className="glass-card p-6 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="text-neon-blue" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Preview de Funcionamiento</span>
                  </div>
                  <div className="aspect-video bg-black/40 rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
                    <Monitor size={32} className="text-white/10 mb-3" />
                    <p className="text-[10px] font-mono text-white/40 uppercase leading-relaxed">{selectedModule.previewDesc}</p>
                  </div>
                </div>

                {/* Dependencies */}
                <div className="glass-card p-6 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="text-neon-lime" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Dependencias</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedModule.dependencies.map(dep => (
                      <span key={dep} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/60 italic">
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Code Developed */}
                <div className="col-span-full glass-card p-6 border-neon-blue/20 bg-black/40">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Code className="text-neon-blue" size={14} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Código Desarrollado</span>
                    </div>
                    <span className="text-[8px] text-neon-blue/40 font-mono tracking-widest">TSX / VITE</span>
                  </div>
                  <pre className="p-4 bg-black/40 border border-white/5 rounded-xl font-mono text-[10px] text-white/80 overflow-x-auto custom-scrollbar leading-relaxed">
                    <code>{selectedModule.code}</code>
                  </pre>
                </div>

                {/* Logs & Backups */}
                <div className="glass-card p-6 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="text-neon-lime" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Últimos Logs</span>
                  </div>
                  <div className="space-y-2">
                    {selectedModule.lastLogs.map((log, i) => (
                      <div key={i} className="flex gap-2 text-[9px] font-mono text-white/40">
                        <span className="text-primary">{'>'}</span>
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card p-6 border-white/5">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="text-neon-pink" size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Backups / Versiones</span>
                  </div>
                  <div className="space-y-2">
                    {selectedModule.backups.map((bk, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/5">
                        <span className="text-[9px] font-mono text-white/60">{bk}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-neon-lime animate-pulse" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* More Info */}
                <div className="col-span-full glass-card p-6 border-white/5 flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="text-primary" size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1 block">Más Información / Notas</span>
                    <p className="text-[11px] text-white/60 font-medium leading-relaxed">{selectedModule.moreInfo}</p>
                  </div>
                </div>
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
