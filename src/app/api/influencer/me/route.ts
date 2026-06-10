// POST /api/influencer/me  → { handle, platform, display_name?, email? }
// Get-or-create an influencer row by (handle, platform). Login accepts
// either TikTok or Instagram. Returns the influencer record, all of
// their submissions in reverse-chronological order, and a counts-by-status
// breakdown for the dashboard stat panel. No real auth — the team-side
// review process catches impersonation.
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isLoginPlatform, normalizeHandle } from '@/lib/influencer';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: {
    handle?: string;
    platform?: string;
    display_name?: string;
    email?: string;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  const handle = normalizeHandle(body.handle || '');
  const platform = (body.platform || '').toLowerCase();
  if (!handle) {
    return Response.json({ ok: false, error: 'handle_required' }, { status: 400 });
  }
  if (handle.length > 50) {
    return Response.json({ ok: false, error: 'handle_too_long' }, { status: 400 });
  }
  if (!isLoginPlatform(platform)) {
    return Response.json({ ok: false, error: 'platform_required' }, { status: 400 });
  }

  const patch: Record<string, unknown> = {
    handle,
    platform,
    last_seen_at: new Date().toISOString(),
  };
  if (body.display_name) patch.display_name = body.display_name.trim().slice(0, 100);
  if (body.email) patch.email = body.email.trim().slice(0, 200);

  const { data: influencer, error: upErr } = await supabaseAdmin
    .from('influencers')
    .upsert(patch, { onConflict: 'handle,platform' })
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

  const list = submissions || [];
  const stats = {
    total: list.length,
    pending: list.filter((s) => s.status === 'pending').length,
    approved: list.filter((s) => s.status === 'approved').length,
    denied: list.filter((s) => s.status === 'denied').length,
    changes_requested: list.filter((s) => s.status === 'changes_requested').length,
  };

  return Response.json({ ok: true, influencer, submissions: list, stats });
}
