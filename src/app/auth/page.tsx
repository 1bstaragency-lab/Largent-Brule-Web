"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
      <div className="max-w-[400px] w-full space-y-16 flex flex-col items-center">
        {/* Logo */}
        <div className="w-full flex justify-center animate-in fade-in zoom-in duration-1000">
          <Image 
            src="/logo_cafe.png" 
            alt="Café L'argent Brûlé" 
            width={300} 
            height={150} 
            className="object-contain"
          />
        </div>

        {/* Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both">
          <h1 className="text-[12px] font-bold uppercase tracking-[0.5em] text-black">SIGN IN TO THE CLUB BELOW</h1>
          <p className="text-[9px] uppercase tracking-[0.3em] opacity-40 font-medium leading-relaxed">
            ACCESS THE ARCHIVE. RSVP TO PRIVATE SHOWS. <br /> RECEIVE COMPLIMENTARY MEMBERSHIP GIFTS.
          </p>
        </div>

        {/* Form */}
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both">
          <div className="space-y-6">
            <input 
              type="email" 
              placeholder="EMAIL ADDRESS" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent text-center"
            />
            <input 
              type="password" 
              placeholder="PASSWORD" 
              className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent text-center"
            />
          </div>

          <button className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.4em] hover:bg-neutral-900 transition-all active:scale-[0.98]">
            ENTER THE CLUB
          </button>

          <div className="flex flex-col items-center gap-4 pt-4">
            <button className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
              FORGOT PASSWORD?
            </button>
            <div className="h-[1px] w-10 bg-black/10" />
            <button className="text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity">
              CREATE ARCHIVAL ACCOUNT
            </button>
          </div>
        </div>

        <Link href="/" className="text-[9px] uppercase font-bold tracking-[0.4em] opacity-20 hover:opacity-100 transition-opacity flex items-center gap-2">
          BACK TO COLLECTIONS
        </Link>
      </div>
    </div>
  );
}
