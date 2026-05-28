import { cookies } from 'next/headers';
import { ADMIN_COOKIE, tokenFor } from '@/lib/admin-auth';

export async function POST(req: Request) {
  let password = '';
  try {
    const body = await req.json();
    password = String(body?.password ?? '');
  } catch {
    return Response.json({ ok: false, error: 'bad_request' }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return Response.json({ ok: false, error: 'server_misconfigured' }, { status: 500 });
  }
  if (password !== expected) {
    return Response.json({ ok: false }, { status: 401 });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, tokenFor(expected), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return Response.json({ ok: true });
}

export async function DELETE() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return Response.json({ ok: true });
}
