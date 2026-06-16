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
  description: "Lightweight long sleeve raglan tee. Crafted with premium breathable fabric and signature raglan sleeves for an effortless, comfortable fit.",
  specs: [
    "Lightweight fabric",
    "Raglan sleeves",
    "Long sleeve",
    "Breathable material",
    "Comfortable fit",
  ],
  heroImage: "/lemondrop main.png",
  galleryImages: [
    "/lemondrop1.png",
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
  const [cartCount, setCartCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [displayImage, setDisplayImage] = useState(PRODUCT.heroImage);
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
        price: `${PRODUCT.price}`,
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
    <div className="w-full bg-white min-h-screen" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      {/* Top Bar - Minimal */}
      <div className="w-full h-12 border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 bg-white z-40">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex flex-col gap-1 w-5 h-5 justify-center"
        >
          <div className="w-full h-px bg-black"></div>
          <div className="w-full h-px bg-black"></div>
          <div className="w-full h-px bg-black"></div>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 text-[13px] font-light tracking-wide">
          {PRODUCT.title}
        </div>

        <button className="relative w-6 h-6 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-black text-white text-[9px] font-medium rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex w-full">
        {/* Left Sidebar - Collapsible */}
        <div
          className={cn(
            "border-r border-neutral-200 bg-white overflow-y-auto transition-all duration-300",
            sidebarOpen ? "w-64" : "w-0"
          )}
          style={{ maxHeight: "calc(100vh - 48px)" }}
        >
          {sidebarOpen && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-[13px] font-semibold mb-2">{PRODUCT.title}</h2>
                <p className="text-[12px] font-light text-neutral-600 leading-relaxed">
                  {PRODUCT.description}
                </p>
              </div>

              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider">Details</p>
                <ul className="space-y-1">
                  {PRODUCT.specs.map((spec, idx) => (
                    <li key={idx} className="text-[11px] font-light text-neutral-600">
                      • {spec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Center - Product Image & Gallery */}
        <div className="flex-1 flex flex-col items-center justify-start p-8 overflow-y-auto" style={{ maxHeight: "calc(100vh - 48px)" }}>
          {/* Main Product Image */}
          <div className="w-full max-w-lg aspect-[3/4] relative mb-8">
            <Image
              src={displayImage}
              alt={PRODUCT.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 100vw, 60vw"
              unoptimized
            />
          </div>

          {/* Gallery - Hover to Swap */}
          {PRODUCT.galleryImages.length > 0 && (
            <div className="w-full max-w-lg space-y-2">
              <p className="text-[11px] font-light text-neutral-500">Gallery</p>
              <div className="flex gap-3 overflow-x-auto">
                {PRODUCT.galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-20 h-28 relative flex-shrink-0 cursor-pointer border border-transparent hover:border-black transition-all"
                    onMouseEnter={() => setDisplayImage(img)}
                    onMouseLeave={() => setDisplayImage(PRODUCT.heroImage)}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      fill
                      className="object-contain"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Purchase Options */}
        <div
          className="w-80 border-l border-neutral-200 bg-white overflow-y-auto p-8"
          style={{ maxHeight: "calc(100vh - 48px)" }}
        >
          <div className="space-y-6">
            {/* Price */}
            <div>
              <p className="text-[15px] font-semibold">${PRODUCT.price} USD</p>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full h-10 border border-neutral-300 px-3 text-[13px] font-light focus:outline-none focus:border-black"
              >
                <option value="">SELECT A SIZE</option>
                {SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToCart}
              disabled={!canAdd || addingState === "adding"}
              className={cn(
                "w-full h-11 text-[13px] font-semibold uppercase tracking-widest transition-all",
                inStock
                  ? addingState === "added"
                    ? "bg-green-600 text-white"
                    : "bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
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

            {/* Wishlist Button */}
            <button className="w-full h-11 border border-black text-[13px] font-semibold uppercase tracking-widest hover:bg-neutral-50 transition-colors">
              ADD TO WISHLIST
            </button>

            {errMsg && (
              <p className="text-[11px] text-red-600 text-center">{errMsg}</p>
            )}

            {/* Info Section */}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              <p className="text-[11px] font-light text-neutral-600">
                Model is 6'1" and wears size M. <u>SIZE GUIDE</u>
              </p>
              <p className="text-[11px] font-light text-neutral-600">
                Free shipping on orders over $150 USD and free returns on all orders.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
