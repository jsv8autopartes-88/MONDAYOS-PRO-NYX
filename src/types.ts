export type WidgetType = 'chart' | 'metric' | 'ai' | 'notes' | 'custom' | 'media' | 'map' | 'action';

export interface Widget {
  id: string;
  title: string;
  type: WidgetType;
  x: number;
  y: number;
  w: number;
  h: number;
  code: string; // The "function" or "logic" of the widget
  config: any;
  isVisible: boolean;
}

export interface ActionLog {
  id: string;
  timestamp: number;
  action: string;
  details: string;
  previousState?: any;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  data: string;
}

export interface AppFile {
  id: string;
  name: string;
  content: string;
  type: 'script' | 'md' | 'json' | 'svg';
}

export interface RemoteAgent {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'busy' | 'error';
  platform: string;
  lastHeartbeat: number;
  currentTask?: string;
  systemInfo?: {
    hostname: string;
    release: string;
    arch: string;
    mem: string;
    cpuModel?: string;
    cpuUsage?: number;
    uptime?: number;
    load?: number[];
  };
  processes?: { pid: number; name: string; cpu: number; mem: number; user: string }[];
  ownerId: string;
  updatedAt?: any;
}

export interface AgentCommand {
  id: string;
  cmd: string;
  args?: any[];
  status: 'pending' | 'received' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export interface AgentSkill {
  id: string;
  name: string;
  description: string;
  code: string;
  category: 'system' | 'automation' | 'web' | 'vision';
  evolvedFrom?: string;
  evolutionCount?: number;
}

export interface AgentMission {
  id: string;
  title: string;
  goal: string;
  status: 'active' | 'completed' | 'paused' | 'failed';
  subtasks: { id: string; description: string; status: 'pending' | 'done' }[];
  feedback?: string[];
  environment?: Record<string, any>;
  agentId?: string;
  createdAt: number;
}

export interface AutopilotAction {
  id: string;
  type: 'click' | 'input' | 'navigation' | 'wait';
  target?: string;
  value?: string;
  label?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  featureId: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

export interface WebLink {
  id: string;
  title: string;
  url: string;
  category?: string;
  icon?: string;
}

export interface AppState {
  widgets: Widget[];
  logs: ActionLog[];
  isCarMode: boolean;
  isAutopilotActive: boolean;
  autopilotQueue: AutopilotAction[];
  autopilotStatus: string;
  reportFiles: AppFile[];
  notifications: AppNotification[];
  activeTutorial: string | null;
  links: WebLink[];
  viewMode: 'grid' | 'list';
  credentials: Record<string, string>;
  notes: string;
  assets: Asset[];
  files: AppFile[];
  agents: RemoteAgent[];
  missions: AgentMission[];
  skills: AgentSkill[];
  aiContext: string;
  searchQuery: string;
  theme: {
    primary: string;
    secondary: string;
    background: string;
    cardBg: string;
  };
  shortcuts: { command: string; scriptId: string }[];
  assistantSettings?: {
    isDraggable: boolean;
    voiceWaveEnabled: boolean;
    autoListen: boolean;
    position?: { x: number; y: number };
  };
}

