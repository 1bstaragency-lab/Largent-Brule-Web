// GET   /api/admin/early-access/message → { body, image_url }
// PATCH /api/admin/early-access/message { body?, image_url? }
// Admin-only. Stores the SMS draft + optional preview image URL that
// gets attached when sending to a cohort.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

const BODY_KEY = 'early_access_sms_body';
const IMAGE_KEY = 'early_access_sms_image_url';

async function readSetting(key: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  return (data?.value as string) || '';
}

async function writeSetting(key: string, value: string) {
  await supabaseAdmin
    .from('app_settings')
    .upsert(
      { key, value, updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    );
}

export async function GET() {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  const [body, image_url] = await Promise.all([
    readSetting(BODY_KEY),
    readSetting(IMAGE_KEY),
  ]);
  return Response.json({ ok: true, body, image_url });
}

export async function PATCH(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let payload: { body?: string; image_url?: string };
  try {
    payload = await req.json();
  } catch {
    return Response.json({ ok: false, error: 'bad_json' }, { status: 400 });
  }

  if (payload.body !== undefined) {
    const body = payload.body.trim();
    if (!body) return Response.json({ ok: false, error: 'body_required' }, { status: 400 });
    if (body.length > 1000) return Response.json({ ok: false, error: 'body_too_long' }, { status: 400 });
    await writeSetting(BODY_KEY, body);
  }

  if (payload.image_url !== undefined) {
    const url = payload.image_url.trim();
    if (url && !/^https?:\/\/[^\s]+$/i.test(url)) {
      return Response.json({ ok: false, error: 'invalid_image_url' }, { status: 400 });
    }
    if (url.length > 2000) {
      return Response.json({ ok: false, error: 'image_url_too_long' }, { status: 400 });
    }
    await writeSetting(IMAGE_KEY, url);
  }

  return Response.json({ ok: true });
}
