import React from 'react';
import { useDashboard } from '../store/DashboardContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  X, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Wrench,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';

export const GuidanceSystem: React.FC = () => {
  const { 
    notifications, 
    clearNotification, 
    activeTutorial, 
    setTutorial,
    reportFiles
  } = useDashboard();

  const getFeatureDocs = (featureId: string) => {
    // We can pull documentation from the reportFiles index
    const report = reportFiles.find(r => r.name.includes('AUDIT'));
    return report ? report.content : "System documentation not yet generation. Run a new System Audit to initialize context.";
  };

  const getTutorialContent = (featureId: string) => {
    const tutorials: Record<string, { title: string, steps: string[], docsId: string }> = {
      'AUTOPILOT': {
        title: 'Native UI Autopilot',
        steps: [
          'Enable the engine using the Play button in the bottom right.',
          'Add tasks from the Autopilot Tab in the Control Panel.',
          'Watch as Nyx identifies and interacts with UI elements natively.',
          'Warning: Do not manually click elements while autopilot is processing.'
        ],
        docsId: 'docs_autopilot'
      },
      'AUDIT_SYSTEM': {
        title: 'Neural Audit Reporting',
        steps: [
          'Run a System Audit to generate a timestamped manifest.',
          'View reports in the Reports Tab of the Control Panel.',
          'Download as .md or copy as plain text for external install logs.',
          'Use these reports to track system evolution and agent efficiency.'
        ],
        docsId: 'docs_reports'
      },
      'LOCAL_AGENT': {
        title: 'Local Node Orchestration',
        steps: [
          'Generate your custom script in the Setup Tab.',
          'Execute "node nyx_agent.js" in your local terminal.',
          'Verify that the device appears in the Nodes Topology map.',
          'Send remote terminal commands directly from the dashboard rail.'
        ],
        docsId: 'docs_local'
      },
      'AI_ASSISTANT': {
        title: 'Neural Interface Steering',
        steps: [
          'Wake the assistant using the floating pulse in the bottom left.',
          'Switch between Voice (Waveform) and Keyboard (Input) modes.',
          'Issue complex goals; the IA will decompose them into autopilot tasks.',
          'Monitor real-time telemetry logs directly in the chat bubble.'
        ],
        docsId: 'docs_assistant'
      }
    };
    return tutorials[featureId] || { title: 'New Domain Integration', steps: ['Analyze the new interface added.', 'Configure parameters in settings.', 'Verify connectivity via remote link.'], docsId: 'docs_general' };
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[10000]">
      {/* Notifications Stack */}
      <div className="absolute top-6 right-6 flex flex-col gap-3 w-80 items-end">
        <AnimatePresence>
          {notifications.map((notif) => (
            <motion.div
              key={notif.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              onClick={() => {
                setTutorial(notif.featureId);
                clearNotification(notif.id);
              }}
              className="pointer-events-auto cursor-pointer glass-card p-4 border-l-4 border-l-primary flex gap-4 shadow-2xl hover:translate-x-[-4px] transition-transform w-full"
            >
              <div className="text-primary mt-1">
                {notif.type === 'success' ? <CheckCircle2 size={16} /> : notif.type === 'warning' ? <AlertCircle size={16} /> : <Info size={16} />}
              </div>
              <div className="flex-1">
                <h4 className="text-[11px] font-black uppercase text-white tracking-widest">{notif.title}</h4>
                <p className="text-[10px] text-white/40 font-mono italic mt-1 leading-relaxed">{notif.message}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[8px] font-black text-primary uppercase">Click for Tutorial</span>
                  <ChevronRight size={10} className="text-primary" />
                </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); clearNotification(notif.id); }}
                className="text-white/20 hover:text-white"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {activeTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="lg:w-[900px] w-full max-h-[80vh] glass-card overflow-hidden flex flex-col shadow-[0_0_100px_rgba(212,255,0,0.1)] border-white/10"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">Feature_Integration: {getTutorialContent(activeTutorial).title}</h2>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.4em]">Guided Configuration & Performance Verification</p>
                  </div>
                </div>
                <button 
                  onClick={() => setTutorial(null)}
                  className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 flex overflow-hidden">
                <div className="w-1/2 p-8 border-r border-white/5 overflow-y-auto custom-scrollbar">
                  <h3 className="text-xs font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Deployment Path
                  </h3>
                  <div className="space-y-8">
                    {getTutorialContent(activeTutorial).steps.map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/20 shrink-0 group-hover:border-primary/40 group-hover:text-primary transition-all">
                          {i + 1}
                        </div>
                        <p className="text-xs text-white/60 leading-relaxed pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
                    <h4 className="text-[10px] font-black uppercase text-white mb-2">Automated Optimization</h4>
                    <p className="text-[10px] text-white/40 italic leading-relaxed">System has auto-adjusted your local node to support this module. Terminal dependencies have been updated remotely.</p>
                  </div>
                </div>

                <div className="w-1/2 p-8 bg-black/20 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                      <BookOpen size={14} /> Logic_Reference
                    </h3>
                    <button className="text-[10px] font-black text-primary uppercase flex items-center gap-1 hover:underline">
                      <ExternalLink size={10} /> Full Docs
                    </button>
                  </div>
                  
                  <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-6 font-mono text-[10px] text-white/20 whitespace-pre-wrap overflow-y-auto custom-scrollbar">
                    {getFeatureDocs(activeTutorial)}
                  </div>

                  <div className="flex gap-3 mt-auto">
                    <button className="flex-1 py-3 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                      <Wrench size={14} /> Open Setup
                    </button>
                    <button 
                      onClick={() => setTutorial(null)}
                      className="flex-1 py-3 bg-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition-all"
                    >
                      Complete Training
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
