// GET   /api/admin/homepage/carousel → { urls: string[] }
// PATCH /api/admin/homepage/carousel { urls: string[] }
// Admin-only. Stores a JSON array of URLs that the gate cycles through.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
const KEY = 'homepage_carousel_urls';

async function readUrls(): Promise<string[]> {
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', KEY)
    .maybeSingle();
  if (!data?.value) return [];
  try {
    const parsed = JSON.parse(data.value as string);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === 'string') : [];
  } catch {
    return [];
  }
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  return Response.json({ ok: true, urls: await readUrls() });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let body: { urls?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }
  if (!Array.isArray(body.urls)) {
    return Response.json({ ok: false, error: 'urls_array_required' }, { status: 400 });
  }
  const clean = body.urls
    .filter((u): u is string => typeof u === 'string')
    .map((u) => u.trim())
    .filter((u) => u && /^https?:\/\//i.test(u))
    .slice(0, 24);
  const { error } = await supabaseAdmin
    .from('app_settings')
    .upsert(
      { key: KEY, value: JSON.stringify(clean), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
  if (error) return Response.json({ ok: false, error: error.message }, { status: 500 });
  return Response.json({ ok: true, urls: clean });
}
