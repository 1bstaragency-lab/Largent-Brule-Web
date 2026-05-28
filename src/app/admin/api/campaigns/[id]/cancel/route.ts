// POST /admin/api/campaigns/[id]/cancel
// Cancels a queued campaign and marks all pending recipients as
// 'cancelled' so the sender task skips them. Sent rows are untouched.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 });

  const now = new Date().toISOString();

  // Mark pending recipients as cancelled.
  const { error: recErr } = await supabaseAdmin
    .from('campaign_recipients')
    .update({ status: 'cancelled' })
    .eq('campaign_id', id)
    .eq('status', 'pending');
  if (recErr) {
    return Response.json({ ok: false, error: recErr.message }, { status: 500 });
  }

  // Mark the campaign itself cancelled.
  const { error: campErr } = await supabaseAdmin
    .from('campaigns')
    .update({ status: 'cancelled', completed_at: now })
    .eq('id', id);
  if (campErr) {
    return Response.json({ ok: false, error: campErr.message }, { status: 500 });
  }

  return Response.json({ ok: true });
}
