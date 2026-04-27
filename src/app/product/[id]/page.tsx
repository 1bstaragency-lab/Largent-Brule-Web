"use client";

import Image from "next/image";
import Link from "next/link";
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

  if (!product) return <div>Product not found</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-white overflow-x-hidden">
      {/* Left: Image Section - Monumental & Edge-to-Edge */}
      <div className="w-full lg:w-[60%] bg-[#f6f6f6] flex items-center justify-center p-0 lg:p-20 lg:sticky lg:top-0 lg:h-screen">
        <div className="relative w-full aspect-[3/4] lg:h-full">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-cover lg:object-contain mix-blend-multiply"
            priority
          />
        </div>
      </div>

      {/* Right: Details Section - Celine Technical Minimalism */}
      <div className="w-full lg:w-[40%] p-6 lg:p-16 bg-white space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-[14px] lg:text-[16px] font-bold tracking-[0.1em] uppercase leading-tight">{product.name}</h1>
          <p className="text-[14px] lg:text-[16px] font-bold tracking-tight">{product.price}</p>
        </div>

        {/* Color Selector */}
        <div className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">{product.colors[selectedColor].name}</p>
          <div className="flex gap-2">
            {product.colors.map((color: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedColor(i)}
                className={cn(
                  "w-10 h-10 border transition-all",
                  selectedColor === i ? "border-black" : "border-transparent"
                )}
              >
                <div className="w-full h-full p-0.5">
                  <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Size Selector */}
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {product.sizes.map((size: string) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={cn(
                  "h-12 border text-[11px] font-bold tracking-widest flex items-center justify-center transition-all",
                  selectedSize === size ? "border-black bg-black text-white" : "border-neutral-200 hover:border-neutral-400"
                )}
              >
                {size}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-60 transition-opacity mt-4">
            SIZE GUIDE <ChevronRight size={12} strokeWidth={2} />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4">
          <div className="block relative w-full h-[55px]">
            <LiquidButton 
              onClick={() => addItem({
                id: id,
                name: product.name,
                price: product.price,
                image: product.image
              })}
              className="w-full h-full bg-black text-white text-[12px] font-bold tracking-[0.3em] uppercase"
            >
              ADD TO BAG
            </LiquidButton>
          </div>
          <button className="w-full h-[55px] border border-black flex items-center justify-center hover:bg-neutral-50 transition-colors bg-white">
            <span className="text-[12px] font-bold tracking-[0.3em] uppercase"> PAY</span>
          </button>
        </div>

        {/* Accordions - Celine Minimalist Dividers */}
        <div className="border-t border-neutral-100 divide-y divide-neutral-100">
          {/* Details */}
          <div>
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
              className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              DETAILS
              <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
            </button>
            <div className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              activeAccordion === 'details' ? "max-h-[500px] pb-8" : "max-h-0"
            )}>
              <ul className="text-[11px] space-y-3 text-neutral-500 font-medium tracking-wide">
                {product.details.map((detail: string, i: number) => (
                  <li key={i}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Care */}
          <div>
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
              className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              CARE AND MAINTENANCE
              <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'care' && "rotate-45")} />
            </button>
            <div className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              activeAccordion === 'care' ? "max-h-[500px] pb-8" : "max-h-0"
            )}>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-medium uppercase tracking-[0.1em]">
                TO PRESERVE THE QUALITY OF THIS PIECE, WE RECOMMEND SPECIALIST CLEANING ONLY. AVOID CONTACT WITH LIGHT-COLORED FABRICS AS COLOR MAY TRANSFER. STORE IN A COOL, DRY PLACE AWAY FROM DIRECT SUNLIGHT.
              </p>
            </div>
          </div>

          {/* Store Availability */}
          <div>
            <button 
              onClick={handleCheckAvailability}
              disabled={isChecking || showSoldOut}
              className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em] disabled:opacity-100"
            >
              <div className="flex flex-col items-start gap-1">
                {isChecking ? "CHECKING ARCHIVE..." : showSoldOut ? (
                  <span className="text-[#4a0404] animate-pulse">SOLD OUT</span>
                ) : "CHECK AVAILABILITY IN STORE"}
                {showSoldOut && (
                  <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 animate-in fade-in slide-in-from-top-1 duration-500">
                    LAST POP UP RODEO DRIVE, APRIL 4TH
                  </p>
                )}
              </div>
              {!isChecking && !showSoldOut && <ChevronRight size={14} />}
            </button>
          </div>

          {/* Shipping */}
          <div>
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
              className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              SHIPPING
              <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'shipping' && "rotate-45")} />
            </button>
            <div className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              activeAccordion === 'shipping' ? "max-h-[500px] pb-8" : "max-h-0"
            )}>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-medium uppercase tracking-[0.1em]">
                10-14 DAY SHIPPING. WHITE GLOVE SERVICE. PACKED AND HANDLED WITH CARE. EXCLUSIVE PINS AND STICKERS INCLUDED IN EVERY SELECTION.
              </p>
            </div>
          </div>

          {/* Return Policy */}
          <div>
            <button 
              onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
              className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em]"
            >
              RETURN POLICY
              <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'returns' && "rotate-45")} />
            </button>
            <div className={cn(
              "transition-all duration-500 ease-in-out overflow-hidden",
              activeAccordion === 'returns' ? "max-h-[500px] pb-8" : "max-h-0"
            )}>
              <p className="text-[11px] text-neutral-500 leading-relaxed font-medium uppercase tracking-[0.1em]">
                NO RETURNS. THIS GARMENT IS PERFECT. TRUST US.
              </p>
            </div>
          </div>
        </div>

        {/* Policy Notice */}
        <div className="pt-4">
          <p className="text-[9px] leading-relaxed text-neutral-400 uppercase tracking-widest">
            I ACCEPT THE <Link href="#" className="underline">GENERAL CONDITIONS OF SALE</Link>, AND CONSENT TO THE PROCESSING OF MY DATA, IN ACCORDANCE WITH THE <Link href="#" className="underline">PRIVACY POLICY</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
