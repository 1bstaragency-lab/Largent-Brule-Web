"use client";

// Slide-fade carousel for the VIP gate. Cycles through the URLs in
// /api/public/homepage-carousel every CYCLE_MS. Old image slides left
// and fades out; new image slides in from the right and fades in.
// Images are transparent PNGs (bg-removed), so the cream page color
// shows through behind them.

import { useEffect, useState } from "react";
import Image from "next/image";

const CYCLE_MS = 3500;
const TRANSITION_MS = 700;

export function HomepageCarousel() {
  const [urls, setUrls] = useState<string[] | null>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/public/homepage-carousel")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setUrls(Array.isArray(j.urls) ? j.urls : []);
      })
      .catch(() => {
        if (!cancelled) setUrls([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Tick to next image.
  useEffect(() => {
    if (!urls || urls.length < 2) return;
    const id = window.setInterval(
      () => setIndex((i) => (i + 1) % urls.length),
      CYCLE_MS
    );
    return () => window.clearInterval(id);
  }, [urls]);

  if (!urls || urls.length === 0) return null;

  return (
    <div className="relative w-full max-w-md aspect-[4/5] mb-8 overflow-hidden">
      {urls.map((url, i) => {
        // Position relative to active index.
        // 0 = active (centered, full opacity)
        // +N = upcoming (sits to the right, hidden)
        // -N = past (sits to the left, hidden)
        const offset = i - index;
        const isActive = offset === 0;
        // Normalize so wrap-around looks correct: the "next" image
        // (offset === 1, OR offset === -(urls.length - 1)) sits to the right.
        let renderedOffset: "active" | "left" | "right";
        if (isActive) {
          renderedOffset = "active";
        } else if (
          offset === 1 ||
          offset === -(urls.length - 1)
        ) {
          renderedOffset = "right";
        } else {
          renderedOffset = "left";
        }
        const translate =
          renderedOffset === "active"
            ? "translateX(0)"
            : renderedOffset === "right"
            ? "translateX(40%)"
            : "translateX(-40%)";
        const opacity = renderedOffset === "active" ? 1 : 0;
        return (
          <div
            key={url}
            className="absolute inset-0 flex items-end justify-center"
            style={{
              transform: translate,
              opacity,
              transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.22, 0.61, 0.36, 1), opacity ${TRANSITION_MS}ms ease`,
              willChange: "transform, opacity",
            }}
          >
            <Image
              src={url}
              alt=""
              fill
              priority={i === 0}
              sizes="(max-width: 768px) 100vw, 448px"
              className="object-contain object-bottom"
              unoptimized
            />
          </div>
        );
      })}
    </div>
  );
}
