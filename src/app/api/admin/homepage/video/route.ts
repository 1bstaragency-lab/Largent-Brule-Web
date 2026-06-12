// GET   /api/admin/homepage/video → { url }   (admin)
// PATCH /api/admin/homepage/video { url }     (admin) — '' clears
// PUBLIC: GET /api/public/homepage-video      (separate route below)
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const KEY = 'homepage_video_url';

async function readUrl(): Promise<string> {
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', KEY)
    .maybeSingle();
  return (data?.value as string) || '';
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return Response.json({ ok: true, url: await readUrl() });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  const url = (body.url || '').trim();
  if (url && !/^https?:\/\/[^\s]+$/i.test(url)) {
    return Response.json({ ok: false, error: 'invalid_url' }, { status: 400 });
  }
  if (url.length > 2000) {
    return Response.json({ ok: false, error: 'url_too_long' }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from('app_settings')
    .upsert(
      { key: KEY, value: url, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
