#!/bin/bash

# 🛡️ NextBuy Auto-Backup Script
echo "🛡️ NextBuy Auto-Backup Starting..."

# Git backup
echo "📤 Pushing to GitHub..."
git add .
git commit -m "🔄 Auto-backup: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main

# Local backup
echo "💾 Creating local backup..."
cd ..
BACKUP_NAME="NextBuy_Backup_$(date +%Y%m%d_%H%M%S).tar.gz"
tar -czf "$BACKUP_NAME" backend --exclude=backend/node_modules --exclude=backend/dist --exclude=backend/.git
echo "✅ Local backup created: $BACKUP_NAME"

# Cleanup old backups (keep last 5)
echo "🧹 Cleaning old backups..."
ls -t NextBuy_Backup_*.tar.gz | tail -n +6 | xargs rm -f

echo "🎉 Backup completed successfully!"
echo "📍 GitHub: https://github.com/dimitrisdogiamas/E-com.git"
echo "📍 Local: $BACKUP_NAME" 