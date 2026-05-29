"use client";

// Per-product time-on-page tracker, used by the cart drawer to suggest a
// product the customer lingered on. Pure client-side, localStorage only.
// Only counts time while the document is visible (tab focused, page not
// minimized). Capped at 10 min per product to ignore tabs left open.

import { useEffect, useRef } from "react";

const STORAGE_KEY = "lb_dwell";
const CAP_MS = 10 * 60 * 1000;
const FLUSH_INTERVAL_MS = 5000;
const MIN_SIGNAL_MS = 4000;

export interface DwellMeta {
  handle: string;
  name: string;
  image: string;
  priceText: string;
}

export interface DwellEntry {
  totalMs: number;
  lastSeen: string;
  meta: DwellMeta;
}

type DwellMap = Record<string, DwellEntry>;

function readMap(): DwellMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DwellMap) : {};
  } catch {
    return {};
  }
}

function writeMap(m: DwellMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    // private mode / quota — drop silently
  }
}

/** Track time-on-page for one product. Pass null until meta is ready. */
export function useDwell(meta: DwellMeta | null) {
  const metaRef = useRef(meta);
  metaRef.current = meta;

  useEffect(() => {
    if (!meta) return;
    let lastTick = Date.now();
    let visible = !document.hidden;

    const flush = () => {
      const m = metaRef.current;
      if (!m || !visible) {
        lastTick = Date.now();
        return;
      }
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;
      if (delta <= 0) return;
      const map = readMap();
      const prev = map[m.handle];
      map[m.handle] = {
        totalMs: Math.min(CAP_MS, (prev?.totalMs ?? 0) + delta),
        lastSeen: new Date().toISOString(),
        meta: m,
      };
      writeMap(map);
    };

    const onVisibility = () => {
      if (visible) flush();
      visible = !document.hidden;
      lastTick = Date.now();
    };

    document.addEventListener("visibilitychange", onVisibility);
    const id = window.setInterval(flush, FLUSH_INTERVAL_MS);

    return () => {
      flush();
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [meta?.handle]);
}

/** Top-dwelt product not in `exclude`. Requires >= MIN_SIGNAL_MS to count. */
export function getTopDwell(exclude: string[]): DwellEntry | null {
  if (typeof window === "undefined") return null;
  const map = readMap();
  const skip = new Set(exclude);
  let best: DwellEntry | null = null;
  for (const [handle, e] of Object.entries(map)) {
    if (skip.has(handle)) continue;
    if (!e.meta?.handle || !e.meta?.image) continue;
    if (e.totalMs < MIN_SIGNAL_MS) continue;
    if (!best || e.totalMs > best.totalMs) best = e;
  }
  return best;
}
