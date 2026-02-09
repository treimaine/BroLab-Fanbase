"use client";

import { AddProductDialog, type AddProductData } from "@/components/forms/add-product-dialog";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { SuspenseWrapper } from "@/components/ui/suspense-wrapper";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { handleMutationError } from "@/lib/limit-toast";
import { useMutation } from "convex/react";
import { toast } from "sonner";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { ProductsContent } from "./components/products-content";

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
export default function ProductsPage() {
  const createProduct = useMutation(api.products.create);
  const { uploadFile } = useFileUpload({ showToasts: false });

  async function handleAddProduct(
    data: AddProductData,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      let fileStorageId: Id<"_storage"> | undefined;
      let contentType: string | undefined;
      let fileSize: number | undefined;
      let coverImageStorageId: Id<"_storage"> | undefined;

      // Upload cover image if provided
      if (data.coverImageFile) {
        onProgress?.(5);
        const coverUploadResult = await uploadFile(data.coverImageFile, "image");

        if (!coverUploadResult) {
          throw new Error("Cover image upload failed");
        }

        coverImageStorageId = coverUploadResult.storageId;
        onProgress?.(20);
      }

      // Upload media file if provided
      if (data.file) {
        onProgress?.(data.coverImageFile ? 30 : 5);
        const uploadResult = await uploadFile(data.file, data.type);

        if (!uploadResult) {
          throw new Error("File upload failed");
        }

        fileStorageId = uploadResult.storageId;
        contentType = uploadResult.contentType;
        fileSize = uploadResult.fileSize;
        onProgress?.(90);
      }

      onProgress?.(95);
      await createProduct({
        title: data.title,
        description: data.description,
        type: data.type,
        priceUSD: data.priceUSD,
        visibility: data.visibility,
        coverImageUrl: data.coverImageUrl,
        coverImageStorageId,
        fileStorageId,
        contentType,
        fileSize,
      });

      onProgress?.(100);
      toast.success("Product created successfully");
    } catch (error) {
      // Handle limit errors with upgrade toast (R-ART-SUB-5.6, R-ART-SUB-6.5)
      handleMutationError(error, "Failed to create product", "products");
      throw error;
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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

      <SuspenseWrapper fallback={<DashboardSkeleton variant="list" />}>
        <ProductsContent />
      </SuspenseWrapper>
    </div>
  );
}
