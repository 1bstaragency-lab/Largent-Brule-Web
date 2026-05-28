import { isAdmin } from '@/lib/admin-auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
  if (!(await isAdmin())) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from('early_access')
    .select('phone_number, created_at')
    .order('created_at', { ascending: false });

  if (error) return new Response(error.message, { status: 500 });

  const csvRows = [
    ['phone_number', 'created_at'],
    ...(data || []).map((r: { phone_number: string; created_at: string }) => [
      r.phone_number,
      r.created_at,
    ]),
  ];
  const csv = csvRows
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const today = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="largent-brule-subscribers-${today}.csv"`,
    },
  });
}
