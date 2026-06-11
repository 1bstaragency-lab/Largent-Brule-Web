// POST /api/vip/attach-email { phone, email }
// Attaches an email address to the early_access row matching the given
// phone digits. Idempotent. The VIP signup flow uses this as the second
// step after the phone submit on the homepage gate.
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  let body: { phone?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const digits = (body.phone || '').replace(/\D/g, '');
  const email = (body.email || '').trim().toLowerCase();

  if (digits.length < 10) {
    return Response.json({ ok: false, error: 'phone_required' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return Response.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  // Match by either canonical 10-digit or 11-digit-leading-1 storage formats.
  const tenDigit = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  const elevenDigit = digits.length === 10 ? '1' + digits : digits;

  const { data, error } = await supabaseAdmin
    .from('early_access')
    .update({ email, email_captured_at: new Date().toISOString() })
    .or(`phone_number.eq.${tenDigit},phone_number.eq.${elevenDigit}`)
    .select('id, phone_number, email');

  if (error) {
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  if (!data || data.length === 0) {
    return Response.json({ ok: false, error: 'phone_not_found' }, { status: 404 });
  }
  return Response.json({ ok: true, updated: data.length });
}
