// Admin review panel for influencer-submitted videos.
// Reads submissions joined with the influencer record, server-side.
// Decisions are applied via /api/admin/influencer-submissions/:id PATCH.
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ReviewRow } from './review-row';
import type { SubmissionStatus } from '@/lib/influencer';

export const dynamic = 'force-dynamic';

interface JoinedSubmission {
  id: string;
  influencer_id: string;
  video_url: string;
  platform: 'tiktok' | 'instagram' | 'youtube' | 'other';
  caption_draft: string | null;
  status: SubmissionStatus;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  influencers: {
    handle: string;
    platform: 'tiktok' | 'instagram';
    display_name: string | null;
    instagram_handle: string | null;
  } | null;
}

async function getSubmissions() {
  const { data } = await supabaseAdmin
    .from('influencer_submissions')
    .select(
      'id, influencer_id, video_url, platform, caption_draft, status, reviewer_notes, reviewed_at, reviewed_by, created_at, influencers(handle, platform, display_name, instagram_handle)'
    )
    .order('created_at', { ascending: false })
    .limit(500);
  return (data || []) as unknown as JoinedSubmission[];
}

export default async function InfluencerSubmissionsAdmin() {
  const submissions = await getSubmissions();
  const grouped = {
    pending: submissions.filter((s) => s.status === 'pending'),
    changes_requested: submissions.filter((s) => s.status === 'changes_requested'),
    approved: submissions.filter((s) => s.status === 'approved'),
    denied: submissions.filter((s) => s.status === 'denied'),
  };

  return (
    <div className="space-y-10">
      <div>
        <p className="text-[9px] text-neutral-400 uppercase tracking-[0.6em] mb-2">
          Influencer Submissions
        </p>
        <h1 className="text-3xl font-light">{submissions.length} total</h1>
        <p className="text-[11px] text-neutral-500 mt-2 tracking-wide">
          {grouped.pending.length} pending review · {grouped.changes_requested.length} changes requested · {grouped.approved.length} approved · {grouped.denied.length} denied
        </p>
      </div>

      <Section title="Pending Review" rows={grouped.pending} emptyMsg="Nothing waiting." />
      <Section
        title="Changes Requested"
        rows={grouped.changes_requested}
        emptyMsg="No submissions currently flagged for changes."
      />
      <Section title="Approved" rows={grouped.approved} emptyMsg="No approvals yet." />
      <Section title="Denied" rows={grouped.denied} emptyMsg="None." />
    </div>
  );
}

function Section({
  title,
  rows,
  emptyMsg,
}: {
  title: string;
  rows: JoinedSubmission[];
  emptyMsg: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.5em] text-neutral-500">
        {title} ({rows.length})
      </h2>
      {rows.length === 0 ? (
        <p className="text-[11px] text-neutral-400 italic">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <ReviewRow key={r.id} submission={r} />
          ))}
        </div>
      )}
    </section>
  );
}
