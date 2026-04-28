"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function EarlyAccessPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const autoCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check session storage to avoid annoyance, but allow re-entry for testing if needed
    const hasSeen = sessionStorage.getItem("largent_brule_access_seen");
    
    if (!hasSeen) {
      const arrivalTimer = setTimeout(() => {
        setIsOpen(true);
        
        // Start the 4-second departure countdown
        autoCloseTimerRef.current = setTimeout(() => {
          setIsOpen((current) => {
            if (current) {
               sessionStorage.setItem("largent_brule_access_seen", "true");
               return false;
            }
            return false;
          });
        }, 4000); 

      }, 3000); // 3-second arrival delay

      return () => {
        clearTimeout(arrivalTimer);
        if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      };
    }
  }, []);

  // Cancel departure if user interacts
  useEffect(() => {
    if (hasInteracted && autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
  }, [hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem("largent_brule_access_seen", "true");
    if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
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
        sessionStorage.setItem("largent_brule_access_seen", "true");
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white p-12 lg:p-20 shadow-2xl space-y-12 overflow-hidden pointer-events-auto"
          >
            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-8 right-8 p-2 hover:opacity-50 transition-opacity"
            >
              <X size={20} strokeWidth={1} />
            </button>

            <div className="space-y-12 text-center">
              <div className="relative w-96 h-24 mx-auto">
                <Image src="/logo_script_final.png" alt="L'argent Brûlé" fill className="object-contain" />
              </div>

              {!isSubmitted ? (
                <>
                  <div className="space-y-4">
                    <h2 className="text-[14px] font-bold tracking-[0.6em] uppercase text-black">ACCESS THE COLLECTION</h2>
                    <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-neutral-400 leading-relaxed">
                      JOIN THE SELECTION FOR PRIVATE UPDATES.
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
                        onFocus={() => setHasInteracted(true)}
                        onChange={(e) => {
                          setPhoneNumber(e.target.value);
                          setHasInteracted(true);
                        }}
                        className="w-full pl-8 py-4 text-[12px] font-bold tracking-[0.3em] uppercase outline-none bg-transparent placeholder:text-neutral-200"
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.5em] hover:bg-neutral-900 transition-all flex items-center justify-center gap-4 group"
                    >
                      {isLoading ? "JOINING..." : (
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
                    YOU ARE NOW IN CLUB L&apos;ARGENT BRÛLÉ.
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
