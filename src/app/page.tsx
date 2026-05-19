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
    // Set launch date to 5 days from now for the countdown
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 5);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

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
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="text-center space-y-16 max-w-2xl w-full">
        {/* Top Header & Countdown */}
        <div className="space-y-6">
          <p className="text-[12px] uppercase tracking-[0.1em] font-medium">
            S/S 26 COLLECTION DROP
          </p>
          
          <div className="flex items-center justify-center gap-2 sm:gap-4 text-5xl sm:text-7xl font-bold tracking-tight">
            <div className="flex flex-col items-center">
              <span>{timeLeft.days}</span>
              <span className="text-[10px] font-normal tracking-normal uppercase mt-2">Days</span>
            </div>
            <span className="mb-6">:</span>
            <div className="flex flex-col items-center">
              <span>{timeLeft.hours}</span>
              <span className="text-[10px] font-normal tracking-normal uppercase mt-2">Hrs</span>
            </div>
            <span className="mb-6">:</span>
            <div className="flex flex-col items-center">
              <span>{timeLeft.minutes}</span>
              <span className="text-[10px] font-normal tracking-normal uppercase mt-2">Mins</span>
            </div>
            <span className="mb-6">:</span>
            <div className="flex flex-col items-center">
              <span>{timeLeft.seconds}</span>
              <span className="text-[10px] font-normal tracking-normal uppercase mt-2">Secs</span>
            </div>
          </div>
        </div>

        {/* Main Copy */}
        <div className="space-y-6 pt-10">
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight leading-none">
            VIP MEMBERS<br/>EARLY ACCESS
          </h1>
          <p className="text-[11px] sm:text-[13px] font-medium uppercase tracking-[0.15em] leading-relaxed max-w-md mx-auto">
            GAIN ACCESS TO OUR S/S 26 COLLECTION 24 HOURS BEFORE THE SITE OPENS TO PUBLIC. EVERYTHING LIMITED.
          </p>
        </div>

        {/* Form */}
        <div className="pt-4 max-w-md mx-auto w-full">
          <form 
            className="flex flex-col gap-3"
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
                  btn.classList.replace('bg-black', 'bg-green-800');
                  input.value = "";
                }
              } catch (err) {
                console.error(err);
                btn.innerText = originalText;
                btn.disabled = false;
              }
            }}
          >
            <div className="relative flex items-center border border-black rounded-sm overflow-hidden h-[54px] bg-white">
              <div className="flex items-center justify-center px-4 border-r border-black/20 bg-neutral-50 h-full">
                <span className="text-lg">🇺🇸</span>
                <svg className="w-3 h-3 ml-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
              <input 
                type="tel" 
                name="phone"
                placeholder="Phone Number" 
                className="w-full h-full text-[15px] px-4 outline-none placeholder:text-neutral-400"
                required
              />
            </div>
            <button 
              type="submit"
              name="submitBtn"
              className="w-full h-[54px] bg-black text-white text-[13px] font-bold tracking-[0.2em] uppercase rounded-[4px] hover:bg-neutral-800 transition-colors mt-2"
            >
              JOIN VIP
            </button>
          </form>
          
          <div className="pt-10 flex justify-center">
            <span className="text-[10px] font-bold tracking-[0.4em] uppercase">L'ARGENT BRÛLÉ</span>
          </div>
        </div>

      </div>
    </div>
  );
}
