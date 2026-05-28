// POST /api/cart/checkout-url
// Builds a Shopify cart-permalink URL from the current Supabase cart
// and returns it. The browser then redirects to that URL, landing
// straight in Shopify-hosted checkout (with payment, tax, shipping).
//
// We embed `attributes[lb_session_id]=<uuid>` in the URL so when the
// orders/paid webhook fires, we can match the resulting order back to
// our cart row (see app/api/shopify/webhook/order-paid/route.ts).
import { buildCheckoutUrl } from '@/lib/shopify';
import {
  getOrCreateCart,
  getOrCreateSessionId,
  logEvent,
  readCartFull,
  touchCart,
} from '@/lib/cart-session';

export async function POST() {
  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);
  const full = await readCartFull(cart.id);
  if (!full || full.items.length === 0) {
    return Response.json({ ok: false, error: 'cart_empty' }, { status: 400 });
  }

  // Each cart_item must have a Shopify variant id. If any are missing,
  // it means the product page added them before Shopify was wired up
  // (or the product hasn't been mapped to Shopify yet).
  const missing = full.items.filter((i) => !i.shopify_variant_legacy_id);
  if (missing.length > 0) {
    return Response.json(
      {
        ok: false,
        error: 'unmapped_items',
        message:
          'Some items have no Shopify variant. Re-add them after the product is synced to Shopify.',
        items: missing.map((i) => ({ name: i.product_name, variant: i.variant })),
      },
      { status: 409 }
    );
  }

  let url: string;
  try {
    url = buildCheckoutUrl({
      items: full.items.map((i) => ({
        variantId: i.shopify_variant_legacy_id!,
        quantity: i.quantity,
      })),
      attributes: { lb_session_id: sessionId },
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 500 }
    );
  }

  await touchCart(cart.id);
  await logEvent({
    cart_id: cart.id,
    session_id: sessionId,
    phone_number: cart.phone_number,
    event_type: 'checkout_started',
    payload: { checkout_url: url, item_count: full.items.length },
  });

  return Response.json({ ok: true, url });
}
