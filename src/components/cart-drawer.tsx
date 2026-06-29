"use client"

import { useState, useEffect, createContext, useContext, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { getTopDwell } from "@/hooks/useDwell";
import { pickRandomCatalogItem, type CatalogItem } from "@/lib/catalog";

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
  // Short-circuited when NEXT_PUBLIC_CART_TRACKING isn't "on" so the
  // locked storefront doesn't generate empty carts on every visit.
  useEffect(() => {
    const trackingOn =
      (process.env.NEXT_PUBLIC_CART_TRACKING || "").toLowerCase() === "on";
    if (!trackingOn) {
      setIsReady(true);
      return;
    }
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

function DwellSuggestion({
  cartProductIds,
  isOpen,
  onClose,
}: {
  cartProductIds: string[];
  isOpen: boolean;
  onClose: () => void;
}) {
  // `kind` distinguishes a real dwell hit from the random catalog fallback —
  // we use a different header label for each.
  const [pick, setPick] = useState<
    | { kind: "dwell"; item: CatalogItem }
    | { kind: "random"; item: CatalogItem }
    | null
  >(null);

  // Recompute each time the drawer opens or the cart contents change.
  useEffect(() => {
    if (!isOpen) return;
    const dwell = getTopDwell(cartProductIds);
    if (dwell) {
      setPick({
        kind: "dwell",
        item: {
          handle: dwell.meta.handle,
          name: dwell.meta.name,
          image: dwell.meta.image,
          priceText: dwell.meta.priceText,
        },
      });
      return;
    }
    const random = pickRandomCatalogItem(cartProductIds);
    setPick(random ? { kind: "random", item: random } : null);
  }, [isOpen, cartProductIds.join("|")]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pick) return null;
  const { item, kind } = pick;
  const label = kind === "dwell" ? "ALSO ON YOUR MIND" : "YOU MAY ALSO LIKE";

  return (
    <div className="border-t border-neutral-50 px-6 lg:px-10 py-6 bg-neutral-50/40">
      <p className="text-[9px] font-bold uppercase tracking-[0.4em] opacity-40 mb-4">
        {label}
      </p>
      <Link
        href={`/product/${item.handle}`}
        onClick={onClose}
        className="flex gap-5 items-center group"
      >
        <div className="w-16 h-20 bg-white relative flex-shrink-0 border border-neutral-100 p-1.5">
          {item.image && (
            <Image
              src={item.image}
              alt={item.name}
              fill
              className="object-contain mix-blend-multiply"
            />
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-widest leading-tight truncate">
            {item.name}
          </p>
          <p className="text-[10px] font-medium tracking-tight opacity-70">
            {item.priceText}
          </p>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-40 group-hover:opacity-100 transition-opacity">
          VIEW →
        </span>
      </Link>
    </div>
  );
}

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
  // Hype "checkout line" queue shown for a few seconds before redirect.
  const [inQueue, setInQueue] = useState(false);
  const QUEUE_MS = 5000;

  const proceedToCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError("");
    try {
      const res = await fetch("/api/cart/checkout-url", { method: "POST" });
      const j = await res.json();
      if (j.ok && j.url) {
        // Show the "you're in line" queue, then auto-load checkout.
        setInQueue(true);
        setTimeout(() => {
          window.location.href = j.url;
        }, QUEUE_MS);
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
      {/* Hype "checkout line" queue overlay */}
      {inQueue && (
        <div className="fixed inset-0 z-[3000] bg-[#faf9f6] flex flex-col items-center justify-center px-6 sm:px-8 text-center">
          {/* Brand logo */}
          <div className="relative w-52 h-20 sm:w-64 sm:h-24 mb-6 sm:mb-8">
            <Image
              src="/logo_script_final.png"
              alt="L'argent Brûlé"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Animated wave bars (deep burgundy) */}
          <div className="flex items-end gap-1.5 h-14 sm:h-16 mb-9 sm:mb-10">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <motion.span
                key={i}
                className="w-1.5 rounded-full bg-[#4a0404]"
                animate={{ height: ["14px", "56px", "14px"] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.12,
                }}
              />
            ))}
          </div>

          <h3 className="text-[20px] sm:text-[22px] font-medium mb-5 sm:mb-6 tracking-tight">
            You&apos;re in line to check out
          </h3>
          <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.12em] leading-relaxed text-neutral-600 max-w-xs sm:max-w-sm mb-4">
            Due to high traffic, you&apos;ll need to wait a few minutes. When it&apos;s your turn, checkout will load automatically.
          </p>
          <p className="text-[11px] sm:text-[12px] uppercase tracking-[0.12em] leading-relaxed text-neutral-600 max-w-xs sm:max-w-sm">
            To keep your spot, please keep this window open and don&apos;t refresh.
          </p>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-[2100] transition-opacity duration-500"
          onClick={() => setIsOpen(false)}
        />
      )}

      <motion.div
        initial={false}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 right-0 h-screen w-full sm:w-[450px] bg-white z-[2200] border-l border-neutral-100"
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
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.08 } },
                }}
              >
                {items.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    variants={{
                      hidden: { opacity: 0, x: 16 },
                      visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
                    }}
                    className="flex gap-8 group"
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
                </motion.div>
              ))
              }
              </motion.div>
            )}
          </div>

          {/* Dwell-based suggestion — the product the customer lingered on. */}
          {items.length > 0 && (
            <DwellSuggestion
              cartProductIds={items.map((i) => i.productId)}
              isOpen={isOpen}
              onClose={() => setIsOpen(false)}
            />
          )}

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
      </motion.div>
    </>
  );
}
