"use client";

/**
 * ShareHub
 *
 * Reusable "share your one-link" affordance: a button that opens a dialog with
 * the public hub URL (copy + native share) and a downloadable QR code.
 * Central to the product ("your career isn't an algorithm" — the hub link is
 * the thing artists hand out).
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Check, Copy, Download, QrCode, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface ShareHubProps {
  readonly artistSlug: string;
  readonly displayName?: string;
  /** Visual style of the trigger button. */
  readonly variant?: "default" | "outline" | "secondary";
  readonly className?: string;
}

export function ShareHub({
  artistSlug,
  displayName,
  variant = "outline",
  className,
}: ShareHubProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const url = useMemo(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "https://fan.brolab";
    return `${origin}/${artistSlug}`;
  }, [artistSlug]);

  // Display without the protocol for a cleaner look
  const prettyUrl = url.replace(/^https?:\/\//, "");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }, [url]);

  const handleNativeShare = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.share) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: displayName ? `${displayName} on BroLab` : "My BroLab hub",
        text: displayName ? `Check out ${displayName} on BroLab` : "Check out my hub",
        url,
      });
    } catch {
      // User dismissed the share sheet — no-op
    }
  }, [displayName, url, handleCopy]);

  const handleDownloadQr = useCallback(() => {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${artistSlug}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }, [artistSlug]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} className={className}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Hub
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share your hub</DialogTitle>
          <DialogDescription>
            One link to everything you do. Share it anywhere or let fans scan the code.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-5">
          {/* QR code */}
          <div
            ref={qrContainerRef}
            className="rounded-xl border border-border/50 bg-white p-4"
          >
            <QRCodeCanvas value={url} size={180} level="M" marginSize={1} />
          </div>

          {/* URL + copy */}
          <div className="flex w-full items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border/50 bg-muted/40 px-3 py-2">
              <QrCode className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate text-sm">{prettyUrl}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              aria-label="Copy link"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button type="button" className="flex-1" onClick={handleNativeShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleDownloadQr}
            >
              <Download className="mr-2 h-4 w-4" />
              Download QR
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
