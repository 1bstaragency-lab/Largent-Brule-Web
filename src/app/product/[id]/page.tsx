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
          <div className="space-y-4 pt-1">
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
            
            {/* Apple Pay Mobile Only - Precision Scaled */}
            <button className="w-full h-[52px] bg-black text-white flex items-center justify-center rounded-none transition-all active:scale-[0.98]">
              <svg width="84" height="34" viewBox="0 0 84 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.6667 9.16667C11.6667 6.4 13.9 4.16667 16.6667 4.16667C19.4333 4.16667 21.6667 6.4 21.6667 9.16667C21.6667 11.9333 19.4333 14.1667 16.6667 14.1667C13.9 14.1667 11.6667 11.9333 11.6667 9.16667Z" fill="white"/>
                <path d="M30.8333 12.5V25.8333H35V12.5H30.8333ZM51.6667 12.5C49.3333 12.5 47.5 13.6667 46.6667 15.5V12.5H42.5V30H46.6667V24.1667C47.5 26 49.3333 27.1667 51.6667 27.1667C55.6667 27.1667 58.3333 23.8333 58.3333 19.8333C58.3333 15.8333 55.6667 12.5 51.6667 12.5ZM50.8333 23.1667C48.5 23.1667 46.6667 21.5 46.6667 19.8333C46.6667 18.1667 48.5 16.5 50.8333 16.5C53.1667 16.5 55 18.1667 55 19.8333C55 21.5 53.1667 23.1667 50.8333 23.1667ZM71.6667 12.5C69.3333 12.5 67.5 13.6667 66.6667 15.5V12.5H62.5V30H66.6667V24.1667C67.5 26 69.3333 27.1667 71.6667 27.1667C75.6667 27.1667 78.3333 23.8333 78.3333 19.8333C78.3333 15.8333 75.6667 12.5 71.6667 12.5ZM70.8333 23.1667C68.5 23.1667 66.6667 21.5 66.6667 19.8333C66.6667 18.1667 68.5 16.5 70.8333 16.5C73.1667 16.5 75 18.1667 75 19.8333C75 21.5 73.1667 23.1667 70.8333 23.1667Z" fill="white"/>
                <path d="M19.1667 27.5C18.3333 28.3333 17.5 29.1667 16.6667 29.1667C15.8333 29.1667 15 28.3333 14.1667 27.5C12.5 25.8333 11.6667 23.3333 11.6667 20.8333C11.6667 18.3333 12.5 15.8333 14.1667 14.1667C15.8333 12.5 18.3333 11.6667 20.8333 11.6667C23.3333 11.6667 25.8333 12.5 27.5 14.1667C29.1667 15.8333 30 18.3333 30 20.8333C30 23.3333 29.1667 25.8333 27.5 27.5C26.6667 28.3333 25.8333 29.1667 25 29.1667C24.1667 29.1667 23.3333 28.3333 22.5 27.5" fill="white"/>
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
