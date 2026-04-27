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
    <header className="lg:hidden sticky top-0 z-[100] w-full bg-white/70 backdrop-blur-xl border-b border-neutral-100 h-20 flex items-center px-6">
      {/* Menu Trigger - Left */}
      <button onClick={() => setIsOpen(true)} className="p-2 -ml-2">
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* Centered Logo - Script */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-20">
        <Link href="/" className="relative block w-full h-full">
          <Image 
            src="/logo_script_final.png" 
            alt="L'ARGENT BRÛLÉ" 
            fill
            className="object-contain"
            priority
          />
        </Link>
      </div>

      <div className="w-10 h-10 ml-auto" /> {/* Balance spacer */}

      {/* Mobile Menu Overlay - Celine Clinical Spec */}
      {isOpen && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-2xl z-[200] flex flex-col animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Menu Header */}
          <div className="h-20 flex items-center px-6 border-b border-neutral-100">
            <button onClick={() => setIsOpen(false)} className="p-2 -ml-2">
              <X size={20} strokeWidth={1.5} />
            </button>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-10">
              <Image 
                src="/logo_script_final.png" 
                alt="L'ARGENT BRÛLÉ" 
                fill
                className="object-contain"
              />
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-10 pt-10 pb-10 space-y-12">
            <div className="space-y-6">
              {[
                "COLLECTIONS",
                "LOOKBOOK",
                "OUR STORY",
                "CAMPAIGNS",
                "FAQ",
                "WOMEN",
                "MEN",
                "STORE LOCATOR",
                "SIGN IN",
                "REGISTER"
              ].map((item) => (
                <Link 
                  key={item}
                  href={item === "SIGN IN" ? "/auth" : "#"} 
                  onClick={() => setIsOpen(false)} 
                  className="block text-[12px] font-bold uppercase tracking-[0.4em] hover:text-[#4a0404] transition-colors"
                >
                  {item}
                </Link>
              ))}
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
