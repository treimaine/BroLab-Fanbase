#!/usr/bin/env node

/**
 * Vercel Production Warnings Debugger
 * Identifies actual production warnings from Vercel deployment logs
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';

// Logging utility for script output
function log(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

log('🔍 Vercel Production Warnings Debugger\n');

// 1. Check for common Vercel build warnings
function checkVercelBuildWarnings() {
  log('🏗️  Checking for common Vercel build warnings...');
  
  const warnings = [];
  
  try {
    // Check for Next.js warnings in build output
    const buildOutput = execSync('npm run build 2>&1', { encoding: 'utf8' });
    
    // Common Next.js warnings
    const warningPatterns = [
      {
        pattern: /Warning: ReactDOM\.render is no longer supported/,
        issue: 'ReactDOM.render deprecation warning',
        solution: 'Update to createRoot API'
      },
      {
        pattern: /Warning: componentWillMount has been renamed/,
        issue: 'Deprecated lifecycle method warning',
        solution: 'Update component lifecycle methods'
      },
      {
        pattern: /Warning: Failed prop type/,
        issue: 'PropTypes validation warning',
        solution: 'Fix component prop types'
      },
      {
        pattern: /Warning: Each child in a list should have a unique "key" prop/,
        issue: 'Missing React keys warning',
        solution: 'Add unique keys to list items'
      },
      {
        pattern: /Warning: Can't perform a React state update on an unmounted component/,
        issue: 'Memory leak warning',
        solution: 'Clean up subscriptions in useEffect cleanup'
      },
      {
        pattern: /Module not found: Can't resolve/,
        issue: 'Missing module import',
        solution: 'Check import paths and install missing dependencies'
      },
      {
        pattern: /Critical dependency: the request of a dependency is an expression/,
        issue: 'Dynamic import warning',
        solution: 'Use static imports or configure webpack'
      }
    ];
    
    warningPatterns.forEach(({ pattern, issue, solution }) => {
      if (pattern.test(buildOutput)) {
        warnings.push({ issue, solution, type: 'build' });
      }
    });
    
    // Check for bundle size warnings
    if (buildOutput.includes('Large page data')) {
      warnings.push({
        issue: 'Large page data detected',
        solution: 'Optimize getStaticProps/getServerSideProps data',
        type: 'performance'
      });
    }
    
    if (buildOutput.includes('Large bundle detected')) {
      warnings.push({
        issue: 'Large JavaScript bundle',
        solution: 'Use dynamic imports and code splitting',
        type: 'performance'
      });
    }
    
  } catch (error) {
    log('❌ Build failed, checking error output...');
    
    const errorOutput = error.stdout || error.message;
    
    // Parse build errors
    if (errorOutput.includes('Type error')) {
      warnings.push({
        issue: 'TypeScript compilation errors',
        solution: 'Fix TypeScript errors before deployment',
        type: 'error'
      });
    }
    
    if (errorOutput.includes('ESLint')) {
      warnings.push({
        issue: 'ESLint errors blocking build',
        solution: 'Fix ESLint errors or update next.config.js to ignore',
        type: 'error'
      });
    }
  }
  
  return warnings;
}

// 2. Check for runtime warnings in components
function checkRuntimeWarnings() {
  log('\n⚡ Checking for runtime warnings in components...');
  
  const warnings = [];
  
  // Check for common React patterns that cause warnings
  const componentFiles = execSync('find src -name "*.tsx" -o -name "*.ts" | grep -v test', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
  
  componentFiles.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for useEffect without dependencies
    if (/useEffect\([^,]+\)/.test(content)) {
      warnings.push({
        issue: `Missing useEffect dependencies in ${file}`,
        solution: 'Add dependency array to useEffect hooks',
        type: 'react',
        file
      });
    }
    
    // Check for useState with object mutations
    if (/setState\([^)]*\.[^)]*=/.test(content)) {
      warnings.push({
        issue: `Direct state mutation in ${file}`,
        solution: 'Use immutable state updates',
        type: 'react',
        file
      });
    }
    
    // Check for missing key props in maps
    if (/\.map\([^}]*<[^>]*(?!.*key=)/.test(content)) {
      warnings.push({
        issue: `Missing key props in ${file}`,
        solution: 'Add unique key prop to mapped elements',
        type: 'react',
        file
      });
    }
    
    // Check for console.log in production
    if (/console\.(log|warn|error)/.test(content) && !file.includes('debug') && !file.includes('dev')) {
      warnings.push({
        issue: `Console statements in production code: ${file}`,
        solution: 'Remove console statements or use proper logging',
        type: 'production',
        file
      });
    }
  });
  
  return warnings;
}

// 3. Check for Vercel-specific configuration issues
function checkVercelConfig() {
  log('\n🚀 Checking Vercel configuration...');
  
  const warnings = [];
  
  // Check vercel.json
  if (fs.existsSync('vercel.json')) {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    
    // Check for deprecated configurations
    if (vercelConfig.builds) {
      warnings.push({
        issue: 'Deprecated "builds" configuration in vercel.json',
        solution: 'Remove builds config, use framework detection',
        type: 'vercel'
      });
    }
    
    if (vercelConfig.routes) {
      warnings.push({
        issue: 'Deprecated "routes" configuration in vercel.json',
        solution: 'Use "rewrites" and "redirects" instead',
        type: 'vercel'
      });
    }
    
    // Check function timeouts
    if (vercelConfig.functions) {
      Object.entries(vercelConfig.functions).forEach(([path, config]) => {
        if (config.maxDuration > 60) {
          warnings.push({
            issue: `Function timeout too high: ${path} (${config.maxDuration}s)`,
            solution: 'Optimize function or use background jobs',
            type: 'vercel'
          });
        }
      });
    }
  }
  
  // Check for large static files
  try {
    const publicFiles = execSync('find public -type f -size +1M 2>/dev/null || true', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    
    if (publicFiles.length > 0) {
      warnings.push({
        issue: `Large static files detected: ${publicFiles.join(', ')}`,
        solution: 'Optimize images and use CDN for large assets',
        type: 'performance'
      });
    }
  } catch (error) {
    // Log error if find command fails on this system
    log(`Warning: Could not check for large files: ${error.message}`);
  }
  
  return warnings;
}

// 4. Check for environment variable issues
function checkEnvironmentIssues() {
  log('\n🔑 Checking environment variable issues...');
  
  const warnings = [];
  
  // Check for missing NEXT_PUBLIC_ prefix
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const envLines = envContent.split('\n').filter(line => line.includes('=') && !line.startsWith('#'));
  
  envLines.forEach(line => {
    const [key] = line.split('=');
    
    // Check if client-side variable is missing NEXT_PUBLIC_ prefix
    if (key.includes('URL') || key.includes('KEY') || key.includes('ID')) {
      if (!key.startsWith('NEXT_PUBLIC_') && !key.startsWith('CLERK_') && !key.startsWith('STRIPE_')) {
        warnings.push({
          issue: `Potentially client-side variable without NEXT_PUBLIC_ prefix: ${key}`,
          solution: 'Add NEXT_PUBLIC_ prefix if used in client components',
          type: 'env'
        });
      }
    }
  });
  
  return warnings;
}

// 5. Check for Next.js specific warnings
function checkNextJsWarnings() {
  log('\n⚛️  Checking Next.js specific warnings...');
  
  const warnings = [];
  
  // Check next.config.js/mjs
  const configFiles = ['next.config.js', 'next.config.mjs'];
  const configFile = configFiles.find(file => fs.existsSync(file));
  
  if (configFile) {
    const config = fs.readFileSync(configFile, 'utf8');
    
    // Check for experimental features in production
    if (config.includes('experimental') && config.includes('appDir')) {
      warnings.push({
        issue: 'Using experimental appDir feature',
        solution: 'App Router is stable in Next.js 13.4+, remove experimental flag',
        type: 'nextjs'
      });
    }
    
    // Check for missing image domains
    if (!config.includes('images') || !config.includes('domains')) {
      warnings.push({
        issue: 'Missing image domains configuration',
        solution: 'Configure allowed image domains in next.config.js',
        type: 'nextjs'
      });
    }
  }
  
  // Check for pages in app directory (hybrid routing)
  if (fs.existsSync('src/app') && fs.existsSync('src/pages')) {
    warnings.push({
      issue: 'Both app and pages directories exist',
      solution: 'Choose either App Router or Pages Router, not both',
      type: 'nextjs'
    });
  }
  
  return warnings;
}

// 6. Generate specific fixes for found warnings
function generateFixes(allWarnings) {
  log('\n🔧 Generating fixes for detected warnings...');
  
  const fixScript = String.raw`#!/usr/bin/env node

// Auto-generated fixes for production warnings
import fs from 'node:fs';

console.log('🔧 Applying production warning fixes...');

${allWarnings.map((warning, index) => {
  switch (warning.type) {
    case 'react':
      return `
// Fix ${index + 1}: ${warning.issue}
console.log('Fixing: ${warning.issue}');
// Manual fix required: ${warning.solution}
`;
    case 'production':
      if (warning.issue.includes('Console statements')) {
        return String.raw`
// Fix ${index + 1}: Remove console statements
const file${index} = '${warning.file}';
if (fs.existsSync(file${index})) {
  let content = fs.readFileSync(file${index}, 'utf8');
  content = content.replace(/console\.(log|warn|error)\([^)]*\);?/g, '');
  fs.writeFileSync(file${index}, content);
  console.log('✅ Removed console statements from', file${index});
}
`;
      }
      break;
    case 'vercel':
      if (warning.issue.includes('Deprecated')) {
        return `
// Fix ${index + 1}: Update vercel.json
console.log('Fixing: ${warning.issue}');
// Manual fix required: ${warning.solution}
`;
      }
      break;
    default:
      return `
// Fix ${index + 1}: ${warning.issue}
console.log('Manual fix required: ${warning.solution}');
`;
  }
}).join('')}

console.log('✅ All automated fixes applied');
console.log('📋 Manual fixes may still be required - check the output above');
`;
  
  fs.writeFileSync('scripts/apply-warning-fixes.js', fixScript);
  log('✅ Generated scripts/apply-warning-fixes.js');
}

// Main execution
async function main() {
  const allWarnings = [
    ...checkVercelBuildWarnings(),
    ...checkRuntimeWarnings(),
    ...checkVercelConfig(),
    ...checkEnvironmentIssues(),
    ...checkNextJsWarnings()
  ];
  
  if (allWarnings.length === 0) {
    log('\n✅ No production warnings detected!');
    log('Your application appears to be production-ready.');
    return;
  }
  
  log(`\n🚨 Found ${allWarnings.length} production warnings:\n`);
  
  // Group warnings by type
  const warningsByType = allWarnings.reduce((acc, warning) => {
    if (!acc[warning.type]) acc[warning.type] = [];
    acc[warning.type].push(warning);
    return acc;
  }, {});
  
  Object.entries(warningsByType).forEach(([type, warnings]) => {
    const emoji = {
      build: '🏗️',
      react: '⚛️',
      production: '🚨',
      vercel: '🚀',
      env: '🔑',
      nextjs: '⚡',
      performance: '📊',
      error: '❌'
    }[type] || '⚠️';
    
    log(`${emoji} ${type.toUpperCase()} WARNINGS:`);
    warnings.forEach((warning, index) => {
      log(`   ${index + 1}. ${warning.issue}`);
      log(`      Solution: ${warning.solution}`);
      if (warning.file) {
        log(`      File: ${warning.file}`);
      }
      log('');
    });
  });
  
  generateFixes(allWarnings);
  
  log('📋 Next Steps:');
  log('1. Review the warnings above');
  log('2. Run: node scripts/apply-warning-fixes.js (for automated fixes)');
  log('3. Manually address remaining warnings');
  log('4. Test build: npm run build');
  log('5. Deploy: git push origin main');
  
  log('\n🔗 Helpful Resources:');
  log('- Vercel Build Logs: https://vercel.com/dashboard');
  log('- Next.js Warnings: https://nextjs.org/docs/messages');
  log('- React Warnings: https://react.dev/warnings');
}

await main();