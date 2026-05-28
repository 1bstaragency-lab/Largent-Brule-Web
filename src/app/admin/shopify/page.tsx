import Image from 'next/image';
import { getAllProducts, type ShopifyProduct } from '@/lib/shopify';

async function fetchProductsOrError(): Promise<
  | { ok: true; products: ShopifyProduct[] }
  | { ok: false; error: string }
> {
  try {
    const products = await getAllProducts();
    return { ok: true, products };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : 'unknown error',
    };
  }
}

export default async function ShopifyAdminPage() {
  const result = await fetchProductsOrError();
  const domain = process.env.SHOPIFY_STORE_DOMAIN || '—';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Shopify</p>
        <h1 className="text-3xl font-light">
          {result.ok ? `${result.products.length} products live` : 'Connection error'}
        </h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide font-mono">{domain}</p>
      </div>

      {!result.ok && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-5 text-[12px] text-red-700 leading-relaxed">
          <p className="font-medium uppercase tracking-[0.2em] text-[10px] mb-2">
            Shopify Admin GraphQL error
          </p>
          <pre className="whitespace-pre-wrap font-mono text-[11px]">{result.error}</pre>
          <p className="mt-3">
            Verify <code className="bg-white px-1">SHOPIFY_ADMIN_TOKEN</code> in <code className="bg-white px-1">.env.local</code>{' '}
            and restart the dev server.
          </p>
        </div>
      )}

      {result.ok && result.products.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-sm p-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-700">
            No products in Shopify yet
          </p>
          <p className="text-[12px] text-neutral-600 mt-3 max-w-md mx-auto leading-relaxed">
            Add at least one product in your Shopify admin (
            <span className="font-mono">{domain}</span>) and refresh. Use the existing slugs as
            product handles to keep current URLs working (e.g.{' '}
            <code className="bg-white px-1">bomber</code>).
          </p>
        </div>
      )}

      {result.ok && result.products.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {result.products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product: p }: { product: ShopifyProduct }) {
  const variantCount = p.variants.length;
  const inStock = p.variants.filter((v) => v.available).length;
  const totalInventory = p.variants.reduce(
    (sum, v) => sum + (v.inventoryQuantity ?? 0),
    0
  );

  return (
    <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
      <div className="flex">
        <div className="w-32 h-32 bg-neutral-50 relative flex-shrink-0">
          {p.featuredImage && (
            <Image
              src={p.featuredImage.url}
              alt={p.featuredImage.altText || p.title}
              fill
              className="object-contain p-2"
              sizes="128px"
              unoptimized
            />
          )}
        </div>
        <div className="flex-1 p-5">
          <p className="text-[11px] font-bold uppercase tracking-widest leading-tight">
            {p.title}
          </p>
          <p className="text-[10px] text-neutral-500 mt-1 font-mono">{p.handle}</p>
          <div className="mt-3 space-y-1">
            <p className="text-[11px] tracking-tight">
              {p.priceRange.min === p.priceRange.max
                ? `$${p.priceRange.min.toFixed(0)} ${p.priceRange.currencyCode}`
                : `$${p.priceRange.min.toFixed(0)} – $${p.priceRange.max.toFixed(0)} ${p.priceRange.currencyCode}`}
            </p>
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500">
              {variantCount} variant{variantCount === 1 ? '' : 's'} ·{' '}
              <span className={inStock > 0 ? 'text-green-600' : 'text-red-500'}>
                {inStock} in stock
              </span>
              {totalInventory > 0 && (
                <span className="text-neutral-400"> · {totalInventory} units</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
