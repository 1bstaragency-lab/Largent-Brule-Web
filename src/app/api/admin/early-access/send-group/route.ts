// POST /api/admin/early-access/send-group { cohort: number }
// Sends the stored early-access SMS to every member of the given cohort
// who hasn't already received it and hasn't opted out. Inserts a
// sent_messages row with message_type='early_access' per delivery for
// admin tracking. Idempotency key is canonical per phone so rerunning
// the endpoint never double-sends.
//
// Hits Blooio's 15-new-conversation/day plan cap — the response counts
// queued vs rate_limited so the admin UI can show "you've used N today,
// X waiting until tomorrow".
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, normalizePhone } from '@/lib/supabase-admin';
import { blooioSend } from '@/lib/blooio';

export const dynamic = 'force-dynamic';

const BODY_KEY = 'early_access_sms_body';
const IMAGE_KEY = 'early_access_sms_image_url';

function toE164(rawDigits: string): string | null {
  const d = rawDigits.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  if (d.length === 10) return `+1${d}`;
  return null;
}

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

  // Pull the message draft + optional image URL.
  const { data: settingsRows } = await supabaseAdmin
    .from('app_settings')
    .select('key, value')
    .in('key', [BODY_KEY, IMAGE_KEY]);
  const settingsMap = new Map(
    (settingsRows || []).map((r: { key: string; value: string }) => [r.key, r.value || ''])
  );
  const body = (settingsMap.get(BODY_KEY) || '').trim();
  const imageUrl = (settingsMap.get(IMAGE_KEY) || '').trim();
  if (!body) {
    return Response.json({ ok: false, error: 'message_not_set' }, { status: 400 });
  }
  const imageUrls = imageUrl ? [imageUrl] : undefined;

  // Pull cohort members + filters.
  const [{ data: members }, { data: alreadySent }, { data: opts }] = await Promise.all([
    supabaseAdmin
      .from('early_access')
      .select('id, phone_number, created_at')
      .eq('cohort', cohort)
      .order('created_at', { ascending: true }),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'early_access'),
    supabaseAdmin.from('opt_outs').select('phone_number'),
  ]);

  const sentSet = new Set((alreadySent || []).map((r) => normalizePhone(r.phone_number)));
  const optSet = new Set((opts || []).map((r) => normalizePhone(r.phone_number)));

  let queued = 0;
  let alreadySentCount = 0;
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
    if (sentSet.has(norm)) {
      alreadySentCount++;
      continue;
    }
    const idempotencyKey = `${e164}_early_access_v1`;
    const result = await blooioSend({
      phoneE164: e164,
      text: body,
      idempotencyKey,
      imageUrls,
    });
    if (result.ok) {
      // Log the send.
      await supabaseAdmin.from('sent_messages').upsert(
        {
          phone_number: e164,
          message_type: 'early_access',
          body,
          blooio_message_id: result.messageId || null,
          status: 'queued',
          idempotency_key: idempotencyKey,
        },
        { onConflict: 'idempotency_key' }
      );
      queued++;
    } else if (result.status === 429) {
      rateLimited++;
      // No point hammering Blooio further this run — cap is hit.
      break;
    } else {
      failures.push({ phone: e164, status: result.status, error: result.body.slice(0, 200) });
    }
  }

  return Response.json({
    ok: true,
    cohort,
    queued,
    already_sent: alreadySentCount,
    opted_out: optedOutCount,
    invalid_phone: invalidPhone,
    rate_limited: rateLimited,
    failures,
  });
}
