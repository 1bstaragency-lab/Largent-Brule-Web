"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X, Search, ChevronLeft, ChevronRight } from "lucide-react";

// Single composite image (the polaroid collage, all laid out as one
// flat graphic).
const WORLD_IMAGE = "/lookbook-world-collage.jpg";

// Paly-reference full-height model shots shown directly under the collage.
const MODEL_SHOTS = [
  { handle: "lemondrop-raglan", name: "L'ARGENT BRÛLÉ RAGLAN", price: "165 USD", image: "/model-raglan.jpg" },
  { handle: "parisian-edition", name: "PARISIAN EDITION TEE", price: "145 USD", image: "/model-parisian-tee.jpg" },
];

const FEATURED_PRODUCTS = [
  { handle: "leather-pants", name: "BEAUTÉ DU CUIR CARPENTERS", price: "300 USD", image: "/pants_product.png" },
  { handle: "lemondrop-raglan", name: "LEMONDROP RAGLAN", price: "165 USD", image: "/lemondrop main.png" },
  { handle: "parisian-edition", name: "PARISIAN EDITION TEE", price: "145 USD", image: "/parsian tee.png" },
  { handle: "nos-origines-tee", name: "NOS ORIGINES TEE", price: "145 USD", image: "/nostee1.png" },
  { handle: "world-tour-2004", name: "WORLD TOUR 2004 TEE", price: "145 USD", image: "/2004.png" },
];

const NAV_LINKS = [
  { label: "Collections", href: "/collections" },
  { label: "Lookbook", href: "/lookbook" },
  { label: "Our Story", href: "/our-story" },
  { label: "FAQ", href: "/faq" },
];

/**
 * Fanned product carousel — center card large/opaque, side cards
 * smaller/faded, straight row (no arch/rotation). Images only, no
 * text. Arrows + dots to navigate; every card still links to its
 * product page.
 */
