import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Keyboard, MessageSquare, X, Send, Sparkles, Activity, Bell, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';
import Draggable from 'react-draggable';
import { GoogleGenAI } from '@google/genai';
import { AIWave } from './AIWave';
import { NeuralService } from '../lib/neuralService';

export const FloatingAssistant: React.FC = () => {
  const { logs, autopilotStatus, addLog, addNotification, credentials, aiContext, agents, assistantSettings, updateTheme } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<{ role: 'ai' | 'user', content: string }[]>([
    { role: 'ai', content: 'Neural Assistant Online. Systems nominal.' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const nodeRef = useRef(null);

  const isDraggable = assistantSettings?.isDraggable ?? true;
  const isVoiceWaveEnabled = assistantSettings?.voiceWaveEnabled ?? true;

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const agentsInfo = agents.map(a => `${a.name}(${a.status})`).join(', ');
      const systemContext = `${aiContext}\n\nYou are answering from a small floating assistant window. Be extremely concise and tech-focused.\n\nContext:\n- Agents: ${agentsInfo}\n- Recent Actions: ${logs.slice(-3).map(l => l.action).join(', ')}`;
      const prompt = `${systemContext}\n\nUSER: ${userMsg}`;

      const result = await NeuralService.generate(prompt);
      
      setMessages(prev => [...prev, { role: 'ai', content: result.content }]);
      addLog('ASSISTANT_AI_REPLY', `Nyx replied to: ${userMsg.substring(0, 15)}...`);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', content: 'Neural link error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <Draggable nodeRef={nodeRef} disabled={!isDraggable} handle=".drag-handle">
      <div ref={nodeRef} className="fixed bottom-6 left-6 z-[10001] flex flex-col items-start gap-4">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-80 h-[450px] glass-card flex flex-col border-primary/20 shadow-2xl overflow-hidden mb-2"
            >
              {/* Chat Header */}
              <div className={cn(
                "p-4 border-b border-white/5 flex flex-col gap-3 transition-colors",
                isListening ? "bg-primary/20" : "bg-primary/10"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="drag-handle cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded">
                      <GripVertical size={14} className="text-white/20" />
                    </div>
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <Sparkles size={16} />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-black" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase text-white">Nyx Assistant</h4>
                      <p className="text-[8px] text-primary uppercase font-mono animate-pulse">{isLoading ? 'Thinking...' : autopilotStatus}</p>
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

                {/* LiveVoice Waveform (Using consolidated AIWave) */}
                <div className="h-10 overflow-hidden bg-black/20 rounded-lg flex items-center justify-center">
                  <AIWave isListening={isListening} isProcessing={isLoading} />
                </div>
              </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-black/40">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex flex-col gap-1", msg.role === 'user' ? "items-end" : "items-start")}>
                  <div className={cn(
                    "p-3 rounded-2xl text-[10px] max-w-[90%] leading-relaxed",
                    msg.role === 'user' ? "bg-primary text-black font-bold" : "bg-white/5 border border-white/5 text-white/80"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-[9px] text-primary/60 font-black animate-pulse">
                  <Activity size={10} />
                  PROCESSING_UPLINK...
                </div>
              )}
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
              isOpen ? "bg-neon-pink text-white border-white/20" : "bg-primary text-black border-primary/40",
              isListening && "animate-pulse"
            )}
          >
            {isOpen ? <X size={24} /> : (
              <div className="flex flex-col items-center">
                <AIWave isListening={isListening} />
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
    </Draggable>
  );
};
