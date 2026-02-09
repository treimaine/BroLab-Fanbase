# BroLab Fanbase

> **"Your career isn't an algorithm."**

A mobile-first platform enabling artists to create their personal hub ("one link") to connect directly with fans.

## 🎯 Overview

BroLab Fanbase allows artists to:
- Create a personalized public hub page
- Manage profile, links, events, and digital products
- Sell directly to fans (music, videos, tickets)
- Track revenue and manage payouts via Stripe Connect

Fans can:
- Follow favorite artists
- Purchase digital content and tickets
- Access a personalized feed from followed artists
- Manage purchases and downloads

## 🛠 Tech Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Language | TypeScript | 5.x |
| UI Library | shadcn/ui | latest |
| Styling | Tailwind CSS | 3.4.x |
| Animations | Framer Motion | 12.x |
| Icons | Lucide React | 0.562.x |
| Theme | next-themes | 0.4.x |
| Auth & Billing | Clerk | 6.36.x |
| Backend/DB | Convex | 1.31.x |
| Payments | Stripe (Connect) | 20.x |
| Forms | React Hook Form + Zod | latest |
| Notifications | Sonner | 2.x |
| State | Zustand | 5.x |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Clerk account
- Convex account
- Stripe account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd brolab-fanbase

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Start Convex development server (in a separate terminal)
npx convex dev

# Start Next.js development server
npm run dev
```

### Environment Variables

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev

# Convex Backend
CONVEX_DEPLOYMENT=dev:your-deployment
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Application
NEXT_PUBLIC_URL=http://localhost:3000
```

## 📁 Project Structure

```
brolab-fanbase/
├── src/
│   ├── app/
│   │   ├── (marketing)/      # Landing page
│   │   ├── (auth)/           # Sign-in, sign-up, onboarding
│   │   ├── (artist)/         # Artist dashboard
│   │   ├── (fan)/            # Fan dashboard
│   │   ├── (public)/         # Public artist hub
│   │   └── api/              # API routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities, constants
│   └── types/                # TypeScript types
├── convex/                   # Convex backend functions
├── docs/                     # Documentation
└── public/                   # Static assets
```


## 💳 Artist Subscriptions (Clerk Billing)

BroLab Fanbase offers subscription plans for artists, managed through **Clerk Billing**.

### Plans

| Feature | Free | Premium |
|---------|------|---------|
| **Price** | $0/month | $19.99/month |
| **Products** | 5 | Unlimited |
| **Events** | 5 | Unlimited |
| **Custom Links** | 5 | Unlimited |
| **Video Uploads** | ❌ Audio only | ✅ Enabled |
| **Max File Size** | 50MB | 500MB |
| **Support** | Community | Priority |

### Free Plan

Perfect for getting started:
- Up to 5 products, events, and custom links
- Audio uploads only (no video)
- 50MB max file size per upload

### Premium Plan ($19.99/month)

For serious artists:
- **Unlimited** products, events, and custom links
- Video uploads enabled
- 500MB max file size per upload
- Priority support

### Upgrade Flow

1. Navigate to **Dashboard → Billing**
2. Click **"Upgrade to Premium - $19.99/month"**
3. Complete payment via Clerk Billing portal
4. Limits update immediately upon successful payment

### Manage Subscription

Artists can manage their subscription at any time:
1. Go to **Dashboard → Billing**
2. Click **"Manage Subscription"**
3. Opens Clerk Billing portal where you can:
   - View current plan details
   - Update payment method
   - Cancel subscription
   - View billing history

### Soft-Lock Policy (Grandfathering)

When downgrading from Premium to Free:
- **Existing content is preserved** - All items beyond the Free limit remain accessible
- **No deletion required** - Can view, edit, and delete existing items
- **Creation blocked** - Cannot create new items until under the Free plan limits
- **Example**: 10 products on Premium → downgrade to Free
  - All 10 products remain accessible to fans
  - Cannot create product #11
  - Must delete 5 products to create new ones

This ensures artists never lose their content when changing plans.

### Server-Side Enforcement

All subscription limits are enforced server-side in Convex mutations:
- Product creation checks against plan limits
- Video upload requires Premium plan
- File size validated against plan maximum

See `convex/subscriptions.ts` for implementation details.

## 🔐 Authentication

Authentication is handled by **Clerk** with role-based access control:

- **Artist role**: Access to `/dashboard/*` routes
- **Fan role**: Access to `/me/*` routes
- **Public**: Landing page and artist hub pages

### Onboarding Flow

1. User signs up via Clerk
2. Redirected to `/onboarding` for role selection
3. Role stored in Clerk `publicMetadata.role`
4. User synced to Convex database
5. Redirected to appropriate dashboard

## 💰 Payments (Stripe Connect)

Artists receive payments directly via **Stripe Connect**:

- **Direct payments**: Fans pay artists directly (no platform commission)
- **Automatic payouts**: Managed by Stripe's payout schedule
- **Platform revenue**: Comes from artist subscriptions (Clerk Billing)

### Checkout Flow

1. Fan clicks "Buy" on a product
2. Stripe Checkout session created with artist as destination
3. Payment routed to artist's Stripe Connect account
4. Webhook confirms payment and creates order in Convex
5. Download entitlement granted to fan

## 🎵 Media Player

Global audio/video player that persists across navigation:

- Play/pause, volume, progress controls
- Queue management
- Video modal for full-screen playback
- Keyboard accessible (space to toggle play/pause)

## 📱 Responsive Design

Mobile-first approach with adaptive navigation:

- **Mobile**: TopBar + BottomNav + Sheet drawer
- **Desktop**: Persistent sidebar navigation
- Breakpoint: 768px (md:)

## 🎨 Theme System

Light/dark mode support via `next-themes`:

- System preference detection
- Persistent user preference
- Smooth transitions
- Custom accent colors (lavender)

## 📚 Documentation

Additional documentation available in `/docs`:

- [Subscription Plans](docs/SUBSCRIPTION-PLANS.md) - Detailed plan comparison
- [Subscription Testing Guide](docs/SUBSCRIPTION-TESTING-GUIDE.md) - Testing checklist
- [Stripe Webhooks Local Dev](docs/STRIPE-WEBHOOKS-LOCAL-DEV.md) - Local webhook setup
- [Checkout Flow Validation](docs/CHECKOUT-FLOW-VALIDATION.md) - Payment flow testing

## 🧪 Development

```bash
# Run development server
npm run dev

# Run Convex dev (separate terminal)
npx convex dev

# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Build for production
npm run build
```

## 📄 License

Proprietary - All rights reserved.

---

**Built with ❤️ by BroLab**
