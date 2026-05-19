"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const collections = [
  {
    slug: "classics",
    label: "CLASSICS",
    description: "The permanent archive. Foundational silhouettes built to last.",
    image: "/bomber_final_studio.jpg",
  },
  {
    slug: "ss26",
    label: "S/S 26",
    description: "Spring / Summer 2026. The new season.",
    image: "/hoodie_front_v16.png",
  },
];

export default function CollectionsPage() {
  const [showSneakPeek, setShowSneakPeek] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSneakPeek(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="px-4 sm:px-10 pb-40">
      {/* Mobile spacer to clear fixed header */}
      <div className="h-8 lg:h-0" />
      <div className="mb-20">
        <h1 className="text-[11px] uppercase font-bold tracking-[0.5em] opacity-40">Collections</h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-12">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.4em]">S/S 26 COLLECTION COMING SOON</h2>
        <p className="opacity-50 text-[11px] tracking-[0.2em] uppercase max-w-md leading-relaxed">
          The shop is closed as we prepare the new collection. Join VIP for early access.
        </p>
        
        <form 
          className="w-full max-w-sm space-y-4"
          onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing."); }}
        >
          <input 
            type="tel" 
            placeholder="PHONE NUMBER" 
            className="w-full h-[52px] bg-neutral-50 text-black text-[11px] font-medium tracking-[0.2em] px-4 outline-none border border-transparent focus:border-black transition-colors"
            required
          />
          <button 
            type="submit"
            className="w-full h-[52px] bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-neutral-800 transition-colors"
          >
            NOTIFY ME
          </button>
        </form>

        <div className={`transition-opacity duration-1000 ${showSneakPeek ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <Link href="/product/leather-pants" className="inline-block border-b border-black text-[10px] uppercase font-bold tracking-[0.3em] pb-1 hover:text-neutral-500 hover:border-neutral-500 transition-colors">
            TAKE A SNEAK PEEK
          </Link>
        </div>
      </div>
    </div>
  );
}
