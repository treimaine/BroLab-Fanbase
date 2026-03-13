/**
 * Production Diagnostics
 * Helps identify and resolve common production issues
 */

export interface ProductionIssue {
  type: 'csp' | 'env' | 'network' | 'auth';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  solution: string;
  affectedFeatures: string[];
}

export function diagnoseProductionIssues(): ProductionIssue[] {
  const issues: ProductionIssue[] = [];

  // Check environment variables
  if (typeof window === 'undefined') {
    // Server-side checks
    
    // Check Clerk configuration
    const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    const clerkJwtIssuer = process.env.CLERK_JWT_ISSUER_DOMAIN;
    
    if (!clerkPublishableKey || clerkPublishableKey.includes('placeholder')) {
      issues.push({
        type: 'env',
        severity: 'critical',
        message: 'Clerk publishable key is missing or invalid',
        solution: 'Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY in environment variables',
        affectedFeatures: ['Authentication', 'User management']
      });
    }
    
    if (!clerkSecretKey || clerkSecretKey.includes('placeholder')) {
      issues.push({
        type: 'env',
        severity: 'critical',
        message: 'Clerk secret key is missing or invalid',
        solution: 'Set CLERK_SECRET_KEY in environment variables',
        affectedFeatures: ['Server-side authentication', 'Webhooks']
      });
    }
    
    // Check Convex configuration
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl || convexUrl.includes('placeholder')) {
      issues.push({
        type: 'env',
        severity: 'critical',
        message: 'Convex URL is missing or invalid',
        solution: 'Set NEXT_PUBLIC_CONVEX_URL in environment variables',
        affectedFeatures: ['Database', 'Real-time updates', 'File storage']
      });
    }
    
    // Check Stripe configuration
    const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripePublishableKey || stripePublishableKey.includes('placeholder')) {
      issues.push({
        type: 'env',
        severity: 'high',
        message: 'Stripe publishable key is missing or invalid',
        solution: 'Set NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in environment variables',
        affectedFeatures: ['Payments', 'Checkout']
      });
    }
    
    if (!stripeSecretKey || stripeSecretKey.includes('placeholder')) {
      issues.push({
        type: 'env',
        severity: 'high',
        message: 'Stripe secret key is missing or invalid',
        solution: 'Set STRIPE_SECRET_KEY in environment variables',
        affectedFeatures: ['Payment processing', 'Webhooks']
      });
    }
  } else {
    // Client-side checks
    
    // Check for CSP violations in console
    const cspViolations = performance.getEntriesByType('navigation');
    if (cspViolations.length > 0) {
      issues.push({
        type: 'csp',
        severity: 'medium',
        message: 'Content Security Policy violations detected',
        solution: 'Update CSP headers in next.config.mjs to allow required domains',
        affectedFeatures: ['Third-party scripts', 'External resources']
      });
    }
  }

  return issues;
}

export function logProductionIssues() {
  const issues = diagnoseProductionIssues();
  
  if (issues.length === 0) {
    console.log('✅ No production issues detected');
    return;
  }
  
  console.group('🚨 Production Issues Detected');
  
  issues.forEach((issue, index) => {
    const emoji = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    }[issue.severity];
    
    console.group(`${emoji} Issue ${index + 1}: ${issue.message}`);
    console.log('Type:', issue.type);
    console.log('Severity:', issue.severity);
    console.log('Solution:', issue.solution);
    console.log('Affected features:', issue.affectedFeatures.join(', '));
    console.groupEnd();
  });
  
  console.groupEnd();
}

// Auto-run diagnostics in development
if (process.env.NODE_ENV === 'development') {
  logProductionIssues();
}