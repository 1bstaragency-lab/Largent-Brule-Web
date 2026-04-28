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

          <nav className="flex-1 overflow-y-auto flex flex-col items-center justify-center space-y-10 px-10">
            {[
              { label: "COLLECTIONS", href: "/" },
              { label: "OUR STORY", href: "/our-story" },
              { label: "LOOKBOOK", href: "#" },
              { label: "FAQ", href: "/faq" },
              { label: "SIGN IN", href: "/auth" },
              { label: "REGISTER", href: "#" }
            ].map((item) => (
              <Link 
                key={item.label}
                href={item.href} 
                onClick={() => setIsOpen(false)} 
                className="text-[12px] font-bold uppercase tracking-[0.6em] text-black hover:opacity-40 transition-all duration-300"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Footer Logo Anchor */}
          <div className="p-12 border-t border-neutral-100/50 flex justify-center">
            <div className="relative w-40 h-10 opacity-40">
              <Image 
                src="/logo_script_final.png" 
                alt="L'ARGENT BRÛLÉ" 
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
