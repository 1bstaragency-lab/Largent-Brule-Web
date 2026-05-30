// POST /api/cart/purchase-completed
// MOCK for now — fired by the fake "Place Order" button on /checkout.
// When Shopify lands, this becomes a webhook handler for
// `checkout.session.completed` (Stripe) or `orders/paid` (Shopify) that
// looks up the cart by session_id or phone match.
//
// Marks cart as 'purchased', logs the event, and prevents the abandoned
// cart detector from texting this user for an already-completed order.
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getOrCreateCart,
  getOrCreateSessionId,
  isCartTrackingEnabled,
  logEvent,
} from '@/lib/cart-session';

export async function POST(req: Request) {
  let payload: { order_id?: string; total_cents?: number } = {};
  try {
    payload = await req.json();
  } catch {
    // body is optional
  }

  if (!isCartTrackingEnabled()) {
    return Response.json({ ok: true, tracking: false });
  }

  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);

  await supabaseAdmin
    .from('carts')
    .update({
      status: 'purchased',
      purchased_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    })
    .eq('id', cart.id);

  await logEvent({
    cart_id: cart.id,
    session_id: sessionId,
    phone_number: cart.phone_number,
    event_type: 'purchase_completed',
    payload: {
      order_id: payload.order_id || null,
      total_cents: payload.total_cents || null,
      mock: true,
    },
  });

  return Response.json({ ok: true });
}
