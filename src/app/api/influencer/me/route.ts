// POST /api/influencer/me  → { handle, instagram_handle?, display_name?, email? }
// Get-or-create an influencer row by TikTok handle. Returns their record
// plus all submissions in reverse-chronological order. This is the
// "sign-in" entry point — no real auth, just a known handle. We trust
// the brand-side review process to catch impersonation.
import { supabaseAdmin } from '@/lib/supabase-admin';
import { normalizeHandle } from '@/lib/influencer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: {
    handle?: string;
    instagram_handle?: string;
    display_name?: string;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const handle = normalizeHandle(body.handle || '');
  if (!handle) {
    return Response.json({ ok: false, error: 'handle_required' }, { status: 400 });
  }
  if (handle.length > 50) {
    return Response.json({ ok: false, error: 'handle_too_long' }, { status: 400 });
  }

  // Upsert by handle.
  const patch: Record<string, unknown> = { handle, last_seen_at: new Date().toISOString() };
  if (body.instagram_handle) patch.instagram_handle = normalizeHandle(body.instagram_handle);
  if (body.display_name) patch.display_name = body.display_name.trim().slice(0, 100);
  if (body.email) patch.email = body.email.trim().slice(0, 200);

  const { data: influencer, error: upErr } = await supabaseAdmin
    .from('influencers')
    .upsert(patch, { onConflict: 'handle' })
    .select('*')
    .single();
  if (upErr || !influencer) {
    return Response.json(
      { ok: false, error: upErr?.message || 'upsert_failed' },
      { status: 500 }
    );
  }

  const { data: submissions } = await supabaseAdmin
    .from('influencer_submissions')
    .select('*')
    .eq('influencer_id', influencer.id)
    .order('created_at', { ascending: false });

  return Response.json({ ok: true, influencer, submissions: submissions || [] });
}
