
export interface FileNode {
  path: string;
  description: string;
  functions?: string[];
  tips?: string[];
}

export const APP_BLUEPRINT = {
  version: "2.5.0",
  codename: "NYX_CORE",
  architecture: "React 18 + Vite + Tailwind CSS + Framer Motion",
  core_stack: [
    "Lucide React (Icons)",
    "Firebase (Persistence & Auth)",
    "Framer Motion (Animations)",
    "Zustand/Context (State Management)"
  ],
  structure: [
    {
      path: "src/App.tsx",
      description: "Main orchestration layer. Handles routing (tabs), authentication state, and global layout wrappers.",
      tips: [
        "Use the activeTab state to register new modules.",
        "The AnimatePresence handles smooth transitions between modules."
      ]
    },
    {
      path: "src/store/DashboardContext.tsx",
      description: "Global state manager for logs, notifications, and shared UI states.",
      functions: ["addLog", "addNotification", "clearLogs"],
      tips: ["Always use the useDashboard hook to interact with system-wide state."]
    },
    {
      path: "src/components/Navigation.tsx",
      description: "Sidebar navigation component with search and quick actions.",
      tips: ["Manage navigation IDs strictly to match App.tsx routing keys."]
    },
    {
      path: "src/components/AIPanel.tsx",
      description: "Neural interface for Gemini API interactions.",
      functions: ["handleTTS", "saveMemory", "handleSendMessage"],
      tips: ["Context Memory is persistent and injected as a system instruction."]
    },
    {
      path: "src/components/WizardInstallManager.tsx",
      description: "Windows application setup compiler simulator.",
      tips: ["Simulates build sequences for architectural visualization."]
    },
    {
      path: "src/lib/utils.ts",
      description: "Utility functions and styling helpers.",
      functions: ["cn() - Tailwind-merge + clsx wrapper"],
      tips: ["Use cn() for any conditional class application to avoid conflicts."]
    }
  ],
  customization_guide: [
    {
      title: "Adding a New Module",
      steps: [
        "1. Create the component in /src/components",
        "2. Add the icon and ID to /src/components/Navigation.tsx",
        "3. Register the tab in /src/App.tsx under the activeTab switch."
      ]
    },
    {
      title: "UI Consistency",
      tips: [
        "Use 'glass-card' class for main containers.",
        "Apply 'text-primary' (#cff80c) for highlights.",
        "Use 'motion.div' for all entering/exiting elements."
      ]
    }
  ]
};
