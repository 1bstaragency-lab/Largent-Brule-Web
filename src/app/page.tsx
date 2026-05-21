"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  useEffect(() => {
    const launchDate = new Date("2026-06-30T23:59:59").getTime();

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = launchDate - now;

      if (distance < 0) {
        clearInterval(timer);
        return;
      }

      setTimeLeft({
        days: String(Math.floor(distance / (1000 * 60 * 60 * 24))).padStart(2, "0"),
        hours: String(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0"),
        minutes: String(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0"),
        seconds: String(Math.floor((distance % (1000 * 60)) / 1000)).padStart(2, "0"),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
    if (phoneError) setPhoneError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");

    if (digits.length < 10) {
      setPhoneError("PLEASE ENTER YOUR FULL 10-DIGIT PHONE NUMBER INCLUDING AREA CODE");
      return;
    }

    setSubmitState("loading");

    try {
      const { error } = await supabase
        .from("early_access")
        .insert([{ phone_number: digits }]);

      if (error && error.code !== "23505") {
        setPhoneError(`ERROR: ${error.message}`);
        setSubmitState("idle");
      } else {
        setSubmitState("success");
        setPhone("");
      }
    } catch (err) {
      console.error(err);
      setPhoneError("SOMETHING WENT WRONG. PLEASE TRY AGAIN.");
      setSubmitState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] text-black flex flex-col items-center justify-center p-6 font-sans">

      <div className="w-full max-w-xl flex flex-col items-center justify-center space-y-24">

        {/* Top Header */}
        <div className="text-center">
          <p className="text-[9px] text-neutral-500 uppercase tracking-[0.6em] font-light">
            S/S 26 COLLECTION
          </p>
        </div>

        {/* Countdown Box */}
        <div className="w-full border border-neutral-300 px-6 py-10 flex items-center justify-around text-4xl md:text-5xl font-light tracking-[0.15em]">
          <div className="flex flex-col items-center gap-4">
            <span>{timeLeft.days}</span>
            <span className="text-[7px] text-neutral-400 font-normal tracking-[0.5em] uppercase">Days</span>
          </div>
          <span className="mb-8 font-thin text-neutral-300">:</span>
          <div className="flex flex-col items-center gap-4">
            <span>{timeLeft.hours}</span>
            <span className="text-[7px] text-neutral-400 font-normal tracking-[0.5em] uppercase">Hrs</span>
          </div>
          <span className="mb-8 font-thin text-neutral-300">:</span>
          <div className="flex flex-col items-center gap-4">
            <span>{timeLeft.minutes}</span>
            <span className="text-[7px] text-neutral-400 font-normal tracking-[0.5em] uppercase">Min</span>
          </div>
          <span className="mb-8 font-thin text-neutral-300">:</span>
          <div className="flex flex-col items-center gap-4">
            <span>{timeLeft.seconds}</span>
            <span className="text-[7px] text-neutral-400 font-normal tracking-[0.5em] uppercase">Sec</span>
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

        {/* Form */}
        <div className="w-full max-w-sm">
          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="(000) 000-0000"
                className={`w-full bg-transparent text-black text-[11px] font-light tracking-[0.3em] pb-3 outline-none border-b transition-colors placeholder:text-neutral-400 text-center ${
                  phoneError ? "border-red-400" : "border-neutral-300 focus:border-black"
                }`}
              />
              {phoneError && (
                <p className="text-[8px] text-red-400 tracking-[0.15em] uppercase text-center leading-relaxed">
                  {phoneError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitState === "loading" || submitState === "success"}
              className={`w-full py-4 bg-transparent border text-[9px] font-bold tracking-[0.5em] uppercase transition-all duration-500 ${
                submitState === "success"
                  ? "border-neutral-300 text-neutral-400 cursor-default"
                  : "border-black text-black hover:bg-black hover:text-[#faf9f6]"
              }`}
            >
              {submitState === "loading"
                ? "PROCESSING..."
                : submitState === "success"
                ? "ADDED TO VIP LIST"
                : "REQUEST INVITATION"}
            </button>
          </form>
        </div>

        {/* Footer Brand */}
        <div className="pt-20">
          <span className="text-[8px] text-neutral-400 font-medium tracking-[0.6em] uppercase">
            L&apos;Argent Brûlé
          </span>
        </div>

      </div>
    </div>
  );
}
