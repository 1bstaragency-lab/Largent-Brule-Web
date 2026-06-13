// POST /api/admin/welcome/send-one { phone: string }
// Manually send the canonical welcome to a single phone number. Phone
// can be in any format — server normalizes to E.164. If the phone is
// already welcomed (sent_messages.welcome row exists) the call is a
// no-op, returning { ok: true, already_welcomed: true }.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, normalizePhone } from '@/lib/supabase-admin';
import { blooioSend } from '@/lib/blooio';
import { WELCOME_BODY, toE164 } from '@/lib/welcome';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let payload: { phone?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  const e164 = toE164(payload.phone || '');
  if (!e164) {
    return Response.json({ ok: false, error: 'invalid_phone' }, { status: 400 });
  }

  const norm = normalizePhone(e164);

  const [{ data: alreadyRows }, { data: optRows }] = await Promise.all([
    supabaseAdmin
      .from('sent_messages')
      .select('id')
      .eq('message_type', 'welcome')
      .eq('phone_number', e164),
    supabaseAdmin.from('opt_outs').select('phone_number'),
  ]);
  const optSet = new Set(
    (optRows || []).map((r) => normalizePhone(r.phone_number))
  );
  if (optSet.has(norm)) {
    return Response.json({ ok: false, error: 'opted_out' }, { status: 409 });
  }
  if ((alreadyRows || []).length > 0) {
    return Response.json({ ok: true, already_welcomed: true });
  }

  const idempotencyKey = `${e164}_welcome_v1`;
  const result = await blooioSend({
    phoneE164: e164,
    text: WELCOME_BODY,
    idempotencyKey,
  });
  if (!result.ok) {
    return Response.json(
      { ok: false, error: 'blooio_failed', status: result.status, body: result.body.slice(0, 300) },
      { status: 502 }
    );
  }
  await supabaseAdmin.from('sent_messages').upsert(
    {
      phone_number: e164,
      message_type: 'welcome',
      body: WELCOME_BODY,
      blooio_message_id: result.messageId || null,
      status: 'queued',
      idempotency_key: idempotencyKey,
    },
    { onConflict: 'idempotency_key' }
  );
  return Response.json({ ok: true, queued: true, message_id: result.messageId });
}
