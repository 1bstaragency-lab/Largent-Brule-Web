// Server-only Supabase client using the service_role key.
// NEVER import this file from a client component or browser code.
// The service_role key bypasses Row Level Security.
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!url || !serviceRoleKey) {
  console.warn(
    '[supabase-admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — admin queries will fail.'
  );
}

export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Normalize any phone format to digits-only "1XXXXXXXXXX" so we can
// cross-reference early_access (which stores 10-digit) with
// sent_messages / opt_outs (which store E.164 like "+1XXXXXXXXXX").
export function normalizePhone(input: string): string {
  const d = (input || '').replace(/\D/g, '');
  if (d.length === 10) return `1${d}`;
  if (d.length === 11 && d.startsWith('1')) return d;
  return d;
}

// Convert digits-only "1XXXXXXXXXX" to E.164 "+1XXXXXXXXXX".
export function toE164(input: string): string | null {
  const n = normalizePhone(input);
  if (n.length !== 11 || !n.startsWith('1')) return null;
  return `+${n}`;
}
