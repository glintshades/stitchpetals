#!/usr/bin/env tsx
/**
 * Database backup script for GlintShades e-commerce platform
 * Creates full backup of all tables with timestamp
 */

import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface BackupOptions {
  outputDir?: string;
  timestamp?: boolean;
  compress?: boolean;
}

export async function createDatabaseBackup(options: BackupOptions = {}) {
  const { 
    outputDir = './backups', 
    timestamp = true,
    compress = false 
  } = options;

  try {
    // Ensure backup directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // Generate backup filename
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = timestamp 
      ? `backup-${date}.sql`
      : 'backup.sql';
    
    const backupPath = path.join(outputDir, filename);

    console.log(`Creating database backup: ${backupPath}`);

    // Get all table names
    const tables = [
      'users',
      'saved_addresses', 
      'products',
      'categories',
      'cart_items',
      'orders',
      'order_items',
      'contact_submissions',
      'admin_users',
      'wishlist_items',
      'offers'
    ];

    let backupSql = `-- Database backup created on ${new Date().toISOString()}\n`;
    backupSql += `-- GlintShades E-commerce Platform\n\n`;

    // Backup each table
    for (const tableName of tables) {
      console.log(`Backing up table: ${tableName}`);
      
      try {
        // Get table structure
        const structureQuery = `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = $1
          ORDER BY ordinal_position;
        `;
        
        const structure = await pool.query(structureQuery, [tableName]);
        
        if (structure.rows.length === 0) {
          console.log(`Table ${tableName} not found, skipping...`);
          continue;
        }

        // Add table comment
        backupSql += `-- Table: ${tableName}\n`;
        backupSql += `-- Columns: ${structure.rows.map(r => r.column_name).join(', ')}\n\n`;

        // Get all data from table
        const dataQuery = `SELECT * FROM ${tableName}`;
        const result = await pool.query(dataQuery);

        if (result.rows.length > 0) {
          // Generate INSERT statements
          const columns = result.rows[0] ? Object.keys(result.rows[0]) : [];
          
          backupSql += `-- Data for table: ${tableName}\n`;
          
          for (const row of result.rows) {
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') {
                return `'${value.replace(/'/g, "''")}'`;
              }
              if (typeof value === 'boolean') return value ? 'true' : 'false';
              if (value instanceof Date) return `'${value.toISOString()}'`;
              if (typeof value === 'object') return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
              return value;
            }).join(', ');
            
            backupSql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values});\n`;
          }
        } else {
          backupSql += `-- No data in table: ${tableName}\n`;
        }
        
        backupSql += `\n`;
      } catch (error) {
        console.error(`Error backing up table ${tableName}:`, error);
        backupSql += `-- ERROR backing up table ${tableName}: ${error.message}\n\n`;
      }
    }

    // Write backup file
    await fs.writeFile(backupPath, backupSql, 'utf8');
    
    console.log(`✅ Database backup completed successfully!`);
    console.log(`📁 Backup saved to: ${backupPath}`);
    console.log(`📊 Backup size: ${(await fs.stat(backupPath)).size} bytes`);
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ Database backup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

export async function restoreFromBackup(backupPath: string) {
  try {
    console.log(`Restoring database from: ${backupPath}`);
    
    // Read backup file
    const backupSql = await fs.readFile(backupPath, 'utf8');
    
    // Split into individual statements
    const statements = backupSql
      .split('\n')
      .filter(line => line.trim() && !line.startsWith('--'))
      .join('\n')
      .split(';')
      .filter(stmt => stmt.trim());

    console.log(`Executing ${statements.length} SQL statements...`);

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement.trim());
        } catch (error) {
          console.error(`Error executing statement: ${statement.substring(0, 100)}...`);
          console.error(error.message);
        }
      }
    }
    
    console.log('✅ Database restore completed!');
    
  } catch (error) {
    console.error('❌ Database restore failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];
  const filePath = process.argv[3];
  
  if (command === 'backup') {
    createDatabaseBackup({
      outputDir: './backups',
      timestamp: true
    }).catch(console.error);
  } else if (command === 'restore' && filePath) {
    restoreFromBackup(filePath).catch(console.error);
  } else {
    console.log('Usage:');
    console.log('  npm run backup        - Create database backup');
    console.log('  npm run restore <file> - Restore from backup file');
  }
}