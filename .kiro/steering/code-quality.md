---
inclusion: always
---


# Code Quality & Best Practices - BroLab Fanbase

## Règles de Sécurité du Code

### Règle Anti-Duplication

**Avant de créer un composant, fonction ou fichier, TOUJOURS vérifier qu'il n'existe pas déjà.**

```bash
# Avant de créer un composant
grepSearch: "ComponentName" in src/components/

# Avant de créer une fonction Convex
fileSearch: "functionName" in convex/

# Avant de créer un utilitaire
grepSearch: "utilityName" in src/lib/
```

### Règle de Vérification des Erreurs

**Après création/modification d'un fichier, TOUJOURS utiliser `getDiagnostics` pour corriger les erreurs avant de continuer.**

1. Créer/Modifier le fichier
2. Exécuter `getDiagnostics` sur le fichier
3. Corriger toutes les erreurs TypeScript et ESLint
4. Re-vérifier jusqu'à 0 erreurs
5. Passer à la tâche suivante

### Règle de Refactoring

1. Lire le fichier original complet
2. Analyser les dépendances
3. Modifier de façon incrémentale
4. Vérifier que tout fonctionne
5. Rollback si problème

## Best Practices Next.js 14 (App Router)

### Structure des Routes

```typescript
// Route Groups - pas d'impact sur l'URL
src/app/(marketing)/page.tsx     // → /
src/app/(auth)/sign-in/page.tsx  // → /sign-in
src/app/(artist)/dashboard/      // → /dashboard
src/app/(fan)/me/[username]/     // → /me/john
src/app/(public)/[artistSlug]/   // → /drake
```

### Layouts

```typescript
// Layout partagé par route group
// src/app/(artist)/layout.tsx
export default function ArtistLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell role="artist">
      {children}
    </AppShell>
  );
}
```

### Server vs Client Components

```typescript
// Server Component (défaut) - pour data fetching
// src/app/(public)/[artistSlug]/page.tsx
export default async function ArtistHub({ params }: { params: { artistSlug: string } }) {
  // Fetch data côté serveur
}

// Client Component - pour interactivité
// src/components/hub/FollowButton.tsx
"use client";
import { useState } from "react";
```

### Metadata

```typescript
// src/app/(public)/[artistSlug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `${artist.name} | BroLab Fanbase`,
    description: artist.bio,
  };
}
```

## Best Practices Convex

### Schema Design

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    role: v.union(v.literal("artist"), v.literal("fan")),
    createdAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"])
    .index("by_email", ["email"]),

  artists: defineTable({
    userId: v.id("users"),
    slug: v.string(),
    displayName: v.string(),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    coverUrl: v.optional(v.string()),
  })
    .index("by_slug", ["slug"])
    .index("by_userId", ["userId"]),

  products: defineTable({
    artistId: v.id("artists"),
    title: v.string(),
    type: v.union(v.literal("music"), v.literal("video")),
    priceUSD: v.number(),
    fileStorageId: v.id("_storage"),
    visibility: v.union(v.literal("public"), v.literal("private")),
  }).index("by_artistId", ["artistId"]),
});
```

### Queries (Lecture)

```typescript
// convex/artists.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("artists")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});
```

### Mutations (Écriture)

```typescript
// convex/artists.ts
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const update = mutation({
  args: {
    artistId: v.id("artists"),
    displayName: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Vérifier l'authentification
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    // Vérifier la propriété
    const artist = await ctx.db.get(args.artistId);
    if (!artist) throw new Error("Artiste non trouvé");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || artist.userId !== user._id) {
      throw new Error("Non autorisé");
    }

    // Mettre à jour
    await ctx.db.patch(args.artistId, {
      displayName: args.displayName,
      bio: args.bio,
    });

    return args.artistId;
  },
});
```

### Actions (APIs externes)

```typescript
// convex/stripe.ts
import { action } from "./_generated/server";
import { v } from "convex/values";
import Stripe from "stripe";

export const createCheckoutSession = action({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    // Récupérer le produit via une query interne
    const product = await ctx.runQuery(internal.products.getById, {
      productId: args.productId,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: product.title },
            unit_amount: product.priceUSD * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
    });

    return session.url;
  },
});
```

### File Upload

```typescript
// convex/files.ts
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Non authentifié");

    return await ctx.storage.generateUploadUrl();
  },
});