function FanGallery({ products }: { products: typeof FEATURED_PRODUCTS }) {
  const [active, setActive] = useState(Math.floor((products.length - 1) / 2));

  const go = (dir: 1 | -1) => {
    setActive((prev) => Math.max(0, Math.min(products.length - 1, prev + dir)));
  };

  return (
    <div className="relative flex items-center justify-center h-[340px] sm:h-[440px]">
      <button
        onClick={() => go(-1)}
        aria-label="Previous"
        className="absolute left-2 sm:left-6 z-20 w-9 h-9 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
        disabled={active === 0}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      <div className="relative w-full h-full flex items-center justify-center">
        {products.map((p, i) => {
          const distance = i - active;
          const abs = Math.abs(distance);
          const scale = distance === 0 ? 1 : abs === 1 ? 0.82 : 0.68;
          const opacity = distance === 0 ? 1 : abs === 1 ? 0.55 : 0.28;
          const translateX = distance * (abs === 0 ? 0 : 105);
          return (
            <Link
              key={p.handle}
              href={`/product/${p.handle}`}
              className="absolute w-[150px] h-[220px] sm:w-[220px] sm:h-[320px] transition-all duration-500 ease-out"
              style={{
                transform: `translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex: 10 - abs,
              }}
              onMouseEnter={() => setActive(i)}
            >
              <div className="relative w-full h-full">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  className="object-contain"
                  sizes="220px"
                />
              </div>
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => go(1)}
        aria-label="Next"
        className="absolute right-2 sm:right-6 z-20 w-9 h-9 rounded-full bg-white/90 border border-neutral-200 flex items-center justify-center hover:bg-white transition-colors disabled:opacity-30"
        disabled={active === products.length - 1}
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>

      <div className="absolute -bottom-2 sm:bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              i === active ? "bg-black" : "bg-neutral-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * The real post-launch homepage. Renders full-bleed (opts out of the
 * persistent sidebar/mobile-navbar, matching how product/VIP pages
 * behave) so the lookbook imagery isn't squeezed by the left rail.
 *
 * `minimal` — used by the "Browse Anyway" sneak-peek route reachable
 * from the still-locked countdown page: shows the header + framed
 * collage only, with a Lookbook link below it. No products, no
 * manifesto, no footer.
 */
export function HomepageLive({ minimal = false }: { minimal?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  // Price stays hidden until the shopper meaningfully engages: instant on
  // mouse hover (desktop), or a 2s+ hold on touch devices (no hover state).
  const [pantsPriceRevealed, setPantsPriceRevealed] = useState(false);
  const dwellTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startDwell = () => {
    dwellTimer.current = setTimeout(() => setPantsPriceRevealed(true), 2000);
  };
  const cancelDwell = () => {
    if (dwellTimer.current) clearTimeout(dwellTimer.current);
  };

  return (
    <div
      className="fixed inset-0 z-[110] w-full min-h-screen bg-[#faf6ef] overflow-y-auto"
      style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}
    >
      {/* ============ TOP NAV ============ */}
      <header className="sticky top-0 z-40 w-full h-16 bg-[#faf6ef]/95 backdrop-blur-sm border-b border-neutral-200 flex items-center justify-between px-5 sm:px-8">
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
        <div className="fixed inset-0 z-50 bg-[#faf6ef] flex flex-col">
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
      <section className="w-full bg-[#faf6ef] py-10 sm:py-14 px-4 sm:px-8">
        {/* Caption — drop title */}
        <div className="max-w-5xl mx-auto text-center mb-8 sm:mb-12 text-[10px] sm:text-[11px] uppercase tracking-[0.15em] font-medium text-neutral-800">
          <span className="leading-relaxed">
            S/S 26<br />
            <span className="normal-case tracking-normal italic text-neutral-600 text-[10px] sm:text-[12px]" style={{ fontFamily: "Georgia, serif" }}>
              Paris — Los Angeles
            </span>
          </span>
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

        {/* Minimal ("Browse Anyway") mode: just a Lookbook link below the
            collage — no products, no manifesto, no footer. */}
        {minimal && (
          <div className="text-center mt-10 sm:mt-14">
            <Link
              href="/lookbook"
              className="inline-block border-b border-black text-[11px] uppercase font-bold tracking-[0.35em] pb-1 hover:text-neutral-500 hover:border-neutral-500 transition-colors"
            >
              View Lookbook
            </Link>
          </div>
        )}
      </section>

      {/* ============ MODEL SHOTS — FULL HEIGHT, PALY-STYLE ============ */}
      <section className="w-full pt-10 sm:pt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2">
          {MODEL_SHOTS.map((shot) => (
            <div key={shot.handle} className="relative">
              <div className="relative w-full aspect-[1696/2528]">
                <Image
                  src={shot.image}
                  alt={shot.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/25 backdrop-blur-md border-t border-white/40 px-3 sm:px-4 py-2.5 sm:py-3">
                  <p className="text-[10px] sm:text-[12px] uppercase tracking-[0.1em] font-bold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                    {shot.name}
                  </p>
                  <p className="text-[9px] sm:text-[11px] text-white/90 mt-0.5" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                    {shot.price}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {!minimal && (
        <>
          {/* ============ FEATURED PRODUCTS — FANNED GALLERY ============ */}
          <section className="py-16 sm:py-24">
            <h2 className="text-center text-[13px] sm:text-[15px] uppercase tracking-[0.4em] font-medium mb-10 sm:mb-16 px-4">
              Printemps-Été
            </h2>
            <FanGallery products={FEATURED_PRODUCTS} />
          </section>

          {/* ============ PANTS + DOBERMAN — FULL HEIGHT SIDE MOMENT ============
              Desktop: pants (hover-reveal price) left, doberman right, side by side.
              Mobile: doberman first (full width), then the back-view pants shot
              with an always-visible frosted glass caption (no hover on touch). */}
          <section className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {/* Doberman — decorative only, no link, no hover. Shown first on mobile. */}
              <div className="order-1 sm:order-2">
                <div className="py-3 sm:py-4 px-2 h-[3.25rem] sm:h-[3.75rem] hidden sm:block" />
                <div className="relative w-full aspect-[1696/2528]">
                  <Image
                    src="/model-doberman.jpg"
                    alt="L'argent Brûlé"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
                  />
                </div>
              </div>

              {/* Pants — desktop version: flat product shot, price hidden until
                  hover (mouse) or a 2s+ hold (touch). Hidden on mobile. */}
              <Link
                href="/product/leather-pants"
                className="order-2 sm:order-1 hidden sm:block bg-[#faf6ef]"
                onMouseEnter={() => setPantsPriceRevealed(true)}
                onMouseLeave={() => setPantsPriceRevealed(false)}
                onTouchStart={startDwell}
                onTouchEnd={cancelDwell}
              >
                <div className="text-center py-3 sm:py-4 px-2 h-[3.25rem] sm:h-[3.75rem] flex flex-col items-center justify-center">
                  <p className="text-[9px] sm:text-[11px] uppercase tracking-[0.15em] font-medium">
                    BEAUTÉ DU CUIR CARPENTERS
                  </p>
                  <p
                    className={`text-[9px] sm:text-[10px] text-neutral-500 mt-1 transition-opacity duration-300 ${
                      pantsPriceRevealed ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    300 USD
                  </p>
                </div>
                <div className="relative w-full aspect-[1696/2528]">
                  <Image
                    src="/pants_product.png"
                    alt="Beauté du Cuir Carpenters"
                    fill
                    className="object-contain p-6 sm:p-10"
                    sizes="600px"
                  />
                </div>
              </Link>

              {/* Pants — mobile version: back-view lifestyle shot, name+price
                  always visible in a frosted glass bar (matches the model
                  shots below the collage). Hidden on sm+. */}
              <Link href="/product/leather-pants" className="order-2 sm:hidden block">
                <div className="relative w-full aspect-[1696/2528]">
                  <Image
                    src="/pants-back-view.jpg"
                    alt="Beauté du Cuir Carpenters"
                    fill
                    className="object-cover"
                    sizes="100vw"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-white/25 backdrop-blur-md border-t border-white/40 px-3 py-2.5">
                    <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-white" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                      BEAUTÉ DU CUIR CARPENTERS
                    </p>
                    <p className="text-[9px] text-white/90 mt-0.5" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.4)" }}>
                      300 USD
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* ============ MANIFESTO BAND ============ */}
          <section className="w-full bg-[#faf6ef] py-16 sm:py-20 px-8 sm:px-16">
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
        </>
      )}
    </div>
  );
}
