import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { Send, Bot, User, Sparkles, Brain } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export const AIPanel: React.FC = () => {
  const { credentials, addLog, aiContext, updateAiContext } = useDashboard();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryInput, setMemoryInput] = useState(aiContext);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !showMemory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showMemory]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const apiKey = credentials['GEMINI_API_KEY'] || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not found in settings or environment.');
      }

      const genAI = new GoogleGenAI({ apiKey });
      
      const response = await genAI.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${aiContext}\n\nCurrent user request: ${userMessage}`
      });

      const text = response.text || 'No response from AI.';

      setMessages(prev => [...prev, { role: 'ai', content: text }]);
      addLog('AI_CHAT', `AI responded to: ${userMessage.substring(0, 30)}...`);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMemory = () => {
    updateAiContext(memoryInput);
    setShowMemory(false);
    addLog('UPDATE_AI_CONTEXT', 'Updated AI Assistant system context');
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neon-lime/20 rounded-lg">
            <Sparkles className="text-neon-lime" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">OmniDash AI Assistant</h2>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">Powered by Gemini</p>
          </div>
        </div>
        <button 
          onClick={() => setShowMemory(!showMemory)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors",
            showMemory ? "bg-neon-lime text-black" : "bg-white/5 hover:bg-white/10 text-white/60"
          )}
        >
          <Brain size={14} />
          Context Memory
        </button>
      </div>

      <div className="flex-1 glass-card mb-4 flex flex-col overflow-hidden bg-black/20 relative">
        {showMemory ? (
          <div className="absolute inset-0 z-10 bg-card-bg flex flex-col p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-neon-lime">System Instructions & Memory</h3>
            <p className="text-xs text-white/50 mb-4">
              Define how the AI should behave, what it should remember about your dashboard, and any custom rules for generating code.
            </p>
            <textarea
              value={memoryInput}
              onChange={(e) => setMemoryInput(e.target.value)}
              className="flex-1 bg-black/50 border border-card-border rounded-xl p-4 text-sm font-mono text-white/80 focus:outline-none focus:border-neon-lime/50 resize-none custom-scrollbar"
              placeholder="You are OmniDash AI..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => { setMemoryInput(aiContext); setShowMemory(false); }}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveMemory}
                className="px-4 py-2 rounded-lg text-xs font-bold bg-neon-lime text-black hover:bg-neon-lime/80 transition-colors"
              >
                Save Memory
              </button>
            </div>
          </div>
        ) : null}

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
              <Bot size={64} />
              <div className="max-w-xs">
                <p className="text-sm font-bold uppercase tracking-widest mb-2">How can I help you today?</p>
                <p className="text-xs">Ask me to generate widget code, explain functions, or help with your dashboard configuration.</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <div key={i} className={cn(
              "flex gap-4",
              msg.role === 'user' ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                msg.role === 'user' ? "bg-neon-blue text-black" : "bg-neon-lime text-black"
              )}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={cn(
                "max-w-[80%] p-4 rounded-2xl text-sm prose prose-invert prose-sm",
                msg.role === 'user' ? "bg-white/10 rounded-tr-none" : "bg-card-bg border border-card-border rounded-tl-none"
              )}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-4 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-neon-lime/20" />
              <div className="h-12 w-48 bg-white/5 rounded-2xl" />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-card-border bg-card-bg/50">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="w-full bg-white/5 border border-card-border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-neon-lime/50 transition-colors"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-lime hover:bg-neon-lime/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        {['Generate a clock widget', 'Show CPU usage code', 'How to add a chart?'].map((suggestion) => (
          <button 
            key={suggestion}
            onClick={() => setInput(suggestion)}
            className="text-[10px] px-3 py-1.5 bg-white/5 border border-card-border rounded-full hover:bg-white/10 transition-colors text-white/60"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
