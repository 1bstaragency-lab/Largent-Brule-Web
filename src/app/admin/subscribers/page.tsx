import { normalizePhone, supabaseAdmin } from '@/lib/supabase-admin';

type Sub = { id: string; phone_number: string; created_at: string };

async function getData() {
  const [subsRes, welcomedRes, sentRes, optsRes] = await Promise.all([
    supabaseAdmin
      .from('early_access')
      .select('id, phone_number, created_at')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'welcome'),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number, sent_at')
      .order('sent_at', { ascending: false }),
    supabaseAdmin.from('opt_outs').select('phone_number'),
  ]);

  const welcomedSet = new Set(
    (welcomedRes.data || []).map((r: { phone_number: string }) => normalizePhone(r.phone_number))
  );
  const optSet = new Set(
    (optsRes.data || []).map((r: { phone_number: string }) => normalizePhone(r.phone_number))
  );

  // Most recent send per phone, for "last contacted" column.
  const lastSentMap = new Map<string, string>();
  for (const row of (sentRes.data || []) as { phone_number: string; sent_at: string }[]) {
    const k = normalizePhone(row.phone_number);
    if (!lastSentMap.has(k)) lastSentMap.set(k, row.sent_at);
  }

  return {
    subs: (subsRes.data || []) as Sub[],
    welcomedSet,
    optSet,
    lastSentMap,
  };
}

function fmtPhone(p: string) {
  const d = p.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1'))
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function fmtRelative(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function SubscribersPage() {
  const { subs, welcomedSet, optSet, lastSentMap } = await getData();
  const welcomed = subs.filter((s) => welcomedSet.has(normalizePhone(s.phone_number))).length;
  const pending = subs.length - welcomed;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Subscribers</p>
          <h1 className="text-3xl font-light">{subs.length} total</h1>
          <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
            {welcomed} welcomed · {pending} pending welcome · {optSet.size} opted out
          </p>
        </div>
        <a
          href="/admin/subscribers/export"
          className="text-[10px] uppercase tracking-[0.3em] border border-neutral-300 px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Export CSV
        </a>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium">Last contacted</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {subs.map((s) => {
              const key = normalizePhone(s.phone_number);
              const optedOut = optSet.has(key);
              const isWelcomed = welcomedSet.has(key);
              const lastSent = lastSentMap.get(key);
              return (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono">{fmtPhone(s.phone_number)}</td>
                  <td className="px-4 py-3 text-neutral-600">{fmtDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {lastSent ? fmtRelative(lastSent) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {optedOut ? (
                      <span className="text-[9px] uppercase tracking-[0.3em] text-red-500">
                        Opted out
                      </span>
                    ) : isWelcomed ? (
                      <span className="text-[9px] uppercase tracking-[0.3em] text-green-600">
                        Welcomed
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-[0.3em] text-amber-600">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {subs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]">
                  No subscribers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
