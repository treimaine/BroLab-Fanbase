"use client";

import {
  ProductItem,
  type ProductItemData,
  type ProductVisibility,
} from "@/components/dashboard/product-item";
import {
  AddProductDialog,
  type AddProductData,
} from "@/components/forms/add-product-dialog";
import {
  EditProductDialog,
  type EditProductData,
} from "@/components/forms/edit-product-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useFileUpload } from "@/lib/hooks/use-file-upload";
import { handleMutationError } from "@/lib/limit-toast";
import { useMutation, useQuery } from "convex/react";
import { Package } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "../../../../../../convex/_generated/api";
import type { Id } from "../../../../../../convex/_generated/dataModel";

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

export function ProductsContent() {
  const products = useQuery(api.products.getCurrentArtistProducts);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);

  const [editingProduct, setEditingProduct] = useState<ProductItemData | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const { uploadFile } = useFileUpload({ showToasts: false });

  async function handleAddProduct(
    data: AddProductData,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    try {
      let fileStorageId: Id<"_storage"> | undefined;
      let contentType: string | undefined;
      let fileSize: number | undefined;

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
      // Handle limit errors with upgrade toast (R-ART-SUB-5.6, R-ART-SUB-6.5)
      handleMutationError(error, "Failed to create product", "products");
      throw error;
    }
  }

  async function handleEditProduct(
    productId: string,
    data: EditProductData,
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

      // Upload new file if provided
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
      await updateProduct({
        productId: productId as Id<"products">,
        title: data.title,
        description: data.description,
        type: data.type,
        priceUSD: data.priceUSD,
        visibility: data.visibility,
        coverImageUrl: data.coverImageUrl,
        ...(coverImageStorageId && { coverImageStorageId }),
        ...(fileStorageId && { fileStorageId, contentType, fileSize }),
      });

      onProgress?.(100);
      toast.success("Product updated successfully");
      setEditingProduct(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update product";
      toast.error(message);
      throw error;
    }
  }

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

  async function handleDeleteProduct(): Promise<void> {
    if (!deletingProductId) return;

    try {
      await deleteProduct({
        productId: deletingProductId as Id<"products">,
      });
      toast.success("Product deleted successfully");
      setDeletingProductId(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete product";
      toast.error(message);
    }
  }

  const productItems: ProductItemData[] = (products ?? []).map((product) => ({
    id: product._id,
    title: product.title,
    description: product.description,
    type: product.type,
    priceUSD: product.priceUSD,
    coverImageUrl: product.coverImageUrl,
    visibility: product.visibility,
  }));

  return (
    <>
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
                  onEdit={setEditingProduct}
                  onDelete={setDeletingProductId}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Product Dialog */}
      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          onEditProduct={handleEditProduct}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingProductId}
        onOpenChange={(open) => !open && setDeletingProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be
              undone. The product and its associated file will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
