import { supabaseAdmin } from '@/lib/supabase-admin';

const DAILY_CAP = 15;

async function getStats() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const sinceWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [subs, sent24h, sentWeek, optOuts, pending, activeCampaigns] = await Promise.all([
    supabaseAdmin.from('early_access').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('sent_messages').select('id', { count: 'exact', head: true }).gte('sent_at', since24h),
    supabaseAdmin.from('sent_messages').select('id', { count: 'exact', head: true }).gte('sent_at', sinceWeek),
    supabaseAdmin.from('opt_outs').select('phone_number', { count: 'exact', head: true }),
    supabaseAdmin.from('campaign_recipients').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabaseAdmin.from('campaigns').select('id', { count: 'exact', head: true }).in('status', ['queued', 'sending']),
  ]);

  return {
    totalSubs: subs.count ?? 0,
    sentToday: sent24h.count ?? 0,
    sentWeek: sentWeek.count ?? 0,
    optOuts: optOuts.count ?? 0,
    pendingQueue: pending.count ?? 0,
    activeCampaigns: activeCampaigns.count ?? 0,
  };
}

export default async function AdminHome() {
  const s = await getStats();
  const remainingToday = Math.max(0, DAILY_CAP - s.sentToday);
  const queueDays = remainingToday > 0 && s.pendingQueue > 0 ? Math.ceil(s.pendingQueue / DAILY_CAP) : null;

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Overview</p>
        <h1 className="text-3xl font-light">L&apos;Argent Brûlé · S/S 26</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Subscribers" value={s.totalSubs} />
        <StatCard
          label="Sent today"
          value={`${s.sentToday} / ${DAILY_CAP}`}
          hint={`${remainingToday} remaining in the next 24h`}
        />
        <StatCard label="Sent this week" value={s.sentWeek} />
        <StatCard label="Opt-outs" value={s.optOuts} />
        <StatCard
          label="Pending queue"
          value={s.pendingQueue}
          hint={queueDays ? `~${queueDays} day${queueDays === 1 ? '' : 's'} to drain at cap` : undefined}
        />
        <StatCard label="Active campaigns" value={s.activeCampaigns} />
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm p-6 text-[12px] text-neutral-600 leading-relaxed">
        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">Rate limit notice</p>
        <p>
          Blooio is capped at ~15 messages per 24 hours. This budget is shared across welcomes
          (existing auto-task) and campaigns (sent via the new Cowork sender task). The counter
          above reflects every message logged in <code className="bg-neutral-50 px-1">sent_messages</code>.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5">
      <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">{label}</p>
      <p className="text-3xl font-light">{value}</p>
      {hint && <p className="text-[10px] text-neutral-500 mt-2 leading-relaxed">{hint}</p>}
    </div>
  );
}
