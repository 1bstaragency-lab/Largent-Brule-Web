"use client";

// TEMP: NotifyMeForm replaced with Add to Cart for testing (see git log).
// Original lockdown view used a "Notify Me" flow with Supabase early_access
// signup. Restored on "revert".

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus, RotateCcw } from "lucide-react";
import { useCart } from "@/components/cart-drawer";
import { motion, AnimatePresence } from "framer-motion";

// TEMP: variants map added per product to bind hardcoded productData
// to live Shopify variant IDs. Restored to original (no variants map)
// on "revert". Keys are `${COLOR_NAME} / ${SIZE_DISPLAY}` matching what
// AddToCart constructs from selectedColor + selectedSize.split("|")[0].
const productData: Record<string, any> = {
  bomber: {
    name: "CROPPED BOMBER JACKET IN TECHNICAL NYLON",
    price: "310 USD",
    colors: [
      {
        name: "CHARCOAL",
        hex: "#2f2f2f",
        images: [
          { type: "exact", src: "/charcoal_front_exact.png" },
          { type: "exact", src: "/charcoal_back_exact.png" },
        ],
      },
      {
        name: "WINE",
        hex: "#4b1b1b",
        images: [{ type: "exact", src: "/wine_front_exact.png" }],
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: {
      "CHARCOAL / S": "47851303370903",
      "CHARCOAL / M": "47851303403671",
      "CHARCOAL / L": "47851303436439",
      "CHARCOAL / XL": "47851303469207",
      "WINE / S": "47851303501975",
      "WINE / M": "47851303534743",
      "WINE / L": "47851303567511",
      "WINE / XL": "47851303600279",
    },
    details: [
      "100% NYLON",
      "LINING 100% VISCOSE",
      "OVERSIZED FIT",
      "CROPPED CUT",
      "BATWING SCULPTURAL SLEEVES",
      "SILVER-TONE ZIP CLOSURE",
      "RIBBED CUFFS AND HEM",
      "MADE IN LOS ANGELES",
      "SKETCHED, FRAMED AND SAMPLES MADE IN FRANCE DESIGN STUDIO",
      "REF: 2LB-BJ-NYL-001",
    ],
  },
  raglan: {
    name: "L'ARGENT BRÛLÉ RAGLAN LONG-SLEEVE TEE",
    price: "87 USD",
    colors: [
      {
        name: "NAVY/WHITE",
        hex: "#f8f8f8",
        images: [{ type: "exact", src: "/raglan_front_white_v2.png" }],
      },
    ],
    sizes: ["1", "2", "3", "4"],
    variants: {
      "NAVY/WHITE / 1": "47851303633047",
      "NAVY/WHITE / 2": "47851303665815",
      "NAVY/WHITE / 3": "47851303698583",
      "NAVY/WHITE / 4": "47851303731351",
    },
    details: [
      "100% SUPIMA COTTON",
      "TWO-TONE RAGLAN CONSTRUCTION",
      "SCREEN PRINTED ARCHIVE GRAPHIC",
      "OVERSIZED DRAPE",
      "MADE IN LOS ANGELES",
      "REF: 2LB-RT-COT-002",
    ],
  },
  hoodie: {
    name: "L'ARGENT BRÛLÉ LEMONDROP HOODIE",
    price: "185 USD",
    colors: [
      {
        name: "WASHED YELLOW",
        hex: "#f0e68c",
        images: [
          { type: "exact", src: "/hoodie_front_v13.png" },
          { type: "exact", src: "/hoodie_back_v10.png" },
        ],
      },
    ],
    sizes: ["S", "M", "L", "XL"],
    variants: {
      "WASHED YELLOW / S": "47851303764119",
      "WASHED YELLOW / M": "47851303796887",
      "WASHED YELLOW / L": "47851303829655",
      "WASHED YELLOW / XL": "47851303862423",
    },
    details: [
      "500 GSM HEAVYWEIGHT COTTON FLEECE",
      "HAND-WASHED VINTAGE FINISH",
      "MULTI-PLACEMENT GRAPHICS (FRONT/BACK)",
      "DOUBLE-LAYERED HOOD",
      "KANGAROO POCKET",
      "MADE IN LOS ANGELES",
      "REF: 2LB-VH-COT-003",
    ],
  },
  "leather-pants": {
    name: "\"BEAUTÉ DU CUIR\" CARPENTERS",
    price: "240 USD",
    isFullBleed: true,
    colors: [
      {
        name: "BLACK LEATHER",
        hex: "#000000",
        images: [
          { type: "exact", src: "/leather_pants_front.png" },
          { type: "exact", src: "/leather_pants_detail.png" },
          { type: "exact", src: "/leather_pants_back.jpg" },
          { type: "exact", src: "/leather_pants_back_detail.png" },
        ],
      },
    ],
    sizes: ["1|28-30", "2|30-32", "3|32-34", "4|34-36", "Custom Order|SIZING AVAILABLE"],
    variants: {
      "BLACK LEATHER / 1": "47851303895191",
      "BLACK LEATHER / 2": "47851303927959",
      "BLACK LEATHER / 3": "47851303960727",
      "BLACK LEATHER / 4": "47851303993495",
      "BLACK LEATHER / Custom Order": "47851304026263",
    },
    details: [
      "UNRELEASED ARCHIVE PIECE",
      "PREMIUM HEAVYWEIGHT LEATHER",
      "MULTI-POCKET CONSTRUCTION",
      "SILVER-TONE RIVETS",
      "RELAXED FIT",
      "MADE IN LOS ANGELES",
      "REF: 2LB-CP-LMB-005",
    ],
  },
};

function OptimizedProductImage({ imageData, alt, isFullBleed }: { imageData: any, alt: string, isFullBleed?: boolean }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={imageData.src}
        alt={alt}
        fill
        className={cn("object-cover", !isFullBleed && "object-contain mix-blend-multiply")}
        style={!isFullBleed ? { filter: 'contrast(1.1) brightness(1.05)' } : {}}
        priority
      />
    </div>
  );
}

// TEMP: replaces NotifyMeForm for testing. Restored to NotifyMeForm on "revert".
// Looks up the Shopify variant ID from product.variants["<COLOR> / <SIZE>"]
// and passes it through so PROCEED TO CHECKOUT can build the Shopify
// cart permalink end-to-end.
function AddToCart({
  handle,
  product,
  selectedColor,
  selectedSize,
}: {
  handle: string;
  product: {
    name: string;
    price: string;
    colors: { name: string; images: { src: string }[] }[];
    variants?: Record<string, string>;
  };
  selectedColor: number;
  selectedSize: string | null;
}) {
  const { addItem } = useCart();
  const [state, setState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const handleAdd = async () => {
    if (!selectedSize) return;
    setState("adding");
    setErrMsg("");
    const colorName = product.colors[selectedColor]?.name || "";
    const imageSrc = product.colors[selectedColor]?.images[0]?.src || "";
    const sizeDisplay = selectedSize.split("|")[0];
    const variantKey = `${colorName} / ${sizeDisplay}`;
    const shopifyVariantId = product.variants?.[variantKey];

    if (!shopifyVariantId) {
      setErrMsg(`No Shopify variant for "${variantKey}"`);
      setState("error");
      return;
    }

    try {
      await addItem({
        id: handle,
        name: product.name,
        price: product.price,
        image: imageSrc,
        variant: variantKey,
        shopify_variant_legacy_id: shopifyVariantId,
      });
      setState("added");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      setState("idle");
    }
  };

  const label =
    state === "adding"
      ? "ADDING…"
      : state === "added"
      ? "ADDED TO CART ✓"
      : state === "error"
      ? "ERROR — TRY AGAIN"
      : !selectedSize
      ? "SELECT SIZE"
      : "ADD TO CART";

  return (
    <div className="w-full space-y-2">
      <button
        onClick={handleAdd}
        disabled={!selectedSize || state === "adding"}
        className="w-full h-full min-h-[52px] bg-black text-white hover:bg-neutral-800 transition-colors text-[11px] font-bold tracking-[0.4em] uppercase disabled:opacity-40"
      >
        {label}
      </button>
      {errMsg && (
        <p className="text-[10px] text-red-500 tracking-wide text-center">{errMsg}</p>
      )}
    </div>
  );
}

function ProductImageViewer({ images, alt, isFullBleed }: { images: any[], alt: string, isFullBleed?: boolean }) {
  const [currentIdx, setCurrentIdx] = useState(0);

  if (isFullBleed) {
    return (
      <div className="w-full h-full overflow-y-auto hide-scrollbar flex flex-col snap-y snap-mandatory bg-black">
        {images.map((img, i) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-start">
            <OptimizedProductImage imageData={img} alt={`${alt} ${i + 1}`} isFullBleed={isFullBleed} />
          </div>
        ))}
      </div>
    );
  }

  const handleMouseEnter = () => {
    if (images.length > 1) setCurrentIdx(1);
  };

  const handleMouseLeave = () => {
    setCurrentIdx(0);
  };

  return (
    <div 
      className="relative w-full h-full group perspective-[3000px] select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIdx}
          initial={images.length > 1 ? (isFullBleed ? { opacity: 0 } : { opacity: 0, rotateY: currentIdx === 1 ? -180 : 180, scale: 0.98 }) : { opacity: 1 }}
          animate={isFullBleed ? { opacity: 1 } : { opacity: 1, rotateY: 0, scale: 1 }}
          exit={images.length > 1 ? (isFullBleed ? { opacity: 0 } : { opacity: 0, rotateY: currentIdx === 1 ? 180 : -180, scale: 0.98 }) : { opacity: 1 }}
          transition={{ 
            duration: 1.0, 
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.3 }
          }}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <OptimizedProductImage imageData={images[currentIdx]} alt={alt} isFullBleed={isFullBleed} />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && !isFullBleed && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-20 transition-opacity duration-1000">
          <RotateCcw size={9} className="text-black" />
          <span className="text-[6px] font-bold tracking-[0.5em] uppercase text-black">TECHNICAL ORBIT</span>
        </div>
      )}
    </div>
  );
}

