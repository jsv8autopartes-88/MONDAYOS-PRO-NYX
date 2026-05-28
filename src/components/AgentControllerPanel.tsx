import { useAppStore } from '../store/appStore';
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
  FolderOpen,
  Save,
  Code,
  MousePointer2,
  Navigation,
  ListRestart,
  Square,
  Play,
  FileText,
  ClipboardCheck,
  DownloadCloud,
  HardDrive,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import { AgentCommand, AgentMission, AgentSkill } from '../types';
import { NeuralService } from '../lib/neuralService';
import { collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GoogleGenAI, Type } from "@google/genai";
import { AgentNetworkGraph } from './AgentNetworkGraph';
import { DevDirectory } from './DevDirectory';
import { LocalAgentSetup } from './LocalAgentSetup';

let envKeyTop = '';
try {
  if (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) {
    envKeyTop = process.env.GEMINI_API_KEY;
  }
} catch (e) {}
const ai = new GoogleGenAI({ apiKey: envKeyTop });

export const AgentControllerPanel: React.FC = () => {
  const { user, searchQuery } = useDashboard();
  const { agents, missions, skills, reportFiles, generateSystemReport, sendCommand, deleteAgent, addMission, updateMission, deleteMission, addSkill, updateSkill, deleteSkill, isAutopilotActive, toggleAutopilot, addAutopilotTask, clearAutopilotQueue, autopilotQueue, autopilotStatus, updateAgent } = useAppStore();
  
  const [activeTab, setActiveTab] = useState<'nodes' | 'missions' | 'skills' | 'evolution' | 'directory' | 'setup' | 'autopilot' | 'reports'>('nodes');
  const [aiAutopilotPrompt, setAiAutopilotPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiAutomation = async () => {
    if (!aiAutopilotPrompt.trim()) return;
    setIsAiGenerating(true);
    try {
      const systemPrompt = `You are an AI UI Automation Agent. The user wants to: "${aiAutopilotPrompt}". 
Return a JSON array of AutopilotAction objects to perform this task in the app.
Available action types: 'click' (needs target selector like .glass-card button), 'input' (needs target selector and value), 'navigation' (needs value: 'home', 'agents', 'missions', 'ai', 'files', 'terminal', 'notes', 'tools', 'settings'), 'wait' (needs value in ms). Make sure it's valid JSON. Do not return markdown formatted code blocks, return raw text parseable by JSON.parse. Example: [{"type":"navigation","value":"notes"},{"type":"wait","value":"500"}]`;
      const response = await NeuralService.generate(systemPrompt, 'gemini');
      let text = response.content.trim();
      if (text.startsWith('\`\`\`json')) text = text.replace(/^\`\`\`json\n/, '').replace(/\n\`\`\`$/, '');
      const actions = JSON.parse(text);
      if (Array.isArray(actions) && actions.length > 0) {
        addAutopilotTask(actions);
      }
      setAiAutopilotPrompt('');
    } catch (error) {
      console.error('Failed to parse or generate autopilot actions:', error);
    } finally {
      setIsAiGenerating(false);
    }
  };

  useEffect(() => {
    const handleNav = (e: any) => {
      if (e.detail && typeof e.detail === 'string') {
        const tabMap: Record<string, typeof activeTab> = {
          'skills': 'skills',
          'missions': 'missions',
          'evo': 'evolution',
          'directory': 'directory',
          'setup': 'setup',
          'nodes': 'nodes',
          'autopilot': 'autopilot',
          'reports': 'reports'
        };
        if (tabMap[e.detail]) {
          setActiveTab(tabMap[e.detail]);
          // If we are jumping to missions, maybe focus the input?
          if (e.detail === 'missions') {
            setTimeout(() => {
              const input = document.querySelector('input[placeholder="DESIGN_GOAL..."]') as HTMLInputElement;
              if (input) input.focus();
            }, 500);
          }
        }
      }
    };
    window.addEventListener('nav-subtab', handleNav);
    return () => window.removeEventListener('nav-subtab', handleNav);
  }, []);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [commands, setCommands] = useState<AgentCommand[]>([]);
  const [inputCmd, setInputCmd] = useState('');
  const [isAiSuggesting, setIsAiSuggesting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isPlanningMission, setIsPlanningMission] = useState(false);
  const [newMissionGoal, setNewMissionGoal] = useState('');
  const [isEvolvingSkill, setIsEvolvingSkill] = useState<string | null>(null);
  const [evolutionLogs, setEvolutionLogs] = useState<{timestamp: number, message: string}[]>([]);
  const [expandedCmds, setExpandedCmds] = useState<string[]>([]);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ description: '', code: '' });

  const filteredAgents = agents.filter(a => {
    const query = (searchQuery || '').toLowerCase();
    return a.name.toLowerCase().includes(query) || 
           a.id.toLowerCase().includes(query) ||
           (a.platform || '').toLowerCase().includes(query);
  });

  const selectedAgent = filteredAgents.find(a => a.id === selectedAgentId);

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

  const toggleCmdExpansion = (id: string) => {
    setExpandedCmds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSendCommand = async () => {
    if (!selectedAgentId || !inputCmd.trim()) return;
    
    // TODO(Daemon): Route commands through local WebSocket proxy instead of Firebase for lowest latency
    // Expected Payload:
    // {
    //   "intent": "exec_cmd",
    //   "payload": {
    //     "agentId": selectedAgentId,
    //     "cmd": inputCmd.trim()
    //   }
    // }
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

  const generateMissionWithAI = async () => {
    if (!newMissionGoal.trim()) return;
    setIsPlanningMission(true);
    try {
      const prompt = `Goal: "${newMissionGoal}". Analyze this tactical objective and create an optimized mission plan. Return JSON { title, goal_summary, subtasks: [{description}] }`;
      const result = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(result.text || '{}');
      if (data.title) {
        addMission({
          title: data.title,
          goal: data.goal_summary || newMissionGoal,
          status: 'active',
          subtasks: (data.subtasks || []).map((s: any) => ({
            id: Math.random().toString(36).substr(2, 5),
            description: s.description,
            status: 'pending'
          }))
        });
        setNewMissionGoal('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanningMission(false);
    }
  };

  const toggleSkillForAgent = async (agentId: string, skillId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    const currentSkills = agent.skillIds || [];
    const newSkills = currentSkills.includes(skillId) ? currentSkills.filter(id => id !== skillId) : [...currentSkills, skillId];
    await updateAgent(agentId, { skillIds: newSkills });
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
        <button 
          onClick={() => setActiveTab('reports')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'reports' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
          title="System Reports"
        >
          <FileText size={20} />
        </button>
        <div className="mt-auto mb-4 w-8 h-[1px] bg-white/10" />
        <button 
          onClick={() => setActiveTab('autopilot')}
          className={cn("p-3 rounded-xl transition-all", activeTab === 'autopilot' ? "bg-primary text-black" : "text-white/40 hover:bg-white/5")}
          title="Nyx Native Autopilot"
        >
          <MousePointer2 size={20} />
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
                  {filteredAgents.length === 0 ? (
                    <div className="h-40 flex flex-col items-center justify-center text-center opacity-30">
                      <Bot size={32} className="mb-2" />
                      <p className="text-xs uppercase">{searchQuery ? 'No Matches Found' : 'No Nodes Found'}</p>
                    </div>
                  ) : (
                    filteredAgents.map((agent) => (
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="glass-card p-4 bg-white/5 border border-white/10 flex flex-col gap-2 group hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-2 text-primary opacity-60">
                            <Monitor size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">OS_HOST</span>
                          </div>
                          <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors truncate">
                            {selectedAgent.systemInfo?.hostname || 'Unknown'} ({selectedAgent.platform})
                          </span>
                        </div>
                        <div className="glass-card p-4 bg-white/5 border border-white/10 flex flex-col gap-2 group hover:border-neon-blue/30 transition-all">
                          <div className="flex items-center gap-2 text-neon-blue opacity-60">
                            <Cpu size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">CPU_SPECS</span>
                          </div>
                          <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors truncate">
                            {selectedAgent.systemInfo?.cpuModel || 'Generic Core'}
                          </span>
                        </div>
                        <div className="glass-card p-4 bg-white/5 border border-white/10 flex flex-col gap-2 group hover:border-red-500/30 transition-all">
                          <div className="flex items-center gap-2 text-red-400 opacity-60">
                            <HardDrive size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">RAM_SYNC</span>
                          </div>
                          <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">
                            {selectedAgent.systemInfo?.mem || '0GB'}
                          </span>
                        </div>
                        <div className="glass-card p-4 bg-white/5 border border-white/10 flex flex-col gap-2 group hover:border-yellow-500/30 transition-all">
                          <div className="flex items-center gap-2 text-yellow-400 opacity-60">
                            <Activity size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">LOAD_AVG</span>
                          </div>
                          <span className="text-xs font-mono text-white/80 group-hover:text-white transition-colors">
                            {selectedAgent.systemInfo?.cpuUsage ? `${(selectedAgent.systemInfo.cpuUsage * 100).toFixed(1)}%` : '0.0%'}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => sendCommand(selectedAgent.id, 'reboot')}
                          className="flex-1 py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                        >
                          <RefreshCw size={14} /> Power_Recycle
                        </button>
                        <button 
                          onClick={() => sendCommand(selectedAgent.id, 'cls')}
                          className="flex-1 py-3 bg-neon-blue/10 border border-neon-blue/20 text-neon-blue rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neon-blue/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Trash2 size={14} /> Wipe_Cache
                        </button>
                        <button 
                          onClick={() => sendCommand(selectedAgent.id, 'systeminfo')}
                          className="flex-1 py-3 bg-primary/10 border border-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all flex items-center justify-center gap-2"
                        >
                          <Monitor size={14} /> Diagnose
                        </button>
                      </div>

                      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
                        <div className="flex flex-col gap-4 overflow-hidden">
                          <div className="flex-1 glass-card p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar bg-black/40 border border-white/5">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2 text-primary">
                              <h4 className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <Zap size={12} fill="currentColor" /> Active_Capabilities
                              </h4>
                            </div>
                            <div className="space-y-2">
                              {skills.map(skill => {
                                const isAssigned = (selectedAgent.skillIds || []).includes(skill.id);
                                return (
                                  <button 
                                    key={skill.id}
                                    onClick={() => toggleSkillForAgent(selectedAgent.id, skill.id)}
                                    className={cn(
                                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all group",
                                      isAssigned ? "bg-primary/20 border-primary shadow-[0_0_15px_rgba(212,255,0,0.1)]" : "bg-white/5 border-white/10 hover:border-white/20"
                                    )}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={cn("w-2 h-2 rounded-full", isAssigned ? "bg-primary animate-pulse shadow-[0_0_5px_#d4ff00]" : "bg-white/10")} />
                                      <div className="text-left">
                                        <div className={cn("text-[10px] font-black uppercase tracking-tight", isAssigned ? "text-white" : "text-white/40 group-hover:text-white/60")}>
                                          {skill.name}
                                        </div>
                                        <div className="text-[8px] text-white/20 font-mono italic truncate w-32">{skill.category}</div>
                                      </div>
                                    </div>
                                    <div className="text-[8px] font-mono text-white/10 uppercase">{isAssigned ? 'Linked' : 'Not_Synced'}</div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div className="h-40 glass-card p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar bg-black/40 border border-white/5">
                             <div className="flex items-center justify-between mb-2 pb-1 border-b border-white/5">
                               <h4 className="text-[10px] text-white/30 font-black uppercase tracking-widest">Loadout_OS</h4>
                             </div>
                             <div className="flex flex-wrap gap-2 py-2">
                               {(selectedAgent.skillIds || []).length > 0 ? (
                                 selectedAgent.skillIds?.map(sid => {
                                   const sk = skills.find(s => s.id === sid);
                                   return sk ? (
                                      <span key={sid} className="px-2 py-1 bg-primary/10 border border-primary/30 text-primary text-[8px] font-black uppercase rounded">
                                        {sk.name}
                                      </span>
                                   ) : null;
                                 })
                               ) : (
                                  <div className="text-[8px] text-white/20 italic p-2 border border-dashed border-white/5 rounded w-full text-center">No skills assigned to node.</div>
                               )}
                             </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 overflow-hidden">
                          <div className="flex-1 glass-card p-4 font-mono text-[11px] overflow-y-auto custom-scrollbar space-y-4 bg-black/40 border border-white/5">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                              <h4 className="text-[10px] text-neon-blue/60 font-black uppercase">Command Stream</h4>
                              <span className="text-[8px] text-white/20 uppercase tracking-widest italic leading-none">Last 15 Operations</span>
                            </div>
                            <AnimatePresence initial={false}>
                              {[...commands].reverse().map((cmd) => {
                                const isExpanded = expandedCmds.includes(cmd.id);
                                const hasResult = !!cmd.result;
                                const hasError = !!cmd.error;
                                const resultsTooLong = (cmd.result?.length || 0) > 150 || (cmd.error?.length || 0) > 150;

                                return (
                                  <motion.div 
                                    key={cmd.id} 
                                    initial={{ opacity: 0, y: 10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    className="space-y-1 mb-4 group"
                                  >
                                    <div 
                                      className="flex items-center justify-between cursor-pointer hover:bg-white/5 p-1 -mx-1 rounded transition-colors"
                                      onClick={() => resultsTooLong && toggleCmdExpansion(cmd.id)}
                                    >
                                      <span className={cn(
                                        "text-[10px] font-bold flex items-center gap-2",
                                        cmd.status === 'completed' ? "text-primary" : 
                                        cmd.status === 'failed' ? "text-red-400" : "text-neon-blue"
                                      )}>
                                        {resultsTooLong && (
                                          <ChevronRight 
                                            size={10} 
                                            className={cn("transition-transform", isExpanded ? "rotate-90" : "")} 
                                          />
                                        )}
                                        Node:{selectedAgentId.substring(0,4)}@nyx:{'>'} {cmd.cmd}
                                      </span>
                                      <span className="text-white/20 text-[8px] uppercase">{new Date(cmd.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                    
                                    {cmd.status === 'executing' && (
                                      <div className="text-neon-blue animate-pulse pl-4 uppercase text-[8px] flex items-center gap-2">
                                        <Activity size={8} /> Executing_Sequence...
                                      </div>
                                    )}

                                    {hasResult && (
                                      <div className="relative group/output">
                                        <pre className={cn(
                                          "text-white/40 pl-4 whitespace-pre-wrap leading-tight text-[10px] border-l border-white/10 ml-1 font-mono",
                                          !isExpanded && resultsTooLong ? "max-h-12 overflow-hidden opacity-100" : "max-h-none"
                                        )}>
                                          {cmd.result}
                                        </pre>
                                        {!isExpanded && resultsTooLong && (
                                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                                        )}
                                        {resultsTooLong && (
                                          <button 
                                            onClick={() => toggleCmdExpansion(cmd.id)}
                                            className="text-[8px] text-primary/60 hover:text-primary font-black uppercase tracking-widest pl-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            {isExpanded ? '[ COLLAPSE ]' : '[ VIEW_FULL_STDOUT ]'}
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {hasError && (
                                      <div className="relative group/output">
                                        <pre className={cn(
                                          "text-red-500/60 pl-4 whitespace-pre-wrap leading-tight text-[10px] border-l border-red-500/20 ml-1 italic font-mono bg-red-500/5",
                                          !isExpanded && resultsTooLong ? "max-h-12 overflow-hidden" : "max-h-none"
                                        )}>
                                          {cmd.error}
                                        </pre>
                                        {!isExpanded && resultsTooLong && (
                                          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
                                        )}
                                        {resultsTooLong && (
                                          <button 
                                            onClick={() => toggleCmdExpansion(cmd.id)}
                                            className="text-[8px] text-red-500/80 hover:text-red-400 font-black uppercase tracking-widest pl-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                          >
                                            {isExpanded ? '[ COLLAPSE ]' : '[ VIEW_FULL_STDERR ]'}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </motion.div>
                                );
                              })}
                              {commands.length === 0 && (
                                <div className="h-full flex items-center justify-center text-white/20 uppercase text-[9px] italic">No activity logs recorded</div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
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
              <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-3xl border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(212,255,0,0.15)]">
                    <Target size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Neural_Tactics</h2>
                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-[0.3em] font-mono leading-none">Mission Control // Autonomous Layer</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="relative group">
                    <Sparkles size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100 group-focus-within:animate-pulse transition-all pointer-events-none" />
                    <input 
                      type="text" 
                      placeholder="ENTER_OBJECTIVE_PROMPT..."
                      value={newMissionGoal}
                      onChange={(e) => setNewMissionGoal(e.target.value)}
                      className="bg-black/80 border border-white/10 rounded-2xl pl-10 pr-4 py-3 text-[10px] font-mono w-80 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all outline-none"
                    />
                  </div>
                  <button 
                    onClick={generateMissionWithAI} 
                    disabled={isPlanningMission || !newMissionGoal.trim()}
                    className="px-6 bg-primary text-black rounded-2xl font-black text-[10px] uppercase hover:scale-105 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-[0_0_20px_rgba(212,255,0,0.2)]"
                  >
                    {isPlanningMission ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} fill="currentColor" />}
                    Deploy_AI_Planner
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {missions.filter(m => {
                  const query = (searchQuery || '').toLowerCase();
                  return m.title.toLowerCase().includes(query) || m.goal.toLowerCase().includes(query);
                }).map((mission) => {
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
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">Capability_Vault</h2>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono italic">Repository: NEURAL_LOGIC // SKILL_SCRIPTS</p>
                </div>
                <button 
                  onClick={() => {
                    const newId = Math.random().toString(36).substr(2, 9);
                    addSkill({ 
                      name: `SKILL_${newId.toUpperCase()}`, 
                      description: 'Define tactical logic here...', 
                      code: '// logic://node.execute\n\nmodule.exports = async (ctx) => {\n  // skill logic\n};',
                      category: 'system'
                    });
                  }}
                  className="px-6 py-2.5 bg-primary text-black rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(207,248,12,0.3)] flex items-center gap-2"
                >
                  <Plus size={16} /> New_Capability
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(skills || []).filter(s => {
                  const query = (searchQuery || '').toLowerCase();
                  return s.name.toLowerCase().includes(query) || s.description.toLowerCase().includes(query);
                }).map((skill) => {
                  const isEditing = editingSkillId === skill.id;
                  return (
                    <div 
                      key={skill.id} 
                      className={cn(
                        "glass-card bg-black/40 border transition-all flex flex-col overflow-hidden group",
                        isEditing ? "col-span-full ring-1 ring-primary/50 bg-black/80 p-8" : "p-6 border-white/5 hover:border-primary/30"
                      )}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                            isEditing ? "bg-primary text-black" : "bg-white/5 text-white/40 group-hover:text-primary"
                          )}>
                            <Code size={20} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[8px] text-white/20 uppercase font-black tracking-widest">Type: {skill.category}</span>
                            <span className="text-[10px] font-black text-white/40 uppercase font-mono">ID: {skill.id.substring(0,6)}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {!isEditing && (
                            <button 
                              onClick={() => {
                                setEditingSkillId(skill.id);
                                setEditForm({ description: skill.description, code: skill.code });
                              }}
                              className="p-2 bg-white/5 hover:bg-primary/20 text-white/40 hover:text-primary rounded-lg transition-all"
                              title="Edit Logic"
                            >
                              <Wrench size={16} />
                            </button>
                          )}
                          <button onClick={() => deleteSkill(skill.id)} className="p-2 bg-white/5 hover:bg-neon-pink/20 text-white/20 hover:text-neon-pink rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {isEditing ? (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          <div className="lg:col-span-1 space-y-6">
                            <div className="space-y-4">
                              <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">{skill.name}</h3>
                              <div className="space-y-1.5">
                                <label className="text-[9px] text-white/30 uppercase font-black tracking-widest pl-1">Mission_Scope</label>
                                <input 
                                  type="text"
                                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:border-primary/50 outline-none font-mono"
                                  value={editForm.description}
                                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                />
                              </div>
                              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                <div className="flex items-center gap-2 mb-2 text-primary">
                                  <Sparkles size={12} />
                                  <span className="text-[9px] font-black uppercase tracking-widest">AI_Insights</span>
                                </div>
                                <p className="text-[10px] text-white/40 italic leading-relaxed">
                                  Evolution cycle: {skill.evolutionCount || 0}. Last improved via Neural Engine {skill.evolvedFrom ? 'successfully' : 'pending'}.
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 pt-4">
                              <button 
                                onClick={() => {
                                  updateSkill(skill.id, { 
                                    description: editForm.description, 
                                    code: editForm.code 
                                  });
                                  setEditingSkillId(null);
                                }}
                                className="w-full py-4 bg-primary text-black rounded-xl font-black text-xs uppercase hover:opacity-80 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,255,0,0.2)] active:scale-95"
                              >
                                <Save size={16} /> Save_Logic_Uplink
                              </button>
                              <button 
                                onClick={() => evolveSkill(skill.id)}
                                disabled={isEvolvingSkill === skill.id}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white/60 hover:text-white rounded-xl font-black text-xs uppercase transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                              >
                                {isEvolvingSkill === skill.id ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                Initiate_Evolution
                              </button>
                              <button 
                                onClick={() => setEditingSkillId(null)}
                                className="w-full py-3 text-[10px] text-white/20 font-black uppercase hover:text-white transition-colors"
                              >
                                [ CANCEL_ACTION ]
                              </button>
                            </div>
                          </div>
                          <div className="lg:col-span-2 relative flex flex-col min-h-[400px]">
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                              <div className="px-2 py-1 bg-black rounded text-[8px] text-white/30 font-mono border border-white/5 uppercase">Language: Node.js</div>
                              <div className="px-2 py-1 bg-black rounded text-[8px] text-primary font-mono border border-primary/20 uppercase shadow-[0_0_10px_rgba(212,255,0,0.1)]">Read_Only: FALSE</div>
                            </div>
                            <textarea 
                              className="w-full flex-1 bg-black border border-white/5 rounded-2xl p-6 text-xs font-mono text-primary focus:border-primary/50 outline-none resize-none custom-scrollbar leading-relaxed shadow-inner"
                              spellCheck="false"
                              value={editForm.code}
                              onChange={e => setEditForm({ ...editForm, code: e.target.value })}
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="mb-6">
                            <h3 className="font-black text-sm uppercase text-white tracking-widest mb-2 group-hover:text-primary transition-colors">{skill.name}</h3>
                            <p className="text-[10px] text-white/40 font-mono italic leading-relaxed h-12 overflow-hidden line-clamp-3">{skill.description}</p>
                          </div>
                          
                          <div className="bg-black/60 rounded-2xl border border-white/5 p-4 mb-6 relative group/code overflow-hidden">
                             <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover/code:bg-primary transition-colors" />
                             <code className="text-[9px] text-white/20 font-mono block whitespace-pre overflow-hidden">
                                {skill.code.substring(0, 120)}...
                             </code>
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end justify-center pb-2 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <span className="text-[8px] font-black text-primary uppercase tracking-[0.2em] animate-pulse">View_Full_Payload</span>
                             </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                               <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                               <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Evo_Tier_{skill.evolutionCount || 0}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setEditingSkillId(skill.id);
                                setEditForm({ description: skill.description, code: skill.code });
                              }}
                              className="text-[9px] font-black text-white px-4 py-2 bg-white/5 hover:bg-primary hover:text-black rounded-lg transition-all uppercase tracking-widest"
                            >
                              Open_Logic
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
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

          {activeTab === 'reports' && (
            <motion.div 
              key="reports"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 gap-8 overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase">System Audit Center</h2>
                  <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono italic">Sector: REPORTING_LOGIC // AUTOMATED_AUDITS</p>
                </div>
                <button 
                  onClick={generateSystemReport}
                  className="px-6 py-2.5 bg-primary text-black rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all shadow-[0_0_20px_rgba(207,248,12,0.3)] flex items-center gap-2"
                >
                  <Activity size={14} /> Run New Audit
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportFiles.length > 0 ? reportFiles.map((report) => (
                  <div key={report.id} className="glass-card p-6 bg-black/40 border border-white/5 group hover:border-primary/30 transition-all flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText size={20} />
                      </div>
                      <span className="text-[9px] font-mono text-white/20">{report.id.split('_')[1]}</span>
                    </div>
                    <h3 className="text-sm font-black text-white uppercase mb-2 truncate">{report.name}</h3>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-[10px] text-white/40 font-mono line-clamp-3 leading-relaxed">
                        {report.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="mt-6 flex gap-3 pt-4 border-t border-white/5">
                      <button 
                        onClick={() => {
                          const blob = new Blob([report.content], { type: 'text/markdown' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.style.display = 'none';
                          a.href = url;
                          a.download = `${report.name}.md`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                        }}
                        className="flex-1 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-white/60 transition-all flex items-center justify-center gap-2"
                      >
                        <DownloadCloud size={12} /> Download
                      </button>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(report.content);
                        }}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-primary transition-all"
                        title="Copy to Clipboard"
                      >
                        <ClipboardCheck size={16} />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center text-center opacity-20">
                     <FileText size={64} className="mb-4" strokeWidth={1} />
                     <p className="text-xs font-black uppercase tracking-[0.3em]">No Audit Reports Logged</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'autopilot' && (
            <motion.div 
              key="autopilot"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar gap-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(212,255,0,0.1)]">
                    <MousePointer2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">Nyx_Autopilot_Engine</h2>
                    <p className="text-[10px] text-white/30 uppercase tracking-[0.3em]">Native UI Automation & Neural Control</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={clearAutopilotQueue}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
                  >
                    <ListRestart size={14} /> Clear Queue
                  </button>
                  <button 
                    onClick={toggleAutopilot}
                    className={cn(
                      "px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg",
                      isAutopilotActive 
                        ? "bg-neon-pink text-white shadow-neon-pink/20" 
                        : "bg-primary text-black shadow-primary/20"
                    )}
                  >
                    {isAutopilotActive ? <Square size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                    {isAutopilotActive ? 'Deactivate Engine' : 'Activate Engine'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="glass-card p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Navigation className="text-primary" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">System_Audit_Sequence</h3>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed mb-6">Executes a full sweep of the application architecture, verifying panel integrity and data connectivity.</p>
                  <button 
                    onClick={() => addAutopilotTask([
                      { type: 'navigation', value: 'home' },
                      { type: 'wait', value: '2000' },
                      { type: 'navigation', value: 'files' },
                      { type: 'wait', value: '1500' },
                      { type: 'click', target: '.glass-card:first-child' },
                      { type: 'navigation', value: 'agents' },
                      { type: 'wait', value: '1000' }
                    ])}
                    className="w-full py-3 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Initiate Audit
                  </button>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Activity className="text-neon-blue" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">UI_Stress_Test</h3>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed mb-6">Rapidly cycles through navigational states to verify browser performance and render consistency.</p>
                  <button 
                    onClick={() => addAutopilotTask([
                      { type: 'navigation', value: 'notes' },
                      { type: 'wait', value: '500' },
                      { type: 'navigation', value: 'ai' },
                      { type: 'wait', value: '500' },
                      { type: 'navigation', value: 'terminal' },
                      { type: 'wait', value: '500' },
                      { type: 'navigation', value: 'home' }
                    ])}
                    className="w-full py-3 bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Run Stress Test
                  </button>
                </div>

                <div className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Bot className="text-neon-purple" size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest text-white">Auto_Doc_Generator</h3>
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed mb-6">Automatically creates a documentation scaffold in the Notes panel for system reference.</p>
                  <button 
                    onClick={() => addAutopilotTask([
                      { type: 'navigation', value: 'notes' },
                      { type: 'wait', value: '1000' },
                      { type: 'input', target: 'textarea, .ql-editor', value: '# SYNC_PROTOCOL\n\n- Node Link: Active\n- Autopilot: Online\n- Neural Status: Optimal\n' },
                      { type: 'wait', value: '500' }
                    ])}
                    className="w-full py-3 bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Generate Manifest
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Live_Automation_Stack</h3>
                  <span className="text-[9px] text-white/20 font-mono italic">PENDING_OPERATIONS: {autopilotQueue.length}</span>
                </div>

                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={aiAutopilotPrompt} 
                    onChange={e => setAiAutopilotPrompt(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAiAutomation()}
                    placeholder="E.g., Open terminal, write a command, then go to home..." 
                    className="flex-1 bg-black/40 border border-primary/20 rounded-lg px-4 py-2 text-[10px] text-primary focus:outline-none focus:border-primary placeholder-primary/20 font-mono h-10"
                  />
                  <button 
                    onClick={handleAiAutomation}
                    disabled={isAiGenerating || !aiAutopilotPrompt.trim()}
                    className="px-4 py-2 bg-primary text-black rounded-lg text-[10px] font-black uppercase tracking-widest disabled:opacity-50 h-10 flex flex-col justify-center transition-all hover:bg-neon-lime"
                  >
                    {isAiGenerating ? 'Generating...' : 'Execute AI'}
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-2 mt-4">
                  {autopilotQueue.slice(0, 5).map((action, i) => (
                    <div key={action.id} className="flex items-center gap-4 p-3 bg-white/5 border border-white/5 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-xs font-bold text-white/40">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-bold text-white uppercase">{action.type}: {action.target || action.value}</div>
                        <div className="text-[8px] text-white/30 uppercase tracking-widest">Execution_id: {action.id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[9px] font-mono text-primary uppercase">Queued</span>
                      </div>
                    </div>
                  ))}
                  {autopilotQueue.length > 5 && (
                    <div className="text-center py-2 text-[9px] text-white/20 font-mono italic">
                      + {autopilotQueue.length - 5} more operations in stack
                    </div>
                  )}
                  {autopilotQueue.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-white/10">
                      <ListRestart size={32} className="mb-4 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">Neural Stack Empty</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-auto glass-card p-4 border-primary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_#d4ff00]" />
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Engine Status: {autopilotStatus}</span>
                </div>
                <div className="text-[9px] font-mono text-white/20">
                  BUILD_VER: 1.0.0-STABLE // CONTROL_INTERFACE: NATIVE
                </div>
              </div>
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
