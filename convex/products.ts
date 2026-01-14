/**
 * Products Functions
 * Requirements: 16.1-16.7 - Digital Products Upload & Management
 *
 * Handles digital product management:
 * - getByArtist: Retrieve products for an artist (for dashboard)
 * - getPublicByArtist: Retrieve only public products for an artist (for Public Hub)
 * - getCurrentArtistProducts: Retrieve products for the authenticated artist
 * - getById: Retrieve a single product by ID
 * - create: Create a new product
 * - update: Update an existing product
 * - remove: Delete a product and its associated file
 */

import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { MutationCtx, QueryCtx, mutation, query } from "./_generated/server";

/**
 * Helper: Get user from authentication identity
 */
async function getUserFromIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  return user;
}

/**
 * Helper: Get artist profile for authenticated user
 */
async function getArtistForUser(ctx: QueryCtx | MutationCtx, userId: Id<"users">) {
  return await ctx.db
    .query("artists")
    .withIndex("by_owner", (q) => q.eq("ownerUserId", userId))
    .unique();
}

/**
 * Helper: Verify product ownership
 * Returns the product if owned by the authenticated user, throws otherwise
 */
async function verifyProductOwnership(
  ctx: MutationCtx,
  productId: Id<"products">
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
    .unique();

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role !== "artist") {
    throw new Error("Only artists can manage products");
  }

  const product = await ctx.db.get(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const artist = await ctx.db.get(product.artistId);
  if (!artist || artist.ownerUserId !== user._id) {
    throw new Error("Not authorized to modify this product");
  }

  return { product, artist, user };
}

/**
 * Get all products for an artist
 * Requirements: 16.1 - Display list of existing products
 * Used for artist dashboard to manage products
 *
 * @param artistId - Artist's Convex document ID
 * @returns Array of product documents sorted by createdAt descending
 */
export const getByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Sort by createdAt descending (newest first)
    return products.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get public products for an artist
 * Requirements: 3.4 - Display "Latest Drops" tab on Public Hub
 *
 * Used for Public Hub to display only public products.
 * Filters out private products.
 *
 * @param artistId - Artist's Convex document ID
 * @returns Array of public product documents
 */
