import Link from 'next/link';
import { blooioListMessages, type BlooioMessage } from '@/lib/blooio';
import { supabaseAdmin } from '@/lib/supabase-admin';

function fmtPhone(e164: string) {
  const d = e164.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1'))
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

function fmtTime(ms: number) {
  return new Date(ms).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

async function getData(chatId: string) {
  const [msgRes, sentRes, optRes, couponRes] = await Promise.all([
    blooioListMessages(chatId, { limit: 200 }),
    supabaseAdmin
      .from('sent_messages')
      .select('blooio_message_id, message_type, campaign_id, coupon_code')
      .eq('phone_number', chatId),
    supabaseAdmin.from('opt_outs').select('phone_number').eq('phone_number', chatId).maybeSingle(),
    supabaseAdmin
      .from('coupons')
      .select('code, discount_pct, expires_at, redeemed_at, campaign_id')
      .eq('phone_number', chatId)
      .order('created_at', { ascending: false }),
  ]);

  // Build a map: blooio_message_id -> our metadata
  const metaByMsgId = new Map<
    string,
    { type: string; campaign_id: string | null; coupon_code: string | null }
  >();
  for (const row of (sentRes.data || []) as Array<{
    blooio_message_id: string | null;
    message_type: string;
    campaign_id: string | null;
    coupon_code: string | null;
  }>) {
    if (row.blooio_message_id) {
      metaByMsgId.set(row.blooio_message_id, {
        type: row.message_type,
        campaign_id: row.campaign_id,
        coupon_code: row.coupon_code,
      });
    }
  }

  // Sort messages oldest-first for thread display
  const messages = [...msgRes.messages].sort((a, b) => a.time_sent - b.time_sent);

  return {
    messages,
    ok: msgRes.ok,
    status: msgRes.status,
    metaByMsgId,
    optedOut: !!optRes.data,
    coupons: couponRes.data || [],
  };
}

export default async function InboxThreadPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId: raw } = await params;
  const chatId = decodeURIComponent(raw);
  const { messages, ok, status, metaByMsgId, optedOut, coupons } = await getData(chatId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/inbox"
            className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-black transition-colors"
          >
            ← Inbox
          </Link>
          <h1 className="text-3xl font-light mt-3 font-mono">{fmtPhone(chatId)}</h1>
          <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
            {messages.length} messages · thread with{' '}
            <span className="font-mono text-black">
              {(() => {
                const s = process.env.BLOOIO_SENDER_NUMBER || '';
                return s
                  ? `+1 (${s.slice(2, 5)}) ${s.slice(5, 8)}-${s.slice(8)}`
                  : 'your sender';
              })()}
            </span>
            {optedOut && (
              <span className="ml-3 text-red-500 uppercase tracking-[0.3em]">· Opted out</span>
            )}
          </p>
        </div>
      </div>

      {!ok && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-[12px] text-red-700">
          Blooio API returned HTTP {status}. Could not load thread.
        </div>
      )}

      {/* Coupons sidebar (if any) */}
      {coupons.length > 0 && (
        <div className="bg-white border border-neutral-200 rounded-sm p-5">
          <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
            Coupons bound to this number
          </p>
          <div className="space-y-2">
            {(coupons as Array<{
              code: string;
              discount_pct: number | null;
              expires_at: string | null;
              redeemed_at: string | null;
            }>).map((c) => (
              <div key={c.code} className="flex items-center justify-between text-[12px]">
                <span className="font-mono">{c.code}</span>
                <span className="text-neutral-500">
                  {c.discount_pct ? `${c.discount_pct}% off` : '—'}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-[0.3em] ${
                    c.redeemed_at ? 'text-green-600' : 'text-amber-600'
                  }`}
                >
                  {c.redeemed_at ? 'Redeemed' : 'Active'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Thread */}
      <div className="space-y-3">
        {messages.map((m) => (
          <MessageBubble key={m.message_id} m={m} meta={metaByMsgId.get(m.message_id)} />
        ))}
        {messages.length === 0 && (
          <p className="text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em] py-16">
            No messages
          </p>
        )}
      </div>
    </div>
  );
}

function MessageBubble({
  m,
  meta,
}: {
  m: BlooioMessage;
  meta?: { type: string; campaign_id: string | null; coupon_code: string | null };
}) {
  const isOutbound = m.direction === 'outbound';
  return (
    <div className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-xl space-y-1 ${isOutbound ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
            isOutbound
              ? m.protocol === 'imessage'
                ? 'bg-blue-500 text-white'
                : 'bg-green-600 text-white'
              : 'bg-neutral-100 text-black'
          }`}
        >
          {m.text}
        </div>
        <div
          className={`flex items-center gap-2 text-[10px] text-neutral-400 ${
            isOutbound ? 'justify-end' : 'justify-start'
          }`}
        >
          <span>{fmtTime(m.time_sent)}</span>
          {m.status && <span className="uppercase tracking-[0.2em]">· {m.status}</span>}
          {meta?.type && (
            <span className="uppercase tracking-[0.2em]">
              · {meta.type}
              {meta.campaign_id && (
                <Link
                  href={`/admin/campaigns/${meta.campaign_id}`}
                  className="ml-1 underline hover:text-black"
                >
                  campaign
                </Link>
              )}
            </span>
          )}
          {meta?.coupon_code && (
            <span className="font-mono text-blue-600">{meta.coupon_code}</span>
          )}
        </div>
      </div>
    </div>
  );
}
