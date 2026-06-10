// PATCH /api/admin/influencer-submissions/:id
//   { status, reviewer_notes? }
// Admin-only — gated by the same lb_admin cookie used elsewhere.
// Records who reviewed (defaults to "team") and when.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import type { SubmissionStatus } from '@/lib/influencer';

export const dynamic = 'force-dynamic';

const ALLOWED: SubmissionStatus[] = [
  'pending',
  'approved',
  'denied',
  'changes_requested',
];

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const { id } = await context.params;
  if (!id) return Response.json({ ok: false, error: 'bad_id' }, { status: 400 });

  let body: { status?: string; reviewer_notes?: string; reviewed_by?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const status = (body.status || '') as SubmissionStatus;
  if (!ALLOWED.includes(status)) {
    return Response.json({ ok: false, error: 'bad_status' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    status,
    reviewer_notes: (body.reviewer_notes || '').trim().slice(0, 4000) || null,
    reviewed_at: status === 'pending' ? null : new Date().toISOString(),
    reviewed_by: status === 'pending' ? null : (body.reviewed_by || 'team').slice(0, 100),
  };

  const { data, error } = await supabaseAdmin
    .from('influencer_submissions')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error || !data) {
    return Response.json(
      { ok: false, error: error?.message || 'update_failed' },
      { status: 500 }
    );
  }
  return Response.json({ ok: true, submission: data });
}
