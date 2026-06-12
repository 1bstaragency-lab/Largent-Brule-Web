// POST /api/admin/homepage/upload-video  (multipart/form-data, field "file")
// Uploads to public bucket homepage-media. Admin-only. Returns public URL.
import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
// 60s upload window for big videos.
export const maxDuration = 60;

const BUCKET = 'homepage-media';
const MAX_BYTES = 50 * 1024 * 1024;
const ALLOWED = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/mov',
  'video/x-m4v',
]);

function extFromMime(mime: string): string {
  switch (mime) {
    case 'video/mp4':
    case 'video/x-m4v':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'video/quicktime':
    case 'video/mov':
      return 'mov';
    default:
      return 'bin';
  }
}

export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return Response.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ ok: false, error: 'bad_form_data' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return Response.json({ ok: false, error: 'file_required' }, { status: 400 });
  }
  if (file.size === 0) {
    return Response.json({ ok: false, error: 'empty_file' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ ok: false, error: 'file_too_large' }, { status: 400 });
  }
  const mime = file.type || 'application/octet-stream';
  if (!ALLOWED.has(mime)) {
    return Response.json(
      { ok: false, error: 'unsupported_type', mime },
      { status: 400 }
    );
  }

  const ext = extFromMime(mime);
  const stamp = Math.floor(Date.now() / 1000).toString(36);
  const rnd = Math.random().toString(36).slice(2, 8);
  const path = `homepage-${stamp}-${rnd}.${ext}`;

  const bytes = new Uint8Array(await file.arrayBuffer());
  const { error: upErr } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (upErr) {
    return Response.json({ ok: false, error: upErr.message }, { status: 500 });
  }
  const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(path);
  return Response.json({ ok: true, url: pub.publicUrl });
}
