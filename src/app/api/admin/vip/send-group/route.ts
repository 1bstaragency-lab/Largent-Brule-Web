// POST /api/admin/vip/send-group { groupId: number }
// Sends the VIP early access password to the nth group of 15 people
// (ordered by signup date, earliest first). Groups 1-41 get 15 people,
// Group 42 gets the remainder (12 people for 627 total).
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin, normalizePhone } from '@/lib/supabase-admin';
import { blooioSend } from '@/lib/blooio';
import { toE164 } from '@/lib/welcome';

export const dynamic = 'force-dynamic';

const PEOPLE_PER_GROUP = 15;
const TOTAL_GROUPS = 42;

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  let payload: { groupId?: number };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const groupId = Number(payload.groupId);
  if (!Number.isInteger(groupId) || groupId < 1 || groupId > TOTAL_GROUPS) {
    return Response.json({ ok: false, error: 'invalid_group_id' }, { status: 400 });
  }

  // Get all VIP signups ordered by creation date (earliest first)
  const { data: allMembers } = await supabaseAdmin
    .from('early_access')
    .select('id, phone_number, created_at')
    .order('created_at', { ascending: true });

  if (!allMembers || allMembers.length === 0) {
    return Response.json({ ok: false, error: 'no_members' }, { status: 404 });
  }

  // Extract the batch for this group
  const startIdx = (groupId - 1) * PEOPLE_PER_GROUP;
  const endIdx = Math.min(startIdx + PEOPLE_PER_GROUP, allMembers.length);
  const groupMembers = allMembers.slice(startIdx, endIdx);

  if (groupMembers.length === 0) {
    return Response.json({ ok: false, error: 'group_out_of_range' }, { status: 404 });
  }

  // Get opt-outs
  const { data: optOuts } = await supabaseAdmin.from('opt_outs').select('phone_number');
  const optSet = new Set((optOuts || []).map((r) => normalizePhone(r.phone_number)));

  // Get already-sent VIP early access messages
  const { data: alreadySent } = await supabaseAdmin
    .from('sent_messages')
    .select('phone_number')
    .eq('message_type', 'vip_early_access');
  const sentSet = new Set((alreadySent || []).map((r) => normalizePhone(r.phone_number)));

  const password = `SS26-${groupId}`;
  const messageBody = `Your VIP early access code: ${password}\n\nVisit: https://largent-brule.vercel.app/vip/group-${groupId}`;

  let queued = 0;
  let alreadySentCount = 0;
  let optedOutCount = 0;
  let invalidPhone = 0;
  let rateLimited = 0;
  const failures: Array<{ phone: string; status: number; error: string }> = [];

  for (const member of groupMembers) {
    const e164 = toE164(member.phone_number);
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

    const idempotencyKey = `${e164}_vip_group_${groupId}_v1`;
    const result = await blooioSend({
      phoneE164: e164,
      text: messageBody,
      idempotencyKey,
    });

    if (result.ok) {
      await supabaseAdmin.from('sent_messages').upsert(
        {
          phone_number: e164,
          message_type: 'vip_early_access',
          body: messageBody,
          blooio_message_id: result.messageId || null,
          status: 'queued',
          idempotency_key: idempotencyKey,
        },
        { onConflict: 'idempotency_key' }
      );
      queued++;
    } else if (result.status === 429) {
      rateLimited++;
      break; // Rate limit hit
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
    groupId,
    password,
    totalInGroup: groupMembers.length,
    queued,
    already_sent: alreadySentCount,
    opted_out: optedOutCount,
    invalid_phone: invalidPhone,
    rate_limited: rateLimited,
    failures,
  });
}
