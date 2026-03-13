/**
 * Clerk Configuration
 * Centralizes Clerk domain and URL configuration to avoid CSP issues
 */

// Determine if we're using custom domain or default Clerk domain
const isCustomDomain = process.env.NODE_ENV === 'production';

export const CLERK_CONFIG = {
  // Use custom domain in production, default domain in development
  frontendApi: isCustomDomain 
    ? 'https://clerk.app.brolabentertainment.com'
    : 'https://big-fly-4.clerk.accounts.dev',
  
  // JWT issuer should match the frontend API
  jwtIssuer: isCustomDomain
    ? 'https://clerk.app.brolabentertainment.com'
    : 'https://big-fly-4.clerk.accounts.dev',
    
  // Sign-in/up URLs
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  
  // Redirect URLs
  afterSignInUrl: '/',
  afterSignUpUrl: '/onboarding',
} as const;

// Export for use in middleware and other files
export const getClerkDomain = () => {
  return isCustomDomain 
    ? 'clerk.app.brolabentertainment.com'
    : 'big-fly-4.clerk.accounts.dev';
};