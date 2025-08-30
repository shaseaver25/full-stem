#!/bin/bash
# Developer setup script
# Run this to add helpful dev scripts

echo "Setting up development environment..."

# Check if package.json has the new scripts
if ! grep -q '"format"' package.json; then
    echo "⚠️  Note: You may want to add these scripts to package.json:"
    echo '  "format": "prettier --write .",'
    echo '  "test": "vitest run",'
    echo '  "test:watch": "vitest"'
fi

# Run initial checks
echo "🔍 Running initial lint check..."
npm run lint

echo "🧪 Running tests..."
npx vitest run

echo "✨ Formatting code..."
npx prettier --write .

echo "✅ Development environment is ready!"
echo ""
echo "💡 Tip: Add '?debug=1' to any URL to see the TTS debug HUD"
echo "🎯 Run 'npm run test:watch' for live testing during development"