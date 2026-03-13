#!/usr/bin/env node

/**
 * Production Warnings Fix Script
 * Identifies and resolves production deployment warnings
 */

import fs from 'node:fs';

// Logging utility for script output
function log(message) {
  // eslint-disable-next-line no-console
  log(message);
}

log('🔧 BroLab Fanbase - Production Warnings Fix\n');

// 1. Check for test keys in production
function checkProductionKeys() {
  log('🔑 Checking for test keys in production...');
  
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const testKeys = [];
  
  // Find test keys
  const testPatterns = [
    { pattern: /pk_test_/, name: 'Stripe/Clerk publishable test key' },
    { pattern: /sk_test_/, name: 'Stripe/Clerk secret test key' },
    { pattern: /whsec_.*test/, name: 'Webhook test secret' },
    { pattern: /big-fly-4\.clerk\.accounts\.dev/, name: 'Development Clerk domain' },
    { pattern: /dev:focused-canary-684/, name: 'Development Convex deployment' }
  ];
  
  testPatterns.forEach(({ pattern, name }) => {
    if (pattern.test(envContent)) {
      testKeys.push(name);
    }
  });
  
  if (testKeys.length > 0) {
    log('❌ Test keys found in production:');
    testKeys.forEach(key => log(`   - ${key}`));
    return false;
  }
  
  log('✅ No test keys detected');
  return true;
}

// 2. Check Next.js configuration
function checkNextConfig() {
  log('\n⚙️  Checking Next.js configuration...');
  
  const issues = [];
  
  if (fs.existsSync('next.config.mjs')) {
    const config = fs.readFileSync('next.config.mjs', 'utf8');
    
    // Check for production optimizations
    if (!config.includes('compress: true')) {
      issues.push('Missing compression configuration');
    }
    
    if (!config.includes('poweredByHeader: false')) {
      issues.push('Missing security header configuration');
    }
    
    // Check for CSP headers
    if (!config.includes('Content-Security-Policy')) {
      issues.push('Missing Content Security Policy headers');
    }
  }
  
  if (issues.length > 0) {
    log('❌ Next.js configuration issues:');
    issues.forEach(issue => log(`   - ${issue}`));
    return false;
  }
  
  log('✅ Next.js configuration looks good');
  return true;
}