export default function LockdownProductView({ handle }: { handle: string }) {
  const product = productData[handle];

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showSoldOut, setShowSoldOut] = useState(false);

  const handleCheckAvailability = () => {
    setIsChecking(true);
    setTimeout(() => {
      setIsChecking(false);
      setShowSoldOut(true);
    }, 2000);
  };

  if (!product) return <div className="p-20 text-center">Product not found</div>;

  return (
    <div className="w-full bg-white min-h-screen pt-20 lg:pt-0">

      {/* ── MOBILE LAYOUT ── */}
      <div className="lg:hidden">
        <div className={cn("w-full overflow-hidden", !product.isFullBleed ? "aspect-[4/5] bg-white p-6" : "aspect-[4/5] bg-black")}>
          <ProductImageViewer images={product.colors[selectedColor].images} alt={product.name} isFullBleed={product.isFullBleed} />
        </div>
        <div className="px-5 pt-4 pb-16 bg-white">
          <div className="space-y-1 mb-6">
            <h1 className="text-[16px] font-mono uppercase tracking-wide text-black">{product.name}</h1>
            <p className="text-[16px] font-mono tracking-wide text-black">{product.price}</p>
          </div>

          <div className="flex gap-3 w-full mb-4">
            <div className="relative w-1/2">
              <select 
                className="w-full appearance-none border border-black bg-transparent py-3.5 px-4 text-[12px] font-mono uppercase tracking-wider outline-none rounded-none"
                value={selectedSize || ''}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                <option value="" disabled>SIZE</option>
                {product.sizes.map((size: string) => (
                  <option key={size} value={size}>{size.split('|')[0]}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={14} className="rotate-90 text-black" strokeWidth={1.5} />
              </div>
            </div>
            <div className="relative w-1/2">
              <select 
                className="w-full appearance-none border border-black bg-transparent py-3.5 px-4 text-[12px] font-mono uppercase tracking-wider outline-none rounded-none"
                value={selectedColor}
                onChange={(e) => setSelectedColor(Number(e.target.value))}
              >
                {product.colors.map((color: any, i: number) => (
                  <option key={i} value={i}>{color.name}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <ChevronRight size={14} className="rotate-90 text-black" strokeWidth={1.5} />
              </div>
            </div>
          </div>
          <div className="w-full mb-6">
            <AddToCart handle={handle} product={product} selectedColor={selectedColor} selectedSize={selectedSize} />
            
            {/* Payment Icons Placeholder */}
            <div className="flex items-center justify-center gap-3 mt-4 text-neutral-500 font-mono text-[9px] uppercase tracking-wider">
              <span>Przelewy24</span>
              <span>•</span>
              <span>PayPal</span>
              <span>•</span>
              <span>VISA</span>
              <span>•</span>
              <span>Mastercard</span>
              <span>•</span>
              <span>Apple Pay</span>
            </div>
          </div>
          <div className="border-t border-neutral-100 divide-y divide-neutral-100">
            <div>
              <button onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')} className="w-full py-5 flex justify-between items-center text-[11px] uppercase tracking-[0.3em]">
                DETAILS <Plus size={13} strokeWidth={1} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'details' ? "max-h-[500px] pb-5" : "max-h-0")}>
                <ul className="space-y-3 text-[11px] text-neutral-500 tracking-[0.05em] leading-relaxed">
                  {product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>
            <button onClick={handleCheckAvailability} disabled={isChecking || showSoldOut} className="w-full py-5 flex justify-between items-center text-[11px] uppercase tracking-[0.3em] disabled:opacity-100">
              {isChecking ? "CHECKING AVAILABILITY..." : showSoldOut ? <span className="text-[#4a0404] animate-pulse">SOLD OUT — RODEO DRIVE, APRIL 4TH</span> : "CHECK AVAILABILITY IN STORE"}
              {!isChecking && !showSoldOut && <ChevronRight size={13} strokeWidth={1} />}
            </button>
          </div>
          <div className="pt-24 pb-12 text-center">
            <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">L&apos;ARGENT BRÛLÉ &copy; 2026</p>
          </div>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ── */}
      <div className="hidden lg:flex w-full min-h-screen">
        <div className={cn("w-full lg:w-[60%] lg:sticky lg:top-0 lg:h-screen flex items-center justify-center overflow-hidden", !product.isFullBleed ? "bg-white p-4 pt-40 lg:p-12" : "")}>
          <div className={cn("w-full", !product.isFullBleed ? "aspect-[3/4] lg:h-full lg:aspect-auto" : "h-full")}>
            <ProductImageViewer images={product.colors[selectedColor].images} alt={product.name} isFullBleed={product.isFullBleed} />
          </div>
        </div>
        <div className="w-[40%] bg-white px-20 py-32 border-l border-neutral-50">
          <div className="max-w-xl space-y-20">
            <div className="space-y-6">
              <h1 className="text-[17px] font-bold uppercase tracking-[0.2em] leading-tight text-black">{product.name}</h1>
              <p className="text-[17px] font-bold tracking-[0.1em] text-black">{product.price}</p>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">COLOR: {product.colors[selectedColor].name}</p>
              <div className="flex gap-4">
                {product.colors.map((color: any, i: number) => (
                  <button key={i} onClick={() => setSelectedColor(i)} className={cn("w-10 h-10 border transition-all p-0.5", selectedColor === i ? "border-black" : "border-neutral-50")}>
                    <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">SELECT SIZE</p>
              <div className="grid grid-cols-4 gap-3 max-w-sm">
                {product.sizes.map((size: string) => (
                  <button key={size} onClick={() => setSelectedSize(size)} className={cn("h-12 border text-[11px] font-bold tracking-widest flex flex-col items-center justify-center transition-all", selectedSize === size ? "border-black bg-black text-white" : "border-neutral-200 text-black hover:border-black")}>
                    {size.includes('|') ? (
                      <>
                        <span className={size.includes('CUSTOM') ? "text-[9px]" : ""}>{size.split('|')[0]}</span>
                        <span className={cn("opacity-70 font-medium tracking-widest mt-0.5", size.includes('CUSTOM') ? "text-[6px]" : "text-[7px]")}>{size.split('|')[1]}</span>
                      </>
                    ) : size}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-10">
              <div className="relative w-full min-h-[60px]">
                <AddToCart handle={handle} product={product} selectedColor={selectedColor} selectedSize={selectedSize} />
              </div>
            </div>
            <div className="border-t border-neutral-100 divide-y divide-neutral-100">
              <div>
                <button onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')} className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em]">
                  DETAILS <Plus size={14} strokeWidth={1} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
                </button>
                <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'details' ? "max-h-[500px] pb-12" : "max-h-0")}>
                  <ul className="space-y-4 text-[11px] text-neutral-500 font-medium tracking-[0.1em] leading-relaxed">
                    {product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                  </ul>
                </div>
              </div>
              <div>
                <button onClick={handleCheckAvailability} disabled={isChecking || showSoldOut} className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em] disabled:opacity-100">
                  {isChecking ? "CHECKING AVAILABILITY..." : showSoldOut ? <span className="text-[#4a0404] animate-pulse">SOLD OUT — RODEO DRIVE, APRIL 4TH</span> : "CHECK AVAILABILITY IN STORE"}
                  {!isChecking && !showSoldOut && <ChevronRight size={14} strokeWidth={1} />}
                </button>
              </div>
            </div>
            <div className="pt-24 pb-12 text-center">
              <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">L&apos;ARGENT BRÛLÉ &copy; 2026</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
