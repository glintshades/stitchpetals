#!/usr/bin/env tsx
/**
 * Simple backup using Replit's SQL tool integration
 * Works with the development database
 */

import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface BackupData {
  timestamp: string;
  tables: Record<string, any[]>;
  metadata: {
    totalRecords: number;
    backupSize: string;
  };
}

export async function createSimpleBackup(): Promise<string> {
  try {
    console.log('Creating database backup...');
    
    // Ensure backup directory exists
    await fs.mkdir('./backups', { recursive: true });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `backup-${timestamp}.json`;
    const backupPath = path.join('./backups', backupFileName);

    // Use the internal backup endpoint (localhost only for security)
    const response = await fetch('http://localhost:5000/api/internal/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Backup API failed: ${response.status}`);
    }

    const backupData = await response.json();
    
    // Write backup to file
    await fs.writeFile(backupPath, JSON.stringify(backupData, null, 2));
    
    const stats = await fs.stat(backupPath);
    console.log(`✅ Backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Backup size: ${stats.size} bytes`);
    console.log(`📋 Total records: ${backupData.metadata?.totalRecords || 'unknown'}`);
    
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  }
}

export async function restoreFromBackup(backupPath: string): Promise<void> {
  try {
    console.log(`Restoring from: ${backupPath}`);
    
    const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
    
    const response = await fetch('http://localhost:5000/api/admin/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(backupData)
    });

    if (!response.ok) {
      throw new Error(`Restore API failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Restore completed successfully!');
    console.log(`📋 Restored ${result.restoredRecords} records`);
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const filePath = process.argv[3];
  
  if (command === 'backup') {
    createSimpleBackup().catch(console.error);
  } else if (command === 'restore' && filePath) {
    restoreFromBackup(filePath).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  tsx scripts/simple-backup.ts backup        - Create database backup');
    console.log('  tsx scripts/simple-backup.ts restore <file> - Restore from backup file');
  }
}