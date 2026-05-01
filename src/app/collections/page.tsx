"use client";

import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    slug: "classics",
    label: "CLASSICS",
    description: "The permanent archive. Foundational silhouettes built to last.",
    image: "/bomber_final_studio.jpg",
  },
  {
    slug: "ss26",
    label: "S/S 26",
    description: "Spring / Summer 2026. The new season.",
    image: "/hoodie_front_v15.png",
  },
];

export default function CollectionsPage() {
  return (
    <div className="px-4 sm:px-10 pb-40">
      {/* Mobile spacer to clear fixed header */}
      <div className="h-8 lg:h-0" />
      <div className="mb-20">
        <h1 className="text-[11px] uppercase font-bold tracking-[0.5em] opacity-40">Collections</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-24">
        {collections.map((col) => (
          <Link
            key={col.slug}
            href={`/collections/${col.slug}`}
            className="group block space-y-8"
          >
            <div className="aspect-[3/4] bg-white relative overflow-hidden border border-transparent group-hover:border-border transition-all duration-700">
              <Image
                src={col.image}
                alt={col.label}
                fill
                className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-1000 ease-out p-8"
                style={{ filter: "contrast(1.1) brightness(1.05)" }}
              />
            </div>
            <div className="space-y-3 text-[13px] tracking-[0.3em]">
              <p className="font-bold uppercase">{col.label}</p>
              <p className="opacity-40 text-[11px] tracking-[0.2em] uppercase">{col.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
