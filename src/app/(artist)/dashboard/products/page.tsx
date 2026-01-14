"use client";

/**
 * Artist Products Management Page
 * Requirements: 16.1-16.7 - Digital Products Upload & Management
 *
 * Features:
 * - Display list of existing products (Music/Video) (16.1)
 * - "Add Product" button (16.2)
 * - Full upload flow: validate → upload → store metadata (16.3-16.5)
 * - Toggle product visibility (16.1)
 * - Delete products (16.6)
 * - Restricted to authenticated artists (16.7)
 */

import {
    ProductItem,
    ProductItemSkeleton,
    type ProductItemData,
    type ProductVisibility,
} from "@/components/dashboard/product-item";
import {
    AddProductDialog,
    type AddProductData,
} from "@/components/forms/add-product-dialog";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { useMutation, useQuery } from "convex/react";
import { Package } from "lucide-react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";

export default function ProductsPage() {
  const products = useQuery(api.products.getCurrentArtistProducts);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  const { uploadFile } = useFileUpload({ showToasts: false });

  const isLoading = products === undefined;

  /**
   * Handle adding a new product
   * Full upload flow: validate → upload → store metadata
   */
  async function handleAddProduct(
    data: AddProductData,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      let fileStorageId: Id<"_storage"> | undefined;
      let contentType: string | undefined;
      let fileSize: number | undefined;

      // Step 1: Upload file if provided
      if (data.file) {
        onProgress?.(5);
        const uploadResult = await uploadFile(data.file, data.type);

        if (!uploadResult) {
          throw new Error("File upload failed");
        }

        fileStorageId = uploadResult.storageId;
        contentType = uploadResult.contentType;
        fileSize = uploadResult.fileSize;
        onProgress?.(90);
      }

      // Step 2: Create product record with metadata
      onProgress?.(95);
      await createProduct({
        title: data.title,
        description: data.description,
        type: data.type,
        priceUSD: data.priceUSD,
        visibility: data.visibility,
        coverImageUrl: data.coverImageUrl,
        fileStorageId,
        contentType,
        fileSize,
      });

      onProgress?.(100);
      toast.success("Product created successfully");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create product";
      toast.error(message);
      throw error; // Re-throw to keep dialog open on error
    }
  }

  /**
   * Handle toggling product visibility
   */
  async function handleToggleVisibility(
    id: string,
    visibility: ProductVisibility
  ): Promise<void> {
    try {
      await updateProduct({
        productId: id as Id<"products">,
        visibility,
      });
      toast.success(
        visibility === "public"
          ? "Product is now public"
          : "Product is now private"
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update product visibility";
      toast.error(message);
    }
  }

  if (isLoading) {
    return <ProductsSkeleton />;
  }

  // Transform Convex data to ProductItemData format
  const productItems: ProductItemData[] = (products ?? []).map((product) => ({
    id: product._id,
    title: product.title,
    type: product.type,
    priceUSD: product.priceUSD,
    coverImageUrl: product.coverImageUrl,
    visibility: product.visibility,
  }));

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="mt-1 text-muted-foreground">
            Upload and manage your digital music and video content
          </p>
        </div>
        <AddProductDialog onAddProduct={handleAddProduct} />
      </div>

      {/* Products List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Your Products
          </CardTitle>
          <CardDescription>
            <ProductsDescription
              count={productItems.length}
              publicCount={
                productItems.filter((p) => p.visibility === "public").length
              }
            />
          </CardDescription>
        </CardHeader>
        <CardContent>
          {productItems.length === 0 ? (
            <EmptyState onAddProduct={handleAddProduct} />
          ) : (
            <div className="space-y-4">
              {productItems.map((product) => (
                <ProductItem
                  key={product.id}
                  product={product}
                  onToggleVisibility={handleToggleVisibility}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Products description helper
 */
function ProductsDescription({
  count,
  publicCount,
}: {
  readonly count: number;
  readonly publicCount: number;
}) {
  if (count === 0) {
    return <>Upload music and video content for your fans to purchase</>;
  }
  const productWord = count === 1 ? "product" : "products";
  return (
    <>
      {count} {productWord} • {publicCount} public
    </>
  );
}

/**
 * Empty state when no products exist
 */
function EmptyState({
  onAddProduct,
}: {
  readonly onAddProduct: (
    data: AddProductData,
    onProgress?: (progress: number) => void
  ) => Promise<void>;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/30 px-6 py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Package className="h-6 w-6 text-primary" />
      </div>
      <h3 className="mb-2 font-medium">No products yet</h3>
      <p className="mb-4 max-w-sm text-sm text-muted-foreground">
        Upload your first music track or video. Fans will see public products on
        your hub under &quot;Latest Drops&quot;.
      </p>
      <AddProductDialog onAddProduct={onAddProduct} />
    </div>
  );
}

/**
 * Loading skeleton
 */
function ProductsSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Card skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ProductItemSkeleton key={i} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
