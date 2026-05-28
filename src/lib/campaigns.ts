// Server-only campaign helpers used by API routes + admin pages.
import { normalizePhone, supabaseAdmin } from './supabase-admin';

export type Segment = 'all' | 'unwelcomed' | 'date_range';

export interface SegmentFilter {
  from?: string;  // ISO date string, inclusive
  to?: string;    // ISO date string, inclusive (end-of-day)
}

export const DAILY_CAP = 15;
export const COUPON_PLACEHOLDER = '{{coupon_code}}';

/**
 * Resolve a segment to a deduped list of digits-only phone numbers
 * (11 digits, "1XXXXXXXXXX"), excluding opt-outs. Caller can convert
 * to E.164 with `+${digits}` when queueing.
 */
export async function getRecipientsForSegment(opts: {
  segment: Segment;
  filter?: SegmentFilter;
}): Promise<string[]> {
  let query = supabaseAdmin
    .from('early_access')
    .select('phone_number, created_at');

  if (opts.segment === 'date_range' && opts.filter) {
    if (opts.filter.from) query = query.gte('created_at', opts.filter.from);
    if (opts.filter.to) {
      // Treat `to` as end-of-day inclusive.
      const end = new Date(opts.filter.to);
      end.setUTCHours(23, 59, 59, 999);
      query = query.lte('created_at', end.toISOString());
    }
  }

  const { data: subs, error: subsErr } = await query;
  if (subsErr) throw subsErr;

  const allPhones = (subs || [])
    .map((r) => normalizePhone((r as { phone_number: string }).phone_number))
    .filter((p) => p.length === 11 && p.startsWith('1'));

  const { data: opts_ } = await supabaseAdmin
    .from('opt_outs')
    .select('phone_number');
  const optOutSet = new Set(
    (opts_ || []).map((r) => normalizePhone((r as { phone_number: string }).phone_number))
  );

  let candidates = allPhones.filter((p) => !optOutSet.has(p));

  if (opts.segment === 'unwelcomed') {
    const { data: welcomed } = await supabaseAdmin
      .from('sent_messages')
      .select('phone_number')
      .eq('message_type', 'welcome');
    const welcomedSet = new Set(
      (welcomed || []).map((r) => normalizePhone((r as { phone_number: string }).phone_number))
    );
    candidates = candidates.filter((p) => !welcomedSet.has(p));
  }

  return Array.from(new Set(candidates));
}

/** Substitute `{{coupon_code}}` in a body template. */
export function renderBody(template: string, coupon?: string | null): string {
  return template.split(COUPON_PLACEHOLDER).join(coupon || '');
}

/** Returns true if `{{coupon_code}}` appears anywhere in the template. */
export function templateHasCoupon(template: string): boolean {
  return template.includes(COUPON_PLACEHOLDER);
}

/** How many sends are left in the rolling 24h Blooio budget. */
export async function getRemainingDailyBudget(cap = DAILY_CAP): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from('sent_messages')
    .select('id', { count: 'exact', head: true })
    .gte('sent_at', since);
  return Math.max(0, cap - (count ?? 0));
}

/** Naive completion estimate: ceil(recipients / cap) days. */
export function estimateCompletionDays(
  recipientCount: number,
  cap = DAILY_CAP
): number {
  if (recipientCount === 0) return 0;
  return Math.ceil(recipientCount / cap);
}

/** Human-friendly preview of a sample E.164 number. */
export function previewE164(digits: string): string {
  if (digits.length !== 11) return `+${digits}`;
  return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
}
