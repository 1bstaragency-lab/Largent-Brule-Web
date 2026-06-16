"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const EARLY_ACCESS_PRODUCTS = [
  {
    handle: "parisian-edition",
    name: "PARISIAN EDITION TEE",
    price: "145 USD",
    image: "/parsian tee.png",
    modelImage: "/parsian product shot.png",
    tag: "NEW",
    available: true,
  },
  {
    handle: "lemondrop-raglan",
    name: "LEMONDROP RAGLAN",
    price: "165 USD",
    image: "/lemondrop main.png",
    modelImage: "/lemondrop1.png",
    tag: "NEW",
    available: true,
  },
  {
    handle: "world-tour-2004",
    name: "WORLD TOUR 2004 TEE",
    price: "145 USD",
    image: "/2004.png",
    modelImage: "/20041.png",
    tag: "NEW",
    available: true,
  },
  {
    handle: "leather-pants",
    name: "BEAUTÉ DU CUIR CARPENTERS",
    price: "240 USD",
    image: "/leathers.png",
    modelImage: "/leathers_detail.png",
    tag: "NEW",
    available: true,
  },
];

export default function EarlyAccessPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessError, setAccessError] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<{ [key: string]: string }>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [videoWatched, setVideoWatched] = useState(false);

  const EARLY_ACCESS_CODE = "LBVIP";
  const SIZES = ["1", "2", "3", "4", "5"];

  useEffect(() => {
    const stored = localStorage.getItem("lb-vip-access");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setIsLoaded(true);
  }, []);

  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.toUpperCase() === EARLY_ACCESS_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem("lb-vip-access", "true");
      setAccessError("");
      setPasswordInput("");
    } else {
      setAccessError("Invalid access code");
      setPasswordInput("");
    }
  };

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setShowPassword(false);
    setPasswordInput("");
    localStorage.removeItem("lb-vip-access");
  };

  if (!isLoaded) {
    return <div className="w-full min-h-screen bg-white" />;
  }

  if (!isAuthenticated && !showPassword && !videoWatched) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center lg:bg-white lg:px-4">
        {/* Mobile Video Entry */}
        <div className="w-screen h-screen lg:hidden flex flex-col items-center justify-center bg-black relative fixed inset-0">
          <Link href="/" className="absolute top-6 left-4 z-10 hover:opacity-70 transition-opacity text-white text-sm font-light tracking-wide" style={{ fontFamily: "cursive" }}>
            L'argent Brûlé
          </Link>

          <video
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/home vip entry.mp4" type="video/mp4" />
          </video>

          <button
            onClick={() => setVideoWatched(true)}
            className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xl font-light tracking-wide bg-white/20 backdrop-blur-sm px-8 py-2 hover:bg-white/30 transition-all z-10"
            style={{ fontFamily: "cursive" }}
          >
            Enter
          </button>
        </div>

        {/* Desktop Access Screen */}
        <div className="hidden lg:flex max-w-md w-full space-y-8 flex-col">
          <div className="text-center space-y-2">
            <h1 className="text-[14px] uppercase font-bold tracking-[0.4em]">EARLY ACCESS</h1>
            <p className="text-[11px] tracking-[0.2em] opacity-50 uppercase">VIP Members Only</p>
          </div>
          <div className="bg-neutral-50 p-8 border border-neutral-100 space-y-6">
            <p className="text-[11px] tracking-[0.2em] text-center opacity-60">
              Enter your VIP access code to unlock the exclusive shop.
            </p>
            <button
              onClick={() => setShowPassword(true)}
              className="w-full h-[52px] bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-800 transition-colors"
            >
              Enter Access Code
            </button>
          </div>
          <p className="text-[9px] text-center opacity-40 uppercase tracking-[0.3em]">
            Don't have a code? Contact us for VIP access.
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-[14px] uppercase font-bold tracking-[0.4em]">EARLY ACCESS CODE</h1>
          </div>
          <form onSubmit={handleAccessSubmit} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value.toUpperCase())}
              placeholder="VIP CODE"
              className="w-full h-[52px] bg-white border border-black text-base font-bold uppercase tracking-[0.4em] px-4 outline-none focus:bg-neutral-50 transition-colors"
              autoFocus
            />
            {accessError && (
              <p className="text-[10px] text-red-500 text-center tracking-wide">{accessError}</p>
            )}
            <button
              type="submit"
              className="w-full h-[52px] bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-800 transition-colors"
            >
              Unlock Shop
            </button>
          </form>
          <button
            onClick={() => setShowPassword(false)}
            className="w-full text-[10px] opacity-40 hover:opacity-60 transition-opacity uppercase tracking-[0.3em]"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-10 pb-40 bg-white min-h-screen">
      <div className="h-4 lg:h-0" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-6 w-full mb-20">
        {EARLY_ACCESS_PRODUCTS.map((p) => (
          <div key={p.handle} className="group block space-y-1">
            <Link href={`/product/${p.handle}`} className="block">
              <div
                className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-3 border border-transparent group-hover:border-neutral-200 transition-all duration-500 will-change-transform"
                onMouseEnter={() => setHoveredProduct(p.handle)}
                onMouseLeave={() => setHoveredProduct(null)}
              >
                {p.image && (
                  <Image
                    src={hoveredProduct === p.handle ? p.modelImage : p.image}
                    alt={p.name}
                    fill
                    className={`object-contain mix-blend-multiply transition-opacity duration-300 ease-out will-change-transform ${
                      p.handle === "leather-pants" ? "p-16" : "p-4"
                    }`}
                    style={{ filter: "contrast(1.1) brightness(1.05)" }}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority
                  />
                )}
                {!p.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <p className="text-white text-[11px] font-bold uppercase tracking-[0.3em]">Coming Soon</p>
                  </div>
                )}
              </div>
            </Link>
            <div className="space-y-0.5 text-[10px] tracking-[0.2em]">
              <p className="font-bold uppercase">{p.name}</p>
              <div className="flex items-center justify-between opacity-50">
                <p className="font-medium">{p.price}</p>
                <p className="font-bold text-[10px] uppercase border-l border-black/20 pl-4">{p.tag}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="max-w-2xl mx-auto border-t border-neutral-100 pt-20 space-y-12">
        <div className="space-y-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">VIP BENEFITS</h2>
          <ul className="space-y-2 text-[11px] tracking-[0.1em] opacity-60">
            <li>✓ Early access to new collections</li>
            <li>✓ Exclusive VIP-only items</li>
            <li>✓ Priority shipping on all orders</li>
            <li>✓ Special member pricing</li>
          </ul>
        </div>
        <div className="space-y-4">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">SHIPPING & RETURNS</h2>
          <p className="text-[11px] tracking-[0.1em] opacity-60">
            Free shipping on all early access orders. 30-day returns for VIP members.
            All items ship within 2-3 business days.
          </p>
        </div>
        <div className="space-y-4 pb-20">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.4em]">QUESTIONS?</h2>
          <p className="text-[11px] tracking-[0.1em] opacity-60">
            Email us at{" "}
            <a href="mailto:vip@largentbrule.com" className="opacity-100 hover:opacity-60 transition-opacity border-b border-black/20 hover:border-black/60">
              vip@largentbrule.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
