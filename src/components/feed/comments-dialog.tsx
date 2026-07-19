"use client";

/**
 * CommentsDialog - Public comments on a feed item (release/event)
 * Requirements: R-FAN-COMMENT-1 - Read/add/delete public comments
 *
 * Comments are public: anyone can read; the current user can add a comment and
 * delete only their own (enforced server-side in convex/comments.ts).
 */

import { api } from "@/../convex/_generated/api";
import type { Id } from "@/../convex/_generated/dataModel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQuery } from "convex/react";
import { Loader2, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const MAX_COMMENT_LENGTH = 500;

interface CommentsDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly targetType: "product" | "event";
  readonly targetId: string;
  readonly title: string;
}

function formatRelativeTime(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export function CommentsDialog({
  open,
  onOpenChange,
  targetType,
  targetId,
  title,
}: CommentsDialogProps) {
  const [body, setBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only subscribe while the dialog is open
  const comments = useQuery(
    api.comments.list,
    open ? { targetType, targetId } : "skip"
  );
  const addComment = useMutation(api.comments.add);
  const removeComment = useMutation(api.comments.remove);

  const handleSubmit = useCallback(async () => {
    const trimmed = body.trim();
    if (trimmed.length === 0) return;

    setIsSubmitting(true);
    try {
      await addComment({ targetType, targetId, body: trimmed });
      setBody("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }, [body, addComment, targetType, targetId]);

  const handleDelete = useCallback(
    async (commentId: string) => {
      try {
        await removeComment({ commentId: commentId as Id<"comments"> });
        toast.success("Comment deleted");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to delete comment");
      }
    },
    [removeComment]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="truncate">Comments · {title}</DialogTitle>
        </DialogHeader>

        {/* Comment list */}
        <div className="max-h-[45vh] overflow-y-auto space-y-4 pr-1">
          {comments === undefined && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {comments && comments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Be the first to say something!
            </p>
          )}

          {comments?.map((comment) => (
            <div key={comment._id} className="flex items-start gap-3 group">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarImage src={comment.author.avatarUrl} alt={comment.author.displayName} />
                <AvatarFallback>{comment.author.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{comment.author.displayName}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-foreground/90 break-words whitespace-pre-wrap">
                  {comment.body}
                </p>
              </div>
              {comment.isMine && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive"
                  onClick={() => handleDelete(comment._id)}
                  aria-label="Delete comment"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Add comment */}
        <div className="space-y-2 border-t border-border/50 pt-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
            placeholder="Add a comment…"
            rows={2}
            className="resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {body.length}/{MAX_COMMENT_LENGTH}
            </span>
            <Button
              size="sm"
              className="rounded-full"
              onClick={handleSubmit}
              disabled={isSubmitting || body.trim().length === 0}
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
