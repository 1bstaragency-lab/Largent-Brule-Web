// POST /admin/api/inbox/sync-opt-outs
// Scans every chat with inbound messages for STOP-style keywords and
// inserts matching phone numbers into opt_outs. Safe to re-run — uses
// upsert semantics on the unique phone_number primary key.
//
// Carrier opt-out keywords (TCPA): STOP, END, QUIT, CANCEL, UNSUBSCRIBE,
// STOPALL, "opt out". We also catch case + whitespace variants.
import { isAdmin } from '@/lib/admin-auth';
import { blooioListChats, blooioListMessages } from '@/lib/blooio';
import { supabaseAdmin } from '@/lib/supabase-admin';

const STOP_KEYWORDS = [
  'stop',
  'stopall',
  'unsubscribe',
  'end',
  'quit',
  'cancel',
  'opt out',
  'optout',
  'remove me',
];

function looksLikeStop(text: string): boolean {
  const t = text.toLowerCase().trim();
  if (!t) return false;
  // Whole-message match OR starts-with for single-word commands
  if (STOP_KEYWORDS.includes(t)) return true;
  for (const kw of STOP_KEYWORDS) {
    // Match standalone word at start, e.g. "stop please"
    const re = new RegExp(`^${kw}\\b`, 'i');
    if (re.test(t)) return true;
  }
  return false;
}

export async function POST() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const detected: Array<{ phone: string; text: string; ts: number }> = [];
  const errors: Array<{ chat: string; status: number }> = [];

  // Page through all chats with inbound activity.
  let offset = 0;
  const PAGE = 100;
  let pageCount = 0;
  const MAX_PAGES = 10; // 1000 chats safety cap

  while (pageCount < MAX_PAGES) {
    const list = await blooioListChats({ limit: PAGE, offset });
    if (!list.ok) {
      errors.push({ chat: 'list', status: list.status });
      break;
    }
    if (list.chats.length === 0) break;

    for (const chat of list.chats) {
      if (chat.inbound_count === 0) continue;

      const msgs = await blooioListMessages(chat.id, { limit: 50 });
      if (!msgs.ok) {
        errors.push({ chat: chat.id, status: msgs.status });
        continue;
      }
      for (const m of msgs.messages) {
        if (m.direction !== 'inbound') continue;
        if (looksLikeStop(m.text)) {
          detected.push({ phone: chat.id, text: m.text, ts: m.time_sent });
          break; // one detection per phone is enough
        }
      }
    }

    if (list.chats.length < PAGE) break;
    offset += PAGE;
    pageCount += 1;
  }

  // Upsert into opt_outs. phone_number is PK, so ON CONFLICT updates the row.
  let inserted = 0;
  let alreadyOptedOut = 0;
  for (const d of detected) {
    const { error } = await supabaseAdmin.from('opt_outs').upsert(
      {
        phone_number: d.phone,
        reason: 'stop_reply',
        opted_out_at: new Date(d.ts).toISOString(),
      },
      { onConflict: 'phone_number', ignoreDuplicates: false }
    );
    if (error) {
      const msg = (error.message || '').toLowerCase();
      if (msg.includes('duplicate')) alreadyOptedOut += 1;
      else errors.push({ chat: d.phone, status: -1 });
    } else {
      inserted += 1;
    }
  }

  return Response.json({
    ok: true,
    chatsScanned: pageCount * PAGE,
    stopMatches: detected.length,
    inserted,
    alreadyOptedOut,
    sample: detected.slice(0, 5),
    errors: errors.slice(0, 10),
  });
}
