import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Cpu, 
  Activity, 
  Terminal as TerminalIcon, 
  Send, 
  Trash2, 
  RefreshCw, 
  Monitor, 
  Smartphone, 
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  AlertCircle,
  X,
  Target,
  Wrench,
  Layout,
  Plus,
  Sparkles,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { AgentCommand, AgentMission, AgentSkill } from '../types';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { AgentNetworkGraph } from './AgentNetworkGraph';
import { DevDirectory } from './DevDirectory';
import { LocalAgentSetup } from './LocalAgentSetup';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const AgentControllerPanel: React.FC = () => {
  const { 
    agents, 
    missions, 
    skills, 
    user, 
    sendCommand, 
    deleteAgent, 
    addMission, 
    updateMission, 
    deleteMission, 
    addSkill, 
    updateSkill,
    deleteSkill 
  } = useDashboard();
  
  const [activeTab, setActiveTab] = useState<'nodes' | 'missions' | 'skills' | 'evolution' | 'directory' | 'setup'>('nodes');
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [commands, setCommands] = useState<AgentCommand[]>([]);
  const [inputCmd, setInputCmd] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isPlanningMission, setIsPlanningMission] = useState(false);
  const [newMissionGoal, setNewMissionGoal] = useState('');
  const [isEvolvingSkill, setIsEvolvingSkill] = useState<string | null>(null);
  const [evolutionLogs, setEvolutionLogs] = useState<{timestamp: number, message: string}[]>([]);

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  const evolveSkill = async (skillId: string) => {
    const skill = skills.find(s => s.id === skillId);
    if (!skill) return;
    
    setIsEvolvingSkill(skillId);
    setEvolutionLogs(prev => [...prev, { timestamp: Date.now(), message: `Starting evolution of [${skill.name}]...` }]);
    
    try {
      const prompt = `You are an AI Self-Correction Engine.
      Current Skill: "${skill.name}"
      Description: "${skill.description}"
      Current Code: "${skill.code}"
      
      Evolve this skill. Improve efficiency, add error handling, and optimize for modularity. 
      Return structured JSON: { evolved_code: string, improvements: string }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              evolved_code: { type: Type.STRING },
              improvements: { type: Type.STRING }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || '{}');
      if (data.evolved_code) {
        updateSkill(skillId, {
          code: data.evolved_code,
          description: skill.description + " (Opt: " + data.improvements.substring(0, 50) + "...)",
          evolutionCount: (skill.evolutionCount || 0) + 1
        });
        setEvolutionLogs(prev => [...prev, { timestamp: Date.now(), message: `Evolution complete for [${skill.name}]. Success.` }]);
      }
    } catch (error) {
      console.error(error);
      setEvolutionLogs(prev => [...prev, { timestamp: Date.now(), message: `Evolution failed for [${skill.name}]: ${error instanceof Error ? error.message : 'Unknown error'}` }]);
    } finally {
      setIsEvolvingSkill(null);
    }
  };

  useEffect(() => {
    if (!user || !selectedAgentId) {
      setCommands([]);
      return;
    }

    const commandsColRef = collection(db, 'users', user.uid, 'agents', selectedAgentId, 'commands');
    const q = query(commandsColRef, orderBy('createdAt', 'desc'), limit(15));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cmds = snapshot.docs.map(doc => doc.data() as AgentCommand);
      setCommands(cmds);
    });

    return () => unsubscribe();
  }, [user, selectedAgentId]);

  const handleSendCommand = async () => {
    if (!selectedAgentId || !inputCmd.trim()) return;
    await sendCommand(selectedAgentId, inputCmd.trim());
    setInputCmd('');
  };

  const getPlatformIcon = (platform?: string) => {
    if (platform?.toLowerCase().includes('win')) return <Monitor size={14} />;
    if (platform?.toLowerCase().includes('mobile')) return <Smartphone size={14} />;
    return <Cpu size={14} />;
  };

  const suggestCommand = async () => {
    if (!selectedAgent) return;
    setIsAiSuggesting(true);
    try {
      const prompt = `Suggest 3 useful commands for this agent: ${selectedAgent.name} on ${selectedAgent.platform}. Return plain text list.`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-lite-preview",
        contents: prompt,
      });
      const sugg = response.text?.split('\n')[0].trim();
      if (sugg) setInputCmd(sugg);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAiSuggesting(false);
    }
  };

  const planMission = async () => {
    if (!newMissionGoal.trim()) return;
    setIsPlanningMission(true);
    try {
      const prompt = `Goal: "${newMissionGoal}". Plan a mission with subtasks. Return JSON: { title: string, subtasks: Array<{description: string}> }`;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtasks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    description: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });
      const missionData = JSON.parse(response.text || '{}');
      if (missionData.title) {
        addMission({
          title: missionData.title,
          goal: newMissionGoal,
          status: 'active',
          subtasks: missionData.subtasks.map((s: any) => ({
            id: Math.random().toString(36).substr(2, 5),
            description: s.description,
            status: 'pending'
          }))
        });
        setNewMissionGoal('');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPlanningMission(false);
    }
  };

  const adaptMission = async (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;
    
    setEvolutionLogs(prev => [...prev, { timestamp: Date.now(), message: `Adapting mission [${mission.title}] to changing environments...` }]);
    try {
      const prompt = `Adapt this mission goal: "${mission.goal}". 
      Current Tasks: ${JSON.stringify(mission.subtasks)}.
      Context: System environment changed. Suggest new subtasks to maintain objective.
      Return JSON: { subtasks: Array<{description: string}> }`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const data = JSON.parse(response.text || '{}');
      if (data.subtasks) {
        updateMission(missionId, {
          subtasks: [...mission.subtasks, ...data.subtasks.map((s: any) => ({
            id: Math.random().toString(36).substr(2, 5),
            description: s.description,
            status: 'pending'
          }))]
        });
        setEvolutionLogs(prev => [...prev, { timestamp: Date.now(), message: `Mission [${mission.title}] adapted with ${data.subtasks.length} new tasks.` }]);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-dashboard-bg/20">
      {/* Navigation Rail */}
      <div className="w-16 border-r border-white/5 flex flex-col items-center py-6 gap-6 bg-black/40">
        <button 
          onClick={() => setActiveTab('nodes')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'nodes' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
        >
          <Layout size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('missions')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'missions' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
        >
          <Target size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('skills')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'skills' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
        >
          <Wrench size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('evolution')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'evolution' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
        >
          <Sparkles size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('directory')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'directory' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
        >
          <FolderOpen size={20} />
        </button>
        <button 
          onClick={() => setActiveTab('setup')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'setup' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
        >
          <Smartphone size={20} />
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'nodes' && (
            <motion.div 
              key="nodes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex overflow-hidden"
            >
              {/* Agent List Sidebar */}
              <div className="w-1/3 border-r border-white/5 flex flex-col bg-black/20">
                <div className="p-6 border-b border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-primary font-black tracking-widest uppercase text-xs">CONNECTED_NODES</h2>
                    <button 
                      onClick={() => setShowConnectModal(true)}
                      className="p-1 px-2 bg-primary/20 text-primary rounded border border-primary/20 text-[9px] font-bold uppercase transition-all"
                    >
                      + Connect
                    </button>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 border border-white/5 text-[10px] text-white/40">
                    Direct link to host agents established. Real-time steering active.
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                  {agents.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-30">
                      <Bot size={32} className="mb-2" />
                      <p className="text-xs uppercase">No Nodes Found</p>
                    </div>
                  ) : (
                    agents.map((agent) => (
                      <button
                        key={agent.id}
                        onClick={() => setSelectedAgentId(agent.id)}
                        className={cn(
                          "w-full p-4 rounded-xl border transition-all text-left",
                          selectedAgentId === agent.id ? "bg-primary/10 border-primary shadow-[0_0_20px_rgba(207,248,12,0.1)]" : "bg-white/5 border-white/10 hover:border-white/20"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={cn("p-1.5 rounded-lg", selectedAgentId === agent.id ? "bg-primary text-black" : "bg-white/10 text-white/60")}>
                              {getPlatformIcon(agent.platform)}
                            </div>
                            <span className="font-bold text-[11px] truncate">{agent.name}</span>
                          </div>
                          <div className={cn("px-2 py-0.5 rounded-full text-[8px] font-black uppercase", agent.status === 'online' ? "bg-primary/20 text-primary" : "bg-white/10 text-white/40")}>
                            {agent.status}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 flex flex-col bg-black/10">
                {selectedAgent ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-white/5 flex items-center justify-between glass-card rounded-none">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center">
                          <Monitor size={20} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black italic tracking-tighter text-white uppercase">{selectedAgent.name}</h3>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">{selectedAgent.platform} // {selectedAgent.id}</p>
                        </div>
                      </div>
                      <button onClick={() => deleteAgent(selectedAgent.id)} className="p-2 text-white/20 hover:text-neon-pink transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                      <div className="flex-1 glass-card p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar space-y-4 bg-black/40">
                        <div className="text-white/20 text-[9px] mb-4 border-b border-white/5 pb-2 uppercase tracking-widest">
                          // NODE_LINK_STABLE // STREAM_ACTIVE
                        </div>
                        <AnimatePresence initial={false}>
                          {[...commands].reverse().map((cmd) => (
                            <motion.div key={cmd.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1 border-l border-white/5 pl-3 py-1">
                              <div className="flex items-center justify-between">
                                <span className="text-primary">Node:{selectedAgentId.substring(0,4)}@nyx:{'>'} {cmd.cmd}</span>
                                <span className="text-white/20 text-[8px] uppercase">{new Date(cmd.createdAt).toLocaleTimeString()}</span>
                              </div>
                              {cmd.status === 'executing' && <div className="text-neon-blue animate-pulse pl-4 uppercase text-[9px]">Executing...</div>}
                              {cmd.result && <pre className="text-white/40 pl-4 whitespace-pre-wrap leading-tight">{cmd.result}</pre>}
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={suggestCommand} className="px-3 py-2 bg-primary/10 border border-primary/20 text-primary rounded-lg text-[9px] font-black uppercase hover:bg-primary/20 transition-all">
                          AI_CO_PILOT
                        </button>
                        <div className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 flex items-center gap-3 focus-within:border-primary/50 transition-colors">
                          <TerminalIcon size={14} className="text-white/20" />
                          <input 
                            type="text" 
                            value={inputCmd}
                            onChange={(e) => setInputCmd(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendCommand()}
                            placeholder="REMOTE_CMD_OR_SKILL..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[11px] font-mono py-2 outline-none"
                          />
                        </div>
                        <button onClick={handleSendCommand} className="p-2 bg-primary text-black rounded-lg hover:opacity-80 transition-all">
                          <Send size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col p-8 overflow-hidden">
                    <div className="flex-1 min-h-0 bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                      <AgentNetworkGraph agents={agents} onSelect={setSelectedAgentId} />
                    </div>
                    <div className="mt-8 text-center">
                      <div className="flex justify-center gap-8 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-[8px] font-black text-white/40 uppercase">Online_Node</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-white/10" />
                          <span className="text-[8px] font-black text-white/40 uppercase">Offline_Node</span>
                        </div>
                      </div>
                      <h3 className="text-xs font-black italic tracking-tighter text-white/80 uppercase mb-2">SYSTEM_TOPOLOGY_ORCHESTRATOR</h3>
                      <p className="text-[9px] text-white/30 uppercase tracking-widest leading-relaxed max-w-xs mx-auto">
                        Visualizing active neural links across host environment.
                        Select any node to initiate remote execution protocols.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'missions' && (
            <motion.div 
              key="missions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">MISSION_CONTROL</h2>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono">Autonomous Orchestration Layer</p>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="DESIGN_GOAL..."
                    value={newMissionGoal}
                    onChange={(e) => setNewMissionGoal(e.target.value)}
                    className="bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-[10px] font-mono w-64 focus:border-primary/50"
                  />
                  <button onClick={planMission} className="p-2 bg-primary text-black rounded-lg font-black text-[10px] uppercase hover:scale-105 transition-all">
                    Plan
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.map((mission) => {
                  const completed = mission.subtasks.filter(t => t.status === 'done').length;
                  const total = mission.subtasks.length;
                  const progress = total > 0 ? (completed / total) * 100 : 0;
                  
                  const statusColors = {
                    active: 'border-l-primary',
                    completed: 'border-l-[#4ade80]', // tailwind green-400
                    paused: 'border-l-[#facc15]',   // tailwind yellow-400
                    failed: 'border-l-neon-pink'
                  };

                  return (
                    <div 
                      key={mission.id} 
                      className={cn(
                        "glass-card p-4 border-l-2 flex flex-col gap-3 transition-colors",
                        statusColors[mission.status] || 'border-l-white/20'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <h3 className="font-black text-sm uppercase text-white truncate max-w-[150px]">{mission.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-tighter",
                              mission.status === 'active' && "text-primary",
                              mission.status === 'completed' && "text-[#4ade80]",
                              mission.status === 'paused' && "text-[#facc15]",
                              mission.status === 'failed' && "text-neon-pink"
                            )}>
                              {mission.status}
                            </span>
                            <span className="text-[8px] text-white/20 font-mono">{Math.round(progress)}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => adaptMission(mission.id)}
                            className="text-primary hover:scale-110 transition-transform"
                            title="Adapt Mission"
                          >
                            <Zap size={14} />
                          </button>
                          <button onClick={() => deleteMission(mission.id)} className="text-white/20 hover:text-neon-pink"><Trash2 size={14} /></button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          className={cn(
                            "h-full transition-all duration-500",
                            mission.status === 'active' && "bg-primary",
                            mission.status === 'completed' && "bg-[#4ade80]",
                            mission.status === 'paused' && "bg-[#facc15]",
                            mission.status === 'failed' && "bg-neon-pink"
                          )}
                        />
                      </div>

                      <div className="space-y-1.5">
                        {mission.subtasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 p-1.5 bg-black/20 rounded border border-white/5">
                          <button 
                            onClick={() => {
                              const next = task.status === 'pending' ? 'done' : 'pending';
                              updateMission(mission.id, {
                                subtasks: mission.subtasks.map(t => t.id === task.id ? { ...t, status: next as any } : t)
                              });
                            }}
                            className={cn("w-3 h-3 rounded-sm border", task.status === 'done' ? "bg-primary border-primary" : "border-white/20")}
                          >
                            {task.status === 'done' && <CheckCircle2 size={8} className="text-black mx-auto" />}
                          </button>
                          <span className={cn("text-[9px] font-mono truncate flex-1", task.status === 'done' ? "text-white/20 line-through" : "text-white/80")}>{task.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              </div>
            </motion.div>
          )}

          {activeTab === 'evolution' && (
            <motion.div 
              key="evolution"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">AUTODESARROLLO_IA</h2>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono">Self-Evolution Logic // System Optimization</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="glass-card p-6 bg-black/40 border border-primary/20">
                    <h3 className="text-xs font-black uppercase text-primary tracking-widest mb-4">Evolution_Stream</h3>
                    <div className="space-y-3 font-mono text-[10px] text-white/60">
                      {evolutionLogs.length === 0 ? (
                        <p className="opacity-30">NO_ACTIVE_EVOLUTION_THREADS</p>
                      ) : (
                        evolutionLogs.map((log, i) => (
                          <div key={i} className="flex gap-4 border-l border-white/5 pl-4">
                            <span className="text-white/20 whitespace-nowrap">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span>{log.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="glass-card p-6 bg-primary/5 border border-primary/20">
                    <Zap className="text-primary mb-3" />
                    <h3 className="text-xs font-black uppercase text-white tracking-widest mb-2">Stability_Matrix</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-white/40">Coherence</span>
                        <span className="text-primary font-bold">98.4%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-[98.4%]" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6 bg-neon-blue/5 border border-neon-blue/20">
                    <Target className="text-neon-blue mb-3" />
                    <h3 className="text-xs font-black uppercase text-white tracking-widest mb-2">Entropy_Reduction</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-white/40">Efficiency_Gain</span>
                        <span className="text-neon-blue font-bold">+12.7%</span>
                      </div>
                      <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                        <div className="bg-neon-blue h-full w-[12.7%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'skills' && (
            <motion.div 
              key="skills"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white">CAPABILITY_VAULT</h2>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono">Modular Functions // Evolutionary Core</p>
                </div>
                <button 
                  onClick={() => addSkill({
                    name: 'New_Module',
                    description: 'Custom autonomous function.',
                    code: '// Node.js code',
                    category: 'automation'
                  })}
                  className="px-3 py-1.5 bg-neon-blue text-black rounded-lg font-black text-[10px] uppercase hover:scale-105 transition-all"
                >
                  <Plus size={14} className="inline mr-1" /> Skill
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {skills.map((skill) => (
                  <div key={skill.id} className="glass-card p-4 group hover:border-primary/20 transition-all flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-primary">
                        <Zap size={14} />
                      </div>
                      <button onClick={() => deleteSkill(skill.id)} className="text-white/20 hover:text-neon-pink"><Trash2 size={14} /></button>
                    </div>
                    <div>
                      <h3 className="font-bold text-[11px] uppercase text-white tracking-widest">{skill.name}</h3>
                      <p className="text-[9px] text-white/40 font-mono italic">{skill.description}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-[8px] font-black italic tracking-widest uppercase text-primary/40">
                      <button 
                        onClick={() => evolveSkill(skill.id)}
                        disabled={isEvolvingSkill === skill.id}
                        className="flex items-center gap-1 hover:text-primary transition-colors disabled:opacity-50"
                      >
                        {isEvolvingSkill === skill.id ? <RefreshCw size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        EVOLVE
                      </button>
                      <ChevronRight size={10} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'directory' && (
            <motion.div 
              key="directory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex overflow-hidden"
            >
              <DevDirectory onNavigate={(tab) => setActiveTab(tab as any)} />
            </motion.div>
          )}

          {activeTab === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex overflow-hidden"
            >
              <LocalAgentSetup />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showConnectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="glass-card max-w-xl w-full p-8 space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-lg font-black italic tracking-tighter uppercase">Establish Node Handshake</h3>
                <button onClick={() => setShowConnectModal(false)}><X size={20} className="text-white/40" /></button>
              </div>
              <div className="space-y-4">
                <p className="text-[11px] text-white/50 leading-relaxed uppercase tracking-tighter text-center">To integrate your physical hardware and enable local automation, you need to configure the NYX_BOOTSTRAP script.</p>
                <div className="p-8 bg-primary/5 border border-primary/20 rounded-xl flex flex-col items-center gap-4">
                   <Smartphone size={48} className="text-primary animate-pulse" />
                   <p className="text-[10px] text-primary/60 font-black uppercase tracking-widest">Awaiting Bridge Connection</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setActiveTab('setup');
                  setShowConnectModal(false);
                }} 
                className="w-full py-4 bg-primary text-black rounded-lg font-black uppercase text-[11px] tracking-widest hover:scale-[1.02] transition-all"
              >
                Go to Setup Guide
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
