"use client"

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export function Sidebar() {
  const router = useRouter();

  return (
    <aside className="w-[250px] h-screen sticky top-0 p-10 flex flex-col border-r border-border bg-background z-50">
      <div className="relative w-full h-24 mb-16 px-6">
        <Image 
          src="/logo_script_final.png" 
          alt="L'argent Brûlé" 
          fill 
          className="object-contain object-left"
        />
      </div>

      <nav className="space-y-8 flex-1">
        <div className="space-y-2">
          <Link href="/" className="block text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
            COLLECTIONS
          </Link>
          <Link href="#" className="block text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
            LOOKBOOK
          </Link>
          <Link href="#" className="block text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
            OUR STORY
          </Link>
          <Link href="#" className="block text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
            CAMPAIGNS
          </Link>
          <Link href="#" className="block text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
            FAQ
          </Link>
        </div>

        <div className="space-y-2 pt-4">
          <Link href="#" className="block text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            WOMEN
          </Link>
          <Link href="#" className="block text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            MEN
          </Link>
        </div>

        <div className="space-y-2 pt-4">
          <Link href="#" className="block text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            STORE LOCATOR
          </Link>
          <Link href="/auth" className="block text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            SIGN IN / REGISTER
          </Link>
        </div>
      </nav>

      <div className="mt-auto">
        <Link href="#" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:opacity-50 transition-opacity">
          SEARCH 🔍
        </Link>
      </div>
    </aside>
  );
}
