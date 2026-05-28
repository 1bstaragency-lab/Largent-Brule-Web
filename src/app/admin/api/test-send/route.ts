// POST /admin/api/test-send
// Sends ONE iMessage to a phone number you specify, right now.
// Lets you verify body composition + Blooio integration without
// waiting for the queue worker. Counts toward the 15/day Blooio cap.
import { isAdmin } from '@/lib/admin-auth';
import { blooioSend } from '@/lib/blooio';
import { renderBody } from '@/lib/campaigns';
import { supabaseAdmin, toE164 } from '@/lib/supabase-admin';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let payload: { phone?: string; body_template?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const e164 = toE164(payload.phone || '');
  const body = (payload.body_template || '').trim();
  if (!e164) return Response.json({ ok: false, error: 'invalid_phone' }, { status: 400 });
  if (!body) return Response.json({ ok: false, error: 'body_required' }, { status: 400 });

  const rendered = renderBody(body, 'LB-VIP-TEST01');
  const digits = e164.slice(1);
  const idempotencyKey = `${digits}_test_${Date.now()}`;

  const result = await blooioSend({
    phoneE164: e164,
    text: rendered,
    idempotencyKey,
  });

  // Log to sent_messages regardless of outcome so the rate counter
  // reflects actual Blooio usage.
  await supabaseAdmin.from('sent_messages').insert({
    phone_number: e164,
    message_type: 'manual',
    campaign_id: null,
    body: rendered,
    blooio_message_id: result.ok ? result.messageId || null : null,
    status: result.ok ? 'queued' : 'failed',
    error: result.ok ? null : `HTTP ${result.status}: ${result.body}`.slice(0, 500),
    idempotency_key: idempotencyKey,
  });

  if (!result.ok) {
    return Response.json(
      { ok: false, error: `Blooio HTTP ${result.status}`, body: result.body },
      { status: 502 }
    );
  }
  return Response.json({ ok: true, messageId: result.messageId, rendered });
}