export const getPublicByArtist = query({
  args: {
    artistId: v.id("artists"),
  },
  handler: async (ctx, args) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", args.artistId))
      .collect();

    // Filter to only public products and sort by createdAt descending
    return products
      .filter((product) => product.visibility === "public")
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get products for the currently authenticated artist
 * Requirements: 16.1 - Display list of existing products
 *
 * Convenience query that uses the authenticated user's identity
 * to fetch their artist profile's products.
 *
 * @returns Array of product documents or null if not authenticated/not an artist
 */
export const getCurrentArtistProducts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getUserFromIdentity(ctx);
    if (user?.role !== "artist") {
      return null;
    }

    const artist = await getArtistForUser(ctx, user._id);
    if (!artist) {
      return null;
    }

    const products = await ctx.db
      .query("products")
      .withIndex("by_artist", (q) => q.eq("artistId", artist._id))
      .collect();

    // Sort by createdAt descending (newest first)
    return products.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a single product by ID
 * Requirements: 16.1 - Product management
 *
 * @param productId - Product's Convex document ID
 * @returns Product document or null if not found
 */
export const getById = query({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

/**
 * Create a new product
 * Requirements: 16.2, 16.3 - Create product with metadata
 *
 * Creates a new digital product for the authenticated artist.
 * Validates:
 * - User is authenticated
 * - User has "artist" role
 * - User has an artist profile
 *
 * @param title - Product title
 * @param description - Optional product description
 * @param type - Product type: "music" or "video"
 * @param priceUSD - Price in USD (can be 0 for free products)
 * @param coverImageUrl - Optional cover image URL
 * @param visibility - "public" or "private"
 * @param fileStorageId - Optional Convex storage ID for the uploaded file
 * @param contentType - Optional MIME type of the uploaded file
 * @param fileSize - Optional file size in bytes
 * @returns The new product's Convex document ID
 * @throws Error if validation fails
 */
export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    type: v.union(v.literal("music"), v.literal("video")),
    priceUSD: v.number(),
    coverImageUrl: v.optional(v.string()),
    visibility: v.union(v.literal("public"), v.literal("private")),
    fileStorageId: v.optional(v.id("_storage")),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Verify user has artist role
    if (user.role !== "artist") {
      throw new Error("Only artists can create products");
    }

    // Get the artist profile
    const artist = await ctx.db
      .query("artists")
      .withIndex("by_owner", (q) => q.eq("ownerUserId", user._id))
      .unique();

    if (!artist) {
      throw new Error("Artist profile not found. Please create your profile first.");
    }

    // Validate price
    if (args.priceUSD < 0) {
      throw new Error("Price cannot be negative");
    }

    // Create the product
    const now = Date.now();
    const productId = await ctx.db.insert("products", {
      artistId: artist._id,
      title: args.title.trim(),
      description: args.description?.trim(),
      type: args.type,
      priceUSD: args.priceUSD,
      coverImageUrl: args.coverImageUrl,
      visibility: args.visibility,
      fileStorageId: args.fileStorageId,
      contentType: args.contentType,
      fileSize: args.fileSize,
      createdAt: now,
      updatedAt: now,
    });

    return productId;
  },
});

/**
 * Update an existing product
 * Requirements: 16.2, 16.3 - Update product metadata
 *
 * Updates an existing product.
 * Validates:
 * - User is authenticated
 * - User owns the product (via artist profile)
 *
 * @param productId - ID of the product to update
 * @param title - Optional new title
 * @param description - Optional new description
 * @param type - Optional new type
 * @param priceUSD - Optional new price
 * @param coverImageUrl - Optional new cover image URL
 * @param visibility - Optional new visibility
 * @param fileStorageId - Optional new file storage ID
 * @param contentType - Optional new content type
 * @param fileSize - Optional new file size
 * @returns The updated product's Convex document ID
 * @throws Error if validation fails
 */
export const update = mutation({
  args: {
    productId: v.id("products"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("music"), v.literal("video"))),
    priceUSD: v.optional(v.number()),
    coverImageUrl: v.optional(v.string()),
    visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
    fileStorageId: v.optional(v.id("_storage")),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    await verifyProductOwnership(ctx, args.productId);

    // Build update object
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    // Apply optional field updates
    if (args.title !== undefined) {
      updates.title = args.title.trim();
    }
    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }
    if (args.type !== undefined) {
      updates.type = args.type;
    }
    if (args.priceUSD !== undefined) {
      if (args.priceUSD < 0) {
        throw new Error("Price cannot be negative");
      }
      updates.priceUSD = args.priceUSD;
    }
    if (args.coverImageUrl !== undefined) {
      updates.coverImageUrl = args.coverImageUrl;
    }
    if (args.visibility !== undefined) {
      updates.visibility = args.visibility;
    }
    if (args.fileStorageId !== undefined) {
      updates.fileStorageId = args.fileStorageId;
    }
    if (args.contentType !== undefined) {
      updates.contentType = args.contentType;
    }
    if (args.fileSize !== undefined) {
      updates.fileSize = args.fileSize;
    }

    // Apply updates
    await ctx.db.patch(args.productId, updates);

    return args.productId;
  },
});

/**
 * Delete a product and its associated file
 * Requirements: 16.6 - Delete product record and associated file from Convex storage
 *
 * Deletes a product and optionally its associated file from storage.
 * Validates:
 * - User is authenticated
 * - User owns the product (via artist profile)
 *
 * @param productId - ID of the product to delete
 * @returns true if deletion was successful
 * @throws Error if validation fails
 */
export const remove = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Verify ownership and get product
    const { product } = await verifyProductOwnership(ctx, args.productId);

    // Delete the associated file from storage if it exists
    if (product.fileStorageId) {
      try {
        await ctx.storage.delete(product.fileStorageId);
      } catch (error) {
        // Log but don't fail if file deletion fails
        // The file might have already been deleted
        console.error("Failed to delete file from storage:", error);
      }
    }

    // Delete the product record
    await ctx.db.delete(args.productId);

    return true;
  },
});

/**
 * Toggle product visibility
 * Requirements: 16.1 - Manage product visibility
 *
 * Convenience mutation to toggle between public and private visibility.
 *
 * @param productId - ID of the product to toggle
 * @returns The new visibility state
 * @throws Error if validation fails
 */
export const toggleVisibility = mutation({
  args: {
    productId: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Verify ownership and get product
    const { product } = await verifyProductOwnership(ctx, args.productId);

    // Toggle visibility
    const newVisibility = product.visibility === "public" ? "private" : "public";

    await ctx.db.patch(args.productId, {
      visibility: newVisibility,
      updatedAt: Date.now(),
    });

    return newVisibility;
  },
});
