"use client"

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-[250px] h-screen sticky top-0 p-10 flex flex-col border-r border-border bg-background z-50">
      <div className="relative w-full h-32 mb-20 px-4">
        <Link href="/" className="relative block w-full h-full">
          <Image 
            src="/logo_script_final.png" 
            alt="L'argent Brûlé" 
            fill 
            className="object-contain object-left"
          />
        </Link>
      </div>

      <nav className="space-y-6 flex-1 overflow-y-auto">
        {[
          { label: "COLLECTIONS", href: "/" },
          { label: "OUR STORY", href: "/our-story" },
          { label: "LOOKBOOK", href: "#" },
          { label: "EARLY ACCESS", href: "/early-access" },
          { label: "FAQ", href: "/faq" },
          { label: "SIGN IN", href: "/auth" },
          { label: "REGISTER", href: "#" }
        ].map((item) => (
          <Link 
            key={item.label}
            href={item.href} 
            className="block text-[10px] font-bold uppercase tracking-[0.5em] hover:opacity-40 transition-all"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto">
        <Link href="#" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
          SEARCH 🔍
        </Link>
      </div>
    </aside>
  );
}
