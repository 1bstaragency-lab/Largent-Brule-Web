"use client";

import { useState } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";

const PRODUCT = {
  id: "parisian-edition",
  title: "PARISIAN EDITION RINGER TEE",
  price: 145,
  currency: "USD",
  description: "Slub ringer tee, slightly distressed, washed for that worn-in feel.",
  specs: [
    "Slub fabric blend",
    "Ringer style",
    "Slightly distressed",
    "Vintage wash",
    "Worn-in aesthetic",
  ],
  heroImage: "/parsian tee.png",
  galleryImages: [
    "/parsian product shot.png",
    "/parisian xtra.png",
    "/parsian full.png",
  ],
};

const SIZES = [
  { value: "1", label: "S" },
  { value: "2", label: "M" },
  { value: "3", label: "L" },
  { value: "4", label: "XL" },
  { value: "5", label: "XXL" },
];

export default function ParisianEditionPage() {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addingState, setAddingState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const { addItem } = useCart();

  const handleAddToCart = async () => {
    if (!selectedSize) {
      setErrMsg("Please select a size");
      setAddingState("error");
      return;
    }

    setAddingState("adding");
    setErrMsg("");
    try {
      await addItem({
        id: PRODUCT.id,
        name: PRODUCT.title,
        price: `${PRODUCT.price} ${PRODUCT.currency}`,
        image: PRODUCT.heroImage,
        variant: SIZES.find((s) => s.value === selectedSize)?.label,
      });
      setAddingState("added");
      setTimeout(() => setAddingState("idle"), 1500);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Could not add to cart");
      setAddingState("error");
    }
  };

  const inStock = true;
  const canAdd = !!selectedSize && inStock;

  return (
    <div className="w-full bg-white min-h-screen pt-20 lg:pt-0">
      {/* Mobile */}
      <div className="lg:hidden">
        {/* Hero Image */}
        <div className="w-full aspect-[4/5] bg-white p-6 relative mb-8">
          <Image
            src={PRODUCT.heroImage}
            alt={PRODUCT.title}
            fill
            className="object-contain mix-blend-multiply"
            priority
            sizes="100vw"
            unoptimized
          />
        </div>

        {/* Gallery Scroll */}
        <div className="mb-8 px-4">
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 w-max">
              {PRODUCT.galleryImages.map((img, idx) => (
                <div key={idx} className="w-32 h-40 bg-neutral-50 relative flex-shrink-0">
                  <Image
                    src={img}
                    alt={`Product view ${idx + 1}`}
                    fill
                    className="object-contain mix-blend-multiply"
                    sizes="128px"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="px-5 pb-16 space-y-6">
          <div className="space-y-2">
            <h1 className="text-[14px] font-bold uppercase tracking-[0.2em]">
              {PRODUCT.title}
            </h1>
            <p className="text-[16px] font-bold tracking-wide">
              ${PRODUCT.price} {PRODUCT.currency}
            </p>
            <p className="text-[11px] text-neutral-600 tracking-[0.1em] leading-relaxed">
              {PRODUCT.description}
            </p>
          </div>

          {/* Specs */}
          <div className="border-t border-neutral-100 pt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-3 opacity-60">
              DETAILS
            </p>
            <ul className="space-y-2 text-[11px] text-neutral-600 tracking-[0.05em]">
              {PRODUCT.specs.map((spec, idx) => (
                <li key={idx}>• {spec}</li>
              ))}
            </ul>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-60">
              SELECT SIZE
            </p>
            <div className="grid grid-cols-5 gap-2">
              {SIZES.map((size) => (
                <button
                  key={size.value}
                  onClick={() => setSelectedSize(size.value)}
                  className={cn(
                    "h-10 border text-[11px] font-bold transition-all",
                    selectedSize === size.value
                      ? "border-black bg-black text-white"
                      : "border-neutral-200 text-black hover:border-black"
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Cart */}
          <div className="space-y-2">
            <button
              onClick={handleAddToCart}
              disabled={!canAdd || addingState === "adding"}
              className={cn(
                "w-full h-[52px] text-[11px] font-bold uppercase tracking-[0.4em] transition-colors",
                inStock
                  ? addingState === "added"
                    ? "bg-green-500 text-white"
                    : "bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              )}
            >
              {!inStock
                ? "SOLD OUT"
                : addingState === "adding"
                ? "ADDING…"
                : addingState === "added"
                ? "ADDED ✓"
                : "ADD TO CART"}
            </button>
            {errMsg && (
              <p className="text-[10px] text-red-500 text-center tracking-wide">{errMsg}</p>
            )}
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="hidden lg:flex w-full min-h-screen">
        <div className="w-[60%] sticky top-0 h-screen flex items-center justify-center overflow-y-auto bg-white p-12">
          <div className="space-y-12 w-full">
            {/* Hero Image */}
            <div className="w-full aspect-[3/4] relative">
              <Image
                src={PRODUCT.heroImage}
                alt={PRODUCT.title}
                fill
                className="object-contain mix-blend-multiply"
                priority
                sizes="60vw"
                unoptimized
              />
            </div>

            {/* Gallery Scroll */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
                PRODUCT GALLERY
              </p>
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-4 w-max">
                  {PRODUCT.galleryImages.map((img, idx) => (
                    <div key={idx} className="w-40 h-56 bg-neutral-50 relative flex-shrink-0">
                      <Image
                        src={img}
                        alt={`Product view ${idx + 1}`}
                        fill
                        className="object-contain mix-blend-multiply"
                        sizes="160px"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-[40%] bg-white px-20 py-32 border-l border-neutral-50 overflow-y-auto">
          <div className="max-w-xl space-y-20">
            {/* Product Info */}
            <div className="space-y-6">
              <h1 className="text-[17px] font-bold uppercase tracking-[0.2em]">
                {PRODUCT.title}
              </h1>
              <p className="text-[17px] font-bold tracking-[0.1em]">
                ${PRODUCT.price} {PRODUCT.currency}
              </p>
              <p className="text-[12px] text-neutral-600 tracking-[0.05em] leading-relaxed">
                {PRODUCT.description}
              </p>
            </div>

            {/* Specs */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">
                DETAILS
              </p>
              <ul className="space-y-2 text-[11px] text-neutral-600 tracking-[0.1em]">
                {PRODUCT.specs.map((spec, idx) => (
                  <li key={idx}>• {spec}</li>
                ))}
              </ul>
            </div>

            {/* Size Selector */}
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">
                SELECT SIZE
              </p>
              <div className="grid grid-cols-5 gap-3 max-w-sm">
                {SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={cn(
                      "h-12 border text-[11px] font-bold transition-all",
                      selectedSize === size.value
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 text-black hover:border-black"
                    )}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3 pt-10">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd || addingState === "adding"}
                className={cn(
                  "w-full h-[52px] text-[11px] font-bold uppercase tracking-[0.4em] transition-colors",
                  inStock
                    ? addingState === "added"
                      ? "bg-green-500 text-white"
                      : "bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                )}
              >
                {!inStock
                  ? "SOLD OUT"
                  : addingState === "adding"
                  ? "ADDING…"
                  : addingState === "added"
                  ? "ADDED ✓"
                  : "ADD TO CART"}
              </button>
              {errMsg && (
                <p className="text-[10px] text-red-500 text-center tracking-wide">{errMsg}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
