import { supabaseAdmin } from '@/lib/supabase-admin';

type CartRow = {
  id: string;
  session_id: string;
  phone_number: string | null;
  status: string;
  last_activity_at: string;
  checkout_started_at: string | null;
  purchased_at: string | null;
  recovery_sent_at: string | null;
  recovery_step: number;
  created_at: string;
};

type CartItemRow = {
  cart_id: string;
  product_name: string;
  variant: string | null;
  price_cents: number;
  quantity: number;
};

type Abandoned = {
  cart_id: string;
  phone_number: string;
  minutes_since_activity: number;
  item_count: number;
  subtotal_cents: number;
  recovery_step: number;
};

async function getData() {
  const [cartsRes, itemsRes, abandonedRes] = await Promise.all([
    supabaseAdmin
      .from('carts')
      .select('*')
      .order('last_activity_at', { ascending: false })
      .limit(200),
    supabaseAdmin.from('cart_items').select('cart_id, product_name, variant, price_cents, quantity'),
    supabaseAdmin.from('v_abandoned_carts').select('*').order('minutes_since_activity', { ascending: true }),
  ]);

  const itemsByCart = new Map<string, CartItemRow[]>();
  for (const it of (itemsRes.data || []) as CartItemRow[]) {
    const arr = itemsByCart.get(it.cart_id) || [];
    arr.push(it);
    itemsByCart.set(it.cart_id, arr);
  }

  return {
    carts: (cartsRes.data || []) as CartRow[],
    itemsByCart,
    abandoned: (abandonedRes.data || []) as Abandoned[],
  };
}

function fmtPhone(e164: string | null) {
  if (!e164) return '—';
  const d = e164.replace(/\D/g, '');
  if (d.length === 11 && d.startsWith('1'))
    return `+1 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  return e164;
}

function fmtRelative(iso: string | null) {
  if (!iso) return '—';
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function fmtUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

const STATUS_TONE: Record<string, string> = {
  active: 'text-amber-600',
  checkout_started: 'text-blue-600',
  purchased: 'text-green-600',
  abandoned: 'text-red-500',
  recovered: 'text-purple-600',
};

export default async function CartsPage() {
  const { carts, itemsByCart, abandoned } = await getData();

  const counts = carts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  const withPhone = carts.filter((c) => c.phone_number).length;
  const withItems = carts.filter((c) => (itemsByCart.get(c.id) || []).length > 0).length;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">Carts</p>
        <h1 className="text-3xl font-light">{carts.length} total</h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
          {withPhone} with phone · {withItems} with items · {abandoned.length} eligible for recovery
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Active" value={counts.active || 0} tone="amber" />
        <StatCard label="At checkout" value={counts.checkout_started || 0} tone="blue" />
        <StatCard label="Purchased" value={counts.purchased || 0} tone="green" />
        <StatCard label="Abandoned" value={counts.abandoned || 0} tone="red" />
        <StatCard label="Recovered" value={counts.recovered || 0} tone="purple" />
      </div>

      {/* Abandoned cart queue (Phase B targets these) */}
      {abandoned.length > 0 && (
        <div>
          <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">
            Recovery queue ({abandoned.length})
          </p>
          <div className="bg-white border border-amber-200 rounded-sm overflow-hidden">
            <table className="w-full text-[12px]">
              <thead className="bg-amber-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Idle</th>
                  <th className="px-4 py-3 text-left font-medium">Items</th>
                  <th className="px-4 py-3 text-left font-medium">Subtotal</th>
                  <th className="px-4 py-3 text-left font-medium">Recovery step</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {abandoned.map((a) => (
                  <tr key={a.cart_id}>
                    <td className="px-4 py-3 font-mono text-[11px]">{fmtPhone(a.phone_number)}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {Math.floor(a.minutes_since_activity)}m
                    </td>
                    <td className="px-4 py-3 text-neutral-600">{a.item_count}</td>
                    <td className="px-4 py-3 text-neutral-600">{fmtUsd(a.subtotal_cents)}</td>
                    <td className="px-4 py-3">
                      <span className="text-[9px] uppercase tracking-[0.3em] text-amber-600">
                        {a.recovery_step === 0
                          ? 'Not sent'
                          : a.recovery_step === 1
                          ? 'Gentle sent'
                          : '10% sent'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">
            Phase B (abandoned cart Cowork task) will drain this list automatically.
          </p>
        </div>
      )}

      {/* All carts */}
      <div>
        <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-3">All carts</p>
        <div className="bg-white border border-neutral-200 rounded-sm overflow-hidden">
          <table className="w-full text-[12px]">
            <thead className="bg-neutral-50 text-[9px] uppercase tracking-[0.3em] text-neutral-500">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Phone</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Items</th>
                <th className="px-4 py-3 text-left font-medium">Subtotal</th>
                <th className="px-4 py-3 text-left font-medium">Last activity</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {carts.map((c) => {
                const items = itemsByCart.get(c.id) || [];
                const subtotal = items.reduce((s, i) => s + i.price_cents * i.quantity, 0);
                return (
                  <tr key={c.id} className="hover:bg-neutral-50">
                    <td className="px-4 py-3 font-mono text-[11px]">{fmtPhone(c.phone_number)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[9px] uppercase tracking-[0.3em] ${
                          STATUS_TONE[c.status] || 'text-neutral-500'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {items.length === 0 ? (
                        <span className="text-neutral-300">—</span>
                      ) : (
                        <span title={items.map((i) => i.product_name).join(', ')}>
                          {items.length}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-600">
                      {items.length ? fmtUsd(subtotal) : '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{fmtRelative(c.last_activity_at)}</td>
                    <td className="px-4 py-3 text-neutral-500">{fmtRelative(c.created_at)}</td>
                  </tr>
                );
              })}
              {carts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-16 text-center text-neutral-400 text-[11px] uppercase tracking-[0.3em]"
                  >
                    No carts yet — first visit to /collections will create one
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

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: 'green' | 'amber' | 'red' | 'blue' | 'purple';
}) {
  const toneClass =
    tone === 'green'
      ? 'text-green-700'
      : tone === 'amber'
      ? 'text-amber-700'
      : tone === 'red'
      ? 'text-red-600'
      : tone === 'blue'
      ? 'text-blue-700'
      : tone === 'purple'
      ? 'text-purple-700'
      : 'text-black';
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-4">
      <p className="text-[9px] uppercase tracking-[0.4em] text-neutral-400 mb-2">{label}</p>
      <p className={`text-2xl font-light ${toneClass}`}>{value}</p>
    </div>
  );
}
