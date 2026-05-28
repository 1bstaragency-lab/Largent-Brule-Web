import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Campaign = {
  id: string;
  name: string;
  status: string;
  segment: string;
  total_recipients: number;
  sent_count: number;
  created_at: string;
  queued_at: string | null;
  completed_at: string | null;
  estimated_completion_at: string | null;
};

async function getCampaigns(): Promise<Campaign[]> {
  const { data, error } = await supabaseAdmin
    .from('campaigns')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) return [];
  return (data || []) as Campaign[];
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    draft: 'text-neutral-500',
    queued: 'text-amber-600',
    sending: 'text-blue-600',
    completed: 'text-green-600',
    paused: 'text-orange-600',
    cancelled: 'text-red-500',
  };
  return (
    <span
      className={`text-[9px] uppercase tracking-[0.3em] ${
        styles[status] || 'text-neutral-500'
      }`}
    >
      {status}
    </span>
  );
}

export default async function CampaignsListPage() {
  const campaigns = await getCampaigns();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
            Campaigns
          </p>
          <h1 className="text-3xl font-light">{campaigns.length} total</h1>
        </div>
        <Link
          href="/admin/campaigns/new"
          className="text-[10px] uppercase tracking-[0.3em] bg-black text-white px-5 py-3 hover:bg-[#111] transition-colors"
        >
          + New campaign
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Segment</th>
              <th className="px-4 py-3 text-left font-medium">Progress</th>
              <th className="px-4 py-3 text-left font-medium">Created</th>
              <th className="px-4 py-3 text-left font-medium">Done by</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {campaigns.map((c) => {
              const pct = c.total_recipients
                ? Math.round((c.sent_count / c.total_recipients) * 100)
                : 0;
              return (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/campaigns/${c.id}`}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{statusBadge(c.status)}</td>
                  <td className="px-4 py-3 text-neutral-600">{c.segment}</td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.sent_count} / {c.total_recipients}{' '}
                    <span className="text-neutral-400">({pct}%)</span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{fmtDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {c.status === 'completed'
                      ? fmtDate(c.completed_at)
                      : c.status === 'cancelled'
                      ? '—'
                      : fmtDate(c.estimated_completion_at)}
                  </td>
                </tr>
              );
            })}
            {campaigns.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]"
                >
                  No campaigns yet — create your first one →
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
