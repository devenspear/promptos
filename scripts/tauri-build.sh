#!/bin/bash
# Tauri build script - temporarily moves API routes for static export

set -e

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
API_DIR="$PROJECT_DIR/src/app/api"
API_BACKUP="$PROJECT_DIR/src/app/_api_backup"
MIDDLEWARE="$PROJECT_DIR/src/middleware.ts"
MIDDLEWARE_BACKUP="$PROJECT_DIR/src/_middleware_backup.ts"

echo "🔧 Preparing for Tauri build..."

# Backup API routes and middleware
if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$API_BACKUP"
  echo "  ✓ Backed up API routes"
fi

if [ -f "$MIDDLEWARE" ]; then
  mv "$MIDDLEWARE" "$MIDDLEWARE_BACKUP"
  echo "  ✓ Backed up middleware"
fi

# Clean previous builds
rm -rf "$PROJECT_DIR/.next" "$PROJECT_DIR/out"

# Run the build
echo "🏗️  Building Next.js static export..."
TAURI_BUILD=true npm run build

# Restore API routes and middleware
if [ -d "$API_BACKUP" ]; then
  mv "$API_BACKUP" "$API_DIR"
  echo "  ✓ Restored API routes"
fi

if [ -f "$MIDDLEWARE_BACKUP" ]; then
  mv "$MIDDLEWARE_BACKUP" "$MIDDLEWARE"
  echo "  ✓ Restored middleware"
fi

echo "✅ Next.js build complete!"
