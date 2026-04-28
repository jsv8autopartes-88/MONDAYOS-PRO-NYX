import React, { useEffect, useRef } from 'react';
import { Canvas, Circle, Rect, IText } from 'fabric';
import { motion } from 'motion/react';
import { Network, ZoomIn, ZoomOut, Maximize, MousePointer2 } from 'lucide-react';

export const NexusCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      fabricRef.current = new Canvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: 'transparent'
      });

      // Add a sample infrastructure node
      const rect = new Rect({
        top: 100,
        left: 100,
        width: 100,
        height: 60,
        fill: '#06b6d4',
        rx: 10,
        ry: 10
      });

      const label = new IText('AGENT_NODE_01', {
        fontSize: 12,
        fill: '#000',
        top: 120,
        left: 110,
        fontFamily: 'monospace'
      });

      fabricRef.current.add(rect, label);

      return () => {
        fabricRef.current?.dispose();
      };
    }
  }, []);

  return (
    <div className="flex-1 flex flex-col glass-card border-white/5 bg-black/40 overflow-hidden">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <Network size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase text-white tracking-widest">Infra_Map_Visualizer</span>
         </div>
         <div className="flex gap-2">
            <button className="p-2 bg-white/5 rounded hover:bg-white/10 text-white/40"><ZoomIn size={14} /></button>
            <button className="p-2 bg-white/5 rounded hover:bg-white/10 text-white/40"><ZoomOut size={14} /></button>
            <button className="p-2 bg-white/5 rounded hover:bg-white/10 text-white/40"><Maximize size={14} /></button>
         </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff05_1px,transparent_1px)] bg-[size:20px_20px]" />
        <canvas ref={canvasRef} className="z-10 shadow-2xl border border-white/10 rounded-xl" />
        
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
               <MousePointer2 size={12} className="text-primary" />
               <span className="text-[9px] font-mono text-white/60 uppercase">Mode: Visual_Edit</span>
            </div>
            <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Selected: NODE_ID_X22</div>
        </div>
      </div>
    </div>
  );
};
