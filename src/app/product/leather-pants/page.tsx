"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";
import Link from "next/link";

const PRODUCT = {
  id: "leather-pants",
  title: "BEAUTÉ DU CUIR CARPENTERS",
  price: 240,
  currency: "USD",
  description: "Premium leather carpenter pants crafted with the finest materials. A luxe, timeless silhouette that blends utility with refined elegance.",
  specs: [
    "Premium leather",
    "Carpenter style",
    "Structured fit",
    "Classic silhouette",
    "Timeless design",
  ],
  heroImage: "/leather_pants_front.png",
  hoverImage: "/leather_pants_front.png",
  galleryImages: [],
};

const SIZES = [
  { value: "1", label: "S" },
  { value: "2", label: "M" },
  { value: "3", label: "L" },
  { value: "4", label: "XL" },
  { value: "5", label: "XXL" },
];

export default function LeatherPantsPage() {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [addingState, setAddingState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
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
      <header className="fixed top-0 w-full bg-white border-b border-neutral-100 z-50 h-16">
        <div className="flex items-center justify-between px-6 lg:px-12 h-full max-w-[1920px] mx-auto">
          <Link href="/" className="text-[13px] font-bold uppercase tracking-[0.3em]">
            Largent Brulé
          </Link>

          <button className="relative w-8 h-8 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="pt-16 w-full">
        <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-64px)] max-w-[1920px] mx-auto">
          {/* Left: Product Image - Centered */}
          <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8 lg:p-16 lg:border-r lg:border-neutral-100">
            <div className="w-full h-full flex items-center justify-center">
              <div
                className="w-full max-w-sm aspect-[3/4] relative cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Image
                  src={isHovering && PRODUCT.hoverImage ? PRODUCT.hoverImage : PRODUCT.heroImage}
                  alt={PRODUCT.title}
                  fill
                  className="object-contain"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="w-full lg:w-1/2 flex flex-col p-8 lg:p-16 lg:overflow-y-auto lg:max-h-[calc(100vh-64px)]">
            <div className="space-y-8 max-w-lg">
              {/* Title */}
              <div className="space-y-4">
                <h1 className="text-[20px] lg:text-[24px] font-bold uppercase tracking-[0.15em] leading-tight">
                  {PRODUCT.title}
                </h1>
              </div>

              {/* Price & Description */}
              <div className="space-y-4">
                <p className="text-[16px] font-bold tracking-[0.1em]">
                  ${PRODUCT.price}
                </p>
                <p className="text-[13px] text-neutral-700 leading-relaxed">
                  {PRODUCT.description}
                </p>
              </div>

              {/* Details Section */}
              <div className="space-y-4 border-t border-neutral-200 pt-6">
                <div className="space-y-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">Product Details</p>
                  <ul className="space-y-2">
                    {PRODUCT.specs.map((spec, idx) => (
                      <li key={idx} className="text-[12px] text-neutral-600">
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Shipping Dropdown */}
                <button
                  onClick={() => setExpandedSection(expandedSection === "shipping" ? null : "shipping")}
                  className="w-full flex items-center justify-between py-4 border-t border-neutral-200 hover:bg-neutral-50 transition-colors -mx-8 lg:-mx-16 px-8 lg:px-16"
                >
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em]">Shipping</p>
                  <span className={`text-[11px] transition-transform ${expandedSection === "shipping" ? "rotate-180" : ""}`}>▼</span>
                </button>
                {expandedSection === "shipping" && (
                  <div className="text-[12px] text-neutral-600 space-y-2 pb-4">
                    <p>Standard Shipping: 5-7 business days</p>
                    <p>Express Shipping: 2-3 business days</p>
                    <p>Free shipping on orders over $150</p>
                  </div>
                )}

                {/* Size Chart Dropdown */}
                <button
                  onClick={() => setExpandedSection(expandedSection === "size" ? null : "size")}
                  className="w-full flex items-center justify-between py-4 border-t border-neutral-200 hover:bg-neutral-50 transition-colors -mx-8 lg:-mx-16 px-8 lg:px-16"
                >
                  <p className="text-[12px] font-bold uppercase tracking-[0.2em]">Size Guide</p>
                  <span className={`text-[11px] transition-transform ${expandedSection === "size" ? "rotate-180" : ""}`}>▼</span>
                </button>
                {expandedSection === "size" && (
                  <div className="text-[12px] text-neutral-600 space-y-2 pb-4">
                    <p className="font-bold">Waist measurements (inches):</p>
                    <div className="grid grid-cols-2 gap-2">
                      <p>S: 28-30"</p>
                      <p>M: 31-33"</p>
                      <p>L: 34-36"</p>
                      <p>XL: 37-40"</p>
                      <p>XXL: 41-44"</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Selector */}
              <div className="space-y-3 border-t border-neutral-200 pt-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70">Select Size</p>
                <div className="flex gap-2">
                  {SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setSelectedSize(size.value)}
                      className={cn(
                        "h-11 w-11 border text-[12px] font-bold transition-all",
                        selectedSize === size.value
                          ? "border-black bg-black text-white"
                          : "border-neutral-300 text-black hover:border-black"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-3 pt-4 border-t border-neutral-200">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAdd || addingState === "adding"}
                  className={cn(
                    "w-full h-12 text-[12px] font-bold uppercase tracking-[0.2em] transition-all",
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
                  <p className="text-[11px] text-red-500 text-center">{errMsg}</p>
                )}
              </div>

              {/* Gallery */}
              {PRODUCT.galleryImages.length > 0 && (
                <div className="border-t border-neutral-200 pt-8">
                  <p className="text-[11px] font-bold uppercase tracking-[0.3em] opacity-70 mb-4">Gallery</p>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {PRODUCT.galleryImages.map((img, idx) => (
                      <div key={idx} className="w-24 h-32 relative flex-shrink-0">
                        <Image
                          src={img}
                          alt={`View ${idx + 1}`}
                          fill
                          className="object-contain"
                          sizes="96px"
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
    </div>
  );
}
