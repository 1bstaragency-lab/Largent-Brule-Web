import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseAdmin } from '@/lib/supabase-admin';
import CancelButton from './cancel-button';

type Campaign = {
  id: string;
  name: string;
  status: string;
  segment: string;
  body_template: string;
  total_recipients: number;
  sent_count: number;
  created_at: string;
  queued_at: string | null;
  completed_at: string | null;
  estimated_completion_at: string | null;
};

type Recipient = {
  id: string;
  phone_number: string;
  status: string;
  rendered_body: string;
  sent_at: string | null;
  error: string | null;
};

async function getData(id: string) {
  const [c, r] = await Promise.all([
    supabaseAdmin.from('campaigns').select('*').eq('id', id).maybeSingle(),
    supabaseAdmin
      .from('campaign_recipients')
      .select('id, phone_number, status, rendered_body, sent_at, error')
      .eq('campaign_id', id)
      .order('created_at', { ascending: true }),
  ]);
  return {
    campaign: c.data as Campaign | null,
    recipients: (r.data || []) as Recipient[],
  };
}

function fmtDateTime(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function fmtPhone(e164: string) {
  const d = e164.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1'))
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'text-amber-600',
  sent: 'text-green-600',
  failed: 'text-red-500',
  skipped_opt_out: 'text-neutral-400',
  cancelled: 'text-neutral-400',
};

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { campaign, recipients } = await getData(id);
  if (!campaign) notFound();

  const pct = campaign.total_recipients
    ? Math.round((campaign.sent_count / campaign.total_recipients) * 100)
    : 0;
  const counts = recipients.reduce<Record<string, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  const canCancel = ['queued', 'sending'].includes(campaign.status);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link
            href="/admin/campaigns"
            className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-black transition-colors"
          >
            ← Campaigns
          </Link>
          <h1 className="text-3xl font-light mt-3">{campaign.name}</h1>
          <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
            <span
              className={`uppercase tracking-[0.3em] ${
                STATUS_STYLES[campaign.status] || 'text-neutral-500'
              }`}
            >
              {campaign.status}
            </span>{' '}
            · {campaign.segment} · created {fmtDateTime(campaign.created_at)}
          </p>
        </div>
        {canCancel && <CancelButton campaignId={campaign.id} />}
      </div>

      {/* Progress + counts */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <ProgressCard
          label="Progress"
          value={`${campaign.sent_count} / ${campaign.total_recipients}`}
          pct={pct}
        />
        <StatCard label="Pending" value={counts.pending || 0} />
        <StatCard label="Sent" value={counts.sent || 0} />
        <StatCard label="Failed" value={counts.failed || 0} />
        <StatCard
          label="Skipped"
          value={(counts.skipped_opt_out || 0) + (counts.cancelled || 0)}
        />
      </div>

      {/* Body template */}
      <div className="bg-white border border-neutral-200 rounded-sm p-6">
        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
          Template
        </p>
        <pre className="whitespace-pre-wrap text-[12px] text-black leading-relaxed font-sans">
          {campaign.body_template}
        </pre>
      </div>

      {/* Recipients */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
          Recipients ({recipients.length})
        </p>
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Sent</th>
                <th className="px-4 py-3 text-left font-medium">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {recipients.map((r) => (
                <tr key={r.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono">{fmtPhone(r.phone_number)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] uppercase tracking-[0.3em] ${
                        STATUS_STYLES[r.status] || 'text-neutral-500'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{fmtDateTime(r.sent_at)}</td>
                  <td className="px-4 py-3 text-red-500 text-[10px] max-w-xs truncate">
                    {r.error || ''}
                  </td>
                </tr>
              ))}
              {recipients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]">
                    No recipients
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-4">
      <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-2">{label}</p>
      <p className="text-2xl font-light">{value}</p>
    </div>
  );
}

function ProgressCard({ label, value, pct }: { label: string; value: string; pct: number }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-4">
      <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-2">{label}</p>
      <p className="text-2xl font-light">{value}</p>
      <div className="h-1 bg-neutral-100 mt-3 rounded-full overflow-hidden">
        <div className="h-full bg-black transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-neutral-500 mt-2">{pct}%</p>
    </div>
  );
}
