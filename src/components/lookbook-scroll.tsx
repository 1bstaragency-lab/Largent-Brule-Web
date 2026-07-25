"use client";

import Image from "next/image";

export interface LookbookLook {
  src: string;
  alt: string;
  caption?: string;
}

// Placeholder looks — replace `src` with real uploads whenever ready.
// Add/remove entries freely; the layout just stacks whatever's here.
const DEFAULT_LOOKS: LookbookLook[] = [
  { src: "/hf_20260521_214620_f138056b-c352-4738-8944-1db1d9e1b6e7.png", alt: "Look 001", caption: "Look 001" },
  { src: "/hf_20260521_073428_d29afd76-3547-4fd5-a1eb-483812ab9283.png", alt: "Look 002", caption: "Look 002" },
  { src: "/hf_20260521_073327_f5f42ea1-bbdd-412c-b885-c5c43a1e1c5b.png", alt: "Look 003", caption: "Look 003" },
  { src: "/hf_20260521_073334_bad353eb-813a-426f-9939-b78904e74044.png", alt: "Look 004", caption: "Look 004" },
];

/**
 * Full-bleed, scroll-through lookbook: each look stacked edge-to-edge
 * so the visitor just scrolls down the page to see the collection.
 * Pass `looks` to override the placeholder set once real photos exist.
 */
export function LookbookScroll({ looks = DEFAULT_LOOKS }: { looks?: LookbookLook[] }) {
  return (
    <section className="w-full bg-white">
      <div className="text-center pt-16 sm:pt-20 pb-8 sm:pb-10 px-4">
        <p className="text-[9px] sm:text-[10px] text-neutral-400 uppercase tracking-[0.6em] font-light mb-3">
          S/S 26
        </p>
        <h2 className="text-[12px] sm:text-[13px] uppercase tracking-[0.5em] font-medium text-black">
          Lookbook
        </h2>
      </div>

      <div className="flex flex-col gap-1">
        {looks.map((look, idx) => (
          <div key={idx} className="relative w-full">
            <div className="relative w-full aspect-[3/4] sm:aspect-[16/9]">
              <Image
                src={look.src}
                alt={look.alt}
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={idx === 0}
              />
            </div>
            {look.caption && (
              <p className="absolute bottom-4 left-4 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-white/90 font-medium drop-shadow">
                {look.caption}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
