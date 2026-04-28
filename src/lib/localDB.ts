import Dexie, { Table } from 'dexie';

export interface AuditLog {
  id?: number;
  timestamp: number;
  action: string;
  category: 'system' | 'inventory' | 'neural' | 'remote';
  details: string;
  operator: string;
}

export interface InventoryItem {
  id?: string;
  sku: string;
  name: string;
  quantity: number;
  lastAudit: number;
  status: 'available' | 'low' | 'out_of_stock';
}

export class JSVDatabase extends Dexie {
  auditLogs!: Table<AuditLog>;
  inventory!: Table<InventoryItem>;

  constructor() {
    super('JSV_Local_Storage');
    this.version(1).stores({
      auditLogs: '++id, timestamp, category, operator',
      inventory: '++id, sku, name, status'
    });
  }
}

export const db_local = new JSVDatabase();
