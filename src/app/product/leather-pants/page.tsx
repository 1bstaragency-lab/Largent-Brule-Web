"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";

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
  const [displayImage, setDisplayImage] = useState(PRODUCT.heroImage);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
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
        <div></div>

        <Link href="/vip" className="relative w-24 h-8 hover:opacity-70 transition-opacity">
          <Image
            src="/lb vip.png"
            alt="Club L'argent Brûlé VIP"
            fill
            className="object-contain"
            unoptimized
          />
        </Link>

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

      <div className="flex w-full" style={{ height: "calc(100vh - 48px)" }}>
        {/* Left - Product Details */}
        <div className="w-64 overflow-y-auto px-8 py-12 flex flex-col justify-center">
          <div className="space-y-6 text-[11px] leading-relaxed">
            <div>
              <p className="font-light text-neutral-900">L'ARGENT BRÛLÉ</p>
              <p className="font-light text-neutral-900 mt-2">{PRODUCT.title}</p>
            </div>

            <p className="font-light text-neutral-700">{PRODUCT.description}</p>

            <div className="space-y-2">
              {PRODUCT.specs.map((spec, idx) => (
                <p key={idx} className="font-light text-neutral-700">• {spec}</p>
              ))}
            </div>

            <p className="font-light text-neutral-600">100% authentic materials. Crafted with premium construction.</p>

            <p className="font-light text-neutral-600">Free shipping on orders over $150 USD. All items ship within 2-3 business days.</p>
          </div>
        </div>

        {/* Center - Main Image */}
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
          <div className="w-full max-w-2xl aspect-[3/4] relative">
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
          <div className="space-y-6 pt-32">
            {/* Product Name */}
            <div className="text-center pb-4">
              <p className="text-[12px] font-light uppercase tracking-wide">{PRODUCT.title}</p>
            </div>

            {/* Price */}
            <div className="text-center">
              <p className="text-[16px] font-semibold">${PRODUCT.price} USD</p>
            </div>

            {/* Size Dropdown */}
            <div className="space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-wider block">SELECT SIZE</label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full h-11 border border-neutral-300 px-3 text-[13px] font-light focus:outline-none focus:border-black appearance-none bg-white cursor-pointer"
              >
                <option value="">Choose size...</option>
                {SIZES.map((size) => (
                  <option key={size.value} value={size.value}>
                    {size.value} ({size.label})
                  </option>
                ))}
              </select>
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
                Model is 6'1" and wears size M. <button onClick={() => setShowSizeGuide(true)} className="underline cursor-pointer hover:opacity-60">SIZE GUIDE</button>
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

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4" onClick={() => setShowSizeGuide(false)}>
            <div
              className="bg-white rounded-lg p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-[14px] font-semibold uppercase tracking-wider mb-6">SIZE GUIDE</h2>

              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-center text-[12px]">
                  <div className="border border-neutral-200 p-3 rounded">
                    <p className="font-semibold">XS</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Width: 18"</p>
                    <p className="text-[10px] text-neutral-600">Length: 27"</p>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded">
                    <p className="font-semibold">S</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Width: 19"</p>
                    <p className="text-[10px] text-neutral-600">Length: 28"</p>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded">
                    <p className="font-semibold">M</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Width: 20"</p>
                    <p className="text-[10px] text-neutral-600">Length: 29"</p>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded">
                    <p className="font-semibold">L</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Width: 21"</p>
                    <p className="text-[10px] text-neutral-600">Length: 30"</p>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded">
                    <p className="font-semibold">XL</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Width: 22"</p>
                    <p className="text-[10px] text-neutral-600">Length: 31"</p>
                  </div>
                  <div className="border border-neutral-200 p-3 rounded">
                    <p className="font-semibold">XXL</p>
                    <p className="text-[10px] text-neutral-600 mt-1">Width: 23"</p>
                    <p className="text-[10px] text-neutral-600">Length: 32"</p>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-neutral-600 text-center mb-6">
                All measurements are approximate and taken from the center of the garment.
              </p>

              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full h-10 bg-black text-white text-[12px] font-semibold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
