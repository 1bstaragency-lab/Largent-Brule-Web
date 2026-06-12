// /admin/early-access — dedicated tab for editing the early-access SMS
// (body + image) and triggering per-group sends. Mirrors the cohort
// computation used by /admin/subscribers so progress is consistent.
import { normalizePhone, supabaseAdmin } from '@/lib/supabase-admin';
import { EarlyAccessPanel } from './panel';

export const dynamic = 'force-dynamic';

interface Sub {
  id: string;
  phone_number: string;
  created_at: string;
  cohort: number;
}

interface CohortMeta {
  num: number;
  label: string;
  size: number;
  earlyAccessSentCount: number;
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function buildCohorts(
  subs: Sub[],
  earlyAccessSet: Set<string>
): CohortMeta[] {
  const byCohort = new Map<number, Sub[]>();
  for (const s of subs) {
    if (!byCohort.has(s.cohort)) byCohort.set(s.cohort, []);
    byCohort.get(s.cohort)!.push(s);
  }
  return Array.from(byCohort.entries())
    .map(([num, rows]) => {
      const sorted = [...rows].sort((a, b) =>
        a.created_at.localeCompare(b.created_at)
      );
      const first = fmtShortDate(sorted[0].created_at);
      const last = fmtShortDate(sorted[sorted.length - 1].created_at);
      const label = first === last ? first : `${first} → ${last}`;
      const earlySent = rows.filter((r) =>
        earlyAccessSet.has(normalizePhone(r.phone_number))
      ).length;
      return {
        num,
        label,
        size: rows.length,
        earlyAccessSentCount: earlySent,
      };
    })
    .sort((a, b) => a.num - b.num);
}

async function getData() {
  const [subsRes, earlyRes] = await Promise.all([
    supabaseAdmin
      .from('early_access')
      .select('id, phone_number, created_at, cohort')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'early_access'),
  ]);

  const earlySet = new Set(
    (earlyRes.data || []).map((r: { phone_number: string }) =>
      normalizePhone(r.phone_number)
    )
  );
  const subs = (subsRes.data || []) as Sub[];
  return { subs, cohorts: buildCohorts(subs, earlySet), earlySet };
}

export default async function EarlyAccessAdminPage() {
  const { subs, cohorts, earlySet } = await getData();
  const totalSent = earlySet.size > 0
    ? subs.filter((s) =>
        earlySet.has(normalizePhone(s.phone_number))
      ).length
    : 0;
  const remaining = subs.length - totalSent;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
          Early Access
        </p>
        <h1 className="text-3xl font-light">{totalSent} sent</h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
          {remaining} still to send · {cohorts.length} groups · 15 per group ·
          Blooio caps at 15 new conversations / day
        </p>
      </div>

      <EarlyAccessPanel
        groups={cohorts.map((c) => ({
          num: c.num,
          label: c.label,
          size: c.size,
          sent: c.earlyAccessSentCount,
        }))}
      />
    </div>
  );
}
