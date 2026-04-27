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
    <header className="lg:hidden sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-sm border-b border-neutral-100 h-16 flex items-center px-6">
      {/* Menu Trigger - Left */}
      <button onClick={() => setIsOpen(true)} className="p-2 -ml-2">
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* Centered Logo - Red Script */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative w-full h-24 mb-16">
          <Image 
            src="/logo_script_final.png" 
            alt="L'argent Brûlé" 
            fill 
            className="object-contain object-left"
          />
        </div>
      </div>

      <div className="w-10 h-10 ml-auto" /> {/* Balance spacer */}

      {/* Mobile Menu Overlay - Celine Clinical Spec */}
      {isOpen && (
        <div className="fixed inset-0 bg-white z-[200] flex flex-col animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Menu Header */}
          <div className="h-16 flex items-center px-6 border-b border-neutral-100">
            <button onClick={() => setIsOpen(false)} className="p-2 -ml-2">
              <X size={20} strokeWidth={1.5} />
            </button>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Image 
                src="/logo_red_script.png" 
                alt="L'ARGENT BRÛLÉ" 
                width={110} 
                height={36} 
                className="object-contain"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-10 pt-16 pb-10 space-y-12">
            <div className="space-y-8">
              <Link href="/" onClick={() => setIsOpen(false)} className="block text-[14px] font-bold uppercase tracking-[0.3em]">
                COLLECTIONS
              </Link>
              <Link href="#" onClick={() => setIsOpen(false)} className="block text-[14px] font-bold uppercase tracking-[0.3em]">
                LOOKBOOK
              </Link>
              <Link href="#" onClick={() => setIsOpen(false)} className="block text-[14px] font-bold uppercase tracking-[0.3em]">
                OUR STORY
              </Link>
              <Link href="#" onClick={() => setIsOpen(false)} className="block text-[14px] font-bold uppercase tracking-[0.3em]">
                CAMPAIGNS
              </Link>
            </div>

            <div className="pt-12 border-t border-neutral-100 space-y-6">
              <Link href="#" onClick={() => setIsOpen(false)} className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                STORE LOCATOR
              </Link>
              <Link href="/auth" onClick={() => setIsOpen(false)} className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                SIGN IN
              </Link>
              <Link href="#" onClick={() => setIsOpen(false)} className="block text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">
                FAQ
              </Link>
            </div>
          </nav>

          <div className="p-10 border-t border-neutral-50 bg-neutral-50/50">
            <p className="text-[9px] font-medium uppercase tracking-widest text-neutral-400">
              L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | V2.0
            </p>
          </div>
        </div>
      )}
    </header>
  );
}
