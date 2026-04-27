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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white">
      {/* Left: Image Section */}
      <div className="w-full lg:w-[60%] bg-[#f6f6f6] flex items-center justify-center p-6 lg:p-20 lg:sticky lg:top-0 lg:h-screen">
        <div className="relative w-full aspect-[3/4] lg:h-full">
          <Image 
            src={product.image} 
            alt={product.name} 
            fill 
            className="object-contain mix-blend-multiply"
            priority
          />
        </div>
      </div>

      {/* Right: Details Section */}
      <div className="w-full lg:w-[40%] p-8 lg:p-16 overflow-y-auto bg-white">
        <div className="max-w-[400px] mx-auto lg:mx-0 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-[12px] font-bold tracking-widest uppercase">{product.name}</h1>
            <p className="text-[13px] font-bold">{product.price}</p>
          </div>

          {/* Color Selector */}
          <div className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider">{product.colors[selectedColor].name}</p>
            <div className="flex gap-2">
              {product.colors.map((color: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={cn(
                    "w-8 h-8 border p-0.5 transition-all",
                    selectedColor === i ? "border-black" : "border-transparent"
                  )}
                >
                  <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "w-12 h-10 border text-[11px] font-medium flex items-center justify-center transition-all",
                    selectedSize === size ? "border-black bg-black text-white" : "border-neutral-200 hover:border-neutral-400"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-60 transition-opacity mt-4">
              SIZE GUIDE <ChevronRight size={12} strokeWidth={3} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button className="w-full h-[50px] border border-black flex items-center justify-center gap-2 hover:bg-neutral-50 transition-colors bg-white">
              <span className="text-lg font-medium tracking-tighter"> Pay</span>
            </button>
            <div className="block relative w-full h-[50px]">
              <LiquidButton 
                onClick={() => addItem({
                  id: id,
                  name: product.name,
                  price: product.price,
                  image: product.image
                })}
                className="w-full h-full bg-black text-white text-[11px] font-bold tracking-widest uppercase"
              >
                ADD TO BAG
              </LiquidButton>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-[9px] leading-relaxed text-neutral-400 uppercase tracking-wide">
              I ACCEPT THE <Link href="#" className="underline">GENERAL CONDITIONS OF SALE</Link>, AND CONSENT TO THE PROCESSING OF MY DATA, IN ACCORDANCE WITH THE <Link href="#" className="underline">PRIVACY POLICY</Link>.
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider">
              ESTIMATED DELIVERY DATE: <span className="opacity-60">STARTING FROM WEDNESDAY APRIL 29</span>
            </p>
          </div>

          {/* Accordions */}
          <div className="border-t border-neutral-100 pt-2">
            {/* Details */}
            <div className="border-b border-neutral-100">
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest"
              >
                DETAILS
                <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
              </button>
              <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                activeAccordion === 'details' ? "max-h-[500px] pb-6" : "max-h-0"
              )}>
                <ul className="text-[11px] space-y-2 text-neutral-500 font-medium">
                  {product.details.map((detail: string, i: number) => (
                    <li key={i}>{detail}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Care and Maintenance */}
            <div className="border-b border-neutral-100">
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest"
              >
                CARE AND MAINTENANCE
                <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'care' && "rotate-45")} />
              </button>
              <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                activeAccordion === 'care' ? "max-h-[500px] pb-6" : "max-h-0"
              )}>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-medium">
                  TO PRESERVE THE QUALITY OF THIS PIECE, WE RECOMMEND SPECIALIST CLEANING ONLY. AVOID CONTACT WITH LIGHT-COLORED FABRICS AS COLOR MAY TRANSFER. STORE IN A COOL, DRY PLACE AWAY FROM DIRECT SUNLIGHT.
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="space-y-4 pt-6">
            <div className="space-y-2">
              <button 
                onClick={handleCheckAvailability}
                disabled={isChecking || showSoldOut}
                className="w-full flex justify-between items-center text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity disabled:opacity-100"
              >
                {isChecking ? "CHECKING ARCHIVE..." : showSoldOut ? (
                  <span className="text-[#4a0404] animate-pulse">SOLD OUT</span>
                ) : "CHECK AVAILABILITY IN STORE"}
                {!isChecking && !showSoldOut && <ChevronRight size={14} />}
              </button>
              {showSoldOut && (
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 animate-in fade-in slide-in-from-top-1 duration-500">
                  LAST POP UP RODEO DRIVE, APRIL 4TH
                </p>
              )}
            </div>
            {/* Shipping */}
            <div className="border-b border-neutral-100">
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest"
              >
                SHIPPING
                <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'shipping' && "rotate-45")} />
              </button>
              <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                activeAccordion === 'shipping' ? "max-h-[500px] pb-6" : "max-h-0"
              )}>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-medium uppercase tracking-widest">
                  10-14 DAY SHIPPING. WHITE GLOVE SERVICE. PACKED AND HANDLED WITH CARE. EXCLUSIVE PINS AND STICKERS INCLUDED IN EVERY SELECTION.
                </p>
              </div>
            </div>
            {/* Return Policy */}
            <div className="border-b border-neutral-100">
              <button 
                onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-widest"
              >
                RETURN POLICY
                <Plus size={14} className={cn("transition-transform duration-300", activeAccordion === 'returns' && "rotate-45")} />
              </button>
              <div className={cn(
                "transition-all duration-500 ease-in-out overflow-hidden",
                activeAccordion === 'returns' ? "max-h-[500px] pb-6" : "max-h-0"
              )}>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-medium uppercase tracking-widest">
                  NO RETURNS. THIS GARMENT IS PERFECT. TRUST US.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
