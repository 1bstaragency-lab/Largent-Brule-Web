// Static product catalog used as a fallback for the cart-drawer "You may
// also like" suggestion when the customer has no dwell signal yet (first
// product they touch, fast add, etc). Mirrors productData in
// src/app/product/[id]/lockdown-view.tsx — keep these handles in sync.

export interface CatalogItem {
  handle: string;
  name: string;
  image: string;
  priceText: string;
}

export const CATALOG: CatalogItem[] = [
  // Bomber turned off for now — excluded from "you may also like" suggestions.
  {
    handle: "raglan",
    name: "L'ARGENT BRÛLÉ RAGLAN LONG-SLEEVE TEE",
    image: "/raglan_front_white_v2.png",
    priceText: "87 USD",
  },
  {
    handle: "hoodie",
    name: "L'ARGENT BRÛLÉ LEMONDROP HOODIE",
    image: "/hoodie_front_v13.png",
    priceText: "185 USD",
  },
  {
    handle: "leather-pants",
    name: '"BEAUTÉ DU CUIR" CARPENTERS',
    image: "/leather_pants_front.png",
    priceText: "240 USD",
  },
];

/** Pick one catalog item not in `exclude`, uniformly at random. */
export function pickRandomCatalogItem(exclude: string[]): CatalogItem | null {
  const skip = new Set(exclude);
  const pool = CATALOG.filter((c) => !skip.has(c.handle));
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
