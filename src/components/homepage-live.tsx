"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Search } from "lucide-react";

// Single composite image (the polaroid collage, all laid out as one
// flat graphic).
const WORLD_IMAGE = "/lookbook-world-collage.jpg";

const FEATURED_PRODUCTS = [
  { handle: "leather-pants", name: "BEAUTÉ DU CUIR CARPENTERS", price: "300 USD", image: "/pants_product.png" },
  { handle: "parisian-edition", name: "PARISIAN EDITION TEE", price: "145 USD", image: "/parsian tee.png" },
  { handle: "nos-origines-tee", name: "NOS ORIGINES TEE", price: "145 USD", image: "/nostee1.png" },
];

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Our Story", href: "/our-story" },
  { label: "FAQ", href: "/faq" },
];

/**
 * The real post-launch homepage. Renders full-bleed (opts out of the
 * persistent sidebar/mobile-navbar, matching how product/VIP pages
 * behave) so the lookbook imagery isn't squeezed by the left rail.
 */
export function HomepageLive() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-[110] w-full min-h-screen bg-white overflow-y-auto"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ============ TOP NAV ============ */}
      <header className="sticky top-0 z-40 w-full h-16 bg-white/95 backdrop-blur-sm border-b border-neutral-200 flex items-center justify-between px-5 sm:px-8">
        <button onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Menu size={20} strokeWidth={1.5} />
        </button>

        <Link href="/" className="relative w-40 h-10 sm:w-48 sm:h-12">
          <Image src="/logo_script_final.png" alt="L'argent Brûlé" fill sizes="192px" className="object-contain" priority />
        </Link>

        <button aria-label="Search">
          <Search size={18} strokeWidth={1.5} />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          <div className="h-16 flex items-center justify-end px-5 sm:px-8 border-b border-neutral-200">
            <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex-1 flex flex-col items-center justify-center gap-8">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[13px] uppercase tracking-[0.4em] font-medium hover:opacity-50 transition-opacity"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* ============ LOOKBOOK WORLD — SINGLE COMPOSITE IMAGE ============ */}
      <section className="w-full bg-white py-10 sm:py-14 px-4 sm:px-8">
        {/* Caption bar — eyebrow / drop title / delivery number */}
        <div className="max-w-5xl mx-auto flex items-start justify-between mb-8 sm:mb-12 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-medium text-neutral-800">
          <span>Archive N&deg;004</span>
          <span className="text-center leading-relaxed">
            S/S 26<br />
            <span className="normal-case tracking-normal italic text-neutral-600 text-[10px] sm:text-[12px]" style={{ fontFamily: "Georgia, serif" }}>
              Paris — Los Angeles
            </span>
          </span>
          <span>Delivery 003</span>
        </div>

        {/* One composite graphic — the whole polaroid collage baked in as a single
            image, set in an ornate gold gallery frame (pure CSS gradient + bevel,
            no external texture) with a cream mat between frame and photo. */}
        <div
          className="max-w-5xl mx-auto p-3 sm:p-4"
          style={{
            background: "linear-gradient(135deg, #7a5a1e 0%, #d4af37 12%, #f9e79f 25%, #b8860b 38%, #fff0b3 50%, #8b6914 62%, #f4d160 75%, #a9781f 88%, #d4af37 100%)",
            boxShadow: "inset 0 0 0 2px rgba(0,0,0,0.35), inset 0 2px 4px rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.25)",
          }}
        >
          <div className="bg-[#faf6ef] p-2 sm:p-3">
            <div className="relative w-full aspect-[2752/1536]">
              <Image
                src={WORLD_IMAGE}
                alt="L'argent Brûlé — S/S 26 archive"
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 800px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURED PRODUCTS ============ */}
      <section className="max-w-6xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
        <h2 className="text-center text-[13px] sm:text-[15px] uppercase tracking-[0.4em] font-medium mb-10 sm:mb-16">
          The Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6">
          {FEATURED_PRODUCTS.map((p) => (
            <Link key={p.handle} href={`/product/${p.handle}`} className="group block space-y-3">
              <div className="aspect-[3/4] bg-neutral-50 relative overflow-hidden flex items-center justify-center p-6">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 33vw"
                />
              </div>
              <div className="text-center space-y-1">
                <p className="text-[11px] uppercase tracking-[0.2em] font-medium">{p.name}</p>
                <p className="text-[11px] text-neutral-500">{p.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============ MANIFESTO BAND ============ */}
      <section className="w-full bg-white py-16 sm:py-20 px-8 sm:px-16 border-t border-neutral-200">
        <p
          className="max-w-lg mx-auto text-center italic text-[13px] sm:text-[14px] leading-loose text-neutral-600"
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          Limited quantities. Custom-milled fabrics. Cut and sewn from the ground up.
          Hand-distressed and perfected between Paris and Los Angeles, each L&apos;argent
          Brûlé piece is built with the precision of traditional European craftsmanship
          and the soul of vintage archives.
        </p>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="w-full bg-black text-white py-14 px-8 text-center space-y-6">
        <div className="relative w-56 h-16 sm:w-64 sm:h-20 mx-auto opacity-90">
          <Image src="/logo_script_final.png" alt="L'argent Brûlé" fill sizes="256px" className="object-contain invert" />
        </div>
        <nav className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-[0.25em] text-neutral-400">
          {NAV_LINKS.map((link, i) => (
            <span key={link.href} className="flex items-center gap-6">
              <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
              {i < NAV_LINKS.length - 1 && <span className="text-neutral-700">—</span>}
            </span>
          ))}
        </nav>
        <p className="text-[9px] text-neutral-600 tracking-[0.1em]">
          L&apos;argent Brûlé &nbsp;—&nbsp; Los Angeles | Paris, France
        </p>
      </footer>
    </div>
  );
}
