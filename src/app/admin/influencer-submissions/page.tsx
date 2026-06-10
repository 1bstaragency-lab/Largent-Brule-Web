// Admin review panel for influencer-submitted videos. Server fetches the
// initial list; the client ReviewBoard handles live re-grouping when a
// reviewer flips status without needing a page refresh.
import { supabaseAdmin } from '@/lib/supabase-admin';
import { ReviewBoard, type BoardSubmission } from './review-board';

export const dynamic = 'force-dynamic';

async function getSubmissions(): Promise<BoardSubmission[]> {
  const { data } = await supabaseAdmin
    .from('influencer_submissions')
    .select(
      'id, influencer_id, video_url, platform, caption_draft, status, reviewer_notes, reviewed_at, reviewed_by, created_at, influencers(handle, platform, display_name, instagram_handle)'
    )
    .order('created_at', { ascending: false })
    .limit(500);
  return (data || []) as unknown as BoardSubmission[];
}

export default async function InfluencerSubmissionsAdmin() {
  const initial = await getSubmissions();
  return <ReviewBoard initial={initial} />;
}
