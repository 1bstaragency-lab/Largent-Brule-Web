// /admin/welcome — manually send the canonical welcome SMS. Two modes:
//   1) Per-cohort: button next to each cohort sends to its un-welcomed
//      members. Mirrors /admin/early-access cohort behavior.
//   2) Single phone: paste any number, hit Send.
//
// Welcome body comes from src/lib/welcome.ts (single source of truth).
import { normalizePhone, supabaseAdmin } from '@/lib/supabase-admin';
import { WELCOME_BODY } from '@/lib/welcome';
import { WelcomePanel } from './panel';

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
  welcomedCount: number;
  pendingCount: number;
}

function fmtShortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function buildCohorts(subs: Sub[], welcomedSet: Set<string>): CohortMeta[] {
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
      const welcomed = rows.filter((r) =>
        welcomedSet.has(normalizePhone(r.phone_number))
      ).length;
      return {
        num,
        label,
        size: rows.length,
        welcomedCount: welcomed,
        pendingCount: rows.length - welcomed,
      };
    })
    .sort((a, b) => a.num - b.num);
}

async function getData() {
  const [subsRes, welcRes] = await Promise.all([
    supabaseAdmin
      .from('early_access')
      .select('id, phone_number, created_at, cohort')
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'welcome'),
  ]);
  const subs = (subsRes.data || []) as Sub[];
  const welcomedSet = new Set(
    (welcRes.data || []).map((r: { phone_number: string }) =>
      normalizePhone(r.phone_number)
    )
  );
  return { subs, cohorts: buildCohorts(subs, welcomedSet), welcomedSet };
}

export default async function WelcomeAdminPage() {
  const { subs, cohorts, welcomedSet } = await getData();
  const welcomed = subs.filter((s) =>
    welcomedSet.has(normalizePhone(s.phone_number))
  ).length;
  const pending = subs.length - welcomed;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
          Welcome SMS
        </p>
        <h1 className="text-3xl font-light">{welcomed} welcomed</h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
          {pending} still pending · {cohorts.length} groups · 15/day Blooio cap
          shared with abandoned-cart + campaigns
        </p>
      </div>

      <WelcomePanel
        welcomeBody={WELCOME_BODY}
        groups={cohorts.map((c) => ({
          num: c.num,
          label: c.label,
          size: c.size,
          welcomed: c.welcomedCount,
          pending: c.pendingCount,
        }))}
      />
    </div>
  );
}
