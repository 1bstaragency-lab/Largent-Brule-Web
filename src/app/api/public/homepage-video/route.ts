// GET /api/public/homepage-video → { url }
// Public read-only endpoint so the homepage client component can fetch
// the current video URL without exposing the admin auth path.
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'homepage_video_url')
    .maybeSingle();
  return Response.json({ url: (data?.value as string) || '' });
}
