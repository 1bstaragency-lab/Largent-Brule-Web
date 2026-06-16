"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PRODUCT = {
  id: "lemondrop-raglan",
  title: "LEMONDROP RAGLAN",
  price: 165,
  currency: "USD",
  description: "Lightweight long sleeve raglan tee.",
  specs: [
    "Lightweight fabric",
    "Raglan sleeves",
    "Long sleeve",
    "Breathable",
    "Comfortable fit",
  ],
  heroImage: "/lemondrop1.png",
  galleryImages: [
    "/lemondrop2.png",
    "/lemondrop3.png",
  ],
};

const SIZES = [
  { value: "1", label: "S" },
  { value: "2", label: "M" },
  { value: "3", label: "L" },
  { value: "4", label: "XL" },
  { value: "5", label: "XXL" },
];

export default function LemonDropRaglanPage() {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addingState, setAddingState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const { addItem, items } = useCart();

  useEffect(() => {
    setCartCount(items?.length || 0);
  }, [items]);

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
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-neutral-100 z-50">
        <div className="flex items-center justify-between px-4 lg:px-8 h-16">
          {/* Hamburger Menu */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden flex flex-col gap-1.5 w-6 h-6 justify-center"
          >
            <div className="w-full h-0.5 bg-black"></div>
            <div className="w-full h-0.5 bg-black"></div>
            <div className="w-full h-0.5 bg-black"></div>
          </button>

          {/* Logo */}
          <Link href="/" className="text-[12px] font-bold uppercase tracking-[0.3em]">
            Largent Brulé
          </Link>

          {/* Bag */}
          <button className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 top-16 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setSidebarOpen(false)} />
          <div className="absolute top-0 left-0 w-48 h-screen bg-white border-r border-neutral-100 p-8 space-y-8">
            <Link href="/collections" className="block text-[12px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
              Collections
            </Link>
            <Link href="/" className="block text-[12px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
              Our Story
            </Link>
            <Link href="/faq" className="block text-[12px] uppercase tracking-[0.2em] opacity-60 hover:opacity-100">
              FAQ
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="pt-16 w-full min-h-screen flex flex-col lg:flex-row">
        {/* Left: Product Image (60%) */}
        <div className="w-full lg:w-[60%] flex items-center justify-center bg-white p-6 lg:p-12 lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto">
          <div className="w-full max-w-2xl space-y-12">
            {/* Hero Image */}
            <div className="w-full aspect-[3/4] relative">
              <Image
                src={PRODUCT.heroImage}
                alt={PRODUCT.title}
                fill
                className="object-contain"
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                unoptimized
              />
            </div>

            {/* Gallery */}
            {PRODUCT.galleryImages.length > 0 && (
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] opacity-40">Gallery</p>
                <div className="overflow-x-auto pb-2 -mx-6 lg:-mx-12 px-6 lg:px-12">
                  <div className="flex gap-4 w-max">
                    {PRODUCT.galleryImages.map((img, idx) => (
                      <div key={idx} className="w-40 h-56 relative flex-shrink-0 bg-neutral-50">
                        <Image
                          src={img}
                          alt={`Product view ${idx + 1}`}
                          fill
                          className="object-contain"
                          sizes="160px"
                          unoptimized
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Details (40%) */}
        <div className="w-full lg:w-[40%] bg-white p-6 lg:p-12 lg:overflow-y-auto lg:h-[calc(100vh-64px)]">
          <div className="max-w-md space-y-8 lg:space-y-12">
            {/* Title & Price */}
            <div className="space-y-4">
              <h1 className="text-[16px] lg:text-[18px] font-bold uppercase tracking-[0.2em]">
                {PRODUCT.title}
              </h1>
              <p className="text-[16px] lg:text-[18px] font-bold tracking-[0.1em]">
                ${PRODUCT.price}
              </p>
              <p className="text-[12px] lg:text-[13px] text-neutral-600 tracking-[0.05em] leading-relaxed">
                {PRODUCT.description}
              </p>
            </div>

            {/* Details */}
            <div className="border-t border-neutral-100 pt-8 space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Details</p>
              <ul className="space-y-2 text-[11px] lg:text-[12px] text-neutral-600 tracking-[0.05em]">
                {PRODUCT.specs.map((spec, idx) => (
                  <li key={idx}>• {spec}</li>
                ))}
              </ul>
            </div>

            {/* Size Selector */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-60">Size</p>
              <div className="grid grid-cols-5 gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={cn(
                      "h-10 lg:h-12 border text-[11px] font-bold transition-all",
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
            <div className="space-y-3 pt-4 lg:pt-8">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd || addingState === "adding"}
                className={cn(
                  "w-full h-12 lg:h-14 text-[11px] font-bold uppercase tracking-[0.3em] transition-all",
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
                  : "ADD TO BAG"}
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
