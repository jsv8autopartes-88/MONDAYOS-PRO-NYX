import { useAppStore } from '../store/appStore';
import React, { useState, useRef, useEffect } from 'react';
import { useDashboard } from '../store/DashboardContext';
import { Send, Bot, User, Sparkles, Brain, Image as ImageIcon, Mic, Search as SearchIcon, X, Loader2, Volume2, Zap } from 'lucide-react';
import { GoogleGenAI, Type, ThinkingLevel, Modality } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { useNyxDaemon } from '../hooks/useNyxDaemon';

import { NeuralService, AIProvider } from '../lib/neuralService';

export const AIPanel: React.FC = () => {
  const { credentials, aiContext, updateAiContext, searchQuery, addNotification } = useDashboard();
  const { addLog, agents, logs, addAutopilotTask } = useAppStore();
  const { sendCommand } = useNyxDaemon();
  const [provider, setProvider] = useState<AIProvider>('gemini');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, type?: 'text' | 'image' }[]>([]);
  const [isUplinkEnabled, setIsUplinkEnabled] = useState(true);
  
  const filteredMessages = messages.filter(msg => {
    const query = (searchQuery || '').toLowerCase();
    return msg.content.toLowerCase().includes(query);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const [isFetchingAudio, setIsFetchingAudio] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [memoryInput, setMemoryInput] = useState(aiContext);
  const [mode, setMode] = useState<'chat' | 'image' | 'voice'>('chat');
  const [isHighThinking, setIsHighThinking] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current && !showMemory) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, showMemory]);

  const handleTTS = async (text: string, index: number) => {
    // If clicking the currently playing audio, stop it
    if (isSpeaking === index) {
      if (sourceRef.current) {
        sourceRef.current.stop();
        sourceRef.current.disconnect();
        sourceRef.current = null;
      }
      setIsSpeaking(null);
      setIsFetchingAudio(false);
      return;
    }

    // Stop any previously playing audio
    if (sourceRef.current) {
      sourceRef.current.stop();
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    setIsSpeaking(index);
    setIsFetchingAudio(true);

    try {
      let envKeyTts = '';
      try {
        if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
          envKeyTts = process.env.GEMINI_API_KEY;
        }
      } catch (e) {}
      const apiKey = credentials['GEMINI_API_KEY'] || envKeyTts;
      const ai = new GoogleGenAI({ apiKey: apiKey! });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
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
        sourceRef.current = source;
        source.buffer = audioBuffer;
        source.connect(audioContextRef.current.destination);
        source.onended = () => {
          if (sourceRef.current === source) {
            setIsSpeaking(null);
            sourceRef.current = null;
          }
        };
        setIsFetchingAudio(false);
        source.start();
      } else {
        setIsSpeaking(null);
        setIsFetchingAudio(false);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      setIsSpeaking(null);
      setIsFetchingAudio(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    // Interceptor logic: If start exactly with !GO NYX, DO NOT send to general AI API
    if (userMessage.startsWith('!GO NYX')) {
      try {
        if (userMessage.includes('MACRO')) {
          sendCommand('PROTOCOL_GO_NYX', { task_type: 'UI_MACRO', image_target: 'target.png' });
        } else if (userMessage.includes('SCRAPE')) {
          sendCommand('PROTOCOL_GO_NYX', { task_type: 'SCRAPE_CATALOG', url: 'https://ejemplo.com', selector: '.price' });
        } else {
          sendCommand('PROTOCOL_GO_NYX', { task_type: 'GENERIC_EXECUTION', command: userMessage });
        }

        setMessages(prev => [...prev, { role: 'ai', content: '⚙️ [NYX CORE]: Protocolo de ejecución física autorizado. Tomando control del sistema...' }]);
        addLog('DAEMON_COMMAND', `Executed physical daemon protocol via !GO NYX override`);
      } catch (err: any) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'ai', content: `⚙️ [NYX CORE]: Fallo de enlace neuronal con el Daemon: ${err.message}` }]);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      if (mode === 'image') {
        let envKeyImg = '';
        try {
          if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
            envKeyImg = process.env.GEMINI_API_KEY;
          }
        } catch (e) {}
        const apiKey = credentials['GEMINI_API_KEY'] || envKeyImg;
        const ai = new GoogleGenAI({ apiKey: apiKey! });
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
        const agentsInfo = agents.map(a => `${a.name}(${a.status})`).join(', ');
        
        let systemContext = `${aiContext}\n\nDASHBOARD_CURRENT_STATE:\n- Agents: ${agentsInfo}\n- Recent Logs: ${logs.slice(-5).map(l => l.details).join('; ')}\n- Search Query: ${searchQuery || 'None'}`;
        
        if (isUplinkEnabled) {
          systemContext += `
\n[SYSTEM_RULE: AUTOPILOT UPLINK ENABLED]
If the user's input asks you to perform an action, click on items, fill out inputs, clear parameters, open logs, look at OBD, play or skip modules, you MUST output a valid JSON code block with system actions to fulfill their request. Start the block with \`\`\`json autopilot and end with \`\`\`.
Do not output anything else in that block. Let us know what you did in your main conversational text response. Keep it friendly and concise!
Example snippet to include in your markdown:
\`\`\`json autopilot
[
  {"type": "navigation", "value": "obdscan"},
  {"type": "click", "target": "Connect Adapter"},
  {"type": "wait", "value": "1500"},
  {"type": "navigation", "value": "home"}
]
\`\`\`
Allowed values for navigation "value": 'home', 'agents', 'ai', 'files', 'notes', 'scripts', 'links', 'autopilot', 'obdscan', 'remote', 'audit', 'dev', 'terminal', 'blueprint', 'installer', 'settings', 'logs'.
`;
        }

        const finalPrompt = `${systemContext}\n\nUSER_REQUEST: ${userMessage}`;
        const response = await NeuralService.generate(finalPrompt, provider);

        setMessages(prev => [...prev, { role: 'ai', content: response.content }]);
        addLog('AI_CHAT', `[${provider}] AI responded to: ${userMessage.substring(0, 30)}...`);

        // Check and parse Autopilot uplink triggers
        if (isUplinkEnabled) {
          const match = response.content.match(/```json\s+autopilot\s*([\s\S]*?)\s*```/);
          if (match && match[1]) {
            try {
              const actions = JSON.parse(match[1]);
              if (Array.isArray(actions) && actions.length > 0) {
                addAutopilotTask(actions);
                addNotification({
                  title: 'AI_AUTOPILOT_TRIGGERED',
                  message: `Autopilot uplink configured with ${actions.length} automations successfully.`,
                  type: 'success',
                  featureId: 'AUTOPILOT_CONTROLLER'
                });
              }
            } catch (e) {
              console.error("AI Autopilot parsing failure:", e);
            }
          }
        }
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'ai', content: `Neural Error: ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      addNotification({ title: 'Speech Not Supported', message: 'Your browser does not support Speech Recognition.', type: 'error', featureId: 'SPEECH_RECOGNITION' });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'es-ES'; // Set to user lang

    recognition.onstart = () => {
      setIsListening(true);
      addLog('AI_VOICE_LISTEN', 'Voice recognition started');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      addLog('AI_VOICE_RESULT', `Voice input capture: ${transcript}`);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      addNotification({ title: 'Voice Error', message: `Recognition failed: ${event.error}`, type: 'error', featureId: 'SPEECH_RECOGNITION' });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const saveMemory = () => {
    updateAiContext(memoryInput);
    setShowMemory(false);
    chatRef.current = null; // Reset chat to apply new context
    addLog('UPDATE_AI_CONTEXT', 'Updated AI Assistant system context');
  };

  return (
    <div className="h-full flex flex-col p-6 max-w-5xl mx-auto gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Sparkles className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight uppercase">Nyx AI Assistant</h2>
            <div className="flex gap-4 mt-1">
              <button 
                onClick={() => setMode('chat')}
                className={cn("text-[10px] uppercase tracking-widest font-black transition-all", mode === 'chat' ? "text-primary active-glow" : "text-white/40 hover:text-white")}
              >
                Chat
              </button>
              <button 
                onClick={() => setMode('image')}
                className={cn("text-[10px] uppercase tracking-widest font-black transition-all", mode === 'image' ? "text-neon-pink active-glow" : "text-white/40 hover:text-white")}
              >
                Image Gen
              </button>
              <button 
                onClick={() => setMode('voice')}
                className={cn("text-[10px] uppercase tracking-widest font-black transition-all", mode === 'voice' ? "text-neon-blue active-glow" : "text-white/40 hover:text-white")}
              >
                Live Voice
              </button>
              <button 
                onClick={() => {
                  setIsFastMode(!isFastMode);
                  if (isFastMode) setIsHighThinking(false);
                  chatRef.current = null;
                }}
                className={cn(
                  "flex items-center gap-1 text-[10px] uppercase tracking-widest font-black transition-all",
                  isFastMode ? "text-neon-blue active-glow" : "text-white/40 hover:text-white"
                )}
              >
                <Zap size={10} />
                Fast Mode
              </button>
              <button 
                onClick={() => {
                  setIsHighThinking(!isHighThinking);
                  if (!isHighThinking) setIsFastMode(false);
                  chatRef.current = null; // Reset chat to apply new config
                }}
                className={cn(
                  "flex items-center gap-1 text-[10px] uppercase tracking-widest font-black transition-all",
                  isHighThinking ? "text-primary active-glow" : "text-white/40 hover:text-white"
                )}
              >
                <Brain size={10} />
                High Thinking
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              setIsUplinkEnabled(!isUplinkEnabled);
              addNotification({
                title: 'AUTOPILOT_AI_UPLINK_STATUS',
                message: isUplinkEnabled ? 'Autopilot automation triggers disabled.' : 'Adaptive autopilot real AI stream parser enabled.',
                type: 'info',
                featureId: 'SPEECH_RECOGNITION'
              });
            }}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95 active:shadow-[0_0_15px_rgba(255,255,255,0.7)]",
              isUplinkEnabled ? "bg-neon-lime text-black shadow-[0_0_15px_rgba(212,255,0,0.3)]" : "bg-white/5 hover:bg-white/10 text-white/60"
            )}
          >
            <Zap size={14} className={cn(isUplinkEnabled && "animate-pulse")} />
            AI Uplink: {isUplinkEnabled ? 'ACTIVE' : 'OFF'}
          </button>

          <button 
            onClick={() => setShowMemory(!showMemory)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 active:scale-95 active:shadow-[0_0_15px_rgba(255,255,255,0.7)]",
              showMemory ? "bg-primary text-black shadow-[0_0_15px_rgba(207,248,12,0.3)]" : "bg-white/5 hover:bg-white/10 text-white/60"
            )}
          >
            <Brain size={14} />
            Context Memory
          </button>
        </div>
      </div>

      <div className="flex-1 glass-card flex flex-col overflow-hidden bg-black/20 relative border-white/5">
        {showMemory && (
          <div className="absolute inset-0 z-10 bg-black/90 flex flex-col p-8 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] mb-6 text-primary">System Instructions & Memory</h3>
            <textarea
              value={memoryInput}
              onChange={(e) => setMemoryInput(e.target.value)}
              maxLength={5000}
              className="flex-1 bg-black/50 border border-white/10 rounded-2xl p-6 text-sm font-mono text-white/80 focus:outline-none focus:border-primary/50 resize-none custom-scrollbar leading-relaxed"
              placeholder="You are Nyx AI..."
            />
            <div className="flex justify-between items-center mt-6">
              <div className={cn(
                "text-[10px] font-mono uppercase tracking-widest",
                memoryInput.length >= 5000 ? "text-neon-pink" : "text-white/40"
              )}>
                {memoryInput.length} <span className="opacity-50">/ 5000 chars</span>
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowMemory(false)} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={saveMemory} className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-primary text-black transition-all active:scale-95 shadow-[0_0_15px_rgba(207,248,12,0.3)]">Save Memory</button>
              </div>
            </div>
          </div>
        )}

        {mode === 'voice' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-10 p-12 text-center">
            <div className="w-40 h-40 rounded-full bg-neon-blue/10 flex items-center justify-center relative">
              <div className={cn("absolute inset-0 rounded-full border-2 border-neon-blue opacity-10", isListening && "animate-ping")} />
              <div className={cn("absolute inset-4 rounded-full border border-neon-blue/30", isListening && "animate-pulse")} />
              <Mic size={56} className={cn("transition-all", isListening ? "text-primary scale-110" : "text-neon-blue")} />
              {isListening && <div className="absolute -bottom-4 bg-primary text-black text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Listening...</div>}
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-black uppercase tracking-[0.2em]">{isListening ? 'User Input Stream' : 'Live Voice Conversation'}</h3>
              <p className="text-xs text-white/30 max-w-xs mx-auto leading-relaxed">
                {isListening ? 'Processing audio buffer into neural context...' : 'Speak naturally with Nyx AI in real-time. (Live API integration pending audio context setup)'}
              </p>
            </div>
            <button 
              onClick={isListening ? () => setIsListening(false) : startVoiceInput}
              className={cn(
                "px-10 py-4 rounded-full font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg flex items-center gap-3",
                isListening ? "bg-neon-pink text-white shadow-neon-pink/20" : "bg-neon-blue text-black shadow-neon-blue/20 hover:bg-neon-blue/80"
              )}
            >
              {isListening ? <X size={14} /> : <Mic size={14} />}
              {isListening ? 'Cancel Listening' : 'Start Session'}
            </button>
          </div>
        ) : (
          <>
          <div className="px-8 pt-6 flex items-center gap-2 shrink-0 overflow-x-auto scrollbar-hide">
            {(['gemini', 'claude', 'ollama', 'openclaw'] as AIProvider[]).map(p => (
              <button
                key={p}
                onClick={() => setProvider(p)}
                className={cn(
                  "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border border-white/5",
                  provider === p ? "bg-primary text-black" : "bg-white/5 text-white/40 hover:text-white"
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-20">
                <div className="p-6 bg-white/5 rounded-full">
                  <Bot size={80} strokeWidth={1} />
                </div>
                <div className="max-w-xs space-y-2">
                  <p className="text-sm font-black uppercase tracking-[0.3em]">How can I help you today?</p>
                  <p className="text-[10px] uppercase tracking-widest leading-relaxed">
                    {mode === 'image' ? 'Describe the image you want to create.' : 'Ask me to generate widget code, explain functions, or search the web.'}
                  </p>
                </div>
              </div>
            )}
            {filteredMessages.map((msg, i) => (
              <div key={i} className={cn("flex gap-6", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg",
                  msg.role === 'user' ? "bg-neon-blue text-black" : "bg-primary text-black"
                )}>
                  {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className={cn(
                  "max-w-[85%] p-6 rounded-[2rem] text-sm relative group transition-all duration-300",
                  msg.role === 'user' 
                    ? "bg-white/5 rounded-tr-none border border-white/5" 
                    : "glass-card bg-white/[0.02] border-white/5 rounded-tl-none"
                )}>
                  {msg.type === 'image' ? (
                    <div className="space-y-4">
                      <img src={msg.content} alt="Generated" className="rounded-2xl w-full h-auto shadow-2xl border border-white/10" referrerPolicy="no-referrer" />
                      <div className="flex justify-end">
                         <span className="text-[9px] font-black text-neon-pink uppercase tracking-widest">Render Complete</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="prose prose-invert prose-sm max-w-none leading-relaxed text-white/80">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === 'ai' && (
                        <button 
                          onClick={() => handleTTS(msg.content, i)}
                          className={cn(
                            "absolute -right-12 top-0 p-2.5 rounded-xl transition-all",
                            isSpeaking === i ? "text-primary bg-primary/10" : "text-white/10 hover:text-primary hover:bg-white/5"
                          )}
                        >
                          {isSpeaking === i ? (
                            isFetchingAudio ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <div className="flex items-center justify-center gap-[2px] h-[18px] w-[18px]">
                                <span className="w-[3px] h-3 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                                <span className="w-[3px] h-4 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                                <span className="w-[3px] h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                              </div>
                            )
                          ) : (
                            <Volume2 size={18} />
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Loader2 size={20} className="text-primary animate-spin" />
                </div>
                <div className="h-14 w-56 glass-card bg-white/[0.02] border-white/5 rounded-[2rem] rounded-tl-none flex items-center px-6">
                  <span className="text-[10px] text-primary font-black uppercase tracking-[0.3em] animate-pulse">Thinking...</span>
                </div>
              </div>
            )}
          </div>
          </>
        )}

        {mode !== 'voice' && (
          <div className="p-6 border-t border-white/5 bg-white/[0.02]">
            <div className="relative group">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={mode === 'image' ? "DESCRIBE_IMAGE..." : "ASK_ANYTHING..."}
                className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-primary/50 transition-all group-focus-within:border-primary/30"
              />
              <button 
                onClick={handleSend}
                disabled={isLoading}
                className={cn(
                  "absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-xl transition-all disabled:opacity-50",
                  mode === 'image' ? "text-neon-pink hover:bg-neon-pink/10" : "text-primary hover:bg-primary/10"
                )}
              >
                {mode === 'image' ? <ImageIcon size={20} /> : <Send size={20} />}
              </button>
            </div>
          </div>
        )}
      </div>

      {mode === 'chat' && (
        <div className="flex flex-wrap gap-3">
          {['Search for latest tech news', 'Create a weather widget', 'Explain this dashboard'].map((suggestion) => (
            <button 
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-white/5 border border-white/5 rounded-full hover:bg-white/10 hover:border-primary/30 transition-all text-white/40 hover:text-primary"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
