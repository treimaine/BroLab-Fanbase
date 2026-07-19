"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useDragReorder
 *
 * Minimal, dependency-free list reordering via the native HTML5 drag events.
 * Keeps an optimistic local order while dragging and commits the final id
 * order once the drag ends. Re-syncs from the source list whenever the set of
 * items changes (add / remove), so server updates flow through cleanly.
 *
 * Usage:
 *   const { ordered, draggingId, getItemProps } = useDragReorder(items, i => i.id, commit);
 *   ordered.map((item, index) => <div {...getItemProps(index)} key={item.id}>…</div>)
 */
export function useDragReorder<T>(
  items: readonly T[],
  getId: (item: T) => string,
  onCommit: (orderedIds: string[]) => void
) {
  const [ordered, setOrdered] = useState<T[]>([...items]);
  const orderedRef = useRef<T[]>(ordered);
  orderedRef.current = ordered;

  const dragIndexRef = useRef<number | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  // Re-sync when the membership OR order of the source list changes
  const idsKey = items.map(getId).join("|");
  useEffect(() => {
    setOrdered([...items]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idsKey]);

  const onDragStart = useCallback(
    (index: number) => {
      dragIndexRef.current = index;
      setDraggingId(getId(orderedRef.current[index]));
    },
    [getId]
  );

  const onDragEnter = useCallback((index: number) => {
    const from = dragIndexRef.current;
    if (from === null || from === index) return;
    setOrdered((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndexRef.current = index;
  }, []);

  const onDragEnd = useCallback(() => {
    const wasDragging = dragIndexRef.current !== null;
    dragIndexRef.current = null;
    setDraggingId(null);
    if (wasDragging) {
      onCommit(orderedRef.current.map(getId));
    }
  }, [getId, onCommit]);

  const getItemProps = useCallback(
    (index: number) => ({
      draggable: true,
      onDragStart: () => onDragStart(index),
      onDragEnter: () => onDragEnter(index),
      onDragEnd,
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
    }),
    [onDragStart, onDragEnter, onDragEnd]
  );

  return { ordered, draggingId, getItemProps };
}
