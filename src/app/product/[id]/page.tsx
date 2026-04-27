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
      {/* Left: Image Section - Monumental & Vertical on Mobile */}
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

      {/* Right: Details Section - Full Width on Mobile */}
      <div className="w-full lg:w-[40%] bg-white">
        <div className="px-6 py-10 lg:px-14 lg:pt-14 space-y-8">

          {/* Name + Price */}
          <div>
            <p className="text-[12px] uppercase tracking-wide font-normal text-black leading-tight">{product.name}</p>
            <p className="text-[14px] font-bold tracking-tight text-black mt-1">{product.price}</p>
          </div>

          {/* Color */}
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-[0.15em] font-medium">{product.colors[selectedColor].name}</p>
            <div className="flex gap-2">
              {product.colors.map((color: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={cn(
                    "w-9 h-9 border-2 transition-all",
                    selectedColor === i ? "border-black" : "border-transparent outline outline-1 outline-neutral-300"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
              ))}
            </div>
          </div>

          {/* Sizes — Horizontal row, all visible */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "min-w-[56px] h-11 px-3 border text-[11px] font-bold tracking-widest uppercase flex items-center justify-center transition-all",
                    selectedSize === size
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 text-black hover:border-black"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.25em] hover:opacity-50 transition-opacity">
              SIZE GUIDE <ChevronRight size={11} strokeWidth={2.5} />
            </button>
          </div>

          {/* ADD TO BAG */}
          <div className="space-y-3">
            <button className="w-full h-[52px] border border-black flex items-center justify-center hover:bg-neutral-50 transition-colors bg-white">
               <span className="text-[12px] font-bold tracking-[0.3em] uppercase"> PAY</span>
            </button>
            <div className="relative w-full h-[52px]">
              <LiquidButton
                onClick={() => addItem({ id, name: product.name, price: product.price, image: product.image })}
                className="w-full h-full bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase"
              >
                ADD TO SELECTION
              </LiquidButton>
            </div>
          </div>

          {/* Fine print */}
          <p className="text-[9px] leading-relaxed text-neutral-400 uppercase tracking-wide">
            I ACCEPT THE <Link href="#" className="underline">GENERAL CONDITIONS OF SALE</Link>, AND CONSENT TO THE PROCESSING OF MY DATA, IN ACCORDANCE WITH THE <Link href="#" className="underline">PRIVACY POLICY</Link>.
          </p>

          {/* Accordions — thin Celine-style dividers */}
          <div className="border-t border-neutral-200 divide-y divide-neutral-200">

            {/* Details */}
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                DETAILS
                <Plus size={14} className={cn("transition-transform duration-300 flex-shrink-0", activeAccordion === 'details' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'details' ? "max-h-[500px] pb-6" : "max-h-0")}>
                <ul className="space-y-2 text-[11px] text-neutral-500 font-medium">
                  {product.details.map((d: string, i: number) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            </div>

            {/* Care */}
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                CARE AND MAINTENANCE
                <Plus size={14} className={cn("transition-transform duration-300 flex-shrink-0", activeAccordion === 'care' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'care' ? "max-h-[500px] pb-6" : "max-h-0")}>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  TO PRESERVE THE QUALITY OF THIS PIECE, WE RECOMMEND SPECIALIST CLEANING ONLY. AVOID CONTACT WITH LIGHT-COLORED FABRICS AS COLOR MAY TRANSFER. STORE IN A COOL, DRY PLACE AWAY FROM DIRECT SUNLIGHT.
                </p>
              </div>
            </div>

            {/* Availability */}
            <div>
              <button
                onClick={handleCheckAvailability}
                disabled={isChecking || showSoldOut}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.25em] disabled:cursor-default"
              >
                <span>
                  {isChecking ? "CHECKING..." : showSoldOut ? (
                    <span className="text-[#4a0404] animate-pulse">SOLD OUT — LAST POP UP RODEO DRIVE, APRIL 4TH</span>
                  ) : "CHECK AVAILABILITY IN STORE"}
                </span>
                {!isChecking && !showSoldOut && <ChevronRight size={14} className="flex-shrink-0" />}
              </button>
            </div>

            {/* Shipping */}
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                SHIPPING
                <Plus size={14} className={cn("transition-transform duration-300 flex-shrink-0", activeAccordion === 'shipping' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'shipping' ? "max-h-[300px] pb-6" : "max-h-0")}>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  10-14 DAY SHIPPING. WHITE GLOVE SERVICE. PACKED AND HANDLED WITH CARE. EXCLUSIVE PINS AND STICKERS INCLUDED IN EVERY SELECTION.
                </p>
              </div>
            </div>

            {/* Returns */}
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'returns' ? null : 'returns')}
                className="w-full py-5 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.25em]"
              >
                RETURN POLICY
                <Plus size={14} className={cn("transition-transform duration-300 flex-shrink-0", activeAccordion === 'returns' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'returns' ? "max-h-[200px] pb-6" : "max-h-0")}>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
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

