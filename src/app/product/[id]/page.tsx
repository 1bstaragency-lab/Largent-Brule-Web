"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import { useCart } from "@/components/cart-drawer";

const productData: Record<string, any> = {
  bomber: {
    name: "CROPPED BOMBER JACKET IN TECHNICAL NYLON",
    price: "310 USD",
    image: "/bomber_final_studio.jpg",
    colors: [
      { name: "BLACK", hex: "#000000" },
      { name: "MILITARY", hex: "#3a3d2e" }
    ],
    sizes: ["S", "M", "L", "XL"],
    details: [
      "100% NYLON",
      "LINING 100% VISCOSE",
      "OVERSIZED FIT",
      "CROPPED CUT",
      "STRUCTURED COLLAR",
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
    image: "/pants_leather_studio.png",
    colors: [
      { name: "BLACK", hex: "#000000" },
      { name: "COGNAC", hex: "#4b3621" }
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
    <div className="flex flex-col lg:flex-row w-full bg-white min-h-screen">
      
      {/* MONUMENTAL HERO IMAGE - HEADER ON MOBILE */}
      <div className="w-full lg:w-[60%] bg-[#f6f6f6] lg:sticky lg:top-0 lg:h-screen flex items-center justify-center p-4 lg:p-12">
        <div className="relative w-full h-[80vw] sm:h-[70vh] lg:h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain mix-blend-multiply"
            priority
          />
        </div>
      </div>

      {/* TECHNICAL DETAILS - VERTICAL ON MOBILE */}
      <div className="w-full lg:w-[40%] bg-white px-6 py-10 lg:px-20 lg:py-32">
        <div className="max-w-xl mx-auto lg:mx-0 space-y-10 lg:space-y-20">
          
          {/* Clinical Info */}
          <div className="space-y-6">
            <h1 className="text-[15px] lg:text-[17px] font-bold uppercase tracking-[0.2em] leading-tight text-black">
              {product.name}
            </h1>
            <p className="text-[15px] lg:text-[17px] font-bold tracking-[0.1em] text-black">
              {product.price}
            </p>
          </div>

          {/* Color Selection */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
              COLOR: {product.colors[selectedColor].name}
            </p>
            <div className="flex gap-4">
              {product.colors.map((color: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={cn(
                    "w-10 h-10 border transition-all p-0.5",
                    selectedColor === i ? "border-black" : "border-neutral-100"
                  )}
                >
                  <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection - Celine Grid */}
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
              SELECT SIZE
            </p>
            <div className="grid grid-cols-4 gap-3 max-w-sm">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "h-12 border text-[11px] font-bold tracking-widest flex items-center justify-center transition-all",
                    selectedSize === size ? "border-black bg-black text-white" : "border-neutral-200 text-black hover:border-black"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Blocks */}
          <div className="space-y-4 pt-2 lg:pt-10">
            <div className="relative w-full h-[60px]">
              <LiquidButton
                onClick={() => addItem({ id, name: product.name, price: product.price, image: product.image })}
                className="w-full h-full bg-black text-white text-[12px] font-bold tracking-[0.4em] uppercase"
              >
                ADD TO BAG
              </LiquidButton>
            </div>
            <button className="w-full h-[60px] border border-black flex items-center justify-center bg-white hover:bg-neutral-50 transition-colors">
               <span className="text-[12px] font-bold tracking-[0.4em] uppercase"> PAY</span>
            </button>
          </div>

          {/* Technical Details - Accordions */}
          <div className="border-t border-neutral-100 divide-y divide-neutral-100 mt-4 lg:mt-20">
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em]"
              >
                DETAILS
                <Plus size={14} strokeWidth={1} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'details' ? "max-h-[500px] pb-12" : "max-h-0")}>
                <ul className="space-y-4 text-[11px] text-neutral-500 font-medium tracking-[0.1em] leading-relaxed">
                  {product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>

            <div>
              <button
                onClick={handleCheckAvailability}
                disabled={isChecking || showSoldOut}
                className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em] disabled:opacity-100"
              >
                <div className="flex flex-col items-start gap-2">
                  {isChecking ? "CHECKING ARCHIVE..." : showSoldOut ? (
                    <span className="text-[#4a0404] animate-pulse">SOLD OUT — RODEO DRIVE, APRIL 4TH</span>
                  ) : "CHECK AVAILABILITY IN STORE"}
                </div>
                {!isChecking && !showSoldOut && <ChevronRight size={14} strokeWidth={1} />}
              </button>
            </div>

            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em]"
              >
                SHIPPING & RETURNS
                <Plus size={14} strokeWidth={1} className={cn("transition-transform duration-300", activeAccordion === 'shipping' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'shipping' ? "max-h-[500px] pb-12" : "max-h-0")}>
                <p className="text-[11px] text-neutral-400 leading-relaxed uppercase tracking-[0.1em]">
                  10-14 DAY WHITE GLOVE SHIPPING. PACKED WITH CARE. NO RETURNS. THIS GARMENT IS PERFECT.
                </p>
              </div>
            </div>
          </div>

          {/* Verification Signature */}
          <div className="pt-24 pb-12 text-center">
            <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">
              L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | FLAGSHIP V4.0 FRESH
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
