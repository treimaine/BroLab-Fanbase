#!/usr/bin/env node

/**
 * Production Issues Diagnostic & Fix Script
 * Identifies and resolves common deployment failures
 */

const fs = require('node:fs');
const { execSync } = require('node:child_process');

console.log('🔧 BroLab Fanbase - Production Issues Diagnostic\n');

// 1. Check for Dependabot conflicts
function checkDependabotConflicts() {
  console.log('📦 Checking for Dependabot conflicts...');
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const issues = [];
  
  // Check for problematic version combinations
  const problematicCombos = [
    {
      check: () => packageJson.dependencies?.next?.includes('15') && packageJson.devDependencies?.eslint?.includes('9'),
      issue: 'ESLint v9 incompatible with Next.js 15',
      fix: 'Downgrade ESLint to v8.x'
    },
    {
      check: () => packageJson.devDependencies?.tailwindcss?.includes('4'),
      issue: 'Tailwind CSS v4 is still beta',
      fix: 'Use Tailwind CSS v3.x for stability'
    },
    {
      check: () => packageJson.dependencies?.react?.includes('19') && !packageJson.dependencies?.['@types/react']?.includes('19'),
      issue: 'React 19 with incompatible TypeScript types',
      fix: 'Update @types/react to v19.x'
    }
  ];
  
  problematicCombos.forEach(combo => {
    if (combo.check()) {
      issues.push(combo);
    }
  });
  
  if (issues.length > 0) {
    console.log('❌ Dependabot conflicts found:');
    issues.forEach(issue => {
      console.log(`   - ${issue.issue}`);
      console.log(`     Fix: ${issue.fix}`);
    });
    return false;
  }
  
  console.log('✅ No Dependabot conflicts detected');
  return true;
}

// 2. Check environment variables
function checkEnvironmentVariables() {
  console.log('\n🔑 Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY', 
    'CLERK_JWT_ISSUER_DOMAIN',
    'NEXT_PUBLIC_CONVEX_URL',
    'CONVEX_DEPLOYMENT',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY'
  ];
  
  const missing = [];
  const testValues = [];
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else if (value.includes('test_') || value.includes('pk_test_') || value.includes('sk_test_')) {
      testValues.push(varName);
    }
  });
  
  if (missing.length > 0) {
    console.log('❌ Missing environment variables:');
    missing.forEach(varName => console.log(`   - ${varName}`));
    return false;
  }
  
  if (testValues.length > 0) {
    console.log('⚠️  Test values in production:');
    testValues.forEach(varName => console.log(`   - ${varName}`));
  }
  
  console.log('✅ Environment variables configured');
  return true;
}

// 3. Check build configuration
function checkBuildConfig() {
  console.log('\n⚙️  Checking build configuration...');
  
  const issues = [];
  
  // Check next.config.mjs
  if (fs.existsSync('next.config.mjs')) {
    const config = fs.readFileSync('next.config.mjs', 'utf8');
    
    if (!config.includes('Content-Security-Policy')) {
      issues.push('Missing CSP headers in next.config.mjs');
    }
    
    if (config.includes('big-fly-4.clerk.accounts.dev') && process.env.NODE_ENV === 'production') {
      issues.push('Development Clerk domain in production config');
    }
  } else {
    issues.push('Missing next.config.mjs file');
  }
  
  // Check TypeScript config
  if (fs.existsSync('tsconfig.json')) {
    const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
    if (!tsConfig.compilerOptions?.strict) {
      issues.push('TypeScript strict mode not enabled');
    }
  }
  
  if (issues.length > 0) {
    console.log('❌ Build configuration issues:');
    issues.forEach(issue => console.log(`   - ${issue}`));
    return false;
  }
  
  console.log('✅ Build configuration looks good');
  return true;
}

// 4. Test build locally
function testBuild() {
  console.log('\n🏗️  Testing local build...');
  
  try {
    console.log('Running npm run build...');
    execSync('npm run build', { stdio: 'pipe' });
    console.log('✅ Local build successful');
    return true;
  } catch (error) {
    console.log('❌ Local build failed:');
    console.log(error.stdout?.toString() || error.message);
    return false;
  }
}

// 5. Generate fixes
function generateFixes() {
  console.log('\n🔧 Generating fixes...');
  
  // Fix package.json for compatibility
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Add overrides to prevent Dependabot conflicts
  packageJson.overrides = {
    "eslint": "^8.57.0",
    "tailwindcss": "^3.4.1",
    "@types/react": "19.2.14",
    "@types/react-dom": "19.2.3"
  };
  
  // Add engines
  packageJson.engines = {
    "node": ">=18.17.0",
    "npm": ">=9.0.0"
  };
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ Updated package.json with overrides');
  
  // Create Vercel configuration
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
    "crons": []
  };
  
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2) + '\n');
  console.log('✅ Created vercel.json configuration');
}

// Main execution
async function main() {
  const checks = [
    checkDependabotConflicts(),
    checkEnvironmentVariables(), 
    checkBuildConfig(),
    testBuild()
  ];
  
  const allPassed = checks.every(Boolean);
  
  if (allPassed) {
    console.log('\n✅ All checks passed - deployment should work');
  } else {
    console.log('\n🚨 Issues detected - generating fixes...');
    generateFixes();
    
    console.log('\n📋 Next steps to fix deployment:');
    console.log('1. Close problematic Dependabot PRs');
    console.log('2. Run: npm install');
    console.log('3. Run: npm run build (test locally)');
    console.log('4. Set production environment variables in Vercel');
    console.log('5. Redeploy from main branch');
    
    console.log('\n🔗 Helpful links:');
    console.log('- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables');
    console.log('- Clerk Production Setup: https://clerk.com/docs/deployments/overview');
    console.log('- Next.js 15 Migration: https://nextjs.org/docs/app/building-your-application/upgrading/version-15');
  }
}

await main();