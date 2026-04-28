"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Smartphone } from "lucide-react";

export default function EarlyAccessPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div className="relative w-64 h-16 mx-auto">
            <Image src="/logo_script_final.png" alt="L'argent Brûlé" fill className="object-contain" />
          </div>
          <div className="space-y-4">
            <h1 className="text-[14px] font-bold tracking-[0.4em] uppercase text-black">ACCESS GRANTED</h1>
            <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 max-w-xs mx-auto leading-relaxed">
              YOU ARE NOW PART OF THE SELECTION. YOU WILL RECEIVE A TEXT MESSAGE SHORTLY.
            </p>
          </div>
          <Link href="/" className="inline-block text-[10px] uppercase font-bold tracking-[0.4em] opacity-40 hover:opacity-100 transition-opacity pt-10">
            RETURN TO COLLECTIONS
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center py-20 px-10">
      {/* Main Content */}
      <main className="w-full max-w-md space-y-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center space-y-6"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="text-[10px] bg-black text-white px-3 py-1 font-bold tracking-[0.3em] uppercase">PRIVATE ACCESS</span>
            <h1 className="text-[18px] font-bold tracking-[0.5em] uppercase text-black">SMS EARLY ACCESS</h1>
          </div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-neutral-400 leading-relaxed">
            MEMBERS ONLY UPDATES AND NEWS.
          </p>
        </motion.div>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          <div className="relative border-b border-neutral-200 group focus-within:border-black transition-colors">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
              <Smartphone size={16} strokeWidth={1.5} />
            </div>
            <input 
              type="tel" 
              placeholder="PHONE NUMBER" 
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-8 py-5 text-[12px] font-bold tracking-[0.3em] uppercase outline-none bg-transparent placeholder:text-neutral-200"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full h-16 bg-black text-white text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-neutral-900 transition-all flex items-center justify-center gap-4 group"
          >
            {isLoading ? (
              <span className="animate-pulse">AUTHORIZING ARCHIVE...</span>
            ) : (
              <>
                JOIN THE SELECTION
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </motion.form>
      </main>

      {/* Footer Meta */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.6 }}
        className="text-center space-y-4"
      >
        <p className="text-[8px] uppercase tracking-[0.3em] font-medium text-neutral-400">
          BY JOINING, YOU AGREE TO RECEIVE RECURRING AUTOMATED MARKETING MESSAGES FROM L&apos;ARGENT BRÛLÉ.
        </p>
        <div className="flex justify-center gap-8 text-[8px] font-bold uppercase tracking-widest text-neutral-300">
          <Link href="#" className="hover:text-black transition-colors">PRIVACY</Link>
          <Link href="#" className="hover:text-black transition-colors">TERMS</Link>
        </div>
      </motion.div>

      {/* Technical Signature */}
      <div className="absolute bottom-8 right-8 hidden lg:block">
        <p className="text-[9px] text-neutral-200 uppercase tracking-[0.5em]">
          L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | FLAGSHIP V6.6
        </p>
      </div>
    </div>
  );
}
