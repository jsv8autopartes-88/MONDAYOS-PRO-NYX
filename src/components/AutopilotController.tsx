import React, { useEffect, useState, useRef } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Activity, AlertCircle, CheckCircle2, ChevronRight, Play, Square } from 'lucide-react';
import { cn } from '../lib/utils';

export const AutopilotController: React.FC = () => {
  const { 
    isAutopilotActive, 
    autopilotQueue, 
    autopilotStatus, 
    updateAutopilotStatus, 
    completeAutopilotAction,
    toggleAutopilot 
  } = useDashboard();

  const [currentActionId, setCurrentActionId] = useState<string | null>(null);
  const [highlightPos, setHighlightPos] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    if (!isAutopilotActive || autopilotQueue.length === 0 || processingRef.current) return;

    const processNext = async () => {
      processingRef.current = true;
      const action = autopilotQueue[0];
      setCurrentActionId(action.id);
      updateAutopilotStatus(`EXECUTING_${action.type.toUpperCase()}`);

      try {
        await executeAction(action);
        completeAutopilotAction(action.id);
      } catch (error) {
        console.error('Autopilot Action Failed:', error);
        updateAutopilotStatus('ERROR: ' + (error instanceof Error ? error.message : 'Unknown error'));
        // For safety, we stop if something fails?
        // Let's just move to next for now but mark error
      } finally {
        processingRef.current = false;
        setCurrentActionId(null);
        setHighlightPos(null);
        if (autopilotQueue.length === 1) {
          updateAutopilotStatus('COMPLETED');
          setTimeout(() => updateAutopilotStatus('STANDBY'), 3000);
        }
      }
    };

    const timer = setTimeout(processNext, 1000); // Small delay between actions
    return () => clearTimeout(timer);
  }, [isAutopilotActive, autopilotQueue]);

  const executeAction = async (action: any) => {
    switch (action.type) {
      case 'click':
        return performClick(action);
      case 'input':
        return performInput(action);
      case 'navigation':
        return performNavigation(action);
      case 'wait':
        return new Promise(resolve => setTimeout(resolve, parseInt(action.value || '1000')));
    }
  };

  const findElement = (target?: string) => {
    if (!target) return null;
    
    // Try by specific selector
    let el = document.querySelector(target);
    if (el) return el as HTMLElement;

    // Try by text content if it's a simple string
    const allClickables = document.querySelectorAll('button, a, [role="button"], input[type="submit"]');
    const byText = Array.from(allClickables).find(e => 
      e.textContent?.toLowerCase().includes(target.toLowerCase()) ||
      (e as HTMLInputElement).value?.toLowerCase().includes(target.toLowerCase())
    );
    if (byText) return byText as HTMLElement;

    // Try by ID exactly
    el = document.getElementById(target);
    if (el) return el as HTMLElement;

    return null;
  };

  const performClick = async (action: any) => {
    const el = findElement(action.target);
    if (!el) throw new Error(`Target not found: ${action.target}`);

    // Highlight the target
    const rect = el.getBoundingClientRect();
    setHighlightPos({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    
    await new Promise(resolve => setTimeout(resolve, 800)); // Visual pause

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.click();
    
    // Trigger React-friendly events
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  };

  const performInput = async (action: any) => {
    const el = findElement(action.target) as HTMLInputElement | HTMLTextAreaElement;
    if (!el) throw new Error(`Input target not found: ${action.target}`);

    const rect = el.getBoundingClientRect();
    setHighlightPos({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
    
    await new Promise(resolve => setTimeout(resolve, 500));

    el.focus();
    el.value = action.value || '';
    
    // React needs these to see the change
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  };

  const performNavigation = async (action: any) => {
    // We assume navigation is done by clicking sidebar buttons
    const navButtons = document.querySelectorAll('nav button, .sidebar-link');
    
    // Try to find by data-id matches (id)
    let target = Array.from(navButtons).find(b => (b as HTMLElement).dataset.id === action.value);
    
    // Fallback to text content
    if (!target) {
      target = Array.from(navButtons).find(b => b.textContent?.toLowerCase().includes(action.value?.toLowerCase() || ''));
    }
    
    if (target) {
      (target as HTMLElement).click();
    } else {
      throw new Error(`Navigation target not found: ${action.value}`);
    }
  };

  if (!isAutopilotActive && autopilotQueue.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999]">
      {/* Neural Highlight Overlay */}
      <AnimatePresence>
        {highlightPos && (
          <motion.div
            initial={{ opacity: 0, scale: 1.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute border-2 border-primary shadow-[0_0_20px_rgba(212,255,0,0.5)] rounded-md pointer-events-none"
            style={{
              left: highlightPos.x - 4,
              top: highlightPos.y - 4,
              width: highlightPos.w + 8,
              height: highlightPos.h + 8
            }}
          >
            <div className="absolute -top-6 left-0 bg-primary text-black text-[9px] font-black uppercase px-2 py-0.5 rounded">
              NYX_ACTION: {autopilotStatus}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel Status */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="absolute bottom-6 right-6 w-72 glass-card border-primary/40 p-4 pointer-events-auto shadow-2xl"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              isAutopilotActive ? "bg-primary" : "bg-white/20"
            )} />
            <h3 className="text-[11px] font-black uppercase tracking-tighter text-white">Nyx Autopilot Mode</h3>
          </div>
          <button 
            onClick={toggleAutopilot}
            className="p-1 px-2 bg-white/5 hover:bg-white/10 rounded text-[9px] text-white/40 uppercase font-black"
          >
            {isAutopilotActive ? <Square size={10} className="inline mr-1" /> : <Play size={10} className="inline mr-1" />}
            {isAutopilotActive ? 'Stop' : 'Resume'}
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[8px] font-mono uppercase text-white/40">
            <span>Current Operation</span>
            <span className="text-primary">{autopilotStatus}</span>
          </div>
          
          <div className="bg-black/40 rounded border border-white/5 p-2 h-24 overflow-y-auto custom-scrollbar">
            {autopilotQueue.length > 0 ? (
              autopilotQueue.map((action, idx) => (
                <div key={action.id} className={cn(
                  "flex items-center gap-2 text-[9px] py-1 border-b border-white/5 last:border-0",
                  idx === 0 ? "text-white" : "text-white/20"
                )}>
                  {idx === 0 ? <Activity size={8} className="animate-pulse text-primary" /> : <ChevronRight size={8} />}
                  <span className="font-mono uppercase">{action.type}</span>
                  <span className="truncate opacity-60">[{action.target || action.value}]</span>
                  {idx === 0 && <span className="ml-auto text-[8px] italic animate-pulse">Running...</span>}
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-white/20">
                <CheckCircle2 size={16} className="mb-2" />
                <span className="text-[8px] font-mono italic">QUEUE_EMPTY</span>
              </div>
            )}
          </div>

          {autopilotStatus.startsWith('ERROR') && (
            <div className="flex items-center gap-2 bg-neon-pink/10 border border-neon-pink/20 p-2 rounded">
              <AlertCircle size={12} className="text-neon-pink" />
              <p className="text-[9px] text-neon-pink font-mono truncate">{autopilotStatus}</p>
            </div>
          )}

          <div className="pt-2 flex justify-between items-center border-t border-white/5">
            <span className="text-[8px] font-mono text-white/20 uppercase">Auth_Token: Verified</span>
            <Sparkles size={10} className="text-primary/40" />
          </div>
        </div>
      </motion.div>
    </div>
  );
};
