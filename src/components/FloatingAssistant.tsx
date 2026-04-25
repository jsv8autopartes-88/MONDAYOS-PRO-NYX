import React, { useState, useEffect } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Keyboard, MessageSquare, X, Send, Sparkles, Activity, Bell } from 'lucide-react';
import { cn } from '../lib/utils';

export const FloatingAssistant: React.FC = () => {
  const { logs, autopilotStatus, addLog, addNotification } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);

  const toggleListening = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsListening(!isListening);
    if (!isListening) {
      addNotification({
        title: 'Voice Priority Active',
        message: 'Nyx is listening to biometric triggers...',
        featureId: 'VOICE_TRIGGER',
        type: 'info'
      });
    }
  };

  useEffect(() => {
    // Initial welcome notification
    const timer = setTimeout(() => {
      addNotification({
        title: 'Neural Assistant Online',
        message: 'Nyx is ready to orchestrate your local environment. Click for tutorial.',
        featureId: 'AI_ASSISTANT',
        type: 'info'
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll simulation for chat
  const [recentLogs, setRecentLogs] = useState(logs.slice(-5));

  useEffect(() => {
    setRecentLogs(logs.slice(-5));
  }, [logs]);

  const handleSend = () => {
    if (!input.trim()) return;
    addLog('USER_COMMAND', input);
    setInput('');
    // Expansion logic could go here to trigger autopilot or missions
  };

  return (
    <div className="fixed bottom-6 left-6 z-[10001] flex flex-col items-start gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-80 h-[450px] glass-card flex flex-col border-primary/20 shadow-2xl overflow-hidden mb-2"
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-white/5 flex flex-col gap-3 bg-primary/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Sparkles size={16} />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase text-white">Nyx Assistant</h4>
                    <p className="text-[8px] text-primary uppercase font-mono animate-pulse">{autopilotStatus}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsKeyboardMode(!isKeyboardMode)}
                    className={cn(
                      "p-1.5 rounded-lg transition-all",
                      isKeyboardMode ? "bg-primary text-black" : "text-white/20 hover:text-white"
                    )}
                  >
                    <Keyboard size={14} />
                  </button>
                  <button onClick={() => setIsOpen(false)} className="text-white/20 hover:text-white"><X size={16} /></button>
                </div>
              </div>

              {/* LiveVoice Waveform (Inner) */}
              <div className="flex gap-1 items-end h-8 overflow-hidden bg-black/20 rounded-lg p-2 justify-center">
                {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.7, 0.5, 0.9].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: !isKeyboardMode && isListening ? [h*24, (1-h)*24, h*24] : 4 }}
                    transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.05 }}
                    className="flex-1 bg-primary rounded-full min-w-[2px]"
                  />
                ))}
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-white/60 leading-relaxed italic">
                  "I am monitoring your local node. Autopilot is ready for UI instructions."
                </p>
              </div>
              
              {recentLogs.map((log) => (
                <div key={log.id} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Activity size={10} className="text-primary/40" />
                    <span className="text-[8px] font-black uppercase text-white/20">{log.action}</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-mono ml-4 truncate">{log.details}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-white/5 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text"
                  autoFocus
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-[11px] text-white focus:border-primary/50 outline-none pr-10"
                  placeholder="Instruir a la IA..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-3 top-2.5 text-primary hover:scale-110 transition-transform"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center gap-2">
        {/* Voice Wave Animation Trigger */}
        <div className="relative group">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!isOpen) {
                setIsOpen(true);
                setIsListening(true);
              } else {
                setIsOpen(false);
                setIsListening(false);
              }
            }}
            className={cn(
              "w-16 h-16 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl relative z-10 border-2",
              isOpen ? "bg-neon-pink text-white border-white/20" : "bg-primary text-black border-primary/40"
            )}
          >
            {isOpen ? <X size={24} /> : (
              <div className="flex flex-col items-center">
                <div className="flex gap-0.5 items-end h-6 mb-1">
                  {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
                    <motion.div 
                      key={i}
                      animate={{ height: [h*20, (1-h)*20, h*20] }}
                      transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                      className="w-1 bg-black rounded-full"
                    />
                  ))}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-black/40 animate-pulse" />
              </div>
            )}
          </motion.button>

          {/* Biometric Trigger Label */}
          {!isOpen && (
            <div className="absolute -right-24 top-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <p className="text-[9px] font-black uppercase text-primary whitespace-nowrap tracking-widest">Neural Trigger</p>
            </div>
          )}

          {/* Secondary Keyboard Icon */}
          <AnimatePresence>
            {!isOpen && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => { setIsOpen(true); setIsKeyboardMode(true); }}
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-primary transition-all border border-white/5"
              >
                <Keyboard size={14} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* New Message Notification Pulse */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-neon-blue rounded-full border-2 border-black flex items-center justify-center animate-bounce">
            <Bell size={8} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};
