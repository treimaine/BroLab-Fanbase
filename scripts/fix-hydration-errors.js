#!/usr/bin/env node

import fs from 'fs';

console.log('🔧 Fixing hydration and Clerk errors...\n');

// 1. Check for suppressHydrationWarning usage
function checkHydrationWarnings() {
  console.log('1. Checking hydration warnings...');
  
  const filesToCheck = [
    'src/app/layout.tsx',
    'src/components/marketing/faq.tsx'
  ];
  
  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('suppressHydrationWarning')) {
        console.log(`✅ ${filePath}: suppressHydrationWarning found`);
      } else {
        console.log(`⚠️  ${filePath}: Missing suppressHydrationWarning`);
      }
    }
  });
}

// 2. Check Clerk configuration
function checkClerkConfig() {
  console.log('\n2. Checking Clerk configuration...');
  
  const envPath = '.env.local';
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    const requiredVars = [
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
      'CLERK_SECRET_KEY',
      'CLERK_JWT_ISSUER_DOMAIN'
    ];
    
    requiredVars.forEach(varName => {
      if (envContent.includes(varName)) {
        console.log(`✅ ${varName}: Present`);
      } else {
        console.log(`❌ ${varName}: Missing`);
      }
    });
  } else {
    console.log('❌ .env.local file not found');
  }
}

// 3. Check Next.js configuration
function checkNextConfig() {
  console.log('\n3. Checking Next.js configuration...');
  
  const nextConfigPath = 'next.config.mjs';
  if (fs.existsSync(nextConfigPath)) {
    console.log('✅ next.config.mjs exists');
  } else {
    console.log('⚠️  next.config.mjs not found');
  }
}

// 4. Generate recommendations
function generateRecommendations() {
  console.log('\n🎯 Recommendations:');
  console.log('1. Restart your development server: npm run dev');
  console.log('2. Clear Next.js cache: rm -rf .next');
  console.log('3. Test Clerk connectivity: node scripts/test-clerk-connectivity.js');
  console.log('4. Check browser console for additional errors');
  console.log('5. Try incognito mode to rule out browser extensions');
}

// Main execution
checkHydrationWarnings();
checkClerkConfig();
checkNextConfig();
generateRecommendations();

console.log('\n✅ Diagnostic complete!');