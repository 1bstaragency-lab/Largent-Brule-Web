// POST /api/cart/checkout-started
// Fired when the user lands on /checkout. Marks cart as 'checkout_started'
// so the abandoned-cart detector (Phase B) targets these more aggressively.
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getOrCreateCart,
  getOrCreateSessionId,
  isCartTrackingEnabled,
  logEvent,
  touchCart,
} from '@/lib/cart-session';

export async function POST() {
  if (!isCartTrackingEnabled()) {
    return Response.json({ ok: true, tracking: false });
  }
  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);

  // Only bump status if still in 'active'. Idempotent for repeat visits.
  if (cart.status === 'active') {
    await supabaseAdmin
      .from('carts')
      .update({
        status: 'checkout_started',
        checkout_started_at: new Date().toISOString(),
      })
      .eq('id', cart.id);
  }
  await touchCart(cart.id);
  await logEvent({
    cart_id: cart.id,
    session_id: sessionId,
    phone_number: cart.phone_number,
    event_type: 'checkout_started',
    payload: null,
  });

  return Response.json({ ok: true });
}
