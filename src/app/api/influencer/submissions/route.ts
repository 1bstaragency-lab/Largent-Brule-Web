// POST /api/influencer/submissions
//   { handle, video_url, caption_draft? }
// Creates a pending submission for the given handle. The handle is
// upserted if it doesn't yet exist so the same form works for first-time
// and returning creators.
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  detectPlatform,
  isValidVideoUrl,
  normalizeHandle,
} from '@/lib/influencer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: {
    handle?: string;
    video_url?: string;
    caption_draft?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const handle = normalizeHandle(body.handle || '');
  const videoUrl = (body.video_url || '').trim();
  if (!handle) {
    return Response.json({ ok: false, error: 'handle_required' }, { status: 400 });
  }
  if (!isValidVideoUrl(videoUrl)) {
    return Response.json({ ok: false, error: 'invalid_video_url' }, { status: 400 });
  }

  // Upsert influencer
  const { data: influencer, error: upErr } = await supabaseAdmin
    .from('influencers')
    .upsert({ handle, last_seen_at: new Date().toISOString() }, { onConflict: 'handle' })
    .select('*')
    .single();
  if (upErr || !influencer) {
    return Response.json(
      { ok: false, error: upErr?.message || 'influencer_upsert_failed' },
      { status: 500 }
    );
  }

  const platform = detectPlatform(videoUrl);
  const caption = (body.caption_draft || '').trim().slice(0, 4000) || null;

  const { data: submission, error } = await supabaseAdmin
    .from('influencer_submissions')
    .insert({
      influencer_id: influencer.id,
      video_url: videoUrl,
      platform,
      caption_draft: caption,
      status: 'pending',
    })
    .select('*')
    .single();
  if (error || !submission) {
    return Response.json(
      { ok: false, error: error?.message || 'submission_failed' },
      { status: 500 }
    );
  }

  return Response.json({ ok: true, submission, influencer });
}
