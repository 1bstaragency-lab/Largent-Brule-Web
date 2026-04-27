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
    <div className="flex flex-col lg:flex-row min-h-screen bg-white w-full overflow-x-hidden">
      
      {/* MONUMENTAL IMAGE - Vertical on Mobile, Left-Anchor on Desktop */}
      <div className="w-full lg:w-[60%] bg-[#f0eeeb] lg:sticky lg:top-0 lg:h-screen flex items-center justify-center">
        <div className="relative w-full h-[80vw] sm:h-[60vh] lg:h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover lg:object-contain mix-blend-multiply"
            priority
          />
        </div>
      </div>

      {/* TECHNICAL DETAILS - Full Width on Mobile, Right-Anchor on Desktop */}
      <div className="w-full lg:w-[40%] bg-white px-6 py-10 lg:px-14 lg:pt-14">
        <div className="space-y-8 max-w-xl mx-auto lg:mx-0">
          {/* Name + Price */}
          <div className="space-y-2 text-left">
            <p className="text-[14px] lg:text-[15px] uppercase tracking-[0.1em] font-bold leading-tight">{product.name}</p>
            <p className="text-[16px] lg:text-[18px] font-bold tracking-tight">{product.price}</p>
          </div>

          {/* Color */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em]">{product.colors[selectedColor].name}</p>
            <div className="flex gap-3">
              {product.colors.map((color: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={cn(
                    "w-10 h-10 border-2 transition-all",
                    selectedColor === i ? "border-black" : "border-transparent ring-1 ring-neutral-200"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sizes - Celine Horizontal Spec */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]">SELECT SIZE</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[64px] h-12 border text-[11px] font-bold tracking-widest flex items-center justify-center transition-all",
                    selectedSize === size ? "border-black bg-black text-white" : "border-neutral-300 text-black hover:border-black"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Block */}
          <div className="space-y-3 pt-4">
            <button className="w-full h-[55px] border border-black flex items-center justify-center bg-white hover:bg-neutral-50 transition-colors">
               <span className="text-[12px] font-bold tracking-[0.4em] uppercase"> PAY</span>
            </button>
            <div className="relative w-full h-[55px]">
              <LiquidButton
                onClick={() => addItem({ id, name: product.name, price: product.price, image: product.image })}
                className="w-full h-full bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase"
              >
                ADD TO CART
              </LiquidButton>
            </div>
          </div>

          {/* Accordions */}
          <div className="border-t border-neutral-200 divide-y divide-neutral-200 mt-10">
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em]"
              >
                DETAILS
                <Plus size={16} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'details' ? "max-h-[500px] pb-6" : "max-h-0")}>
                <ul className="pb-4 space-y-3 text-[11px] text-neutral-500 font-medium tracking-wide">
                  {product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>

            <div>
              <button
                onClick={handleCheckAvailability}
                disabled={isChecking || showSoldOut}
                className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em] disabled:opacity-100"
              >
                <div className="flex flex-col items-start gap-1">
                  {isChecking ? "CHECKING ARCHIVE..." : showSoldOut ? (
                    <span className="text-[#4a0404] animate-pulse">SOLD OUT — RODEO DRIVE, APRIL 4TH</span>
                  ) : "CHECK AVAILABILITY IN STORE"}
                </div>
                {!isChecking && !showSoldOut && <ChevronRight size={16} />}
              </button>
            </div>

            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                className="w-full py-6 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.3em]"
              >
                SHIPPING & RETURNS
                <Plus size={16} className={cn("transition-transform duration-300", activeAccordion === 'shipping' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'shipping' ? "max-h-[500px] pb-6" : "max-h-0")}>
                <p className="text-[11px] text-neutral-500 leading-relaxed uppercase tracking-[0.1em]">
                  10-14 DAY WHITE GLOVE SHIPPING. PACKED WITH CARE. NO RETURNS. THIS GARMENT IS PERFECT.
                </p>
              </div>
            </div>
          </div>

          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.3em] text-center pt-10">
            L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | FLAGSHIP V2.3
          </p>
        </div>
      </div>
    </div>
  );
}
