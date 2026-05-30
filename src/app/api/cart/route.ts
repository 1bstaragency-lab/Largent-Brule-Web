// GET  /api/cart        → read current cart (creates session + cart on first hit)
// POST /api/cart        → add an item     (body: { product_id, product_name, variant?, price_cents, image_url? })
// DELETE /api/cart/:id  → remove an item  (handled by [itemId]/route.ts)
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getOrCreateCart,
  getOrCreateSessionId,
  isCartTrackingEnabled,
  logEvent,
  readCartFull,
  touchCart,
} from '@/lib/cart-session';

export async function GET() {
  if (!isCartTrackingEnabled()) {
    return Response.json({ ok: true, cart: null, items: [], tracking: false });
  }
  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);
  const full = await readCartFull(cart.id);
  return Response.json({
    ok: true,
    cart: full?.cart ?? cart,
    items: full?.items ?? [],
  });
}

export async function POST(req: Request) {
  if (!isCartTrackingEnabled()) {
    return Response.json(
      { ok: false, error: 'cart_tracking_disabled' },
      { status: 503 }
    );
  }
  let payload: {
    product_id?: string;
    product_name?: string;
    variant?: string | null;
    price_cents?: number;
    image_url?: string | null;
    quantity?: number;
    shopify_variant_id?: string | null;
    shopify_variant_legacy_id?: string | null;
  };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  if (!payload.product_id || !payload.product_name || typeof payload.price_cents !== 'number') {
    return Response.json({ ok: false, error: 'missing_fields' }, { status: 400 });
  }

  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);
  const variant = payload.variant || null;
  const qty = Math.max(1, payload.quantity ?? 1);

  // Try insert; on unique violation (cart_id, product_id, variant), bump quantity.
  const { error: insertErr } = await supabaseAdmin.from('cart_items').insert({
    cart_id: cart.id,
    product_id: payload.product_id,
    product_name: payload.product_name,
    variant,
    price_cents: payload.price_cents,
    image_url: payload.image_url || null,
    quantity: qty,
    shopify_variant_id: payload.shopify_variant_id || null,
    shopify_variant_legacy_id: payload.shopify_variant_legacy_id || null,
  });

  if (insertErr) {
    const msg = (insertErr.message || '').toLowerCase();
    const isDup =
      (insertErr as { code?: string }).code === '23505' ||
      msg.includes('duplicate') ||
      msg.includes('unique');
    if (!isDup) {
      return Response.json({ ok: false, error: insertErr.message }, { status: 500 });
    }
    // Increment existing row's quantity by qty.
    const { data: existing } = await supabaseAdmin
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('product_id', payload.product_id)
      .eq('variant', variant)
      .maybeSingle();
    if (existing) {
      await supabaseAdmin
        .from('cart_items')
        .update({
          quantity: (existing as { quantity: number }).quantity + qty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', (existing as { id: string }).id);
    }
  }

  await touchCart(cart.id);
  await logEvent({
    cart_id: cart.id,
    session_id: sessionId,
    phone_number: cart.phone_number,
    event_type: 'item_added',
    payload: { product_id: payload.product_id, variant, quantity: qty },
  });

  const full = await readCartFull(cart.id);
  return Response.json({ ok: true, cart: full?.cart, items: full?.items ?? [] });
}
