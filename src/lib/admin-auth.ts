// Admin auth: simple shared-password gate.
// The cookie value is HMAC(password, "lb_admin_v1") so the raw password
// never appears in the cookie. httpOnly prevents JS from reading it.
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const ADMIN_COOKIE = 'lb_admin';
const TOKEN_SALT = 'lb_admin_v1';

function signToken(password: string): string {
  return crypto.createHmac('sha256', password).update(TOKEN_SALT).digest('hex');
}

/** Server-only: read cookie + verify against ADMIN_PASSWORD env. */
export async function isAdmin(): Promise<boolean> {
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword) return false;
  const store = await cookies();
  const c = store.get(ADMIN_COOKIE);
  if (!c?.value) return false;
  return c.value === signToken(expectedPassword);
}

/** Returns the cookie value to set after a successful password match. */
export function tokenFor(password: string): string {
  return signToken(password);
}
