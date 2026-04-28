"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus, RotateCcw } from "lucide-react";
import { useCart } from "@/components/cart-drawer";
import { motion, AnimatePresence } from "framer-motion";

const productData: Record<string, any> = {
  bomber: {
    name: "CROPPED BOMBER JACKET IN TECHNICAL NYLON",
    price: "310 USD",
    colors: [
      { 
        name: "CHARCOAL", 
        hex: "#2f2f2f", 
        images: [
          { type: 'exact', src: "/charcoal_front_exact.png" },
          { type: 'exact', src: "/charcoal_back_exact.png" }
        ] 
      },
      { 
        name: "WINE", 
        hex: "#4b1b1b", 
        images: [
          { type: 'exact', src: "/wine_front_exact.png" }
        ] 
      }
    ],
    sizes: ["S", "M", "L", "XL"],
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
      "REF: 2LB-BJ-NYL-001"
    ]
  },
  pants: {
    name: "CARGO LEATHER PANTS IN LAMBSKIN",
    price: "240 USD",
    colors: [
      { 
        name: "BLACK", 
        hex: "#000000",
        images: [{ type: 'exact', src: "/pants_leather_studio.png" }]
      }
    ],
    sizes: ["30", "32", "34", "36", "38"],
    details: [
      "100% LAMBSKIN",
      "LINING 100% SILK",
      "STRAIGHT LEG",
      "MULTI-POCKET CONSTRUCTION",
      "SILVER-TONE RIVETS",
      "CUSTOM 'LB' ENGRAVED BUTTON",
      "MADE IN LOS ANGELES",
      "SKETCHED, FRAMED AND SAMPLES MADE IN FRANCE DESIGN STUDIO",
      "REF: 2LB-CP-LMB-004"
    ]
  }
};

function OptimizedProductImage({ imageData, alt }: { imageData: any, alt: string }) {
  return (
    <div className="relative w-full h-full">
      <Image
        src={imageData.src}
        alt={alt}
        fill
        className="object-contain mix-blend-multiply"
        style={{ filter: 'contrast(1.15) brightness(1.1)' }}
        priority
      />
    </div>
  );
}

function ProductImageViewer({ images, alt }: { images: any[], alt: string }) {
  const [currentIdx, setCurrentIdx] = useState(0);

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
          initial={images.length > 1 ? { opacity: 0, rotateY: currentIdx === 1 ? -180 : 180, scale: 0.98 } : { opacity: 1 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={images.length > 1 ? { opacity: 0, rotateY: currentIdx === 1 ? 180 : -180, scale: 0.98 } : { opacity: 1 }}
          transition={{ 
            duration: 1.0, 
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.3 }
          }}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <OptimizedProductImage imageData={images[currentIdx]} alt={alt} />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0 group-hover:opacity-20 transition-opacity duration-1000">
          <RotateCcw size={9} className="text-black" />
          <span className="text-[6px] font-bold tracking-[0.5em] uppercase text-black">TECHNICAL ORBIT</span>
        </div>
      )}
    </div>
  );
}

