// POST /admin/api/campaigns
// Creates a campaign + materializes campaign_recipients rows in one
// transaction. Status starts as 'queued' so the Cowork sender task
// (added in Session 3) picks it up immediately on its next run.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  estimateCompletionDays,
  getRecipientsForSegment,
  renderBody,
  templateHasCoupon,
  type Segment,
  type SegmentFilter,
} from '@/lib/campaigns';
import { mintUniqueCoupon } from '@/lib/coupons';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let payload: {
    name?: string;
    body_template?: string;
    segment?: Segment;
    segment_filter?: SegmentFilter;
    coupon_discount_pct?: number | null;
    coupon_expires_days?: number | null;
  };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const name = (payload.name || '').trim();
  const body = (payload.body_template || '').trim();
  const segment: Segment = payload.segment || 'all';

  if (!name) return Response.json({ ok: false, error: 'name_required' }, { status: 400 });
  if (!body) return Response.json({ ok: false, error: 'body_required' }, { status: 400 });
  if (body.length > 1200)
    return Response.json({ ok: false, error: 'body_too_long' }, { status: 400 });

  // Resolve recipients.
  let recipients: string[];
  try {
    recipients = await getRecipientsForSegment({
      segment,
      filter: payload.segment_filter,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : 'segment_failed' },
      { status: 500 }
    );
  }

  if (recipients.length === 0) {
    return Response.json({ ok: false, error: 'no_recipients' }, { status: 400 });
  }

  // Create the campaign row.
  const completionDays = estimateCompletionDays(recipients.length);
  const estCompleteAt = new Date();
  estCompleteAt.setUTCDate(estCompleteAt.getUTCDate() + completionDays);

  const hasCoupon = templateHasCoupon(body);

  const { data: campaign, error: campErr } = await supabaseAdmin
    .from('campaigns')
    .insert({
      name,
      body_template: body,
      segment,
      segment_filter: payload.segment_filter || null,
      coupon_discount_pct: hasCoupon ? payload.coupon_discount_pct ?? null : null,
      coupon_expires_days: hasCoupon ? payload.coupon_expires_days ?? null : null,
      status: 'queued',
      total_recipients: recipients.length,
      estimated_completion_at: estCompleteAt.toISOString(),
      queued_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (campErr || !campaign) {
    return Response.json(
      { ok: false, error: campErr?.message || 'insert_failed' },
      { status: 500 }
    );
  }

  // Mint one unique coupon per recipient when the template uses
  // {{coupon_code}}. Each code is bound to the recipient's phone and
  // to this campaign for redemption tracking.
  const couponExpiresAt =
    hasCoupon && payload.coupon_expires_days
      ? new Date(Date.now() + payload.coupon_expires_days * 86400000)
      : null;

  const rows: Array<{
    campaign_id: string;
    phone_number: string;
    coupon_code: string | null;
    rendered_body: string;
    status: 'pending';
    idempotency_key: string;
  }> = [];

  for (const digits of recipients) {
    const phoneE164 = `+${digits}`;
    let couponCode: string | null = null;
    if (hasCoupon) {
      try {
        couponCode = await mintUniqueCoupon({
          phoneE164,
          campaignId: campaign.id,
          discountPct: payload.coupon_discount_pct ?? null,
          expiresAt: couponExpiresAt,
        });
      } catch (e) {
        // Roll back the partial mint + campaign on failure.
        await supabaseAdmin.from('coupons').delete().eq('campaign_id', campaign.id);
        await supabaseAdmin.from('campaigns').delete().eq('id', campaign.id);
        return Response.json(
          { ok: false, error: e instanceof Error ? e.message : 'coupon_mint_failed' },
          { status: 500 }
        );
      }
    }
    rows.push({
      campaign_id: campaign.id,
      phone_number: phoneE164,
      coupon_code: couponCode,
      rendered_body: renderBody(body, couponCode),
      status: 'pending',
      idempotency_key: `${digits}_campaign_${campaign.id}`,
    });
  }

  // Supabase has no real "transaction" via the REST client. Chunked
  // insert is fine — if any chunk fails we roll back manually.
  const CHUNK = 200;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const slice = rows.slice(i, i + CHUNK);
    const { error: recErr } = await supabaseAdmin.from('campaign_recipients').insert(slice);
    if (recErr) {
      // Rollback: delete recipients (CASCADE), minted coupons, and the campaign itself.
      await supabaseAdmin.from('coupons').delete().eq('campaign_id', campaign.id);
      await supabaseAdmin.from('campaigns').delete().eq('id', campaign.id);
      return Response.json(
        { ok: false, error: recErr.message },
        { status: 500 }
      );
    }
  }

  return Response.json({
    ok: true,
    id: campaign.id,
    recipientCount: recipients.length,
    completionDays,
  });
}
