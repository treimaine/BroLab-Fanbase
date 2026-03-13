/** @type {import('next').NextConfig} */
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
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://clerk.app.brolabentertainment.com https://big-fly-4.clerk.accounts.dev https://eu.i.posthog.com https://eu-assets.i.posthog.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://api.stripe.com https://clerk.app.brolabentertainment.com https://big-fly-4.clerk.accounts.dev https://focused-canary-684.convex.cloud https://eu.i.posthog.com https://eu-assets.i.posthog.com wss:",
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