// 3. Check package.json for production readiness
function checkPackageJson() {
  log('\n📦 Checking package.json...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const issues = [];
  
  // Check engines
  if (!packageJson.engines) {
    issues.push('Missing Node.js version specification');
  }
  
  // Check for development dependencies in production
  const prodDeps = Object.keys(packageJson.dependencies || {});
  const devOnlyPackages = ['@types/', 'eslint', 'prettier', 'typescript'];
  
  prodDeps.forEach(dep => {
    if (devOnlyPackages.some(devPkg => dep.includes(devPkg))) {
      issues.push(`Development dependency in production: ${dep}`);
    }
  });
  
  if (issues.length > 0) {
    log('❌ Package.json issues:');
    issues.forEach(issue => log(`   - ${issue}`));
    return false;
  }
  
  log('✅ Package.json looks good');
  return true;
}

// 4. Generate production environment template
function generateProductionEnv() {
  log('\n📝 Generating production environment template...');
  
  const prodEnvTemplate = `# ===========================================
# PRODUCTION ENVIRONMENT VARIABLES
# ===========================================
# ⚠️  REPLACE ALL VALUES WITH PRODUCTION KEYS

NEXT_PUBLIC_URL=https://app.brolabentertainment.com

# ===========================================
# Clerk Authentication (PRODUCTION)
# ===========================================
# Get PRODUCTION keys from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_HERE
CLERK_JWT_ISSUER_DOMAIN=https://clerk.app.brolabentertainment.com
CLERK_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

# Billing
CLERK_BILLING_ENABLED=true
NEXT_PUBLIC_CLERK_PREMIUM_PLAN_ID=cplan_YOUR_PRODUCTION_PLAN_ID

# ===========================================
# Convex (PRODUCTION)
# ===========================================
# Deploy to production: npx convex deploy --prod
CONVEX_DEPLOYMENT=prod:YOUR_PRODUCTION_DEPLOYMENT
NEXT_PUBLIC_CONVEX_URL=https://YOUR_PRODUCTION_DEPLOYMENT.convex.cloud

# ===========================================
# Stripe (PRODUCTION)
# ===========================================
# Get PRODUCTION keys from https://dashboard.stripe.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

# ===========================================
# Email (PRODUCTION)
# ===========================================
RESEND_API_KEY=re_YOUR_PRODUCTION_RESEND_KEY

# ===========================================
# Analytics (PRODUCTION)
# ===========================================
NEXT_PUBLIC_POSTHOG_KEY=phc_YOUR_PRODUCTION_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# ===========================================
# TestSprite (PRODUCTION)
# ===========================================
TESTSPRITE_API_KEY=sk-user-YOUR_PRODUCTION_TESTSPRITE_KEY
`;
  
  fs.writeFileSync('.env.production.template', prodEnvTemplate);
  log('✅ Created .env.production.template');
}

// 5. Generate optimized next.config.mjs
function generateNextConfig() {
  log('\n⚙️  Generating optimized next.config.mjs...');
  
  const nextConfig = `/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://clerk.app.brolabentertainment.com https://eu.i.posthog.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.stripe.com https://clerk.app.brolabentertainment.com https://focused-canary-684.convex.cloud https://eu.i.posthog.com wss:",
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "media-src 'self' blob:",
            ].join('; ')
          }
        ]
      }
    ];
  },
  
  // Image optimization
  images: {
    domains: [
      'img.clerk.com',
      'images.clerk.dev',
      'focused-canary-684.convex.cloud'
    ],
    formats: ['image/webp', 'image/avif']
  },
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons']
  }
};

export default nextConfig;
`;
  
  fs.writeFileSync('next.config.mjs', nextConfig);
  log('✅ Created optimized next.config.mjs');
}

// 6. Generate Vercel configuration
function generateVercelConfig() {
  log('\n🚀 Generating Vercel configuration...');
  
  const vercelConfig = {
    "buildCommand": "npm run build",
    "outputDirectory": ".next",
    "installCommand": "npm ci",
    "framework": "nextjs",
    "functions": {
      "app/api/**/*.ts": {
        "maxDuration": 30
      }
    },
    "headers": [
      {
        "source": "/api/(.*)",
        "headers": [
          {
            "key": "Access-Control-Allow-Origin",
            "value": "https://app.brolabentertainment.com"
          }
        ]
      }
    ],
    "rewrites": [
      {
        "source": "/healthz",
        "destination": "/api/health"
      }
    ]
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  log('✅ Created vercel.json');
}

// 7. Update package.json with production settings
function updatePackageJson() {
  log('\n📦 Updating package.json for production...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Add engines
  packageJson.engines = {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  };
  
  // Add production scripts
  packageJson.scripts = {
    ...packageJson.scripts,
    "build:analyze": "ANALYZE=true npm run build",
    "start:prod": "NODE_ENV=production npm start",
    "health-check": "curl -f http://localhost:3000/healthz || exit 1"
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  log('✅ Updated package.json');
}

// 8. Create health check endpoint
function createHealthCheck() {
  log('\n🏥 Creating health check endpoint...');
  
  const healthCheckCode = `import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health checks
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
`;
  
  // Create directory if it doesn't exist
  if (!fs.existsSync('src/app/api/health')) {
    fs.mkdirSync('src/app/api/health', { recursive: true });
  }
  
  fs.writeFileSync('src/app/api/health/route.ts', healthCheckCode);
  log('✅ Created health check endpoint');
}

// Main execution
async function main() {
  const checks = [
    checkProductionKeys(),
    checkNextConfig(),
    checkPackageJson()
  ];
  
  const allPassed = checks.every(Boolean);
  
  if (allPassed) {
    log('\n✅ All production checks passed!');
    log('Your application is ready for production deployment.');
  } else {
    log('\n🔧 Generating production fixes...');
    
    generateProductionEnv();
    generateNextConfig();
    generateVercelConfig();
    updatePackageJson();
    createHealthCheck();
    
    log('\n📋 Production Deployment Checklist:');
    log('');
    log('1. 🔑 Environment Variables:');
    log('   - Copy .env.production.template to your Vercel dashboard');
    log('   - Replace ALL placeholder values with production keys');
    log('   - Ensure Clerk domain matches your production domain');
    log('');
    log('2. 🏗️  Convex Deployment:');
    log('   - Run: npx convex deploy --prod');
    log('   - Update CONVEX_DEPLOYMENT and NEXT_PUBLIC_CONVEX_URL');
    log('');
    log('3. 💳 Stripe Configuration:');
    log('   - Switch to live keys in Stripe dashboard');
    log('   - Update webhook endpoints to production URLs');
    log('');
    log('4. 🔐 Clerk Configuration:');
    log('   - Switch to production instance');
    log('   - Update allowed origins and redirect URLs');
    log('');
    log('5. 🚀 Deploy:');
    log('   - Commit changes: git add . && git commit -m "Production config"');
    log('   - Push to main: git push origin main');
    log('   - Verify deployment at: https://app.brolabentertainment.com/healthz');
    
    log('\n🔗 Helpful Resources:');
    log('- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables');
    log('- Clerk Production Setup: https://clerk.com/docs/deployments/overview');
    log('- Stripe Live Mode: https://stripe.com/docs/keys#obtain-api-keys');
    log('- Convex Production: https://docs.convex.dev/production/hosting');
  }
}

await main();