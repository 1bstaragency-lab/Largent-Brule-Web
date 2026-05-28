// Server component. Fetches the product from Shopify by handle.
// If found and ACTIVE → render the buy-mode Shopify view (Add to Cart live).
// Otherwise → render the lockdown / pre-launch view (hardcoded productData,
// "Notify Me" flow).
//
// The dynamic segment is still named [id] for URL stability with the
// existing /product/<handle> links throughout the site.
import { getProductByHandle } from "@/lib/shopify";
import LockdownProductView from "./lockdown-view";
import ShopifyProductView from "./shopify-view";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: handle } = await params;

  let product = null;
  try {
    product = await getProductByHandle(handle);
  } catch (e) {
    console.warn(`[product/${handle}] Shopify fetch failed:`, e);
  }

  if (product && product.status === "ACTIVE") {
    return <ShopifyProductView product={product} />;
  }
  return <LockdownProductView handle={handle} />;
}
