"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function EarlyAccessPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("largent_brule_access_seen");
    if (!hasSeen) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show after 3 seconds for prestigious arrival
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("largent_brule_access_seen", "true");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('early_access')
        .insert([{ phone_number: phoneNumber }]);

      if (error && error.code !== '23505') {
        alert(`ACCESS ERROR: ${error.message}`);
      } else {
        setIsSubmitted(true);
        localStorage.setItem("largent_brule_access_seen", "true");
        setTimeout(() => setIsOpen(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white p-12 lg:p-20 shadow-2xl space-y-12 overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-8 right-8 p-2 hover:opacity-50 transition-opacity"
            >
              <X size={20} strokeWidth={1} />
            </button>

            <div className="space-y-12 text-center">
              <div className="relative w-80 h-20 mx-auto">
                <Image src="/logo_script_final.png" alt="L'argent Brûlé" fill className="object-contain" />
              </div>

              {!isSubmitted ? (
                <>
                  <div className="space-y-4">
                    <h2 className="text-[14px] font-bold tracking-[0.6em] uppercase text-black">ACCESS THE COLLECTION</h2>
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 leading-relaxed">
                      JOIN THE SELECTION FOR PRIVATE UPDATES AND PRE-RELEASE ACCESS.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative border-b border-neutral-200 group focus-within:border-black transition-colors">
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 opacity-20 group-focus-within:opacity-100 transition-opacity">
                        <Smartphone size={16} strokeWidth={1.5} />
                      </div>
                      <input 
                        type="tel" 
                        placeholder="PHONE NUMBER" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full pl-8 py-4 text-[12px] font-bold tracking-[0.3em] uppercase outline-none bg-transparent placeholder:text-neutral-200"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-neutral-900 transition-all flex items-center justify-center gap-4 group"
                    >
                      {isLoading ? "ARCHIVING..." : (
                        <>
                          JOIN SELECTION
                          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 py-12"
                >
                  <h2 className="text-[14px] font-bold tracking-[0.6em] uppercase text-black">ACCESS GRANTED</h2>
                  <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400">
                    YOU HAVE BEEN ADDED TO THE SELECTION.
                  </p>
                </motion.div>
              )}

              <p className="text-[8px] font-medium tracking-[0.3em] text-neutral-300 uppercase leading-relaxed max-w-xs mx-auto">
                BY JOINING, YOU AGREE TO RECEIVE AUTOMATED MARKETING MESSAGES. DATA PROTECTED BY CLINICAL STANDARDS.
              </p>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
