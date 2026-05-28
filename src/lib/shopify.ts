// Server-only Shopify Admin GraphQL client.
// We deliberately do not use the Storefront API or expose any Shopify
// token to the browser. Everything goes through our Next.js server.
//
// For checkout we use Shopify's "cart permalink" URL pattern:
//   https://{checkout_domain}/cart/{variant_id}:{qty},{variant_id}:{qty}
// which redirects straight to Shopify-hosted checkout. No Storefront
// token needed.
//
// Admin API calls always use the canonical myshopify domain. The
// checkout URL uses the BRANDED domain (e.g. shop.largentbrule.com)
// so customers see L'B in the address bar during checkout.

const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || '';
const CHECKOUT_DOMAIN = process.env.SHOPIFY_CHECKOUT_DOMAIN || DOMAIN;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN || '';
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2026-04';

function adminEndpoint(): string {
  if (!DOMAIN) throw new Error('SHOPIFY_STORE_DOMAIN is not set');
  return `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`;
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function shopifyAdminGraphQL<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  if (!TOKEN) throw new Error('SHOPIFY_ADMIN_TOKEN is not set');
  const res = await fetch(adminEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables: variables || {} }),
    // Do not cache — admin reads need to be fresh for inventory/availability.
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Shopify Admin GraphQL HTTP ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`Shopify Admin GraphQL: ${json.errors.map((e) => e.message).join('; ')}`);
  }
  if (!json.data) throw new Error('Shopify Admin GraphQL: empty response');
  return json.data;
}

// ============================================================
// Product fetch helpers
// ============================================================

export interface ShopifyProduct {
  id: string;             // gid://shopify/Product/123
  handle: string;         // e.g. 'bomber'
  title: string;
  description: string;
  status: string;         // 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  featuredImage: { url: string; altText: string | null } | null;
  images: Array<{ url: string; altText: string | null }>;
  options: Array<{ name: string; values: string[] }>;
  variants: ShopifyVariant[];
  priceRange: { min: number; max: number; currencyCode: string };
}

export interface ShopifyVariant {
  id: string;             // gid://shopify/ProductVariant/123
  legacyId: string;       // numeric id used in /cart/ permalinks
  title: string;          // e.g. 'CHARCOAL / M'
  price: number;          // dollars
  available: boolean;
  inventoryQuantity: number | null;
  selectedOptions: Array<{ name: string; value: string }>;
}

const PRODUCT_FIELDS = `
  id
  handle
  title
  description
  status
  featuredImage { url altText }
  images(first: 20) { nodes { url altText } }
  options { name values }
  priceRangeV2 {
    minVariantPrice { amount currencyCode }
    maxVariantPrice { amount currencyCode }
  }
  variants(first: 100) {
    nodes {
      id
      legacyResourceId
      title
      price
      availableForSale
      inventoryQuantity
      selectedOptions { name value }
    }
  }
`;

interface RawProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  status: string;
  featuredImage: { url: string; altText: string | null } | null;
  images: { nodes: Array<{ url: string; altText: string | null }> };
  options: Array<{ name: string; values: string[] }>;
  priceRangeV2: {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
  };
  variants: {
    nodes: Array<{
      id: string;
      legacyResourceId: string;
      title: string;
      price: string;
      availableForSale: boolean;
      inventoryQuantity: number | null;
      selectedOptions: Array<{ name: string; value: string }>;
    }>;
  };
}

function normalizeProduct(p: RawProduct): ShopifyProduct {
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description,
    status: p.status,
    featuredImage: p.featuredImage,
    images: p.images.nodes,
    options: p.options,
    priceRange: {
      min: parseFloat(p.priceRangeV2.minVariantPrice.amount),
      max: parseFloat(p.priceRangeV2.maxVariantPrice.amount),
      currencyCode: p.priceRangeV2.minVariantPrice.currencyCode,
    },
    variants: p.variants.nodes.map((v) => ({
      id: v.id,
      legacyId: v.legacyResourceId,
      title: v.title,
      price: parseFloat(v.price),
      available: v.availableForSale,
      inventoryQuantity: v.inventoryQuantity,
      selectedOptions: v.selectedOptions,
    })),
  };
}

/** Fetch all ACTIVE products. Capped at 250 for safety. */
export async function getAllProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyAdminGraphQL<{
    products: { nodes: RawProduct[] };
  }>(
    `query { products(first: 250, query: "status:active") { nodes { ${PRODUCT_FIELDS} } } }`
  );
  return data.products.nodes.map(normalizeProduct);
}

/** Fetch one product by handle (the URL slug). Returns null if not found. */
export async function getProductByHandle(handle: string): Promise<ShopifyProduct | null> {
  const data = await shopifyAdminGraphQL<{
    productByHandle: RawProduct | null;
  }>(
    `query($handle: String!) {
      productByHandle(handle: $handle) { ${PRODUCT_FIELDS} }
    }`,
    { handle }
  );
  return data.productByHandle ? normalizeProduct(data.productByHandle) : null;
}

// ============================================================
// Checkout URL (cart permalink). No GraphQL call needed.
// Format: /cart/{variantId1}:{qty1},{variantId2}:{qty2}?attributes...
// Optional ?discount=CODE will pre-apply a coupon.
// ============================================================
export function buildCheckoutUrl(opts: {
  items: Array<{ variantId: string; quantity: number }>;
  discountCode?: string | null;
  /** Optional attribute pairs encoded into the URL — useful for tying
   *  the Shopify order back to our cart row via session_id. */
  attributes?: Record<string, string>;
}): string {
  if (!CHECKOUT_DOMAIN) throw new Error('SHOPIFY_CHECKOUT_DOMAIN / SHOPIFY_STORE_DOMAIN is not set');
  if (opts.items.length === 0) throw new Error('cart items required');
  const path = opts.items
    .map((i) => `${i.variantId}:${Math.max(1, i.quantity)}`)
    .join(',');
  const params = new URLSearchParams();
  if (opts.discountCode) params.set('discount', opts.discountCode);
  if (opts.attributes) {
    for (const [k, v] of Object.entries(opts.attributes)) {
      params.set(`attributes[${k}]`, v);
    }
  }
  const qs = params.toString();
  return `https://${CHECKOUT_DOMAIN}/cart/${path}${qs ? `?${qs}` : ''}`;
}

/** Extract the numeric Shopify ID from a GID string. */
export function gidToNumericId(gid: string): string {
  const m = gid.match(/\/(\d+)$/);
  return m ? m[1] : gid;
}
