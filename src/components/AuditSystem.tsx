import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  Download, 
  Database, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
  Box,
  FileBadge
} from 'lucide-react';
import { useDashboard } from '../store/DashboardContext';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLiveQuery } from 'dexie-react-hooks';
import { db_local } from '../lib/localDB';

export const AuditSystem: React.FC = () => {
  const { addLog } = useDashboard();
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Live query from local DB (Industrial feature)
  const auditLogs = useLiveQuery(() => db_local.auditLogs.reverse().limit(10).toArray());
  const inventoryItems = useLiveQuery(() => db_local.inventory.toArray());
  const inventoryStats = useLiveQuery(() => db_local.inventory.count());

  const addToInventory = async () => {
    const sku = `JSV-${Math.floor(Math.random() * 10000)}`;
    await db_local.inventory.add({
      sku,
      name: 'Industrial Unit Delta',
      quantity: 1,
      status: 'available',
      lastAudit: Date.now()
    });
    addLog('INV_ADD', `New unit cataloged: ${sku}`);
  };

  const generateAuditReport = async () => {
    setIsGenerating(true);
    addLog('AUDIT_START', 'Generating technical industrial report (PDF)...');

    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(20, 20, 20);
      doc.text('JSV_AUTOPARTES - INDUSTRIAL AUDIT', 14, 22);
      
      doc.setFontSize(10);
      doc.text(`DATE: ${new Date().toLocaleString()}`, 14, 30);
      doc.text('SECURITY LEVEL: RESTRICTED', 14, 35);

      // Inventory Table
      autoTable(doc, {
        startY: 45,
        head: [['System_ID', 'Unit_Name', 'Status', 'Timestamp']],
        body: auditLogs?.map(log => [
          log.id?.toString() || 'N/A',
          log.action,
          log.category.toUpperCase(),
          new Date(log.timestamp).toLocaleTimeString()
        ]) || [['No data available', '', '', '']],
        theme: 'striped',
        headStyles: { fillColor: [0, 0, 0] }
      });

      doc.save(`JSV_AUDIT_${Date.now()}.pdf`);
      addLog('AUDIT_SUCCESS', 'Industrial report generated and exported.');
    } catch (error) {
      console.error(error);
      addLog('AUDIT_ERROR', 'Failed to generate PDF report.');
    } finally {
      setIsGenerating(false);
    }
  };

  const addManualLog = async () => {
     await db_local.auditLogs.add({
        timestamp: Date.now(),
        action: 'MANUAL_INSPECTION_COMPLETED',
        category: 'inventory',
        details: 'Visual verification of unit stock successful.',
        operator: 'SYSTEM_ADMIN'
     });
     addLog('DB_LOCAL_UPDATE', 'Manual audit log synced to local storage.');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#050505] p-6 gap-6 h-full overflow-hidden">
      {/* HEADER SECTION */}
      <div className="flex items-center justify-between glass-card p-6 border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-yellow-400/10 rounded-2xl text-yellow-400">
            <ClipboardCheck size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic text-white tracking-tighter uppercase leading-none">
              AUDIT_<span className="text-yellow-400">SYSTEM</span>_v1.2
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-2 py-0.5 bg-white/5 rounded text-[8px] font-black text-white/40 uppercase tracking-widest border border-white/10">INDUSTRIAL_CORE</span>
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Local Integrity: 99.8%</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={addToInventory}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white/60 transition-all border border-white/10"
          >
            <Plus size={14} />
            Catalog_Unit
          </button>
          <button 
            onClick={generateAuditReport}
            disabled={isGenerating}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
              isGenerating ? "bg-white/5 text-white/20 cursor-wait" : "bg-yellow-400 text-black hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
            )}
          >
            <Download size={14} />
            {isGenerating ? 'PROCESSING...' : 'EXPORT_AUDIT_PDF'}
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        {/* STATS BOARD */}
        <div className="lg:col-span-1 space-y-6 flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar">
           <div className="glass-card p-6 border-white/5 bg-white/[0.02]">
             <div className="flex items-center justify-between mb-4">
               <div className="text-[10px] font-black uppercase text-white/40 tracking-widest">Inventory_Overview</div>
               <TrendingUp size={14} className="text-green-500" />
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                   <div className="text-2xl font-black text-white">{inventoryStats || 0}</div>
                   <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Total_Units</div>
                </div>
                <div className="bg-black/40 p-4 rounded-xl border border-white/5">
                   <div className="text-2xl font-black text-yellow-400">04</div>
                   <div className="text-[8px] font-bold text-white/20 uppercase mt-1">Low_Stock</div>
                </div>
             </div>
           </div>

           <div className="glass-card p-6 border-white/5 bg-white/[0.02] flex-1">
             <h3 className="text-xs font-black text-white uppercase mb-6 tracking-widest flex items-center gap-2">
                <Box size={14} className="text-yellow-400" />
                Live_Inventory
             </h3>
             <div className="space-y-3">
                {inventoryItems?.slice(-5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                     <div>
                        <div className="text-[10px] font-black text-white/80">{item.sku}</div>
                        <div className="text-[8px] font-mono text-white/20 uppercase">{item.name}</div>
                     </div>
                     <div className="text-[9px] font-black text-green-500 uppercase">{item.status}</div>
                  </div>
                ))}
                {(!inventoryItems || inventoryItems.length === 0) && (
                   <div className="text-[8px] font-mono text-white/20 uppercase text-center py-8">Waiting for intake...</div>
                )}
             </div>
           </div>
        </div>

        {/* LOGS TABLE (INDUSTRIAL FEED) */}
        <div className="lg:col-span-2 glass-card border-white/5 bg-white/[0.01] flex flex-col h-full overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileBadge size={16} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase text-white tracking-widest">Industrial_Activity_Log</span>
            </div>
            <div className="flex items-center gap-2">
               <button 
                onClick={addManualLog}
                className="p-2 bg-white/5 rounded-lg text-yellow-400 hover:bg-yellow-400 hover:text-black transition-all" title="Manual Entry">
                <Plus size={14} />
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <table className="w-full text-left">
               <thead className="sticky top-0 bg-[#050505]/80 backdrop-blur-md z-10">
                  <tr className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] border-b border-white/5">
                    <th className="pb-4 pt-1 px-4">Timestamp</th>
                    <th className="pb-4 pt-1 px-4">Action_Type</th>
                    <th className="pb-4 pt-1 px-4 text-right">Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/[0.02]">
                  {auditLogs?.map((log) => (
                    <tr key={log.id} className="group hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-4 font-mono text-[9px] text-white/40">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="py-4 px-4 capitalize">
                        <div className="text-[10px] font-black text-white/80 group-hover:text-yellow-400 transition-colors uppercase">{log.action.replace(/_/g, ' ')}</div>
                        <div className="text-[9px] text-white/20 line-clamp-1">{log.details}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                         <span className="px-2 py-1 bg-yellow-400/10 text-yellow-400 text-[8px] font-black uppercase rounded tracking-widest border border-yellow-400/20">
                            {log.category}
                         </span>
                      </td>
                    </tr>
                  ))}
               </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

