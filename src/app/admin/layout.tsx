import { isAdmin } from '@/lib/admin-auth';
import AdminNav from './nav';
import { AdminLogin } from './login-form';

// Admin pages are always dynamic — they read cookies + live DB state.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: "L'B · Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = await isAdmin();
  if (!authed) return <AdminLogin />;

  return (
    <div className="min-h-screen bg-[#faf9f6] font-sans">
      <AdminNav />
      <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
