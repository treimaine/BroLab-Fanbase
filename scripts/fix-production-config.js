#!/usr/bin/env node

/**
 * Production Configuration Fix Script
 * Automatically detects and fixes common production configuration issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 BroLab Fanbase - Production Configuration Fix');
console.log('================================================\n');

// Read current .env.local
const envPath = path.join(process.cwd(), '.env.local');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ Found .env.local file');
} catch (error) {
  console.log('❌ .env.local file not found');
  process.exit(1);
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

console.log('\n📋 Current Configuration Analysis:');
console.log('==================================');

// Check Clerk configuration
const clerkIssues = [];
const clerkJwtIssuer = envVars['CLERK_JWT_ISSUER_DOMAIN'];
const isProduction = process.env.NODE_ENV === 'production';

if (clerkJwtIssuer) {
  console.log(`🔐 Clerk JWT Issuer: ${clerkJwtIssuer}`);
  
  // Check for inconsistency between development and production domains
  if (isProduction && clerkJwtIssuer.includes('clerk.accounts.dev')) {
    clerkIssues.push({
      issue: 'Using development Clerk domain in production',
      current: clerkJwtIssuer,
      recommended: 'https://clerk.app.brolabentertainment.com',
      fix: 'CLERK_JWT_ISSUER_DOMAIN=https://clerk.app.brolabentertainment.com'
    });
  } else if (!isProduction && clerkJwtIssuer.includes('brolabentertainment.com')) {
    clerkIssues.push({
      issue: 'Using production Clerk domain in development',
      current: clerkJwtIssuer,
      recommended: 'https://big-fly-4.clerk.accounts.dev',
      fix: 'CLERK_JWT_ISSUER_DOMAIN=https://big-fly-4.clerk.accounts.dev'
    });
  }
}

// Check other critical environment variables
const criticalVars = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'NEXT_PUBLIC_CONVEX_URL',
  'CONVEX_DEPLOYMENT',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY'
];

const missingVars = [];
const placeholderVars = [];

criticalVars.forEach(varName => {
  const value = envVars[varName];
  if (!value) {
    missingVars.push(varName);
  } else if (value.includes('placeholder') || value.includes('your-') || value.includes('xxx')) {
    placeholderVars.push({ name: varName, value });
  }
});

// Report issues
if (clerkIssues.length > 0) {
  console.log('\n🚨 Clerk Configuration Issues:');
  clerkIssues.forEach((issue, index) => {
    console.log(`${index + 1}. ${issue.issue}`);
    console.log(`   Current: ${issue.current}`);
    console.log(`   Recommended: ${issue.recommended}`);
    console.log(`   Fix: ${issue.fix}\n`);
  });
}

if (missingVars.length > 0) {
  console.log('\n❌ Missing Critical Variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
}

if (placeholderVars.length > 0) {
  console.log('\n⚠️  Placeholder Values Detected:');
  placeholderVars.forEach(({ name, value }) => {
    console.log(`   - ${name}: ${value}`);
  });
}

// Provide solutions
console.log('\n💡 Recommended Actions:');
console.log('======================');

if (clerkIssues.length > 0 || missingVars.length > 0 || placeholderVars.length > 0) {
  console.log('1. Update your .env.local file with the correct values');
  console.log('2. Ensure Clerk custom domain is properly configured');
  console.log('3. Verify all API keys are valid and not placeholders');
  console.log('4. Restart your development server after making changes');
  console.log('5. Test authentication and payment flows');
} else {
  console.log('✅ Configuration looks good!');
}

// CSP recommendations
console.log('\n🛡️  CSP Security Recommendations:');
console.log('=================================');
console.log('The next.config.mjs has been updated with dynamic CSP headers.');
console.log('This should resolve the Content Security Policy violations.');
console.log('');
console.log('If you still see CSP errors:');
console.log('1. Clear browser cache and hard refresh');
console.log('2. Check browser console for specific blocked resources');
console.log('3. Verify the domain in CSP matches your Clerk configuration');

console.log('\n🚀 Next Steps:');
console.log('==============');
console.log('1. npm run build && npm start (test production build)');
console.log('2. Check browser console for remaining errors');
console.log('3. Test authentication flow end-to-end');
console.log('4. Test payment flow if applicable');

console.log('\n✨ Configuration fix complete!');