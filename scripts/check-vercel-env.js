#!/usr/bin/env node

/**
 * Vercel Environment Variables Checker
 * Ensures all required environment variables are set for production deployment
 */

const requiredEnvVars = {
  // Clerk Authentication
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': {
    description: 'Clerk publishable key for client-side auth',
    example: 'pk_live_...',
    critical: true
  },
  'CLERK_SECRET_KEY': {
    description: 'Clerk secret key for server-side auth',
    example: 'sk_live_...',
    critical: true
  },
  'CLERK_JWT_ISSUER_DOMAIN': {
    description: 'Clerk JWT issuer domain for Convex integration',
    example: 'https://clerk.app.brolabentertainment.com',
    critical: true
  },
  'CLERK_WEBHOOK_SECRET': {
    description: 'Clerk webhook secret for signature verification',
    example: 'whsec_...',
    critical: true
  },
  
  // Convex Backend
  'NEXT_PUBLIC_CONVEX_URL': {
    description: 'Convex deployment URL',
    example: 'https://your-deployment.convex.cloud',
    critical: true
  },
  'CONVEX_DEPLOYMENT': {
    description: 'Convex deployment identifier',
    example: 'prod:your-deployment',
    critical: true
  },
  
  // Stripe Payments
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': {
    description: 'Stripe publishable key for client-side payments',
    example: 'pk_live_...',
    critical: true
  },
  'STRIPE_SECRET_KEY': {
    description: 'Stripe secret key for server-side payments',
    example: 'sk_live_...',
    critical: true
  },
  'STRIPE_WEBHOOK_SECRET': {
    description: 'Stripe webhook secret for signature verification',
    example: 'whsec_...',
    critical: true
  },
  
  // Application
  'NEXT_PUBLIC_URL': {
    description: 'Application base URL',
    example: 'https://app.brolabentertainment.com',
    critical: true
  },
  
  // Optional but recommended
  'RESEND_API_KEY': {
    description: 'Resend API key for email sending',
    example: 're_...',
    critical: false
  },
  'NEXT_PUBLIC_POSTHOG_KEY': {
    description: 'PostHog analytics key',
    example: 'phc_...',
    critical: false
  },
  'NEXT_PUBLIC_POSTHOG_HOST': {
    description: 'PostHog host URL',
    example: 'https://eu.i.posthog.com',
    critical: false
  }
};

console.log('🔍 Checking Vercel environment variables...\n');

const missing = [];
const warnings = [];

Object.entries(requiredEnvVars).forEach(([key, config]) => {
  const value = process.env[key];
  
  if (!value) {
    if (config.critical) {
      missing.push({ key, config });
    } else {
      warnings.push({ key, config });
    }
  } else if (value.includes('placeholder') || value.includes('your-') || value.includes('test_')) {
    if (config.critical) {
      missing.push({ key, config, reason: 'Contains placeholder/test value' });
    } else {
      warnings.push({ key, config, reason: 'Contains placeholder/test value' });
    }
  } else {
    console.log(`✅ ${key}: Set`);
  }
});

if (missing.length > 0) {
  console.log('\n🚨 CRITICAL: Missing required environment variables:');
  missing.forEach(({ key, config, reason }) => {
    console.log(`\n❌ ${key}`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Example: ${config.example}`);
    if (reason) console.log(`   Issue: ${reason}`);
  });
  
  console.log('\n📋 To fix in Vercel:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add the missing variables above');
  console.log('5. Redeploy your application');
  
  process.exit(1);
}

if (warnings.length > 0) {
  console.log('\n⚠️  Optional environment variables not set:');
  warnings.forEach(({ key, config, reason }) => {
    console.log(`\n🟡 ${key}`);
    console.log(`   Description: ${config.description}`);
    console.log(`   Example: ${config.example}`);
    if (reason) console.log(`   Issue: ${reason}`);
  });
}

console.log('\n✅ Environment variables check completed');

// Additional production checks
console.log('\n🔍 Additional production checks:');

// Check for development URLs in production
const devPatterns = [
  'localhost',
  '127.0.0.1',
  '.dev',
  'test_',
  'pk_test_',
  'sk_test_'
];

let hasDevUrls = false;
Object.entries(process.env).forEach(([key, value]) => {
  if (key.startsWith('NEXT_PUBLIC_') || key.includes('URL') || key.includes('KEY')) {
    devPatterns.forEach(pattern => {
      if (value && value.includes(pattern)) {
        console.log(`⚠️  ${key} contains development pattern: ${pattern}`);
        hasDevUrls = true;
      }
    });
  }
});

if (!hasDevUrls) {
  console.log('✅ No development URLs detected in production variables');
}

console.log('\n📖 For more help:');
console.log('- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables');
console.log('- Clerk Production Setup: https://clerk.com/docs/deployments/overview');
console.log('- Convex Production: https://docs.convex.dev/production/hosting');
console.log('- Stripe Production: https://stripe.com/docs/keys');