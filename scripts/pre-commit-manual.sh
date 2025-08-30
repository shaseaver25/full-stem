#!/bin/bash
# Manual pre-commit check script
# Run this before committing to ensure code quality

echo "🔍 Running pre-commit checks..."

# Lint check
echo "Running ESLint..."
if ! npm run lint; then
    echo "❌ Linting failed. Please fix the issues above."
    exit 1
fi

# Format check
echo "Checking code formatting..."
if ! npx prettier --check .; then
    echo "❌ Code formatting issues found. Run 'npx prettier --write .' to fix."
    exit 1
fi

# Test check
echo "Running tests..."
if ! npx vitest run --silent; then
    echo "❌ Tests failed. Please fix the failing tests."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
echo "💡 Ready to commit!"