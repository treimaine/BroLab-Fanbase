#!/bin/bash

# Vercel Deployment Control Script
# Returns exit code 0 to deploy, 1 to skip deployment

echo "🔍 Checking if deployment should proceed..."

# Get the commit message
COMMIT_MSG=$(git log -1 --pretty=%B)
echo "📝 Commit message: $COMMIT_MSG"

# Check if this is a Dependabot commit with no-deploy label
if echo "$COMMIT_MSG" | grep -i "dependabot" > /dev/null; then
  echo "🤖 Dependabot commit detected"
  
  # Check if it's a major version update (requires manual review)
  if echo "$COMMIT_MSG" | grep -E "(major|breaking)" > /dev/null; then
    echo "⚠️  Major update detected - skipping deployment"
    echo "Manual review required for major dependency updates"
    exit 1
  fi
  
  # Check if it's a security update (should deploy)
  if echo "$COMMIT_MSG" | grep -i "security" > /dev/null; then
    echo "🔒 Security update - proceeding with deployment"
    exit 0
  fi
  
  # For minor/patch updates, check if tests pass
  echo "🧪 Running quick validation for dependency update..."
  
  # Install dependencies and run basic checks
  npm ci --silent
  
  # Run TypeScript check
  if ! npx tsc --noEmit; then
    echo "❌ TypeScript errors detected - skipping deployment"
    exit 1
  fi
  
  # Run security audit
  if ! npm audit --omit=dev --audit-level=high; then
    echo "❌ Security vulnerabilities detected - skipping deployment"
    exit 1
  fi
  
  echo "✅ Dependency update validation passed - proceeding with deployment"
  exit 0
fi

# For non-Dependabot commits, always deploy
echo "👤 Regular commit - proceeding with deployment"
exit 0