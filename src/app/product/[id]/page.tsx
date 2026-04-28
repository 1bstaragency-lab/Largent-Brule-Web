"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
        name: "WINE", 
        hex: "#4b1b1b", 
        images: [
          { type: 'exact', src: "/wine_front_exact.png" },
          { type: 'color-replace', src: "/charcoal_back_exact.png", targetColor: '#4b1b1b' }
        ] 
      },
      { 
        name: "CHARCOAL", 
        hex: "#2f2f2f", 
        images: [
          { type: 'exact', src: "/charcoal_front_exact.png" },
          { type: 'exact', src: "/charcoal_back_exact.png" }
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

function ColorReplacedImage({ src, targetColor, alt, className }: { src: string, targetColor: string, alt: string, className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processedSrc, setProcessedSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new (window as any).Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const r_target = parseInt(targetColor.slice(1, 3), 16);
      const g_target = parseInt(targetColor.slice(3, 5), 16);
      const b_target = parseInt(targetColor.slice(5, 7), 16);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a > 0 && (r < 250 || g < 250 || b < 250)) {
          const intensity = (r + g + b) / 3;
          const factor = intensity / 255;
          data[i] = r_target * (factor + 0.3);
          data[i + 1] = g_target * (factor + 0.3);
          data[i + 2] = b_target * (factor + 0.3);
        } else if (r >= 250 && g >= 250 && b >= 250) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      setProcessedSrc(canvas.toDataURL());
    };
  }, [src, targetColor]);

  return (
    <div className={cn("relative w-full h-full", className)}>
      <canvas ref={canvasRef} className="hidden" />
      {processedSrc ? (
        <Image
          src={processedSrc}
          alt={alt}
          fill
          className="object-contain"
          priority
        />
      ) : (
        <div className="w-full h-full bg-white animate-pulse" />
      )}
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
      className="relative w-full h-full cursor-pointer group perspective-[3000px] select-none"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentIdx}
          initial={{ opacity: 0, rotateY: currentIdx === 1 ? -180 : 180, scale: 0.95 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: currentIdx === 1 ? 180 : -180, scale: 0.95 }}
          transition={{ 
            duration: 1.2, 
            ease: [0.23, 1, 0.32, 1], // Monumental Liquid Ease
            opacity: { duration: 0.4 }
          }}
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {images[currentIdx].type === 'color-replace' ? (
            <ColorReplacedImage 
              src={images[currentIdx].src} 
              targetColor={images[currentIdx].targetColor} 
              alt={alt} 
            />
          ) : (
            <div className="relative w-full h-full">
              <Image
                src={images[currentIdx].src}
                alt={alt}
                fill
                className="object-contain mix-blend-multiply"
                style={{ filter: 'contrast(1.05) brightness(1.02)' }}
                priority
              />
            </div>
          )}
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
        <div className="w-full aspect-square bg-white p-10 overflow-hidden">
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
