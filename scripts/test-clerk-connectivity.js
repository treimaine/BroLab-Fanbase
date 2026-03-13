#!/usr/bin/env node

import https from 'https';
import { URL } from 'url';

// Test Clerk connectivity
async function testClerkConnectivity() {
  const clerkDomain = 'big-fly-4.clerk.accounts.dev';
  const testUrl = `https://${clerkDomain}/npm/@clerk/clerk-js@5/dist/clerk.browser.js`;
  
  console.log('🔍 Testing Clerk connectivity...');
  console.log(`📡 Testing URL: ${testUrl}`);
  
  return new Promise((resolve, reject) => {
    const url = new URL(testUrl);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'HEAD',
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`✅ Status: ${res.statusCode}`);
      console.log(`📋 Headers:`, res.headers);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('✅ Clerk connectivity: OK');
        resolve(true);
      } else {
        console.log('❌ Clerk connectivity: Failed');
        resolve(false);
      }
    });

    req.on('error', (err) => {
      console.log('❌ Connection error:', err.message);
      
      if (err.code === 'ENOTFOUND') {
        console.log('🔍 DNS resolution failed. Check your internet connection.');
      } else if (err.code === 'ECONNREFUSED') {
        console.log('🔍 Connection refused. Server might be down.');
      } else if (err.code === 'ETIMEDOUT') {
        console.log('🔍 Connection timeout. Check firewall/proxy settings.');
      }
      
      resolve(false);
    });

    req.on('timeout', () => {
      console.log('❌ Request timeout');
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Test environment variables
function testEnvVars() {
  console.log('\n🔍 Checking environment variables...');
  
  const requiredVars = [
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY',
    'CLERK_JWT_ISSUER_DOMAIN'
  ];
  
  let allPresent = true;
  
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
      console.log(`✅ ${varName}: ${value.slice(0, 20)}...`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Main function
async function main() {
  console.log('🚀 Clerk Diagnostics\n');
  
  // Load environment variables
  try {
    const { config } = await import('dotenv');
    config({ path: '.env.local' });
  } catch (err) {
    console.log('⚠️  Could not load .env.local file');
  }
  
  const envOk = testEnvVars();
  const connectivityOk = await testClerkConnectivity();
  
  console.log('\n📊 Summary:');
  console.log(`Environment Variables: ${envOk ? '✅' : '❌'}`);
  console.log(`Clerk Connectivity: ${connectivityOk ? '✅' : '❌'}`);
  
  if (!envOk || !connectivityOk) {
    console.log('\n🔧 Troubleshooting:');
    if (!envOk) {
      console.log('- Check your .env.local file');
      console.log('- Verify Clerk keys from dashboard');
    }
    if (!connectivityOk) {
      console.log('- Check internet connection');
      console.log('- Check firewall/proxy settings');
      console.log('- Try different network (mobile hotspot)');
    }
    process.exit(1);
  } else {
    console.log('\n✅ All checks passed!');
  }
}

main().catch(console.error);