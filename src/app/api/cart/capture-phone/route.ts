// POST /api/cart/capture-phone
// Body: { phone: string }
// Called from the VIP password gate, the Join VIP signup form, AND the
// checkout phone input. Idempotent — linking the same phone twice is a no-op.
import {
  getOrCreateCart,
  getOrCreateSessionId,
  isCartTrackingEnabled,
  linkPhoneToCart,
} from '@/lib/cart-session';

export async function POST(req: Request) {
  let phone: string;
  try {
    const body = await req.json();
    phone = String(body?.phone || '');
  } catch {
    return Response.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }
  if (!phone.trim()) {
    return Response.json({ ok: false, error: 'phone_required' }, { status: 400 });
  }

  // When cart tracking is off, swallow the call without minting a cart.
  // VIP signups still land in the `early_access` table via the page's
  // own supabase call — see src/app/page.tsx.
  if (!isCartTrackingEnabled()) {
    return Response.json({ ok: true, tracking: false });
  }

  const { sessionId } = await getOrCreateSessionId();
  const cart = await getOrCreateCart(sessionId);

  // No-op if already linked to this phone.
  if (cart.phone_number) {
    return Response.json({ ok: true, phone: cart.phone_number, alreadyLinked: true });
  }

  const result = await linkPhoneToCart({
    cartId: cart.id,
    sessionId,
    phoneInput: phone,
  });
  if (!result.ok) {
    return Response.json({ ok: false, error: result.reason }, { status: 400 });
  }
  return Response.json({ ok: true, phone: result.phone });
}
