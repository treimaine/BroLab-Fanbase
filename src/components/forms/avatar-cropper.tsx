"use client";

/**
 * AvatarCropper
 *
 * Dependency-free square image cropper (pan + zoom) rendered in a Dialog.
 * The user frames a square region over their image; on "Apply" the region is
 * drawn to a canvas at a fixed output size and returned as a WebP File, ready
 * to upload. Keeps avatars square + reasonably sized (fixes off-center crops
 * and oversized uploads).
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ZoomIn } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface AvatarCropperProps {
  /** The raw file the user picked. When null, the dialog is idle. */
  readonly file: File | null;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Called with the cropped square image as a File. */
  readonly onCropComplete: (file: File) => void;
  /** Output edge size in pixels (square). Defaults to 512. */
  readonly outputSize?: number;
}

// On-screen size of the square framing viewport (px)
const VIEWPORT = 288;
const MAX_ZOOM = 3;

export function AvatarCropper({
  file,
  open,
  onOpenChange,
  onCropComplete,
  outputSize = 512,
}: AvatarCropperProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const dragState = useRef<{ startX: number; startY: number; ox: number; oy: number } | null>(null);

  // Load the picked file into an <img> to read its natural dimensions
  useEffect(() => {
    if (!file) {
      setObjectUrl(undefined);
      setNatural(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    const image = new window.Image();
    image.onload = () => {
      imgRef.current = image;
      setNatural({ w: image.naturalWidth, h: image.naturalHeight });
    };
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Scale that makes the image fully cover the viewport at zoom = 1
  const baseScale = natural ? Math.max(VIEWPORT / natural.w, VIEWPORT / natural.h) : 1;
  const effectiveScale = baseScale * zoom;
  const dispW = natural ? natural.w * effectiveScale : 0;
  const dispH = natural ? natural.h * effectiveScale : 0;

  const clamp = useCallback(
    (x: number, y: number) => ({
      x: Math.min(0, Math.max(VIEWPORT - dispW, x)),
      y: Math.min(0, Math.max(VIEWPORT - dispH, y)),
    }),
    [dispW, dispH]
  );

  // Center the image whenever a new one loads
  useEffect(() => {
    if (!natural) return;
    setZoom(1);
    const w = natural.w * baseScale;
    const h = natural.h * baseScale;
    setOffset({ x: (VIEWPORT - w) / 2, y: (VIEWPORT - h) / 2 });
  }, [natural, baseScale]);

  // Re-clamp offset when zoom changes, keeping the viewport center stable
  const handleZoom = useCallback(
    (nextZoom: number) => {
      if (!natural) return;
      const prevScale = baseScale * zoom;
      const nextScale = baseScale * nextZoom;
      const centerSrcX = (VIEWPORT / 2 - offset.x) / prevScale;
      const centerSrcY = (VIEWPORT / 2 - offset.y) / prevScale;
      const nx = VIEWPORT / 2 - centerSrcX * nextScale;
      const ny = VIEWPORT / 2 - centerSrcY * nextScale;
      const nextDispW = natural.w * nextScale;
      const nextDispH = natural.h * nextScale;
      setZoom(nextZoom);
      setOffset({
        x: Math.min(0, Math.max(VIEWPORT - nextDispW, nx)),
        y: Math.min(0, Math.max(VIEWPORT - nextDispH, ny)),
      });
    },
    [natural, baseScale, zoom, offset]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, ox: offset.x, oy: offset.y };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragState.current) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    setOffset(clamp(dragState.current.ox + dx, dragState.current.oy + dy));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragState.current = null;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const handleApply = useCallback(() => {
    const image = imgRef.current;
    if (!image || !file) return;
    setIsProcessing(true);
    try {
      const canvas = document.createElement("canvas");
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");

      // Map the on-screen viewport back to source pixels
      const sx = (0 - offset.x) / effectiveScale;
      const sy = (0 - offset.y) / effectiveScale;
      const sSize = VIEWPORT / effectiveScale;
      ctx.drawImage(image, sx, sy, sSize, sSize, 0, 0, outputSize, outputSize);

      canvas.toBlob(
        (blob) => {
          setIsProcessing(false);
          if (!blob) return;
          const baseName = file.name.replace(/\.[^.]+$/, "");
          const cropped = new File([blob], `${baseName}-cropped.webp`, {
            type: "image/webp",
          });
          onCropComplete(cropped);
          onOpenChange(false);
        },
        "image/webp",
        0.9
      );
    } catch {
      setIsProcessing(false);
    }
  }, [file, offset, effectiveScale, outputSize, onCropComplete, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust your photo</DialogTitle>
          <DialogDescription>
            Drag to reposition and zoom to frame. Your avatar is saved as a square.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          {/* Framing viewport */}
          <div
            className="relative touch-none overflow-hidden rounded-lg bg-muted"
            style={{ width: VIEWPORT, height: VIEWPORT }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {objectUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={objectUrl}
                alt="Crop preview"
                draggable={false}
                className="pointer-events-none absolute max-w-none select-none"
                style={{
                  width: dispW,
                  height: dispH,
                  transform: `translate(${offset.x}px, ${offset.y}px)`,
                }}
              />
            )}
            {/* Round mask guide */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className="rounded-full ring-1 ring-white/70"
                style={{
                  width: VIEWPORT,
                  height: VIEWPORT,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                }}
              />
            </div>
          </div>

          {/* Zoom slider */}
          <div className="flex w-full items-center gap-3">
            <ZoomIn className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => handleZoom(Number(e.target.value))}
              aria-label="Zoom"
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleApply} disabled={!natural || isProcessing}>
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Apply"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