// Client-side upload
const uploadFile = async (file: File) => {
  // 1. Validation client
  if (file.size > 50 * 1024 * 1024) {
    throw new Error("Fichier trop volumineux (max 50MB)");
  }

  // 2. Obtenir l'URL d'upload
  const uploadUrl = await generateUploadUrl();

  // 3. Upload le fichier
  const result = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await result.json();
  return storageId;
};
```

## Best Practices Clerk

### Provider Setup

```typescript
// src/app/layout.tsx
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Middleware de Protection

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/stripe/webhook",
]);

const isArtistRoute = createRouteMatcher(["/dashboard(.*)"]);
const isFanRoute = createRouteMatcher(["/me(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();
  if (!userId) return auth().redirectToSignIn();

  const role = sessionClaims?.metadata?.role;

  if (isArtistRoute(req) && role !== "artist") {
    return Response.redirect(new URL("/", req.url));
  }

  if (isFanRoute(req) && role !== "fan") {
    return Response.redirect(new URL("/", req.url));
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### Hooks Clerk

```typescript
"use client";
import { useUser, useAuth } from "@clerk/nextjs";

export function UserProfile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  if (!isLoaded) return <Skeleton />;

  return (
    <div>
      <Avatar src={user?.imageUrl} />
      <span>{user?.fullName}</span>
      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  );
}
```

## Best Practices Stripe

### Webhook Handler

```typescript
// src/app/api/stripe/webhook/route.ts
import { headers } from "next/headers";
import Stripe from "stripe";
import { api } from "@/convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response("Webhook signature verification failed", { status: 400 });
  }

  // Idempotency: vérifier si déjà traité
  const processed = await fetchMutation(api.stripe.isEventProcessed, {
    eventId: event.id,
  });

  if (processed) {
    return new Response("Event already processed", { status: 200 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await fetchMutation(api.orders.createFromStripe, {
      stripeSessionId: session.id,
      eventId: event.id,
    });
  }

  return new Response("OK", { status: 200 });
}
```

## Best Practices shadcn/ui

### Installation des Composants

```bash
# Initialiser shadcn
npx shadcn@latest init

# Ajouter les composants requis
npx shadcn@latest add button card input tabs sheet avatar switch separator dropdown-menu badge skeleton sonner form label dialog
```

### Utilisation avec cn()

```typescript
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<Button className={cn("w-full", isLoading && "opacity-50")} />
```

### Notifications avec Sonner

```typescript
// src/app/layout.tsx
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}

// Usage
import { toast } from "sonner";

toast.success("Profil mis à jour");
toast.error("Une erreur est survenue");
```

### Forms avec Validation

```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";

const schema = z.object({
  displayName: z.string().min(2, "Minimum 2 caractères"),
  slug: z.string().regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement"),
});

export function ProfileForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", slug: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage /> {/* Erreurs inline */}
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
```

## TypeScript Standards

### Types Stricts

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### Types Partagés

```typescript
// src/types/index.ts
export type UserRole = "artist" | "fan";

export interface Artist {
  _id: string;
  slug: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export interface Product {
  _id: string;
  title: string;
  type: "music" | "video";
  priceUSD: number;
  visibility: "public" | "private";
}
```

### Validation Zod

```typescript
// src/lib/validations.ts
import { z } from "zod";

export const slugSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-z0-9-]+$/)
  .refine((val) => !RESERVED_SLUGS.includes(val), "Slug réservé");

export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  type: z.enum(["music", "video"]),
}).refine(
  (data) => {
    const maxSize = data.type === "music" ? 50 * 1024 * 1024 : 200 * 1024 * 1024;
    return data.file.size <= maxSize;
  },
  "Fichier trop volumineux"
);
```

## Commandes de Développement

```bash
# Développement
npm run dev              # Next.js dev server
npx convex dev           # Convex dev (dans un autre terminal)

# Vérification
npm run lint             # ESLint
npm run type-check       # TypeScript

# Build
npm run build            # Production build

# Convex
npx convex deploy        # Déployer en production
npx convex dashboard     # Ouvrir le dashboard
```

## Checklist Pré-Commit

1. ✅ `getDiagnostics` sur tous les fichiers modifiés
2. ✅ `npm run lint` sans erreurs
3. ✅ `npm run type-check` sans erreurs
4. ✅ Pas de `console.log` en production
5. ✅ Pas de `any` types
6. ✅ Auth vérifié dans toutes les mutations Convex
7. ✅ Validation Zod sur les inputs utilisateur
8. ✅ Erreurs gérées avec try-catch et toast
