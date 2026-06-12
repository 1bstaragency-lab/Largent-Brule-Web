// GET /api/public/homepage-carousel → { urls: string[] }
// Read-only list of carousel image URLs. Empty array if not set.
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', 'homepage_carousel_urls')
    .maybeSingle();
  let urls: string[] = [];
  if (data?.value) {
    try {
      const parsed = JSON.parse(data.value as string);
      if (Array.isArray(parsed)) urls = parsed.filter((s): s is string => typeof s === 'string');
    } catch {
      // value not JSON — treat as none
    }
  }
  return Response.json({ urls });
}
