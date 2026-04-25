import React, { useState } from 'react';
import { Terminal, Download, Copy, Check, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import firebaseConfig from '../../firebase-applet-config.json';

export const LocalAgentSetup: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const agentCode = `
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, onSnapshot, updateDoc, collection, addDoc } = require('firebase/firestore');
const { exec } = require('child_process');

const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AGENT_ID = 'PC_' + Math.random().toString(36).substr(2, 9);
const agentRef = doc(db, 'agents', AGENT_ID);

console.log('\\x1b[32m%s\\x1b[0m', 'NYX_CORE | Local Agent Starting...');
console.log('Agent ID:', AGENT_ID);

// Register agent
async function register() {
  await addDoc(collection(db, 'agents'), {
    id: AGENT_ID,
    name: 'DEKTOP_NODE_' + AGENT_ID.slice(-4),
    status: 'online',
    platform: process.platform,
    lastHeartbeat: Date.now(),
    ownerId: 'SYSTEM'
  });
}

register();

// Listen for commands
onSnapshot(collection(db, 'commands'), (snapshot) => {
  snapshot.docChanges().forEach(change => {
    if (change.type === 'added') {
      const data = change.doc.data();
      if (data.targetId === AGENT_ID && data.status === 'pending') {
        console.log('Executing:', data.cmd);
        
        exec(data.cmd, (error, stdout, stderr) => {
          updateDoc(change.doc.ref, {
            status: error ? 'failed' : 'completed',
            result: stdout || stderr,
            completedAt: Date.now()
          });
        });
      }
    }
  });
});
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(agentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col p-8 gap-8 bg-black/20 overflow-y-auto custom-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter text-white">LOCAL_NODE_SETUP</h2>
          <p className="text-[10px] text-white/40 mt-1 uppercase tracking-widest font-mono">Bridge to physical hardware automation</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-neon-lime/10 border border-neon-lime/20 rounded-full">
            <Shield size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase text-primary">Secure_Channel</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section className="glass-card p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Zap size={14} className="text-primary" />
              1. Requisitos
            </h3>
            <ul className="space-y-2 text-[11px] text-white/50 font-mono">
              <li>{'>'} Node.js v16+ instalado en la PC</li>
              <li>{'>'} Conexión a internet estable</li>
              <li>{'>'} Permisos de ejecución de terminal</li>
            </ul>
          </section>

          <section className="glass-card p-6 border-white/5 space-y-4">
            <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
              <Terminal size={14} className="text-primary" />
              2. Instalación
            </h3>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Crea un archivo llamado <code className="text-primary">nyx_agent.js</code> en tu PC, 
              pega el código de la derecha y ejecútalo con:
            </p>
            <div className="bg-black/60 p-3 rounded-lg font-mono text-[10px] text-primary border border-white/5">
              node nyx_agent.js
            </div>
          </section>

          <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
            <p className="text-[10px] text-primary font-black uppercase tracking-widest leading-relaxed">
              Una vez ejecutado, tu PC aparecerá automáticamente en el mapa topográfico de "Nodes" y podrás enviar comandos de automatización remotamente.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest italic">NYX_AGENT_RUNTIME_V1.0</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold text-white transition-all active:scale-95 border border-white/5"
            >
              {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
              {copied ? 'COPIED' : 'COPY_CODE'}
            </button>
          </div>
          <div className="flex-1 bg-black/60 rounded-2xl border border-white/5 p-6 font-mono text-[10px] overflow-auto custom-scrollbar text-white/70 leading-relaxed">
            <pre className="whitespace-pre-wrap">{agentCode}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
