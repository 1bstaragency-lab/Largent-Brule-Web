"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PRODUCT = {
  id: "parisian-edition",
  title: "PARISIAN EDITION RINGER TEE",
  price: 145,
  currency: "USD",
  description: "Slub ringer tee with signature distressed detailing and vintage wash. Crafted for that perfect worn-in aesthetic.",
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

const NAV_ITEMS = [
  { label: "COLLECTIONS", href: "/collections" },
  { label: "OUR STORY", href: "/" },
  { label: "LOOKBOOK", href: "/" },
  { label: "FAQ", href: "/faq" },
  { label: "SIGN IN", href: "/" },
  { label: "REGISTER", href: "/" },
];

export default function ParisianEditionPage() {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addingState, setAddingState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [navOpen, setNavOpen] = useState(false);
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
      {/* Top Bar */}
      <div className="w-full h-12 border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 bg-white z-40">
        <button
          onClick={() => setNavOpen(!navOpen)}
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

      {/* Navigation Sidebar */}
      {navOpen && (
        <div className="fixed inset-0 top-12 z-30 bg-black/20" onClick={() => setNavOpen(false)}>
          <div className="absolute top-0 left-0 w-64 h-screen bg-white border-r border-neutral-200 p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="block text-[12px] font-light uppercase tracking-wider hover:opacity-60 transition-opacity"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex w-full" style={{ height: "calc(100vh - 48px)" }}>
        {/* Left - Details */}
        <div className="w-64 border-r border-neutral-200 overflow-y-auto p-6 space-y-6">
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

        {/* Center - Main Image */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-md aspect-[3/4] relative">
            <Image
              src={displayImage}
              alt={PRODUCT.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          </div>
        </div>

        {/* Right - Purchase Section */}
        <div className="w-80 border-l border-neutral-200 overflow-y-auto p-8">
          <div className="space-y-6">
            {/* Price */}
            <div>
              <p className="text-[16px] font-semibold">${PRODUCT.price} USD</p>
            </div>

            {/* Size Selector */}
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider">SELECT SIZE</p>
              <div className="flex flex-wrap gap-2">
                {SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => setSelectedSize(size.value)}
                    className={cn(
                      "px-3 py-2 border text-[11px] font-light transition-all",
                      selectedSize === size.value
                        ? "border-black bg-black text-white"
                        : "border-neutral-300 text-black hover:border-black"
                    )}
                  >
                    {size.value} <span className="text-[9px]">({size.label})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons - Side by Side */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!canAdd || addingState === "adding"}
                className={cn(
                  "flex-1 h-11 text-[12px] font-semibold uppercase tracking-widest transition-all",
                  inStock
                    ? addingState === "added"
                      ? "bg-green-600 text-white"
                      : "bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
                    : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                )}
              >
                {addingState === "added" ? "ADDED ✓" : "ADD TO BAG"}
              </button>

              <button className="flex-1 h-11 border border-black text-[12px] font-semibold uppercase tracking-widest hover:bg-neutral-50 transition-colors">
                WISHLIST
              </button>
            </div>

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

            {/* Gallery */}
            {PRODUCT.galleryImages.length > 0 && (
              <div className="pt-4 border-t border-neutral-200 space-y-3">
                <p className="text-[11px] font-light text-neutral-500">GALLERY</p>
                <div className="space-y-2">
                  {PRODUCT.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="w-full h-24 relative cursor-pointer border border-transparent hover:border-black transition-all"
                      onMouseEnter={() => setDisplayImage(img)}
                      onMouseLeave={() => setDisplayImage(PRODUCT.heroImage)}
                    >
                      <Image
                        src={img}
                        alt={`View ${idx + 1}`}
                        fill
                        className="object-contain"
                        sizes="100%"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
