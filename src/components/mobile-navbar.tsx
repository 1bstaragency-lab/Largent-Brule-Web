"use client"

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="lg:hidden sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
      <Link href="/">
        <Image 
          src="/logo_vfinal.png" 
          alt="L'ARGENT BRÛLÉ" 
          width={120} 
          height={40} 
          className="object-contain"
        />
      </Link>

      <button onClick={() => setIsOpen(!isOpen)} className="p-2">
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-[110] p-10 pt-24 space-y-10 flex flex-col animate-in fade-in slide-in-from-top duration-500">
          <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 p-2">
            <X size={24} />
          </button>

          <nav className="space-y-10">
            <Link href="/" onClick={() => setIsOpen(false)} className="block text-2xl font-bold uppercase tracking-widest">
              COLLECTIONS
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="block text-2xl font-bold uppercase tracking-widest">
              LOOKBOOK
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="block text-2xl font-bold uppercase tracking-widest">
              OUR STORY
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="block text-2xl font-bold uppercase tracking-widest">
              CAMPAIGNS
            </Link>
            <Link href="#" onClick={() => setIsOpen(false)} className="block text-2xl font-bold uppercase tracking-widest">
              FAQ
            </Link>
          </nav>

          <div className="mt-auto space-y-6">
            <Link href="#" onClick={() => setIsOpen(false)} className="block text-xs uppercase tracking-widest opacity-60">
              STORE LOCATOR
            </Link>
            <Link href="/auth" onClick={() => setIsOpen(false)} className="block text-xs uppercase tracking-widest opacity-60">
              SIGN IN / REGISTER
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
