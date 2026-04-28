import React, { useCallback } from 'react';
import { ImageIcon, PenTool, Scissors, ImagePlus, Layers, Download, Trash2 } from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';

interface ToolProps {
  title: string;
  description: string;
  icon: any;
  color: string;
  onClick?: () => void;
}

const ToolCard: React.FC<ToolProps> = ({ title, description, icon: Icon, color, onClick }) => (
  <div 
    onClick={onClick}
    className="glass-card p-6 flex flex-col items-center text-center space-y-4 hover:bg-white/5 transition-all group cursor-pointer"
  >
    <div className={`p-4 rounded-2xl ${color} bg-opacity-20 group-hover:scale-110 transition-transform`}>
      <Icon className={color.replace('bg-', 'text-')} size={32} />
    </div>
    <div>
      <h4 className="font-bold text-lg">{title}</h4>
      <p className="text-xs text-white/40 mt-1">{description}</p>
    </div>
    <button className="w-full py-2 bg-white/5 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
      Launch Tool
    </button>
  </div>
);

export const ToolsPanel: React.FC<{ type: 'media' | 'vector' }> = ({ type }) => {
  const { assets, addAsset, deleteAsset } = useDashboard();

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addAsset({
            name: file.name,
            type: file.type,
            data: event.target.result as string
          });
        }
      };
      reader.readAsDataURL(file);
    });
  }, [addAsset]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const navToAI = () => {
     const event = new CustomEvent('nav-tab', { detail: 'ai' });
     window.dispatchEvent(event);
  };

  const navToFiles = () => {
    const event = new CustomEvent('nav-tab', { detail: 'files' });
    window.dispatchEvent(event);
  };

  return (
    <div className="p-8 space-y-8 h-full overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-3">
        {type === 'media' ? <ImageIcon size={32} className="text-neon-pink" /> : <PenTool size={32} className="text-neon-blue" />}
        <div>
          <h2 className="text-2xl font-bold tracking-tight uppercase">
            {type === 'media' ? 'Media & Image Studio' : 'Vector & Icon Designer'}
          </h2>
          <p className="text-xs text-white/40 uppercase tracking-widest">Creative Suite Extension</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {type === 'media' ? (
          <>
            <ToolCard 
              title="Background Remover" 
              description="AI-powered background removal for your assets." 
              icon={Scissors} 
              color="bg-neon-pink" 
              onClick={navToAI}
            />
            <ToolCard 
              title="Asset Library" 
              description="Manage your icons, images, and brand vectors." 
              icon={Layers} 
              color="bg-neon-blue" 
              onClick={navToFiles}
            />
            <ToolCard 
              title="Image Optimizer" 
              description="Compress and resize images for dashboard performance." 
              icon={Download} 
              color="bg-neon-lime" 
              onClick={navToAI}
            />
          </>
        ) : (
          <>
            <ToolCard 
              title="Icon Creator" 
              description="Design custom SVG icons for your widgets." 
              icon={PenTool} 
              color="bg-neon-blue" 
              onClick={navToAI}
            />
            <ToolCard 
              title="Vector Importer" 
              description="Import and sanitize external SVG assets." 
              icon={ImagePlus} 
              color="bg-neon-lime" 
              onClick={navToFiles}
            />
            <ToolCard 
              title="UI Component Builder" 
              description="Create reusable UI elements with custom code." 
              icon={Layers} 
              color="bg-neon-pink" 
              onClick={navToFiles}
            />
          </>
        )}
      </div>

      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="glass-card p-12 flex flex-col items-center justify-center border-dashed border-2 border-white/10 hover:border-neon-lime/50 transition-colors cursor-pointer"
      >
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <Layers size={32} className="text-white/20" />
        </div>
        <p className="text-sm font-bold text-white/40">Drop files here to import into library</p>
        <p className="text-[10px] text-white/20 mt-1 uppercase tracking-widest">Supports SVG, PNG, JPG</p>
      </div>

      {assets.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-neon-lime">Asset Library</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {assets.map(asset => (
              <div key={asset.id} className="glass-card p-2 relative group flex flex-col items-center">
                <div className="w-full aspect-square bg-black/50 rounded-lg mb-2 overflow-hidden flex items-center justify-center">
                  {asset.type.startsWith('image/') ? (
                    <img src={asset.data} alt={asset.name} className="w-full h-full object-cover" />
                  ) : (
                    <Layers size={24} className="text-white/20" />
                  )}
                </div>
                <p className="text-[10px] text-white/60 truncate w-full text-center">{asset.name}</p>
                <button 
                  onClick={() => deleteAsset(asset.id)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

