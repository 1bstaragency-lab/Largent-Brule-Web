// DELETE /api/cart/[itemId] → remove a single line item from the active cart.
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  getOrCreateCart,
  getOrCreateSessionId,
  logEvent,
  readCartFull,
  touchCart,
} from '@/lib/cart-session';

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ itemId: string }> }
) {
  const { itemId } = await context.params;
  if (!itemId) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 });

  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);

  // Look up the item first so we can log what was removed.
  const { data: item } = await supabaseAdmin
    .from('cart_items')
    .select('product_id, variant, quantity')
    .eq('id', itemId)
    .eq('cart_id', cart.id)
    .maybeSingle();

  const { error } = await supabaseAdmin
    .from('cart_items')
    .delete()
    .eq('id', itemId)
    .eq('cart_id', cart.id);
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });

  await touchCart(cart.id);
  if (item) {
    await logEvent({
      cart_id: cart.id,
      session_id: sessionId,
      phone_number: cart.phone_number,
      event_type: 'item_removed',
      payload: item as Record<string, unknown>,
    });
  }

  const full = await readCartFull(cart.id);
  return Response.json({ ok: true, cart: full?.cart, items: full?.items ?? [] });
}
