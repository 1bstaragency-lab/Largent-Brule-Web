"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";

// Public shape used by product pages: `addItem({ id, name, price, image, ... })`.
// `id` is the product_id / handle (e.g. "bomber"). Variant is optional.
// shopify_variant_* fields are passed through when the product is sourced
// from Shopify so the checkout permalink can resolve.
interface ProductCartInput {
  id: string;
  name: string;
  price: string;          // formatted, e.g. "310 USD"
  image: string;
  variant?: string;
  shopify_variant_id?: string;
  shopify_variant_legacy_id?: string;
}

// Server-side row shape, returned by /api/cart.
interface ServerCartItem {
  id: string;             // cart_item_id (different from product_id)
  product_id: string;
  product_name: string;
  variant: string | null;
  price_cents: number;
  image_url: string | null;
  quantity: number;
}

// Internal client shape — mirrors what the drawer renders.
interface CartItem {
  id: string;             // cart_item_id, used for delete
  productId: string;
  name: string;
  price: string;          // formatted "310 USD" for legacy callers
  image: string;
  variant?: string;
  quantity: number;
  priceCents: number;
}

interface CartContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: ProductCartInput) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCart: () => void;
  items: CartItem[];
  showAdded: boolean;
  isReady: boolean;       // true after first hydration
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function fromServer(row: ServerCartItem): CartItem {
  const dollars = Math.floor(row.price_cents / 100);
  return {
    id: row.id,
    productId: row.product_id,
    name: row.product_name,
    price: `${dollars} USD`,
    image: row.image_url || "",
    variant: row.variant || undefined,
    quantity: row.quantity,
    priceCents: row.price_cents,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>([]);
  const [showAdded, setShowAdded] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Hydrate from the server on first mount. This also mints the
  // lb_session cookie + cart row on first ever page load.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/cart")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.ok && Array.isArray(j.items)) {
          setItems(j.items.map(fromServer));
        }
      })
      .catch(() => {/* offline-safe: drawer just starts empty */})
      .finally(() => {
        if (!cancelled) setIsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const addItem = useCallback(async (input: ProductCartInput) => {
    // Open the drawer + flash badge immediately for snappy UX.
    setIsOpen(true);
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 3000);

    const priceCents =
      Math.max(0, parseInt((input.price || "").replace(/[^0-9]/g, ""), 10) || 0) * 100;

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: input.id,
          product_name: input.name,
          price_cents: priceCents,
          image_url: input.image,
          variant: input.variant ?? null,
          quantity: 1,
          shopify_variant_id: input.shopify_variant_id ?? null,
          shopify_variant_legacy_id: input.shopify_variant_legacy_id ?? null,
        }),
      });
      const j = await res.json();
      if (j.ok && Array.isArray(j.items)) {
        setItems(j.items.map(fromServer));
      }
    } catch {
      // Silent — drawer state stays consistent with server on next hydration.
    }
  }, []);

  const removeItem = useCallback(async (cartItemId: string) => {
    // Optimistic remove
    setItems((prev) => prev.filter((it) => it.id !== cartItemId));
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, { method: "DELETE" });
      const j = await res.json();
      if (j.ok && Array.isArray(j.items)) {
        setItems(j.items.map(fromServer));
      }
    } catch {/* silent */}
  }, []);

  const clearCart = useCallback(() => {
    // Local-only — the server marks status='purchased' via the
    // separate /api/cart/purchase-completed call fired by checkout.
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{ isOpen, setIsOpen, addItem, removeItem, clearCart, items, showAdded, isReady }}
    >
      {children}
      <CartDrawer
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        items={items}
        showAdded={showAdded}
        removeItem={removeItem}
      />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

function CartDrawer({
  isOpen,
  setIsOpen,
  items,
  removeItem,
}: {
  isOpen: boolean;
  setIsOpen: (o: boolean) => void;
  items: CartItem[];
  showAdded: boolean;
  removeItem: (id: string) => Promise<void>;
}) {
  const subtotal = items.reduce((acc, item) => acc + (item.priceCents / 100) * item.quantity, 0);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  const proceedToCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/cart/checkout-url", { method: "POST" });
      const j = await res.json();
      if (j.ok && j.url) {
        window.location.href = j.url;
      } else if (j.error === "unmapped_items") {
        setCheckoutError(
          "Some items aren't synced to Shopify yet. Remove and re-add them once available."
        );
        setCheckoutLoading(false);
      } else {
        setCheckoutError(j.message || j.error || "Checkout unavailable");
        setCheckoutLoading(false);
      }
    } catch {
      setCheckoutError("Network error — try again");
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[2100] transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white z-[2200] border-l border-neutral-100 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 lg:p-10 border-b border-neutral-50">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.3em]">
              YOUR SELECTION ({items.length})
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:opacity-50 transition-opacity"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-10 space-y-10">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em]">
                  YOUR SELECTION IS EMPTY
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-8 group animate-in fade-in slide-in-from-right-4 duration-700"
                >
                  <div className="w-24 h-32 bg-white relative flex-shrink-0 border border-neutral-50 p-2">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-contain mix-blend-multiply"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center space-y-2">
                    <p className="text-[11px] font-bold uppercase tracking-widest leading-tight">
                      {item.name}
                    </p>
                    {item.variant && (
                      <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">
                        {item.variant}
                      </p>
                    )}
                    <p className="text-[11px] font-medium tracking-tighter">
                      {item.price}
                      {item.quantity > 1 && (
                        <span className="text-neutral-400"> · ×{item.quantity}</span>
                      )}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100 transition-opacity pt-2 w-fit"
                    >
                      REMOVE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 lg:p-10 border-t border-neutral-100 space-y-6 bg-white">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40">
                    SUBTOTAL
                  </p>
                  <p className="text-[14px] font-bold tracking-tight">{subtotal} USD</p>
                </div>
                <p className="text-[9px] font-medium uppercase tracking-widest opacity-40">
                  EXCL. SHIPPING
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={proceedToCheckout}
                  disabled={checkoutLoading}
                  className="block w-full h-[55px] bg-black text-white text-center leading-[55px] text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-[#1a1a1a] transition-all disabled:opacity-50"
                >
                  {checkoutLoading ? "REDIRECTING…" : "PROCEED TO CHECKOUT"}
                </button>
                {checkoutError && (
                  <p className="text-[10px] text-center text-red-500 tracking-wide">
                    {checkoutError}
                  </p>
                )}
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
