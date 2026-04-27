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

  return (
    <CartContext.Provider value={{ isOpen, setIsOpen, addItem, items, showAdded }}>
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
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[2100] transition-opacity duration-500" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-white z-[2200] shadow-2xl transition-transform duration-500 ease-in-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full p-10">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">YOUR BAG</h2>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:opacity-50">
              <X size={18} />
            </button>
          </div>

          {/* Green Added Message */}
          <div className={`mb-10 flex items-center gap-2 text-green-600 transition-opacity duration-1000 ${showAdded ? 'opacity-100' : 'opacity-0'}`}>
            <Check size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">ADDED TO SELECTION</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-8">
            {items.map((item, i) => (
              <div key={i} className="flex gap-6 animate-in slide-in-from-right duration-500">
                <div className="w-24 h-32 bg-[#f6f6f6] relative border border-border">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest">{item.name}</p>
                  <p className="text-[10px] font-medium tracking-widest">{item.price}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-10 border-t border-border space-y-4">
            <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
              <span>SUBTOTAL</span>
              <span>{items.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, "")), 0)} USD</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={() => setIsOpen(false)}
              className="block w-full h-14 bg-black text-white text-center leading-[56px] text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-900 transition-colors"
            >
              PROCEED TO CHECKOUT
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
