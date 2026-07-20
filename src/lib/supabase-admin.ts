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

// Phone normalization lives in src/lib/phone.ts (international-aware).
// Re-exported here so existing imports keep working.
export { normalizePhone, toE164 } from './phone';
