"use client"

import { useState, useEffect, createContext, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Check } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: string;
  image: string;
}

interface CartContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  clearCart: () => void;
  items: CartItem[];
  showAdded: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [showAdded, setShowAdded] = useState(false);

  const addItem = (item: CartItem) => {
    setItems((prev) => [...prev, item]);
    setIsOpen(true);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 3000);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ""));
    return acc + price;
  }, 0);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider value={{ isOpen, setIsOpen, addItem, clearCart, items, showAdded }}>
      {children}
      <CartDrawer isOpen={isOpen} setIsOpen={setIsOpen} items={items} showAdded={showAdded} />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

function CartDrawer({ isOpen, setIsOpen, items, showAdded }: { 
  isOpen: boolean; 
  setIsOpen: (o: boolean) => void; 
  items: CartItem[];
  showAdded: boolean;
}) {
  const subtotal = items.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, "")), 0);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[2100] transition-opacity duration-500" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white z-[2200] border-l border-neutral-100 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 lg:p-10 border-b border-neutral-50">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">YOUR SELECTION ({items.length})</h2>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:opacity-50 transition-opacity">
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-10 space-y-10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">YOUR SELECTION IS EMPTY</p>
              </div>
            ) : (
              items.map((item, i) => (
                <div key={i} className="flex gap-8 group animate-in fade-in slide-in-from-right-4 duration-700">
                  <div className="w-24 h-32 bg-[#f6f6f6] relative flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover mix-blend-multiply" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest leading-tight">{item.name}</p>
                    <p className="text-[11px] font-medium tracking-tighter">{item.price}</p>
                    <button className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity pt-2 w-fit">
                      REMOVE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 lg:p-10 border-t border-neutral-100 space-y-6 bg-neutral-50/30">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">SUBTOTAL</p>
                  <p className="text-[14px] font-bold tracking-tight">{subtotal} USD</p>
                </div>
                <p className="text-[9px] font-medium uppercase tracking-widest opacity-40">EXCL. SHIPPING</p>
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/checkout" 
                  onClick={() => setIsOpen(false)}
                  className="block w-full h-[55px] bg-black text-white text-center leading-[55px] text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#1a1a1a] transition-all"
                >
                  PROCEED TO CHECKOUT
                </Link>
                <p className="text-[9px] text-center text-neutral-400 uppercase tracking-widest">
                  SHIPPING & TAXES CALCULATED AT CHECKOUT
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