export default function ProductPage() {
  const params = useParams();
  const id = params.id as string;
  const product = productData[id];
  const { addItem } = useCart();

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
      <div className="lg:hidden bg-white">
        <div className="w-full aspect-square bg-white p-6 overflow-hidden mix-blend-multiply">
          <ProductImageViewer images={product.colors[selectedColor].images} alt={product.name} />
        </div>
        <div className="px-5 pt-6 pb-16 space-y-7 bg-white">
          <div>
            <p className="text-[12px] uppercase tracking-[0.18em] leading-snug text-black font-medium">{product.name}</p>
            <p className="text-[14px] font-bold tracking-[0.05em] text-black mt-1.5">{product.price}</p>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-black">{product.colors[selectedColor].name}</p>
            <div className="flex gap-3">
              {product.colors.map((color: any, i: number) => (
                <button key={i} onClick={() => setSelectedColor(i)} className={cn("w-9 h-9 border transition-all p-0.5", selectedColor === i ? "border-black" : "border-neutral-100")}>
                  <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.35em] text-black">SELECT SIZE</p>
            <div className="flex gap-2 flex-wrap">
              {product.sizes.map((size: string) => (
                <button key={size} onClick={() => setSelectedSize(size)} className={cn("h-11 min-w-[52px] px-3 border text-[11px] font-medium tracking-wider flex items-center justify-center transition-all", selectedSize === size ? "border-black bg-black text-white" : "border-neutral-100 text-black")}>
                  {size}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3 pt-1">
            <button
              onClick={() => addItem({ 
                id: `${id}-${product.colors[selectedColor].name}`, 
                name: `${product.name} - ${product.colors[selectedColor].name}`, 
                price: product.price, 
                image: product.colors[selectedColor].images[0].src 
              })}
              className="w-full h-[52px] bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase"
            >
              ADD TO BAG
            </button>
            
            {/* Apple Pay Mobile Only */}
            <button className="w-full h-[52px] bg-black text-white flex items-center justify-center rounded-md transition-all active:scale-[0.98]">
              <svg width="60" height="25" viewBox="0 0 100 42" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.9 14.5c.3-3.8 3.5-6.8 7.3-6.8 3.7 0 6.6 2.6 7 6.1-3.6.2-6.5 2.5-7.3 5.6-.4 1.4-.4 3 .2 4.3.7 1.4 1.9 2.4 3.4 2.8 1.4.3 3 .1 4.3-.6 1.1-.6 2-1.7 2.4-2.9l.1-.3V28h5.2V7.1c-.8-.2-1.6-.3-2.5-.3-4.5 0-8.4 2.7-10.1 6.6l-.2.5L12.9 14.5zM45.5 19.8c.2-4.1 3.4-7.4 7.6-7.4 4.1 0 7.3 3.3 7.6 7.4h-15.2zm7.6-11.8c-6.8 0-12.4 5.3-12.8 12h25.6c-.4-6.7-6-12-12.8-12zM75.1 19.8c.2-4.1 3.4-7.4 7.6-7.4 4.1 0 7.3 3.3 7.6 7.4H75.1zm7.6-11.8c-6.8 0-12.4 5.3-12.8 12h25.6c-.4-6.7-6-12-12.8-12z" fill="white"/>
                <path d="M18.4 2.9C17.4 4.1 15.8 4.9 14.3 4.8c-.2-1.5.5-3.1 1.6-4.2 1.1-1.1 2.7-1.9 4.1-1.8.2 1.6-.6 3-1.6 4.1" fill="white"/>
              </svg>
            </button>
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
      <div className="hidden lg:flex w-full min-h-screen bg-white">
        <div className="w-full lg:w-[60%] bg-white lg:sticky lg:top-0 lg:h-screen flex items-center justify-center p-4 pt-40 lg:p-12 overflow-hidden">
          <div className="w-full aspect-[3/4] lg:h-full lg:aspect-auto">
            <ProductImageViewer images={product.colors[selectedColor].images} alt={product.name} />
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
                  <button key={size} onClick={() => setSelectedSize(size)} className={cn("h-12 border text-[11px] font-bold tracking-widest flex items-center justify-center transition-all", selectedSize === size ? "border-black bg-black text-white" : "border-neutral-200 text-black hover:border-black")}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4 pt-10">
              <div className="relative w-full h-[60px]">
                <LiquidButton
                  onClick={() => addItem({ 
                    id: `${id}-${product.colors[selectedColor].name}`, 
                    name: `${product.name} - ${product.colors[selectedColor].name}`, 
                    price: product.price, 
                    image: product.colors[selectedColor].images[0].src 
                  })}
                  className="w-full h-full bg-black text-white text-[12px] font-bold tracking-[0.4em] uppercase"
                >
                  ADD TO BAG
                </LiquidButton>
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
