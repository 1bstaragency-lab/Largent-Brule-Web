"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // End of next month: June 30, 2026
    const launchDate = new Date("2026-06-30T23:59:59").getTime();
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, '0'),
        hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0'),
        minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0'),
        seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#111111] flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-24">
        
        {/* Top Header */}
        <div className="text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.6em] font-light">
            S/S 26 COLLECTION
          </p>
        </div>

        {/* Minimalist Countdown */}
        <div className="flex items-center justify-center gap-6 sm:gap-12 text-3xl sm:text-5xl font-light tracking-[0.2em]">
          <div className="flex flex-col items-center">
            <span>{timeLeft.days}</span>
            <span className="text-[7px] text-neutral-500 font-normal tracking-[0.5em] uppercase mt-4">Days</span>
          </div>
          <span className="mb-8 font-thin text-neutral-800">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.hours}</span>
            <span className="text-[7px] text-neutral-500 font-normal tracking-[0.5em] uppercase mt-4">Hrs</span>
          </div>
          <span className="mb-8 font-thin text-neutral-800">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.minutes}</span>
            <span className="text-[7px] text-neutral-500 font-normal tracking-[0.5em] uppercase mt-4">Min</span>
          </div>
          <span className="mb-8 font-thin text-neutral-800">:</span>
          <div className="flex flex-col items-center">
            <span>{timeLeft.seconds}</span>
            <span className="text-[7px] text-neutral-500 font-normal tracking-[0.5em] uppercase mt-4">Sec</span>
          </div>
        </div>

        {/* Messaging */}
        <div className="text-center space-y-8">
          <h1 className="text-[15px] sm:text-[18px] font-medium uppercase tracking-[0.4em] leading-loose">
            VIP EARLY ACCESS
          </h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] leading-loose max-w-sm mx-auto">
            Secure your allocation 24 hours prior to public release. Extremely limited quantities.
          </p>
        </div>

        {/* High-Fashion Input Form */}
        <div className="w-full max-w-sm">
          <form 
            className="flex flex-col gap-8"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('phone') as HTMLInputElement;
              const btn = form.elements.namedItem('submitBtn') as HTMLButtonElement;
              
              if (!input.value) return;
              
              const originalText = btn.innerText;
              btn.innerText = "PROCESSING...";
              btn.disabled = true;

              try {
                const { error } = await supabase
                  .from('early_access')
                  .insert([{ phone_number: input.value }]);

                if (error && error.code !== '23505') {
                  alert(`ERROR: ${error.message}`);
                  btn.innerText = originalText;
                  btn.disabled = false;
                } else {
                  btn.innerText = "ADDED TO VIP LIST";
                  btn.classList.add('text-neutral-500', 'border-neutral-800');
                  input.value = "";
                }
              } catch (err) {
                console.error(err);
                btn.innerText = originalText;
                btn.disabled = false;
              }
            }}
          >
            <div className="relative w-full">
              <input 
                type="tel" 
                name="phone"
                placeholder="ENTER PHONE NUMBER" 
                className="w-full bg-transparent text-[#111111] text-[11px] font-light tracking-[0.3em] pb-3 outline-none border-b border-neutral-300 focus:border-[#111111] transition-colors placeholder:text-neutral-400 text-center"
                required
              />
            </div>
            <button 
              type="submit"
              name="submitBtn"
              className="w-full py-4 bg-transparent border border-[#111111] text-[#111111] text-[9px] font-bold tracking-[0.5em] uppercase hover:bg-[#111111] hover:text-[#faf9f6] transition-all duration-500"
            >
              REQUEST INVITATION
            </button>
          </form>
        </div>

        {/* Footer Brand */}
        <div className="pt-20">
          <span className="text-[8px] text-neutral-400 font-medium tracking-[0.6em] uppercase">
            L'Argent Brûlé
          </span>
        </div>

      </div>
    </div>
  );
}
