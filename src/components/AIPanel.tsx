import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { Send, Bot, User, Sparkles, Brain, Image as ImageIcon, Mic, Search as SearchIcon, X, Loader2, Volume2 } from 'lucide-react';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

export const AIPanel: React.FC = () => {
  const { credentials, addLog, aiContext, updateAiContext } = useDashboard();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, type?: 'text' | 'image' }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryInput, setMemoryInput] = useState(aiContext);
  const [mode, setMode] = useState<'chat' | 'image' | 'voice'>('chat');
  const [isHighThinking, setIsHighThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (scrollRef.current && !showMemory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showMemory]);

  const getAI = () => {
    const apiKey = credentials['GEMINI_API_KEY'] || process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY not found.');
    return new GoogleGenAI({ apiKey });
  };

  const handleTTS = async (text: string, index: number) => {
    if (isSpeaking !== null) return;
    setIsSpeaking(index);

    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Say clearly: ${text.substring(0, 500)}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const audioData = atob(base64Audio);
        const arrayBuffer = new ArrayBuffer(audioData.length);
        const view = new Uint8Array(arrayBuffer);
        for (let i = 0; i < audioData.length; i++) {
          view[i] = audioData.charCodeAt(i);
        }

        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => setIsSpeaking(null);
        source.start();
      } else {
        setIsSpeaking(null);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = getAI();

      if (mode === 'image') {
        const response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-image-preview',
          contents: { parts: [{ text: userMessage }] },
          config: {
            imageConfig: { aspectRatio: "1:1", imageSize: "1K" }
          }
        });

        let imageUrl = '';
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            imageUrl = `data:image/png;base64,${part.inlineData.data}`;
            break;
          }
        }

        if (imageUrl) {
          setMessages(prev => [...prev, { role: 'ai', content: imageUrl, type: 'image' }]);
          addLog('AI_IMAGE_GEN', `Generated image for: ${userMessage.substring(0, 30)}...`);
        } else {
          setMessages(prev => [...prev, { role: 'ai', content: 'Failed to generate image.' }]);
        }
      } else {
        // Multi-turn chat
        if (!chatRef.current) {
          chatRef.current = ai.chats.create({
            model: 'gemini-3.1-pro-preview',
            config: {
              systemInstruction: aiContext,
              tools: [{ googleSearch: {} }],
              toolConfig: { includeServerSideToolInvocations: true },
              thinkingConfig: isHighThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined
            }
          });
        }

        const response = await chatRef.current.sendMessage({ message: userMessage });
        const text = response.text || 'No response from AI.';

        setMessages(prev => [...prev, { role: 'ai', content: text }]);
        addLog('AI_CHAT', `AI responded to: ${userMessage.substring(0, 30)}...`);
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveMemory = () => {
    updateAiContext(memoryInput);
    setShowMemory(false);
    chatRef.current = null; // Reset chat to apply new context
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
            <div className="flex gap-4 mt-1">
              <button 
                onClick={() => setMode('chat')}
                className={cn("text-[10px] uppercase tracking-widest font-bold transition-colors", mode === 'chat' ? "text-neon-lime" : "text-white/40 hover:text-white")}
              >
                Chat
              </button>
              <button 
                onClick={() => setMode('image')}
                className={cn("text-[10px] uppercase tracking-widest font-bold transition-colors", mode === 'image' ? "text-neon-pink" : "text-white/40 hover:text-white")}
              >
                Image Gen
              </button>
              <button 
                onClick={() => setMode('voice')}
                className={cn("text-[10px] uppercase tracking-widest font-bold transition-colors", mode === 'voice' ? "text-neon-blue" : "text-white/40 hover:text-white")}
              >
                Live Voice
              </button>
              <button 
                onClick={() => {
                  setIsHighThinking(!isHighThinking);
                  chatRef.current = null; // Reset chat to apply new config
                }}
                className={cn(
                  "flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold transition-colors",
                  isHighThinking ? "text-neon-lime" : "text-white/40 hover:text-white"
                )}
              >
                <Brain size={10} />
                High Thinking
              </button>
            </div>
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
        {showMemory && (
          <div className="absolute inset-0 z-10 bg-card-bg flex flex-col p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-neon-lime">System Instructions & Memory</h3>
            <textarea
              value={memoryInput}
              onChange={(e) => setMemoryInput(e.target.value)}
              className="flex-1 bg-black/50 border border-card-border rounded-xl p-4 text-sm font-mono text-white/80 focus:outline-none focus:border-neon-lime/50 resize-none custom-scrollbar"
              placeholder="You are OmniDash AI..."
            />
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowMemory(false)} className="px-4 py-2 rounded-lg text-xs font-bold bg-white/5">Cancel</button>
              <button onClick={saveMemory} className="px-4 py-2 rounded-lg text-xs font-bold bg-neon-lime text-black">Save Memory</button>
            </div>
          </div>
        )}

        {mode === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-8 p-12 text-center">
            <div className="w-32 h-32 rounded-full bg-neon-blue/20 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-2 border-neon-blue animate-ping opacity-20" />
              <Mic size={48} className="text-neon-blue" />
            </div>
            <div>
              <h3 className="text-lg font-bold uppercase tracking-widest mb-2">Live Voice Conversation</h3>
              <p className="text-sm text-white/40 max-w-xs">Speak naturally with OmniDash AI in real-time. (Live API integration pending audio context setup)</p>
            </div>
            <button className="px-8 py-3 bg-neon-blue text-black rounded-full font-bold uppercase tracking-widest text-xs hover:bg-neon-blue/80 transition-all">
              Start Session
            </button>
          </div>
        ) : (
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                <Bot size={64} />
                <div className="max-w-xs">
                  <p className="text-sm font-bold uppercase tracking-widest mb-2">How can I help you today?</p>
                  <p className="text-xs">
                    {mode === 'image' ? 'Describe the image you want to create.' : 'Ask me to generate widget code, explain functions, or search the web.'}
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-4", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", msg.role === 'user' ? "bg-neon-blue text-black" : "bg-neon-lime text-black")}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn("max-w-[80%] p-4 rounded-2xl text-sm relative group", msg.role === 'user' ? "bg-white/10 rounded-tr-none" : "bg-card-bg border border-card-border rounded-tl-none")}>
                  {msg.type === 'image' ? (
                    <img src={msg.content} alt="Generated" className="rounded-lg w-full h-auto shadow-2xl" referrerPolicy="no-referrer" />
                  ) : (
                    <>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === 'ai' && (
                        <button 
                          onClick={() => handleTTS(msg.content, i)}
                          className={cn(
                            "absolute -right-10 top-0 p-2 rounded-lg transition-all",
                            isSpeaking === i ? "text-neon-lime animate-pulse" : "text-white/20 hover:text-white/60 hover:bg-white/5"
                          )}
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-neon-lime/20 flex items-center justify-center">
                  <Loader2 size={16} className="text-neon-lime animate-spin" />
                </div>
                <div className="h-12 w-48 bg-white/5 rounded-2xl flex items-center px-4">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {mode !== 'voice' && (
          <div className="p-4 border-t border-card-border bg-card-bg/50">
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'image' ? "Describe an image..." : "Ask anything..."}
                className="w-full bg-white/5 border border-card-border rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-neon-lime/50 transition-colors"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-neon-lime hover:bg-neon-lime/10 rounded-lg transition-colors disabled:opacity-50"
              >
                {mode === 'image' ? <ImageIcon size={18} /> : <Send size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {mode === 'chat' && (
        <div className="flex gap-2">
          {['Search for latest tech news', 'Create a weather widget', 'Explain this dashboard'].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-[10px] px-3 py-1.5 bg-white/5 border border-card-border rounded-full hover:bg-white/10 transition-colors text-white/60"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
