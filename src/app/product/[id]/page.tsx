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
    <div className="product-page-root">
      <style jsx>{`
        .product-page-root {
          display: flex;
          flex-direction: column;
          width: 100%;
          background-color: #fff;
          min-height: 100vh;
        }

        .product-hero-image {
          width: 100%;
          background-color: #f6f6f6;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          height: 140vw;
        }

        .product-details-container {
          width: 100%;
          padding: 80px 32px 100px;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .product-page-root {
            flex-direction: row;
          }
          .product-hero-image {
            width: 60%;
            height: 100vh;
            position: sticky;
            top: 0;
          }
          .product-details-container {
            width: 40%;
            padding: 120px 80px;
          }
        }

        .clinical-header {
          margin-bottom: 60px;
        }

        .clinical-header h1 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          line-height: 1.4;
          margin-bottom: 16px;
        }

        .clinical-header p {
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .size-grid {
          display: grid;
          grid-template-cols: repeat(4, 1fr);
          gap: 12px;
          margin-top: 24px;
        }

        .action-block {
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .size-button {
          height: 50px;
          border: 1px solid #e5e5e5;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          transition: all 0.3s ease;
          background: #fff;
        }

        .size-button.selected {
          border-color: #000;
          background-color: #000;
          color: #fff;
        }
      `}</style>

      {/* MONUMENTAL IMAGE - NO SQUEEZING POSSIBLE */}
      <div className="product-hero-image">
        <div className="relative w-full h-full">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain mix-blend-multiply"
            priority
          />
        </div>
      </div>

      {/* TECHNICAL DETAILS - FULL WIDTH MANDATE */}
      <div className="product-details-container">
        <div className="max-w-xl mx-auto lg:mx-0">
          {/* Header */}
          <div className="clinical-header">
            <h1>{product.name}</h1>
            <p>{product.price}</p>
          </div>

          {/* Color Selector */}
          <div className="space-y-6 mb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400">COLOR: {product.colors[selectedColor].name}</p>
            <div className="flex gap-4">
              {product.colors.map((color: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedColor(i)}
                  className={cn(
                    "w-8 h-8 border transition-all p-0.5",
                    selectedColor === i ? "border-black" : "border-neutral-100"
                  )}
                >
                  <div className="w-full h-full" style={{ backgroundColor: color.hex }} />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="mb-16">
            <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-neutral-400">SELECT SIZE</p>
            <div className="size-grid">
              {product.sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={cn("size-button", selectedSize === size && "selected")}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-block">
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

          {/* Minimalist Accordions */}
          <div className="border-t border-neutral-100 divide-y divide-neutral-100 mt-20">
            <div>
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'details' ? null : 'details')}
                className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em]"
              >
                DETAILS
                <Plus size={14} strokeWidth={1} className={cn("transition-transform duration-300", activeAccordion === 'details' && "rotate-45")} />
              </button>
              <div className={cn("overflow-hidden transition-all duration-500", activeAccordion === 'details' ? "max-h-[500px] pb-12" : "max-h-0")}>
                <ul className="space-y-4 text-[11px] text-neutral-400 font-medium tracking-[0.1em] leading-relaxed">
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

          <div className="pt-24 text-center">
            <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">
              L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | FLAGSHIP V3.2
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
