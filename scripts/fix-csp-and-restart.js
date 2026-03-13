#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🔧 Fixing CSP issues and restarting...\n');

// 1. Kill any running Next.js processes
try {
  console.log('🛑 Stopping any running Next.js processes...');
  if (process.platform === 'win32') {
    execSync('taskkill /f /im node.exe 2>nul || echo "No Node processes to kill"', { stdio: 'inherit' });
  } else {
    execSync('pkill -f "next dev" || echo "No Next.js processes to kill"', { stdio: 'inherit' });
  }
  console.log('✅ Processes stopped');
} catch (error) {
  console.log('ℹ️  No processes to stop');
}

// 2. Remove .next directory
try {
  if (fs.existsSync('.next')) {
    console.log('🗑️  Removing .next directory...');
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ .next directory removed');
  }
} catch (error) {
  console.log('❌ Error removing .next:', error.message);
}

// 3. Remove node_modules/.cache if exists
try {
  if (fs.existsSync('node_modules/.cache')) {
    console.log('🗑️  Removing node_modules/.cache...');
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    console.log('✅ Cache removed');
  }
} catch (error) {
  console.log('ℹ️  No cache to remove');
}

// 4. Verify CSP configuration
console.log('🔍 Verifying CSP configuration...');
if (fs.existsSync('next.config.mjs')) {
  const config = fs.readFileSync('next.config.mjs', 'utf8');
  if (config.includes('big-fly-4.clerk.accounts.dev') && config.includes('eu-assets.i.posthog.com')) {
    console.log('✅ CSP configuration looks correct');
  } else {
    console.log('❌ CSP configuration may need updating');
  }
}

console.log('\n🎉 Cleanup complete!');
console.log('💡 Now run: npm run dev');
console.log('🔍 Check browser console - CSP errors should be gone');