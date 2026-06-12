import Link from 'next/link';

export default function AdminNav() {
  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="text-[10px] uppercase tracking-[0.5em] font-medium">
          L&apos;B · Admin
        </Link>
        <div className="flex gap-6 text-[10px] uppercase tracking-[0.3em] text-neutral-500">
          <Link href="/admin" className="hover:text-black transition-colors">
            Overview
          </Link>
          <Link href="/admin/subscribers" className="hover:text-black transition-colors">
            Subscribers
          </Link>
          <Link href="/admin/inbox" className="hover:text-black transition-colors">
            Inbox
          </Link>
          <Link href="/admin/carts" className="hover:text-black transition-colors">
            Carts
          </Link>
          <Link href="/admin/campaigns" className="hover:text-black transition-colors">
            Campaigns
          </Link>
          <Link href="/admin/early-access" className="hover:text-black transition-colors">
            Early Access
          </Link>
          <Link href="/admin/homepage" className="hover:text-black transition-colors">
            Homepage
          </Link>
          <Link href="/admin/coupons" className="hover:text-black transition-colors">
            Coupons
          </Link>
          <Link href="/admin/influencer-submissions" className="hover:text-black transition-colors">
            Creators
          </Link>
          <Link href="/admin/shopify" className="hover:text-black transition-colors">
            Shopify
          </Link>
        </div>
      </div>
    </nav>
  );
}
