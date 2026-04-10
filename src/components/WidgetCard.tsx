import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Settings, Maximize2, Trash2, Play, Code, Save } from 'lucide-react';
import { Widget } from '../types';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism-tomorrow.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface WidgetCardProps {
  widget: Widget;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ widget }) => {
  const { updateWidget, deleteWidget, addLog } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(widget.code);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeCode = (codeToRun: string) => {
    try {
      // Basic sandbox-like execution
      const fn = new Function(codeToRun);
      const result = fn();
      setData(result);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Widget Execution Error:', err);
    }
  };

  useEffect(() => {
    executeCode(widget.code);
  }, [widget.code]);

  const handleSave = () => {
    updateWidget(widget.id, { code });
    setIsEditing(false);
    addLog('SAVE_WIDGET_CODE', `Saved code for widget: ${widget.title}`);
  };

  const renderContent = () => {
    if (error) {
      return (
        <div className="text-red-500 text-xs font-mono p-2 bg-red-500/10 rounded border border-red-500/20">
          {error}
        </div>
      );
    }

    if (!data) {
      return <div className="text-white/20 italic text-xs">No data returned</div>;
    }

    if (data.renderType === 'chart') {
      return (
        <div className="w-full h-full min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.chartData}>
              <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#151619', border: '1px solid #2a2b2e', borderRadius: '8px' }}
                itemStyle={{ color: '#d4ff00' }}
              />
              <Line type="monotone" dataKey="value" stroke="#d4ff00" strokeWidth={2} dot={{ fill: '#d4ff00', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (data.renderType === 'html') {
      return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: data.html }} />;
    }

    if (data.renderType === 'actions' && data.buttons) {
      return (
        <div className="flex flex-wrap gap-2 items-center justify-center h-full p-4">
          {data.buttons.map((btn: any, idx: number) => (
            <button
              key={idx}
              onClick={() => {
                try {
                  const actionFn = new Function(btn.action);
                  actionFn();
                } catch (e) {
                  console.error("Action error:", e);
                }
              }}
              className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              style={{ backgroundColor: btn.color ? `${btn.color}20` : undefined, borderColor: btn.color ? `${btn.color}50` : undefined, color: btn.color || 'white' }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      );
    }

    // Default metric render
    return (
      <div className="space-y-2 text-center">
        {data.value !== undefined && (
          <div className="text-4xl font-bold neon-text">
            {data.value}
            <span className="text-sm ml-1 text-white/50 font-normal">{data.unit}</span>
          </div>
        )}
        {data.label && <div className="text-xs text-white/50 uppercase tracking-widest">{data.label}</div>}
        {data.temp !== undefined && (
           <div className="flex flex-col items-center">
              <div className="text-5xl font-light">{data.temp}{data.unit}</div>
              <div className="text-[10px] mt-2 px-2 py-0.5 bg-neon-lime/20 text-neon-lime rounded-full border border-neon-lime/30 uppercase tracking-tighter">
                {data.status}
              </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <motion.div
      layout
      style={{
        gridColumn: `span ${widget.w}`,
        gridRow: `span ${widget.h}`
      }}
      className={cn(
        "glass-card group relative flex flex-col overflow-hidden transition-all duration-500",
        isEditing ? "z-50 ring-2 ring-primary" : "hover:neon-glow hover:border-primary/30"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">{widget.title}</h3>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-primary transition-all"
          >
            {isEditing ? <Maximize2 size={12} /> : <Code size={12} />}
          </button>
          <button 
            onClick={() => deleteWidget(widget.id)}
            className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-neon-pink transition-all"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 relative flex flex-col">
        {isEditing ? (
          <div className="absolute inset-0 bg-dashboard-bg z-10 flex flex-col">
            <div className="flex-1 overflow-auto font-mono text-sm p-2">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={code => highlight(code, languages.js, 'javascript')}
                padding={10}
                className="min-h-full outline-none"
                style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: 12,
                }}
              />
            </div>
            <div className="p-2 border-t border-card-border flex justify-end gap-2 bg-card-bg">
              <button 
                onClick={() => executeCode(code)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
              >
                <Play size={12} /> Test
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-neon-lime text-black font-bold rounded hover:bg-neon-lime/80 transition-colors"
              >
                <Save size={12} /> Save
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col justify-center items-center">
            {renderContent()}
          </div>
        )}
      </div>
    </motion.div>
  );
};

