"use client"

import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-drawer";
import { cn } from "@/lib/utils";

export function CartToggle() {
  const { items, setIsOpen, showAdded } = useCart();
  
  if (items.length === 0) return null;

  return (
    <button 
      onClick={() => setIsOpen(true)}
      className={cn(
        "fixed top-28 lg:top-12 right-6 lg:right-10 z-[3000] flex items-center gap-2 group transition-all duration-300 p-1 px-2 rounded-full border border-white/10 shadow-lg",
        showAdded 
          ? "bg-[#4a0404] opacity-0 scale-95" 
          : "bg-[#4a0404]/80 backdrop-blur-md hover:bg-[#4a0404] text-white opacity-100 scale-100"
      )}
    >
      <div className="flex flex-col items-end">
        <span className="text-[7px] font-bold tracking-[0.4em] uppercase">BAG</span>
        <span className="text-[5px] font-medium tracking-[0.2em] opacity-60 uppercase">
          {items.length} {items.length === 1 ? 'SELECTION' : 'SELECTIONS'}
        </span>
      </div>
      <div className="relative transition-all duration-500 group-hover:scale-110">
        <ShoppingBag size={15} strokeWidth={1} />
        {items.length > 0 && (
          <div className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-white text-[#4a0404] text-[7px] font-bold rounded-full flex items-center justify-center shadow-md">
            {items.length}
          </div>
        )}
      </div>
    </button>
  );
}
