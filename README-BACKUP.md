# Database Backup System

Your user data is automatically preserved in Replit's PostgreSQL database during redeployments. However, this backup system provides additional protection.

## Quick Backup Commands

### Manual Backup (Run before major changes)
```bash
tsx scripts/quick-backup.ts backup
```
This creates a timestamped backup file in the `./backups` directory.

### Create Pre-Deployment Backup
```bash
mkdir -p backups && tsx scripts/quick-backup.ts backup
```

## What Gets Backed Up

- ✅ **User accounts** - All registered users and their profiles
- ✅ **Shipping addresses** - Default addresses and saved addresses  
- ✅ **Products** - All product catalog data
- ✅ **Orders** - Complete order history and details
- ✅ **Cart data** - Active shopping carts
- ✅ **Categories** - Product categories and organization
- ✅ **Admin users** - Admin account access
- ✅ **Wishlist items** - User wishlist data
- ✅ **Contact messages** - Customer inquiries

## Automatic Data Protection

Replit automatically provides:
- **Database persistence** - Data survives deployments 
- **Daily snapshots** - Built into Replit's PostgreSQL service
- **High availability** - Professional database hosting

## Pre-Deployment Safety

Before any major redeployment:

1. **Create backup**: `tsx scripts/backup-database.ts backup`
2. **Deploy your changes** 
3. **Verify data is intact** - Check user accounts and orders
4. **If issues occur**: Restore from backup

## Backup File Locations

- Backups are saved to `./backups/` directory
- Files named: `backup-YYYY-MM-DDTHH-MM-SS.sql`
- Each backup is a complete snapshot of all data

## Emergency Recovery

If you ever lose data:

1. Find the most recent backup file in `./backups/`
2. Run: `tsx scripts/backup-database.ts restore ./backups/[filename]`
3. All user data will be restored

Your user registration and checkout system will continue working seamlessly across deployments with this backup protection in place.