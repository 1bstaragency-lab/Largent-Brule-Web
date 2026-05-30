// Server-only cart session + persistence layer.
// Browsers carry one httpOnly `lb_session` cookie containing a UUID.
// That UUID maps 1:1 to a row in the `carts` table.
// Phone number is linked when we learn it (VIP password, signup, checkout).
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import { supabaseAdmin, toE164 } from './supabase-admin';

export const SESSION_COOKIE = 'lb_session';
const COOKIE_MAX_AGE_DAYS = 365;

/**
 * Master switch for the whole cart-tracking pipeline (session cookies,
 * carts/cart_items/cart_events rows, abandoned-cart recovery flow). Off
 * by default so the locked storefront doesn't accumulate empty cart rows.
 * Set `NEXT_PUBLIC_CART_TRACKING=on` in Netlify env to turn it on.
 */
export function isCartTrackingEnabled(): boolean {
  return (process.env.NEXT_PUBLIC_CART_TRACKING || '').toLowerCase() === 'on';
}

export interface CartRow {
  id: string;
  session_id: string;
  phone_number: string | null;
  status: 'active' | 'checkout_started' | 'purchased' | 'abandoned' | 'recovered';
  last_activity_at: string;
  checkout_started_at: string | null;
  purchased_at: string | null;
  recovery_sent_at: string | null;
  recovery_step: number;
  created_at: string;
}

export interface CartItemRow {
  id: string;
  cart_id: string;
  product_id: string;
  product_name: string;
  variant: string | null;
  price_cents: number;
  image_url: string | null;
  quantity: number;
  shopify_variant_id: string | null;
  shopify_variant_legacy_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CartEventInsert {
  cart_id: string;
  session_id: string;
  phone_number?: string | null;
  event_type:
    | 'cart_created'
    | 'item_added'
    | 'item_removed'
    | 'cart_viewed'
    | 'checkout_started'
    | 'phone_captured'
    | 'purchase_completed'
    | 'recovery_sent'
    | 'recovery_clicked';
  payload?: Record<string, unknown> | null;
}

/**
 * Return the existing session UUID from the cookie, or mint a new one
 * and set the cookie. Server-only — must be called from a Route Handler
 * or Server Action (because cookie writes are not allowed in Server
 * Components during render).
 */
export async function getOrCreateSessionId(): Promise<{ sessionId: string; isNew: boolean }> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE);
  if (existing?.value && /^[0-9a-f-]{36}$/i.test(existing.value)) {
    return { sessionId: existing.value, isNew: false };
  }
  const sessionId = randomUUID();
  store.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * COOKIE_MAX_AGE_DAYS,
  });
  return { sessionId, isNew: true };
}

/** Read-only variant for Server Components — does NOT set a cookie. */
export async function peekSessionId(): Promise<string | null> {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE);
  if (existing?.value && /^[0-9a-f-]{36}$/i.test(existing.value)) {
    return existing.value;
  }
  return null;
}

/** Get the cart row for this session, creating it on first call. */
export async function getOrCreateCart(sessionId: string): Promise<CartRow> {
  const { data: existing } = await supabaseAdmin
    .from('carts')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();
  if (existing) return existing as CartRow;

  const { data: created, error } = await supabaseAdmin
    .from('carts')
    .insert({ session_id: sessionId, status: 'active' })
    .select('*')
    .single();
  if (error || !created) throw new Error(`getOrCreateCart failed: ${error?.message}`);

  await logEvent({
    cart_id: created.id,
    session_id: sessionId,
    event_type: 'cart_created',
    payload: null,
  });
  return created as CartRow;
}

/** Touch last_activity_at to NOW. Called on every cart mutation. */
export async function touchCart(cartId: string): Promise<void> {
  await supabaseAdmin
    .from('carts')
    .update({ last_activity_at: new Date().toISOString() })
    .eq('id', cartId);
}

/** Append-only event log. Never throws — failure here shouldn't break a UX flow. */
export async function logEvent(input: CartEventInsert): Promise<void> {
  await supabaseAdmin.from('cart_events').insert(input);
}

/** Link a phone number to a cart. Idempotent on the same number. */
export async function linkPhoneToCart(opts: {
  cartId: string;
  sessionId: string;
  phoneInput: string;
}): Promise<{ ok: boolean; phone?: string; reason?: string }> {
  const e164 = toE164(opts.phoneInput);
  if (!e164) return { ok: false, reason: 'invalid_phone' };

  // Update cart row
  const { error } = await supabaseAdmin
    .from('carts')
    .update({ phone_number: e164, last_activity_at: new Date().toISOString() })
    .eq('id', opts.cartId);
  if (error) return { ok: false, reason: error.message };

  await logEvent({
    cart_id: opts.cartId,
    session_id: opts.sessionId,
    phone_number: e164,
    event_type: 'phone_captured',
    payload: null,
  });
  return { ok: true, phone: e164 };
}

/** Fetch the full cart for the browser: row + items. */
export async function readCartFull(cartId: string): Promise<{
  cart: CartRow;
  items: CartItemRow[];
} | null> {
  const [cartRes, itemsRes] = await Promise.all([
    supabaseAdmin.from('carts').select('*').eq('id', cartId).maybeSingle(),
    supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('cart_id', cartId)
      .order('created_at', { ascending: true }),
  ]);
  if (!cartRes.data) return null;
  return {
    cart: cartRes.data as CartRow,
    items: (itemsRes.data || []) as CartItemRow[],
  };
}
