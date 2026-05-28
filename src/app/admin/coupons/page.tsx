import Link from 'next/link';
import { supabaseAdmin } from '@/lib/supabase-admin';

type Coupon = {
  id: string;
  code: string;
  phone_number: string;
  campaign_id: string | null;
  discount_pct: number | null;
  expires_at: string | null;
  redeemed_at: string | null;
  redeemed_order_id: string | null;
  created_at: string;
};

type Campaign = { id: string; name: string };

async function getData() {
  const [coupons, campaigns] = await Promise.all([
    supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500),
    supabaseAdmin.from('campaigns').select('id, name'),
  ]);
  return {
    coupons: (coupons.data || []) as Coupon[],
    campaigns: new Map(((campaigns.data || []) as Campaign[]).map((c) => [c.id, c.name])),
  };
}

function fmtPhone(e164: string) {
  const d = e164.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1'))
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function isExpired(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export default async function CouponsPage() {
  const { coupons, campaigns } = await getData();
  const redeemed = coupons.filter((c) => c.redeemed_at).length;
  const expired = coupons.filter((c) => !c.redeemed_at && isExpired(c.expires_at)).length;
  const active = coupons.length - redeemed - expired;
  const redemptionRate = coupons.length
    ? Math.round((redeemed / coupons.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Coupons</p>
        <h1 className="text-3xl font-light">{coupons.length} total</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Active" value={active} tone="amber" />
        <StatCard label="Redeemed" value={redeemed} tone="green" />
        <StatCard label="Expired" value={expired} tone="neutral" />
        <StatCard
          label="Redemption rate"
          value={`${redemptionRate}%`}
          hint={`${redeemed} of ${coupons.length}`}
        />
      </div>

      <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
        <table className="w-full text-[12px]">
          <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Code</th>
              <th className="px-4 py-3 text-left font-medium">Phone</th>
              <th className="px-4 py-3 text-left font-medium">Campaign</th>
              <th className="px-4 py-3 text-left font-medium">Discount</th>
              <th className="px-4 py-3 text-left font-medium">Expires</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {coupons.map((c) => {
              const exp = isExpired(c.expires_at);
              const status: 'redeemed' | 'expired' | 'active' = c.redeemed_at
                ? 'redeemed'
                : exp
                ? 'expired'
                : 'active';
              const campaignName = c.campaign_id ? campaigns.get(c.campaign_id) : null;
              return (
                <tr key={c.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3 font-mono text-[11px]">{c.code}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-600">
                    {fmtPhone(c.phone_number)}
                  </td>
                  <td className="px-4 py-3 text-neutral-600 max-w-xs truncate">
                    {c.campaign_id ? (
                      <Link
                        href={`/admin/campaigns/${c.campaign_id}`}
                        className="hover:underline"
                      >
                        {campaignName || c.campaign_id.slice(0, 8)}
                      </Link>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {c.discount_pct != null ? `${c.discount_pct}%` : '—'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{fmtDate(c.expires_at)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[9px] uppercase tracking-[0.3em] ${
                        status === 'redeemed'
                          ? 'text-green-600'
                          : status === 'expired'
                          ? 'text-neutral-400'
                          : 'text-amber-600'
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                </tr>
              );
            })}
            {coupons.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-16 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]"
                >
                  No coupons yet — drop {`{{coupon_code}}`} in a campaign template to auto-mint
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: number | string;
  hint?: string;
  tone?: 'green' | 'amber' | 'neutral';
}) {
  const valueTone =
    tone === 'green'
      ? 'text-green-700'
      : tone === 'amber'
      ? 'text-amber-700'
      : 'text-black';
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-5">
      <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">{label}</p>
      <p className={`text-3xl font-light ${valueTone}`}>{value}</p>
      {hint && <p className="text-[10px] text-neutral-500 mt-2">{hint}</p>}
    </div>
  );
}
