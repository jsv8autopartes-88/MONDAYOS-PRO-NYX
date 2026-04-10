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

export interface AppState {
  widgets: Widget[];
  logs: ActionLog[];
  isCarMode: boolean;
  viewMode: 'grid' | 'list';
  credentials: Record<string, string>;
  notes: string;
  assets: Asset[];
  files: AppFile[];
  aiContext: string;
  searchQuery: string;
  theme: {
    primary: string;
    secondary: string;
    background: string;
    cardBg: string;
  };
  shortcuts: { command: string; scriptId: string }[];
}

