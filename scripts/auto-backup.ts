#!/usr/bin/env tsx
/**
 * Automated backup system with scheduled backups
 * Runs periodic backups and cleanup of old backups
 */

import { createDatabaseBackup } from './backup-database.js';
import fs from 'fs/promises';
import path from 'path';

interface AutoBackupConfig {
  intervalMinutes: number;
  maxBackups: number;
  backupDir: string;
}

export class AutoBackupService {
  private config: AutoBackupConfig;
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  constructor(config: Partial<AutoBackupConfig> = {}) {
    this.config = {
      intervalMinutes: 60, // Backup every hour
      maxBackups: 24,      // Keep 24 backups (1 day if hourly)
      backupDir: './backups',
      ...config
    };
  }

  async start() {
    if (this.isRunning) {
      console.log('Auto-backup service is already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting auto-backup service...`);
    console.log(`⏰ Backup interval: ${this.config.intervalMinutes} minutes`);
    console.log(`📁 Backup directory: ${this.config.backupDir}`);
    console.log(`🗂️ Max backups to keep: ${this.config.maxBackups}`);

    // Create initial backup
    await this.performBackup();

    // Schedule periodic backups
    this.intervalId = setInterval(
      () => this.performBackup(),
      this.config.intervalMinutes * 60 * 1000
    );

    console.log('✅ Auto-backup service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Auto-backup service is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    this.isRunning = false;
    console.log('🛑 Auto-backup service stopped');
  }

  private async performBackup() {
    try {
      console.log(`🔄 Creating scheduled backup...`);
      
      const backupPath = await createDatabaseBackup({
        outputDir: this.config.backupDir,
        timestamp: true
      });

      console.log(`✅ Scheduled backup completed: ${backupPath}`);

      // Clean up old backups
      await this.cleanupOldBackups();

    } catch (error) {
      console.error('❌ Scheduled backup failed:', error);
    }
  }

  private async cleanupOldBackups() {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('backup-') && file.endsWith('.sql'))
        .map(file => ({
          name: file,
          path: path.join(this.config.backupDir, file),
          stats: null as any
        }));

      // Get file stats for sorting by creation time
      for (const file of backupFiles) {
        file.stats = await fs.stat(file.path);
      }

      // Sort by creation time (newest first)
      backupFiles.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      // Delete excess backups
      if (backupFiles.length > this.config.maxBackups) {
        const filesToDelete = backupFiles.slice(this.config.maxBackups);
        
        console.log(`🧹 Cleaning up ${filesToDelete.length} old backup files...`);
        
        for (const file of filesToDelete) {
          await fs.unlink(file.path);
          console.log(`🗑️ Deleted old backup: ${file.name}`);
        }
      }

    } catch (error) {
      console.error('❌ Failed to cleanup old backups:', error);
    }
  }

  async getBackupStatus() {
    try {
      const files = await fs.readdir(this.config.backupDir);
      const backupFiles = files.filter(file => file.startsWith('backup-') && file.endsWith('.sql'));
      
      const backups = [];
      for (const file of backupFiles) {
        const filePath = path.join(this.config.backupDir, file);
        const stats = await fs.stat(filePath);
        backups.push({
          name: file,
          size: stats.size,
          created: stats.mtime,
          path: filePath
        });
      }

      // Sort by creation time (newest first)
      backups.sort((a, b) => b.created.getTime() - a.created.getTime());

      return {
        isRunning: this.isRunning,
        totalBackups: backups.length,
        backups: backups,
        config: this.config
      };
    } catch (error) {
      console.error('Failed to get backup status:', error);
      return null;
    }
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const autoBackup = new AutoBackupService();

  switch (command) {
    case 'start':
      autoBackup.start().catch(console.error);
      // Keep the process running
      process.stdin.resume();
      break;
    
    case 'status':
      autoBackup.getBackupStatus().then(status => {
        console.log('📊 Backup Status:');
        console.log(JSON.stringify(status, null, 2));
        process.exit(0);
      }).catch(console.error);
      break;
    
    default:
      console.log('Usage:');
      console.log('  npm run auto-backup start  - Start automatic backup service');
      console.log('  npm run auto-backup status - Show backup status');
  }
}

export default AutoBackupService;