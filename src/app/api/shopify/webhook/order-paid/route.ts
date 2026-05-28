// POST /api/shopify/webhook/order-paid
// Fires when an order is paid. Verifies HMAC, marks the cart 'purchased',
// blocks abandoned-cart recovery, logs revenue attribution.
//
// We tie Shopify orders back to our Supabase cart via the `attributes`
// query parameters baked into the checkout URL (see lib/shopify.ts
// buildCheckoutUrl + attributes.lb_session_id).
import crypto from 'crypto';
import { supabaseAdmin, toE164 } from '@/lib/supabase-admin';
import { logEvent } from '@/lib/cart-session';

interface ShopifyOrderWebhook {
  id: number;
  order_number: number;
  email: string | null;
  phone: string | null;
  total_price: string;
  currency: string;
  financial_status: string;
  note_attributes?: Array<{ name: string; value: string }>;
  customer?: { phone: string | null; email: string | null } | null;
  shipping_address?: { phone: string | null } | null;
  discount_codes?: Array<{ code: string }>;
}

function verifyHmac(rawBody: string, signature: string | null): boolean {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('base64');
  // timing-safe compare requires equal-length buffers
  if (expected.length !== signature.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

function findAttribute(
  notes: ShopifyOrderWebhook['note_attributes'],
  key: string
): string | null {
  if (!notes) return null;
  const hit = notes.find((n) => n.name === key);
  return hit?.value || null;
}

function extractPhone(order: ShopifyOrderWebhook): string | null {
  const candidates = [
    order.phone,
    order.customer?.phone,
    order.shipping_address?.phone,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const e164 = toE164(c);
    if (e164) return e164;
  }
  return null;
}

export async function POST(req: Request) {
  // 1. Read the raw body (Buffer) once so we can verify HMAC against it.
  const rawBody = await req.text();
  const signature = req.headers.get('x-shopify-hmac-sha256');

  if (!verifyHmac(rawBody, signature)) {
    // Don't leak details — just 401.
    return new Response('Unauthorized', { status: 401 });
  }

  let order: ShopifyOrderWebhook;
  try {
    order = JSON.parse(rawBody);
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  // 2. Look up our cart. Two paths:
  //    a) session_id attribute set on the checkout URL — exact match
  //    b) phone match against carts.phone_number — fallback when session lost
  const sessionId = findAttribute(order.note_attributes, 'lb_session_id');
  const phone = extractPhone(order);
  const couponCode = order.discount_codes?.[0]?.code || null;

  let cartId: string | null = null;
  if (sessionId) {
    const { data } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('session_id', sessionId)
      .maybeSingle();
    if (data) cartId = (data as { id: string }).id;
  }
  if (!cartId && phone) {
    // Most recent active or checkout_started cart for this phone.
    const { data } = await supabaseAdmin
      .from('carts')
      .select('id')
      .eq('phone_number', phone)
      .in('status', ['active', 'checkout_started'])
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) cartId = (data as { id: string }).id;
  }

  // 3. If we found a cart, mark it purchased + log the event.
  const totalCents = Math.round(parseFloat(order.total_price) * 100);
  if (cartId) {
    await supabaseAdmin
      .from('carts')
      .update({
        status: 'purchased',
        purchased_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', cartId);

    await logEvent({
      cart_id: cartId,
      session_id: sessionId || '00000000-0000-0000-0000-000000000000',
      phone_number: phone,
      event_type: 'purchase_completed',
      payload: {
        shopify_order_id: order.id,
        shopify_order_number: order.order_number,
        total_cents: totalCents,
        currency: order.currency,
        coupon_code: couponCode,
        financial_status: order.financial_status,
      },
    });
  }

  // 4. If a coupon was redeemed, mark it in our coupons table.
  if (couponCode) {
    await supabaseAdmin
      .from('coupons')
      .update({
        redeemed_at: new Date().toISOString(),
        redeemed_order_id: String(order.id),
      })
      .eq('code', couponCode);
  }

  // Always 200 — Shopify retries on non-2xx and we don't want loops.
  return Response.json({ ok: true, matched_cart: !!cartId });
}
