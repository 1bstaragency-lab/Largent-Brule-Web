// POST /api/influencer/submissions
//   { handle, platform, video_url, caption_draft? }
// Creates a pending submission for (handle, platform). The influencer
// row is upserted on first submit so first-time creators don't need a
// separate signup.
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  detectPlatform,
  isLoginPlatform,
  isValidVideoUrl,
  normalizeHandle,
} from '@/lib/influencer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: {
    handle?: string;
    platform?: string;
    video_url?: string;
    caption_draft?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const handle = normalizeHandle(body.handle || '');
  const loginPlatform = (body.platform || '').toLowerCase();
  const videoUrl = (body.video_url || '').trim();
  if (!handle) {
    return Response.json({ ok: false, error: 'handle_required' }, { status: 400 });
  }
  if (!isLoginPlatform(loginPlatform)) {
    return Response.json({ ok: false, error: 'platform_required' }, { status: 400 });
  }
  if (!isValidVideoUrl(videoUrl)) {
    return Response.json({ ok: false, error: 'invalid_video_url' }, { status: 400 });
  }

  const { data: influencer, error: upErr } = await supabaseAdmin
    .from('influencers')
    .upsert(
      { handle, platform: loginPlatform, last_seen_at: new Date().toISOString() },
      { onConflict: 'handle,platform' }
    )
    .select('*')
    .single();
  if (upErr || !influencer) {
    return Response.json(
      { ok: false, error: upErr?.message || 'influencer_upsert_failed' },
      { status: 500 }
    );
  }

  // The submission's *video* platform is derived from the URL — that may
  // differ from the influencer's login platform (a TikTok creator might
  // submit a cross-posted IG Reel link).
  const videoPlatform = detectPlatform(videoUrl);
  const caption = (body.caption_draft || '').trim().slice(0, 4000) || null;

  const { data: submission, error } = await supabaseAdmin
    .from('influencer_submissions')
    .insert({
      influencer_id: influencer.id,
      video_url: videoUrl,
      platform: videoPlatform,
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
