import { normalizePhone, supabaseAdmin } from '@/lib/supabase-admin';
import { EarlyAccessPanel } from './early-access-panel';

type Sub = { id: string; phone_number: string; created_at: string; cohort: number };

async function getData() {
  const [subsRes, welcomedRes, earlyAccessRes, sentRes, optsRes] = await Promise.all([
    supabaseAdmin
      .from('early_access')
      .select('id, phone_number, created_at, cohort')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'welcome'),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'early_access'),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number, sent_at')
      .order('sent_at', { ascending: false }),
    supabaseAdmin.from('opt_outs').select('phone_number'),
  ]);

  const welcomedSet = new Set(
    (welcomedRes.data || []).map((r: { phone_number: string }) => normalizePhone(r.phone_number))
  );
  const earlyAccessSet = new Set(
    (earlyAccessRes.data || []).map((r: { phone_number: string }) => normalizePhone(r.phone_number))
  );
  const optSet = new Set(
    (optsRes.data || []).map((r: { phone_number: string }) => normalizePhone(r.phone_number))
  );

  const lastSentMap = new Map<string, string>();
  for (const row of (sentRes.data || []) as { phone_number: string; sent_at: string }[]) {
    const k = normalizePhone(row.phone_number);
    if (!lastSentMap.has(k)) lastSentMap.set(k, row.sent_at);
  }

  return {
    subs: (subsRes.data || []) as Sub[],
    welcomedSet,
    earlyAccessSet,
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

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

interface CohortMeta {
  num: number;
  size: number;
  first: string;
  last: string;
  earlyAccessSentCount: number;
  label: string; // "May 12 → May 20" or "May 22" if single day
}

function buildCohortMeta(subs: Sub[], earlyAccessSet: Set<string>): CohortMeta[] {
  const byCohort = new Map<number, Sub[]>();
  for (const s of subs) {
    if (!byCohort.has(s.cohort)) byCohort.set(s.cohort, []);
    byCohort.get(s.cohort)!.push(s);
  }
  return Array.from(byCohort.entries())
    .map(([num, rows]) => {
      const sorted = [...rows].sort((a, b) => a.created_at.localeCompare(b.created_at));
      const first = sorted[0].created_at;
      const last = sorted[sorted.length - 1].created_at;
      const firstShort = fmtShortDate(first);
      const lastShort = fmtShortDate(last);
      const label = firstShort === lastShort ? firstShort : `${firstShort} → ${lastShort}`;
      const earlySent = rows.filter((r) =>
        earlyAccessSet.has(normalizePhone(r.phone_number))
      ).length;
      return {
        num,
        size: rows.length,
        first,
        last,
        earlyAccessSentCount: earlySent,
        label,
      };
    })
    .sort((a, b) => a.num - b.num);
}

export default async function SubscribersPage() {
  const { subs, welcomedSet, earlyAccessSet, optSet, lastSentMap } = await getData();
  const welcomed = subs.filter((s) => welcomedSet.has(normalizePhone(s.phone_number))).length;
  const pending = subs.length - welcomed;
  const earlyAccessSent = subs.filter((s) =>
    earlyAccessSet.has(normalizePhone(s.phone_number))
  ).length;

  const cohorts = buildCohortMeta(subs, earlyAccessSet);
  const cohortLabelByNum = new Map(cohorts.map((c) => [c.num, c.label]));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Subscribers</p>
          <h1 className="text-3xl font-light">{subs.length} total</h1>
          <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
            {welcomed} welcomed · {pending} pending welcome · {optSet.size} opted out
          </p>
          <p className="text-[11px] text-neutral-500 mt-1 tracking-wide">
            {earlyAccessSent} early-access SMS sent · {subs.length - earlyAccessSent} still to send
          </p>
          <p className="text-[11px] text-neutral-500 mt-1 tracking-wide">
            {cohorts.length} groups (15 per group by SMS signup date)
          </p>
        </div>
        <a
          href="/admin/subscribers/export"
          className="text-[10px] uppercase tracking-[0.3em] border border-neutral-300 px-4 py-2 hover:bg-black hover:text-white transition-colors"
        >
          Export CSV
        </a>
      </div>

      {/* Early-access editor + per-group send buttons */}
      <EarlyAccessPanel
        groups={cohorts.map((c) => ({
          num: c.num,
          label: c.label,
          size: c.size,
          sent: c.earlyAccessSentCount,
        }))}
      />

      {/* Group breakdown chips — labeled by date, with early-access send progress */}
      {cohorts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cohorts.map((c) => {
            const allSent = c.earlyAccessSentCount === c.size;
            return (
              <span
                key={c.num}
                className={`text-[9px] uppercase tracking-[0.3em] border px-3 py-1.5 ${
                  allSent
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : c.earlyAccessSentCount > 0
                    ? 'bg-amber-50 border-amber-300 text-amber-700'
                    : 'bg-white border-neutral-300 text-black'
                }`}
                title={`Group ${c.num}: ${c.earlyAccessSentCount}/${c.size} early-access SMS sent`}
              >
                {c.label}
                <span className="opacity-60 ml-2">
                  {c.earlyAccessSentCount}/{c.size}
                </span>
              </span>
            );
          })}
        </div>
      )}

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium w-40">Group</th>
              <th className="px-4 py-3 text-left font-medium">Joined</th>
              <th className="px-4 py-3 text-left font-medium w-32">Early access</th>
              <th className="px-4 py-3 text-left font-medium">Last contacted</th>
              <th className="px-4 py-3 text-left font-medium">Welcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {subs.map((s) => {
              const key = normalizePhone(s.phone_number);
              const optedOut = optSet.has(key);
              const isWelcomed = welcomedSet.has(key);
              const isEarlyAccessSent = earlyAccessSet.has(key);
              const lastSent = lastSentMap.get(key);
              const groupLabel = cohortLabelByNum.get(s.cohort) || `#${s.cohort}`;
              return (
                <tr key={s.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono">{fmtPhone(s.phone_number)}</td>
                  <td className="px-4 py-3">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-neutral-700 border border-neutral-300 px-2 py-0.5">
                      {groupLabel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">{fmtDate(s.created_at)}</td>
                  <td className="px-4 py-3">
                    {isEarlyAccessSent ? (
                      <span className="text-[9px] uppercase tracking-[0.3em] text-green-700">
                        ✓ Sent
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase tracking-[0.3em] text-neutral-400">
                        Not sent
                      </span>
                    )}
                  </td>
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
                <td colSpan={6} className="px-4 py-10 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]">
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
