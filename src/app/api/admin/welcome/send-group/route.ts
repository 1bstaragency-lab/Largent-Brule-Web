// POST /api/admin/welcome/send-group { cohort: number }
// Send the canonical welcome SMS to every member of `cohort` who hasn't
// already received it and hasn't opted out. Mirrors the early-access
// send-group endpoint but writes message_type='welcome' so the
// /admin/subscribers "welcomed" counter increments correctly.
//
// Skips contacts that already have a welcome row (idempotency key
// guards against double-send). Breaks on Blooio 429 (15/day cap).
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, normalizePhone } from '@/lib/supabase-admin';
import { blooioSend } from '@/lib/blooio';
import { WELCOME_BODY, toE164 } from '@/lib/welcome';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let payload: { cohort?: number };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  const cohort = Number(payload.cohort);
  if (!Number.isInteger(cohort) || cohort < 1) {
    return Response.json({ ok: false, error: 'bad_cohort' }, { status: 400 });
  }

  const [{ data: members }, { data: alreadyWelcomed }, { data: opts }] =
    await Promise.all([
      supabaseAdmin
        .from('early_access')
        .select('id, phone_number, created_at')
        .eq('cohort', cohort)
        .order('created_at', { ascending: true }),
      supabaseAdmin
        .from('sent_messages')
        .select('phone_number')
        .eq('message_type', 'welcome'),
      supabaseAdmin.from('opt_outs').select('phone_number'),
    ]);

  const welcomedSet = new Set(
    (alreadyWelcomed || []).map((r) => normalizePhone(r.phone_number))
  );
  const optSet = new Set(
    (opts || []).map((r) => normalizePhone(r.phone_number))
  );

  let queued = 0;
  let alreadyWelcomedCount = 0;
  let optedOutCount = 0;
  let invalidPhone = 0;
  let rateLimited = 0;
  const failures: Array<{ phone: string; status: number; error: string }> = [];

  for (const m of (members || []) as { phone_number: string }[]) {
    const e164 = toE164(m.phone_number);
    if (!e164) {
      invalidPhone++;
      continue;
    }
    const norm = normalizePhone(e164);
    if (optSet.has(norm)) {
      optedOutCount++;
      continue;
    }
    if (welcomedSet.has(norm)) {
      alreadyWelcomedCount++;
      continue;
    }
    const idempotencyKey = `${e164}_welcome_v1`;
    const result = await blooioSend({
      phoneE164: e164,
      text: WELCOME_BODY,
      idempotencyKey,
    });
    if (result.ok) {
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
      queued++;
    } else if (result.status === 429) {
      rateLimited++;
      break; // 15/day cap hit, stop hammering Blooio
    } else {
      failures.push({
        phone: e164,
        status: result.status,
        error: result.body.slice(0, 200),
      });
    }
  }

  return Response.json({
    ok: true,
    cohort,
    queued,
    already_welcomed: alreadyWelcomedCount,
    opted_out: optedOutCount,
    invalid_phone: invalidPhone,
    rate_limited: rateLimited,
    failures,
  });
}
