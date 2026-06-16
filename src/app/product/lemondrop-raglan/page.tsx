"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";

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
      {/* Header */}
      <div className="w-full h-12 border-b border-neutral-200 flex items-center justify-between px-4 md:px-6 sticky top-0 bg-white z-40">
        <div></div>
        <Link href="/vip" className="relative w-20 h-7 hover:opacity-70 transition-opacity">
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

      {/* Mobile-First Single Column Layout */}
      <div className="w-full overflow-y-auto">
        {/* Product Image */}
        <div className="w-full bg-neutral-50 flex items-center justify-center p-4 md:p-8">
          <div className="w-full max-w-md aspect-[3/4] relative md:max-w-2xl">
            <Image
              src={displayImage}
              alt={PRODUCT.title}
              fill
              className="object-contain"
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
              unoptimized
            />
          </div>
        </div>

        {/* Purchase Section */}
        <div className="w-full px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
          {/* Product Info */}
          <div className="mb-6 space-y-3">
            <div>
              <p className="text-[10px] font-light text-neutral-600 uppercase tracking-wide">L'ARGENT BRÛLÉ</p>
              <p className="text-sm md:text-base font-light mt-1">{PRODUCT.title}</p>
            </div>
            <p className="text-base md:text-lg font-semibold">${PRODUCT.price} USD</p>
          </div>

          {/* Size Selector */}
          <div className="mb-6 space-y-3">
            <label className="text-[10px] font-semibold uppercase tracking-wider block">SELECT SIZE</label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="w-full h-12 md:h-11 border border-neutral-300 px-3 text-sm font-light focus:outline-none focus:border-black appearance-none bg-white cursor-pointer"
            >
              <option value="">Choose size...</option>
              {SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.value} ({size.label})
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="space-y-3 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={!canAdd || addingState === "adding"}
              className={cn(
                "w-full h-12 md:h-11 text-sm font-semibold uppercase tracking-widest transition-all",
                inStock
                  ? addingState === "added"
                    ? "bg-green-600 text-white"
                    : "bg-black text-white hover:bg-neutral-800 disabled:opacity-50"
                  : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
              )}
            >
              {addingState === "added" ? "ADDED ✓" : "ADD TO BAG"}
            </button>

            <button className="w-full h-12 md:h-11 border border-black text-sm font-semibold uppercase tracking-widest hover:bg-neutral-50 transition-colors">
              WISHLIST
            </button>
          </div>

          {errMsg && (
            <p className="text-xs text-red-600 text-center mb-4">{errMsg}</p>
          )}

          {/* Description */}
          <div className="border-t border-neutral-200 pt-6 mb-6 space-y-4">
            <p className="text-xs md:text-sm font-light text-neutral-700 leading-relaxed">{PRODUCT.description}</p>

            <div className="space-y-2">
              {PRODUCT.specs.map((spec, idx) => (
                <p key={idx} className="text-xs md:text-sm font-light text-neutral-700">• {spec}</p>
              ))}
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-light text-neutral-600">100% authentic materials. Crafted with premium construction.</p>
              <p className="text-xs font-light text-neutral-600">Free shipping on orders over $150 USD. All items ship within 2-3 business days.</p>
            </div>
          </div>

          {/* Info Section */}
          <div className="border-t border-neutral-200 pt-4 space-y-3">
            <p className="text-xs font-light text-neutral-600">
              Model is 6'1" and wears size L. <button onClick={() => setShowSizeGuide(true)} className="underline cursor-pointer hover:opacity-60">SIZE GUIDE</button>
            </p>
            <p className="text-xs font-light text-neutral-600">
              Free shipping on orders over $150 USD and free returns on all orders.
            </p>
          </div>

          {/* Gallery */}
          {PRODUCT.galleryImages.length > 0 && (
            <div className="border-t border-neutral-200 mt-6 pt-6 space-y-3">
              <p className="text-xs font-light text-neutral-500 uppercase">GALLERY</p>
              <div className="grid grid-cols-2 gap-3">
                {PRODUCT.galleryImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="aspect-[3/4] relative cursor-pointer border border-transparent hover:border-black transition-all"
                    onClick={() => setDisplayImage(img)}
                  >
                    <Image
                      src={img}
                      alt={`View ${idx + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 50vw, 300px"
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
            className="bg-white rounded-lg p-6 md:p-8 max-w-sm w-full animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-sm md:text-base font-semibold uppercase tracking-wider mb-4">SIZE GUIDE</h2>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { size: "XS", width: 18, length: 27 },
                { size: "S", width: 19, length: 28 },
                { size: "M", width: 20, length: 29 },
                { size: "L", width: 21, length: 30 },
                { size: "XL", width: 22, length: 31 },
                { size: "XXL", width: 23, length: 32 },
              ].map((s) => (
                <div key={s.size} className="border border-neutral-200 p-2 rounded text-center text-xs">
                  <p className="font-semibold">{s.size}</p>
                  <p className="text-[9px] text-neutral-600 mt-1">W: {s.width}"</p>
                  <p className="text-[9px] text-neutral-600">L: {s.length}"</p>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-neutral-600 text-center mb-4">
              All measurements are approximate and taken from the center of the garment.
            </p>

            <button
              onClick={() => setShowSizeGuide(false)}
              className="w-full h-10 bg-black text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
