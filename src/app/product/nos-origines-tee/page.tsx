"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/components/cart-drawer";
import { cn } from "@/lib/utils";

const PRODUCT = {
  id: "nos-origines-tee",
  title: "NOS ORIGINES TEE",
  price: 145,
  currency: "USD",
  description: "Premium vintage-inspired tee with heritage detailing. Crafted with meticulous attention to detail and premium materials.",
  specs: [
    "Premium cotton blend",
    "Vintage-inspired aesthetic",
    "Heritage detailing",
    "Timeless design",
    "Elevated craftsmanship",
  ],
  heroImage: "/nostee1.png",
  galleryImages: [
    "/nostee2.png",
    "/nostee3.png",
    "/nostee4.png",
    "/nostee5.png",
    "/nostee6.png",
  ],
};

// Sizes wired to the Shopify "Nos Origines Tee" variants (made to order).
const SIZES = [
  { value: "S", label: "S", variantId: "47957845639319" },
  { value: "M", label: "M", variantId: "47957845672087" },
  { value: "L", label: "L", variantId: "47957845704855" },
  { value: "XL", label: "XL", variantId: "47957845737623" },
];

const RELATED_PRODUCTS = [
  {
    id: "parisian-edition",
    title: "PARISIAN EDITION TEE",
    price: 145,
    image: "/parsian tee.png",
  },
  {
    id: "leather-pants",
    title: "BEAUTÉ DU CUIR CARPENTERS",
    price: 240,
    image: "/leather_pants_front.png",
  },
];


export default function NosOriginesPage() {
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

    const sizeObj = SIZES.find((s) => s.value === selectedSize);
    if (!sizeObj?.variantId) {
      setErrMsg("This size isn't available online yet — contact us for a custom order.");
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
        variant: sizeObj.label,
        shopify_variant_legacy_id: sizeObj.variantId,
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
        {/* Logo - Mobile Left */}
        <Link href="/vip" className="relative w-20 h-7 hover:opacity-70 transition-opacity lg:hidden">
          <Image
            src="/lb vip.png"
            alt="Club L'argent Brûlé VIP"
            fill
            className="object-contain"
            unoptimized
          />
        </Link>

        {/* Empty Space - Desktop Left */}
        <div className="hidden lg:block"></div>

        {/* Logo - Desktop Center */}
        <Link href="/vip" className="relative w-20 h-7 hover:opacity-70 transition-opacity hidden lg:block">
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

      {/* Mobile Layout (default) */}
      <div className="lg:hidden w-full overflow-y-auto">
        {/* Product Image */}
        <div className="w-full bg-neutral-50 flex items-center justify-center p-4 pt-40">
          <div className="w-full max-w-md aspect-[3/4] relative">
            <Image
              src={displayImage}
              alt={PRODUCT.title}
              fill
              className="object-contain"
              priority
              sizes="100vw"
              unoptimized
            />
          </div>
        </div>

        {/* Purchase Section */}
        <div className="w-full px-4 py-6 max-w-2xl mx-auto">
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
                  {size.label}
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

          {/* You May Also Like */}
          <div className="border-t border-neutral-200 mt-8 pt-8 space-y-6">
            <p className="text-xs font-light text-neutral-500 uppercase tracking-wide">YOU MAY ALSO LIKE</p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
              {RELATED_PRODUCTS.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.id}`}
                  className="group space-y-3 cursor-pointer"
                >
                  <div className="aspect-[3/4] relative bg-neutral-50 overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain group-hover:opacity-80 transition-opacity"
                      sizes="(max-width: 640px) 50vw, 300px"
                      unoptimized
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-light text-neutral-900">{product.title}</p>
                    <p className="text-sm font-semibold">${product.price} USD</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout (lg and up) */}
      <div className="hidden lg:flex w-full" style={{ height: "calc(100vh - 48px)" }}>
        {/* Left - Product Details */}
        <div className="w-64 overflow-y-auto px-8 py-12 flex flex-col justify-center border-r border-neutral-200">
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
        <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto bg-neutral-50">
          <div className={`w-full aspect-[3/4] relative ${displayImage === PRODUCT.heroImage ? 'max-w-2xl' : 'max-w-xl'}`}>
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
                    {size.label}
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
                Model is 6'1" and wears size L. <button onClick={() => setShowSizeGuide(true)} className="underline cursor-pointer hover:opacity-60">SIZE GUIDE</button>
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
                      className="w-full h-12 relative cursor-pointer border border-transparent hover:border-black transition-all"
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
