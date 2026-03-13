#!/usr/bin/env node

/**
 * Fix Dependabot Conflicts Script
 * Resolves common dependency conflicts that cause deployment failures
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Dependabot conflicts...');

// Read package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Define compatible versions for Next.js 15 + React 19
const compatibleVersions = {
  // Core Next.js ecosystem
  "next": "^15.5.12",
  "react": "^19.2.4", 
  "react-dom": "^19.2.4",
  "@types/react": "19.2.14",
  "@types/react-dom": "19.2.3",
  
  // ESLint ecosystem - keep compatible versions
  "eslint": "^8.57.0", // Don't upgrade to v9 yet
  "eslint-config-next": "^15.5.12", // Match Next.js version
  
  // Tailwind - keep stable version
  "tailwindcss": "^3.4.1", // Don't upgrade to v4 yet (beta)
  "postcss": "^8.4.35",
  
  // TypeScript
  "typescript": "^5.3.3",
  
  // Clerk - ensure compatibility
  "@clerk/nextjs": "^6.36.5",
  
  // Convex
  "convex": "^1.31.2",
  
  // Stripe
  "stripe": "^20.1.2",
  "@stripe/stripe-js": "^8.6.1",
  "@stripe/react-stripe-js": "^5.4.1"
};

// Update dependencies
let updated = false;

Object.entries(compatibleVersions).forEach(([pkg, version]) => {
  if (packageJson.dependencies && packageJson.dependencies[pkg]) {
    if (packageJson.dependencies[pkg] !== version) {
      console.log(`📦 Updating ${pkg}: ${packageJson.dependencies[pkg]} → ${version}`);
      packageJson.dependencies[pkg] = version;
      updated = true;
    }
  }
  
  if (packageJson.devDependencies && packageJson.devDependencies[pkg]) {
    if (packageJson.devDependencies[pkg] !== version) {
      console.log(`📦 Updating ${pkg}: ${packageJson.devDependencies[pkg]} → ${version}`);
      packageJson.devDependencies[pkg] = version;
      updated = true;
    }
  }
});

// Add resolution overrides to prevent Dependabot conflicts
if (!packageJson.overrides) {
  packageJson.overrides = {};
}

packageJson.overrides = {
  ...packageJson.overrides,
  // Force specific versions to prevent conflicts
  "eslint": "^8.57.0",
  "tailwindcss": "^3.4.1",
  "@types/react": "19.2.14",
  "@types/react-dom": "19.2.3"
};

// Add engines to prevent incompatible Node versions
packageJson.engines = {
  "node": ">=18.17.0",
  "npm": ">=9.0.0"
};

if (updated) {
  // Write updated package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log('✅ package.json updated with compatible versions');
  
  console.log('\n🔄 Next steps:');
  console.log('1. Run: npm install');
  console.log('2. Run: npm run build');
  console.log('3. Test locally before deploying');
  console.log('4. Close problematic Dependabot PRs');
} else {
  console.log('✅ No updates needed - versions are already compatible');
}

console.log('\n📋 Dependabot Configuration Recommendations:');
console.log('- Pin ESLint to v8.x (v9 has breaking changes)');
console.log('- Pin Tailwind to v3.x (v4 is still beta)');
console.log('- Group React ecosystem updates together');
console.log('- Set update schedule to monthly instead of weekly');