"use client";

// Shopify-backed buy-mode product view. Used when Shopify has the product.
// Color/size selectors map to variant.selectedOptions; ADD TO CART calls
// /api/cart with the resolved variant id, then opens the cart drawer.

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronRight, Plus } from "lucide-react";
import { useCart } from "@/components/cart-drawer";
import { useDwell } from "@/hooks/useDwell";
import type { ShopifyProduct, ShopifyVariant } from "@/lib/shopify";

interface Props {
  product: ShopifyProduct;
}

function findOptionValues(product: ShopifyProduct, name: string): string[] {
  const opt = product.options.find(
    (o) => o.name.toLowerCase() === name.toLowerCase()
  );
  return opt?.values || [];
}

function matchVariant(
  variants: ShopifyVariant[],
  selections: Record<string, string>
): ShopifyVariant | null {
  return (
    variants.find((v) =>
      v.selectedOptions.every(
        (opt) =>
          (selections[opt.name.toLowerCase()] || "").toLowerCase() ===
          opt.value.toLowerCase()
      )
    ) || null
  );
}

export default function ShopifyProductView({ product }: Props) {
  const colors = findOptionValues(product, "color");
  const sizes = findOptionValues(product, "size");
  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;

  const [selectedColor, setSelectedColor] = useState<string>(
    hasColors ? colors[0] : ""
  );
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [addingState, setAddingState] = useState<"idle" | "adding" | "added" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  const { addItem } = useCart();

  const matchedVariant = useMemo(() => {
    const selections: Record<string, string> = {};
    if (hasColors) selections.color = selectedColor;
    if (hasSizes) selections.size = selectedSize;
    return matchVariant(product.variants, selections);
  }, [product.variants, selectedColor, selectedSize, hasColors, hasSizes]);

  const inStock = matchedVariant?.available ?? false;
  const canAdd =
    (!hasSizes || !!selectedSize) && (!hasColors || !!selectedColor) && inStock;

  const displayPrice =
    matchedVariant?.price ?? product.priceRange.min;

  const handleAddToCart = async () => {
    if (!matchedVariant) {
      setErrMsg("Pick a size first");
      setAddingState("error");
      return;
    }
    setAddingState("adding");
    setErrMsg("");
    try {
      await addItem({
        id: product.handle,
        name: product.title,
        price: `${Math.round(displayPrice)} ${product.priceRange.currencyCode}`,
        image: product.featuredImage?.url || product.images[0]?.url || "",
        variant: matchedVariant.title,
        shopify_variant_id: matchedVariant.id,
        shopify_variant_legacy_id: matchedVariant.legacyId,
      });
      setAddingState("added");
      setTimeout(() => setAddingState("idle"), 2200);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "could not add");
      setAddingState("error");
    }
  };

  const heroImage =
    product.featuredImage?.url || product.images[0]?.url || "";

  useDwell({
    handle: product.handle,
    name: product.title,
    image: heroImage,
    priceText: `${Math.round(displayPrice)} ${product.priceRange.currencyCode}`,
  });

  const detailsList = product.description
    .split(/\r?\n|\.\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  return (
    <div className="w-full bg-white min-h-screen pt-20 lg:pt-0">
      {/* ── MOBILE ── */}
      <div className="lg:hidden">
        <div className="w-full aspect-[4/5] bg-white p-6 relative">
          {heroImage && (
            <Image
              src={heroImage}
              alt={product.title}
              fill
              className="object-contain mix-blend-multiply"
              priority
              sizes="100vw"
              unoptimized
            />
          )}
        </div>
        <div className="px-5 pt-4 pb-16 bg-white">
          <div className="space-y-1 mb-6">
            <h1 className="text-[16px] font-mono uppercase tracking-wide text-black">
              {product.title}
            </h1>
            <p className="text-[16px] font-mono tracking-wide text-black">
              ${Math.round(displayPrice)} {product.priceRange.currencyCode}
            </p>
          </div>

          <div className="flex gap-3 w-full mb-4">
            {hasSizes && (
              <div className="relative w-1/2">
                <select
                  className="w-full appearance-none border border-black bg-transparent py-3.5 px-4 text-[12px] font-mono uppercase tracking-wider outline-none rounded-none"
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                >
                  <option value="" disabled>SIZE</option>
                  {sizes.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={14} className="rotate-90 text-black" strokeWidth={1.5} />
                </div>
              </div>
            )}
            {hasColors && (
              <div className="relative w-1/2">
                <select
                  className="w-full appearance-none border border-black bg-transparent py-3.5 px-4 text-[12px] font-mono uppercase tracking-wider outline-none rounded-none"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                >
                  {colors.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={14} className="rotate-90 text-black" strokeWidth={1.5} />
                </div>
              </div>
            )}
          </div>

          <AddToCartButton
            canAdd={canAdd}
            inStock={inStock}
            addingState={addingState}
            errMsg={errMsg}
            onClick={handleAddToCart}
          />

          {detailsList.length > 0 && (
            <div className="border-t border-neutral-100 divide-y divide-neutral-100 mt-6">
              <div>
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "details" ? null : "details")}
                  className="w-full py-5 flex justify-between items-center text-[11px] uppercase tracking-[0.3em]"
                >
                  DETAILS{" "}
                  <Plus
                    size={13}
                    strokeWidth={1}
                    className={cn(
                      "transition-transform duration-300",
                      activeAccordion === "details" && "rotate-45"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500",
                    activeAccordion === "details" ? "max-h-[500px] pb-5" : "max-h-0"
                  )}
                >
                  <ul className="space-y-3 text-[11px] text-neutral-500 tracking-[0.05em] leading-relaxed">
                    {detailsList.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <div className="hidden lg:flex w-full min-h-screen">
        <div className="w-[60%] sticky top-0 h-screen flex items-center justify-center overflow-hidden bg-white p-4 pt-40 lg:p-12">
          <div className="w-full h-full relative">
            {heroImage && (
              <Image
                src={heroImage}
                alt={product.title}
                fill
                className="object-contain mix-blend-multiply"
                priority
                sizes="60vw"
                unoptimized
              />
            )}
          </div>
        </div>
        <div className="w-[40%] bg-white px-20 py-32 border-l border-neutral-50">
          <div className="max-w-xl space-y-20">
            <div className="space-y-6">
              <h1 className="text-[17px] font-bold uppercase tracking-[0.2em] leading-tight text-black">
                {product.title}
              </h1>
              <p className="text-[17px] font-bold tracking-[0.1em] text-black">
                ${Math.round(displayPrice)} {product.priceRange.currencyCode}
              </p>
            </div>

            {hasColors && (
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                  COLOR: {selectedColor}
                </p>
                <div className="flex gap-3 flex-wrap">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={cn(
                        "px-4 py-2 border text-[10px] uppercase tracking-[0.3em] transition-all",
                        selectedColor === c
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 text-black hover:border-black"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {hasSizes && (
              <div className="space-y-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-neutral-400">
                  SELECT SIZE
                </p>
                <div className="grid grid-cols-4 gap-3 max-w-sm">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "h-12 border text-[11px] font-bold tracking-widest flex items-center justify-center transition-all",
                        selectedSize === s
                          ? "border-black bg-black text-white"
                          : "border-neutral-200 text-black hover:border-black"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-10">
              <AddToCartButton
                canAdd={canAdd}
                inStock={inStock}
                addingState={addingState}
                errMsg={errMsg}
                onClick={handleAddToCart}
              />
            </div>

            {detailsList.length > 0 && (
              <div className="border-t border-neutral-100 divide-y divide-neutral-100">
                <div>
                  <button
                    onClick={() =>
                      setActiveAccordion(activeAccordion === "details" ? null : "details")
                    }
                    className="w-full py-8 flex justify-between items-center text-[11px] font-bold uppercase tracking-[0.4em]"
                  >
                    DETAILS{" "}
                    <Plus
                      size={14}
                      strokeWidth={1}
                      className={cn(
                        "transition-transform duration-300",
                        activeAccordion === "details" && "rotate-45"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-500",
                      activeAccordion === "details" ? "max-h-[800px] pb-12" : "max-h-0"
                    )}
                  >
                    <ul className="space-y-4 text-[11px] text-neutral-500 font-medium tracking-[0.1em] leading-relaxed">
                      {detailsList.map((d, i) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddToCartButton({
  canAdd,
  inStock,
  addingState,
  errMsg,
  onClick,
}: {
  canAdd: boolean;
  inStock: boolean;
  addingState: "idle" | "adding" | "added" | "error";
  errMsg: string;
  onClick: () => void;
}) {
  const label = !inStock
    ? "SOLD OUT"
    : addingState === "adding"
    ? "ADDING…"
    : addingState === "added"
    ? "ADDED ✓"
    : "ADD TO CART";

  return (
    <div className="w-full space-y-2">
      <button
        onClick={onClick}
        disabled={!canAdd || addingState === "adding"}
        className={cn(
          "w-full h-[52px] text-[11px] font-bold uppercase tracking-[0.4em] transition-colors",
          inStock
            ? "bg-black text-white hover:bg-neutral-800 disabled:opacity-40"
            : "bg-neutral-300 text-neutral-500 cursor-not-allowed"
        )}
      >
        {label}
      </button>
      {errMsg && (
        <p className="text-[10px] text-red-500 tracking-wide text-center">{errMsg}</p>
      )}
    </div>
  );
}
