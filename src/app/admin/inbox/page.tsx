import Link from 'next/link';
import { blooioListChats, type BlooioChat } from '@/lib/blooio';
import { supabaseAdmin } from '@/lib/supabase-admin';
import SyncOptOutsButton from './sync-opt-outs-button';

async function getData() {
  const [chatsResult, optsResult] = await Promise.all([
    blooioListChats({ limit: 200 }),
    supabaseAdmin.from('opt_outs').select('phone_number'),
  ]);

  const optSet = new Set(
    (optsResult.data || []).map((r: { phone_number: string }) => r.phone_number)
  );

  // Sort by last activity desc
  const chats = [...chatsResult.chats].sort(
    (a, b) => (b.last_message_time ?? 0) - (a.last_message_time ?? 0)
  );

  return { chats, ok: chatsResult.ok, status: chatsResult.status, optSet };
}

function fmtPhone(e164: string) {
  const d = e164.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1'))
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

function fmtRelative(ms: number | null) {
  if (!ms) return '—';
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function truncate(s: string, n = 80) {
  const clean = s.replace(/\s+/g, ' ').trim();
  return clean.length > n ? clean.slice(0, n) + '…' : clean;
}

export default async function InboxPage() {
  const { chats, ok, status, optSet } = await getData();

  const totalReplies = chats.reduce((sum, c) => sum + c.inbound_count, 0);
  const withReplies = chats.filter((c) => c.inbound_count > 0).length;
  const imessage = chats.filter(
    (c) => c.last_message?.protocol === 'imessage'
  ).length;

  const senderNumber = process.env.BLOOIO_SENDER_NUMBER || '';
  const senderDisplay = senderNumber
    ? `+1 (${senderNumber.slice(2, 5)}) ${senderNumber.slice(5, 8)}-${senderNumber.slice(8)}`
    : '—';

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Inbox</p>
          <h1 className="text-3xl font-light">{chats.length} conversations</h1>
          <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
            Sending from <span className="font-mono text-black">{senderDisplay}</span>
            <span className="text-neutral-400"> · L&apos;Argent Brûlé</span>
          </p>
          <p className="text-[11px] text-neutral-500 mt-1 tracking-wide">
            {totalReplies} replies across {withReplies} chats · {imessage} on iMessage
          </p>
        </div>
        <SyncOptOutsButton />
      </div>

      {!ok && (
        <div className="bg-red-50 border border-red-200 rounded-sm p-4 text-[12px] text-red-700">
          Blooio API returned HTTP {status}. Live inbox unavailable.
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium w-44">Contact</th>
              <th className="px-4 py-3 text-left font-medium">Last message</th>
              <th className="px-4 py-3 text-left font-medium w-24">Replies</th>
              <th className="px-4 py-3 text-left font-medium w-28">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {chats.map((c) => {
              const optedOut = optSet.has(c.id);
              const hasReplies = c.inbound_count > 0;
              return (
                <tr
                  key={c.id}
                  className={`hover:bg-neutral-50 ${hasReplies ? 'bg-amber-50/30' : ''}`}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/inbox/${encodeURIComponent(c.id)}`}
                      className="block"
                    >
                      <div className="font-mono text-[11px]">{fmtPhone(c.id)}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <ProtocolBadge protocol={c.last_message?.protocol} />
                        {optedOut && (
                          <span className="text-[8px] uppercase tracking-[0.3em] text-red-500">
                            Opted out
                          </span>
                        )}
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/inbox/${encodeURIComponent(c.id)}`} className="block">
                      <p className="text-neutral-700 leading-snug">
                        {c.last_message ? (
                          <>
                            {c.last_message.direction === 'inbound' && (
                              <span className="text-amber-600 text-[10px] uppercase tracking-[0.3em] mr-2">
                                ← reply
                              </span>
                            )}
                            {truncate(c.last_message.text, 120)}
                          </>
                        ) : (
                          <span className="text-neutral-400">no messages</span>
                        )}
                      </p>
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {hasReplies ? (
                      <span className="text-[9px] uppercase tracking-[0.3em] text-amber-600 font-medium">
                        {c.inbound_count} new
                      </span>
                    ) : (
                      <span className="text-[10px] text-neutral-300">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {fmtRelative(c.last_message_time)}
                  </td>
                </tr>
              );
            })}
            {chats.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-16 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]"
                >
                  No conversations yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
        Live from Blooio. Refresh the page to pull the latest. The Sync opt-outs button scans all
        inbound messages for STOP / UNSUBSCRIBE / opt out and adds matching phones to the
        opt_outs table — they'll be skipped by every future campaign.
      </p>
    </div>
  );
}

function ProtocolBadge({ protocol }: { protocol: string | undefined }) {
  if (!protocol) return null;
  if (protocol === 'imessage')
    return (
      <span className="text-[8px] uppercase tracking-[0.3em] text-blue-600">iMessage</span>
    );
  return (
    <span className="text-[8px] uppercase tracking-[0.3em] text-green-700">{protocol}</span>
  );
}
