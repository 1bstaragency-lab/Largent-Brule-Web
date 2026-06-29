// Tracks how quickly a visitor moves through their session so the
// "checkout line" wait can adapt: swift, decisive shoppers wait less;
// slow browsers wait longer. Everything is client-side via sessionStorage.

const EVENTS_KEY = "lb_pace_events";
const START_KEY = "lb_pace_start";
const MAX_EVENTS = 30;

export const MIN_WAIT_MS = 5000; // fastest queue
export const MAX_WAIT_MS = 30000; // slowest queue

/** Record a "movement" event (page view, add-to-cart, etc.). */
export function recordPaceEvent(): void {
  if (typeof window === "undefined") return;
  try {
    const now = Date.now();
    if (!sessionStorage.getItem(START_KEY)) {
      sessionStorage.setItem(START_KEY, String(now));
    }
    const raw = sessionStorage.getItem(EVENTS_KEY);
    const arr: number[] = raw ? JSON.parse(raw) : [];
    arr.push(now);
    while (arr.length > MAX_EVENTS) arr.shift();
    sessionStorage.setItem(EVENTS_KEY, JSON.stringify(arr));
  } catch {
    /* sessionStorage unavailable — ignore */
  }
}

// Avg gap between actions, in ms, that maps to the fast / slow ends.
const FAST_GAP = 8000; // ≤ 8s between actions → moving swiftly
const SLOW_GAP = 60000; // ≥ 60s between actions → browsing slowly

/**
 * Compute how long to hold someone in the checkout line, in ms.
 * Faster session pace → shorter wait. Includes ±2.5s jitter so two
 * identical paces don't always get the exact same number.
 */
export function computeQueueWaitMs(): number {
  if (typeof window === "undefined") return MIN_WAIT_MS;
  try {
    const raw = sessionStorage.getItem(EVENTS_KEY);
    const arr: number[] = raw ? JSON.parse(raw) : [];

    // A decisive 1-action buyer is "swift" → near the fast end.
    if (arr.length < 2) return withJitter(MIN_WAIT_MS + 3000);

    let total = 0;
    for (let i = 1; i < arr.length; i++) total += arr[i] - arr[i - 1];
    const avgGap = total / (arr.length - 1);

    // 0 = swift (fast end), 1 = slow (slow end).
    const t = Math.min(1, Math.max(0, (avgGap - FAST_GAP) / (SLOW_GAP - FAST_GAP)));
    const wait = MIN_WAIT_MS + t * (MAX_WAIT_MS - MIN_WAIT_MS);
    return withJitter(wait);
  } catch {
    return MIN_WAIT_MS;
  }
}

function withJitter(ms: number): number {
  const jitter = (Math.random() - 0.5) * 5000; // ±2.5s
  return Math.round(Math.min(MAX_WAIT_MS, Math.max(MIN_WAIT_MS, ms + jitter)));
}
