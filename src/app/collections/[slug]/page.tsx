"use client";

import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import { notFound } from "next/navigation";

const collectionData: Record<string, {
  label: string;
  description: string;
  products: { id: string; name: string; price: string; image: string; tag: string }[];
}> = {
  classics: {
    label: "CLASSICS",
    description: "The permanent archive. Foundational silhouettes built to last.",
    products: [
      { id: "bomber", name: "CROPPED BOMBER JACKET", price: "310 USD", image: "/bomber_final_studio.jpg", tag: "NEW" },
      { id: "pants", name: "CARGO LEATHER PANTS", price: "240 USD", image: "/pants_leather_studio.png", tag: "NEW" },
    ],
  },
  ss26: {
    label: "S/S 26",
    description: "Spring / Summer 2026. The new season.",
    products: [
      { id: "hoodie", name: "LEMONDROP HOODIE", price: "185 USD", image: "/hoodie_front_v12.png", tag: "NEW" },
      { id: "raglan", name: "RAGLAN L/S TEE", price: "87 USD", image: "/raglan_front_white_v2.png", tag: "NEW" },
    ],
  },
};

export default function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const col = collectionData[slug];
  if (!col) return notFound();

  return (
    <div className="px-4 sm:px-10 pb-40">
      {/* Mobile spacer to clear fixed header */}
      <div className="h-8 lg:h-0" />
      {/* Breadcrumb */}
      <div className="mb-20 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30">
          <Link href="/collections" className="hover:opacity-60 transition-opacity">Collections</Link>
          {" / "}
          {col.label}
        </p>
        <h1 className="text-[14px] uppercase font-bold tracking-[0.3em]">{col.label}</h1>
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-40">{col.description}</p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32 w-full">
        {col.products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-8">
            <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-12 border border-transparent group-hover:border-border transition-all duration-700">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-contain mix-blend-multiply group-hover:scale-125 transition-transform duration-1000 ease-out p-2"
                style={{ filter: "contrast(1.1) brightness(1.05)" }}
              />
            </div>
            <div className="space-y-3 text-[13px] tracking-[0.3em]">
              <p className="font-bold uppercase">{product.name}</p>
              <div className="flex items-center justify-between opacity-50">
                <p className="font-medium">{product.price}</p>
                <p className="font-bold text-[10px] uppercase border-l border-black/20 pl-4">{product.tag}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
