#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🧹 Cleaning Next.js cache and restarting...\n');

// 1. Remove .next directory
try {
  if (fs.existsSync('.next')) {
    console.log('🗑️  Removing .next directory...');
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ .next directory removed');
  } else {
    console.log('ℹ️  .next directory not found');
  }
} catch (error) {
  console.log('❌ Error removing .next:', error.message);
}

// 2. Clear npm cache
try {
  console.log('🧹 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });
  console.log('✅ npm cache cleared');
} catch (error) {
  console.log('❌ Error clearing npm cache:', error.message);
}

// 3. Reinstall dependencies
try {
  console.log('📦 Reinstalling dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies reinstalled');
} catch (error) {
  console.log('❌ Error reinstalling dependencies:', error.message);
}

console.log('\n🎉 Cleanup complete!');
console.log('💡 Now run: npm run dev');