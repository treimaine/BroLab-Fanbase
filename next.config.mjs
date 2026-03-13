/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "img.clerk.com",
      },
    ],
  },
  async headers() {
    // Determine environment-specific domains
    const isProduction = process.env.NODE_ENV === 'production';
    const clerkDomain = isProduction 
      ? 'clerk.app.brolabentertainment.com'
      : 'big-fly-4.clerk.accounts.dev';
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://${clerkDomain} https://js.stripe.com https://eu-assets.i.posthog.com https://app.posthog.com`,
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              `connect-src 'self' https://*.convex.cloud https://clerk.com https://*.clerk.accounts.dev https://*.clerk.dev https://${clerkDomain} https://api.stripe.com https://eu.i.posthog.com https://eu-assets.i.posthog.com https://app.posthog.com wss://*.convex.cloud`,
              `frame-src https://js.stripe.com https://hooks.stripe.com https://${clerkDomain} https://*.clerk.accounts.dev https://*.clerk.dev`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
