// Server component. Fetches the collection's products from Shopify by
// collection handle. If Shopify is empty or unreachable, falls back to
// the hardcoded curation (preserves pre-launch behavior).
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { shopifyAdminGraphQL } from "@/lib/shopify";

export const dynamic = "force-dynamic";

interface CollectionProduct {
  handle: string;
  title: string;
  imageUrl: string | null;
  priceMin: number;
  currencyCode: string;
  tag: string;
}

interface CollectionCard {
  label: string;
  description: string;
  products: CollectionProduct[];
  source: "shopify" | "hardcoded";
}

// Hardcoded fallback — same content the page had pre-Shopify.
const HARDCODED: Record<
  string,
  {
    label: string;
    description: string;
    products: Array<{
      id: string;
      name: string;
      price: string;
      image: string;
      tag: string;
    }>;
  }
> = {
  classics: {
    label: "CLASSICS",
    description: "The permanent archive. Foundational silhouettes built to last.",
    products: [
      { id: "bomber", name: "CROPPED BOMBER JACKET", price: "310 USD", image: "/bomber_final_studio.jpg", tag: "NEW" },
      { id: "leather-pants", name: "BEAUTÉ DU CUIR CARPENTERS", price: "240 USD", image: "/leather_pants_front.png", tag: "ARCHIVE" },
    ],
  },
  ss26: {
    label: "S/S 26",
    description: "Spring / Summer 2026. The new season.",
    products: [
      { id: "hoodie", name: "LEMONDROP HOODIE", price: "185 USD", image: "/hoodie_front_v16.png", tag: "NEW" },
      { id: "raglan", name: "RAGLAN L/S TEE", price: "87 USD", image: "/raglan_front_white_v2.png", tag: "NEW" },
    ],
  },
};

async function loadCollection(slug: string): Promise<CollectionCard | null> {
  // Try Shopify by collection handle.
  try {
    const data = await shopifyAdminGraphQL<{
      collectionByHandle: {
        title: string;
        description: string;
        products: {
          nodes: Array<{
            handle: string;
            title: string;
            featuredImage: { url: string } | null;
            priceRangeV2: {
              minVariantPrice: { amount: string; currencyCode: string };
            };
            tags: string[];
            status: string;
          }>;
        };
      } | null;
    }>(
      `query($handle: String!) {
        collectionByHandle(handle: $handle) {
          title
          description
          products(first: 50, filters: [{available: true}]) {
            nodes {
              handle
              title
              featuredImage { url }
              priceRangeV2 { minVariantPrice { amount currencyCode } }
              tags
              status
            }
          }
        }
      }`,
      { handle: slug }
    );
    const col = data.collectionByHandle;
    if (col && col.products.nodes.length > 0) {
      return {
        label: col.title.toUpperCase(),
        description: col.description || "",
        source: "shopify",
        products: col.products.nodes
          .filter((p) => p.status === "ACTIVE")
          .map((p) => ({
            handle: p.handle,
            title: p.title.toUpperCase(),
            imageUrl: p.featuredImage?.url || null,
            priceMin: parseFloat(p.priceRangeV2.minVariantPrice.amount),
            currencyCode: p.priceRangeV2.minVariantPrice.currencyCode,
            tag: p.tags?.[0]?.toUpperCase() || "NEW",
          })),
      };
    }
  } catch (e) {
    console.warn(`[collection/${slug}] Shopify fetch failed:`, e);
  }

  // Fallback to hardcoded curation.
  const fb = HARDCODED[slug];
  if (!fb) return null;
  return {
    label: fb.label,
    description: fb.description,
    source: "hardcoded",
    products: fb.products.map((p) => ({
      handle: p.id,
      title: p.name,
      imageUrl: p.image,
      priceMin: parseFloat(p.price.replace(/[^0-9.]/g, "")),
      currencyCode: "USD",
      tag: p.tag,
    })),
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const col = await loadCollection(slug);
  if (!col) return notFound();

  return (
    <div className="px-4 sm:px-10 pb-40">
      <div className="h-8 lg:h-0" />
      <div className="mb-20 space-y-3">
        <p className="text-[10px] uppercase tracking-[0.5em] opacity-30">
          <Link href="/collections" className="hover:opacity-60 transition-opacity">
            Collections
          </Link>
          {" / "}
          {col.label}
        </p>
        <h1 className="text-[14px] uppercase font-bold tracking-[0.3em]">{col.label}</h1>
        {col.description && (
          <p className="text-[11px] uppercase tracking-[0.3em] opacity-40">{col.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32 w-full">
        {col.products.map((p) => (
          <Link
            key={p.handle}
            href={`/product/${p.handle}`}
            className="group block space-y-8"
          >
            <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-12 border border-transparent group-hover:border-border transition-all duration-700">
              {p.imageUrl && (
                <Image
                  src={p.imageUrl}
                  alt={p.title}
                  fill
                  className="object-contain mix-blend-multiply group-hover:scale-125 transition-transform duration-1000 ease-out p-2"
                  style={{ filter: "contrast(1.1) brightness(1.05)" }}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized={p.imageUrl.includes("cdn.shopify.com")}
                />
              )}
            </div>
            <div className="space-y-3 text-[13px] tracking-[0.3em]">
              <p className="font-bold uppercase">{p.title}</p>
              <div className="flex items-center justify-between opacity-50">
                <p className="font-medium">
                  ${Math.round(p.priceMin)} {p.currencyCode}
                </p>
                <p className="font-bold text-[10px] uppercase border-l border-black/20 pl-4">
                  {p.tag}
                </p>
              </div>
            </div>
          </Link>
        ))}
        {col.products.length === 0 && (
          <p className="col-span-full text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em] py-20">
            No products in this collection yet
          </p>
        )}
      </div>
    </div>
  );
}
