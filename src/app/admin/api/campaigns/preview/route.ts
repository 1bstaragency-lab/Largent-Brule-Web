import { isAdmin } from '@/lib/admin-auth';
import {
  estimateCompletionDays,
  getRecipientsForSegment,
  getRemainingDailyBudget,
  previewE164,
  renderBody,
  templateHasCoupon,
  type Segment,
  type SegmentFilter,
} from '@/lib/campaigns';

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  let payload: {
    segment?: Segment;
    segment_filter?: SegmentFilter;
    body_template?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const segment: Segment = payload.segment || 'all';
  const body = payload.body_template || '';

  try {
    const recipients = await getRecipientsForSegment({
      segment,
      filter: payload.segment_filter,
    });
    const remaining = await getRemainingDailyBudget();
    const completionDays = estimateCompletionDays(recipients.length);
    const sample = recipients.slice(0, 3).map(previewE164);
    const hasCoupon = templateHasCoupon(body);
    const exampleRendered = renderBody(body, hasCoupon ? 'LB-VIP-X7K2B9' : null);

    return Response.json({
      ok: true,
      recipientCount: recipients.length,
      sample,
      completionDays,
      remainingToday: remaining,
      hasCoupon,
      exampleRendered,
    });
  } catch (e) {
    return Response.json(
      { ok: false, error: e instanceof Error ? e.message : 'unknown' },
      { status: 500 }
    );
  }
}
