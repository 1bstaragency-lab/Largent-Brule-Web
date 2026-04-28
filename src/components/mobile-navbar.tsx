"use client"

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { label: "COLLECTIONS", href: "/" },
    { label: "OUR STORY", href: "/our-story" },
    { label: "LOOKBOOK", href: "#" },
    { label: "FAQ", href: "/faq" },
    { label: "SIGN IN", href: "/auth" },
    { label: "REGISTER", href: "#" }
  ];

  return (
    <header className="lg:hidden sticky top-0 z-[100] w-full bg-white border-b border-neutral-100 h-20 flex items-center px-6">
      {/* Menu Trigger - Left */}
      <button onClick={() => setIsOpen(true)} className="p-2 -ml-2">
        <Menu size={20} strokeWidth={1.5} />
      </button>

      {/* Centered Logo - Script */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-16">
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
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[200] flex flex-col"
          >
            {/* Menu Header */}
            <div className="h-20 flex items-center px-6 border-b border-neutral-100 relative">
              <button onClick={() => setIsOpen(false)} className="p-2 -ml-2">
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <nav className="flex-1 flex flex-col items-center justify-center space-y-8 py-20 overflow-y-auto">
              {navItems.map((item, idx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link 
                    href={item.href} 
                    onClick={() => setIsOpen(false)} 
                    className="text-[14px] font-bold uppercase tracking-[0.8em] text-black hover:opacity-40 transition-all duration-300 block py-2"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            {/* Verification Signature */}
            <div className="p-12 border-t border-neutral-100 flex justify-center">
              <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">
                L&apos;ARGENT BRÛLÉ &copy; 2026
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
