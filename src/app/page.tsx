"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronDown } from "lucide-react";

// ← change this to whatever password you want
const SITE_PASSWORD = "SS26";

const LAUNCH_DATE = new Date("2026-06-30T23:59:59");

const NAV_LINKS = [
  { label: "Lookbook", href: "/lookbook" },
  { label: "Our Story", href: "/our-story" },
  { label: "FAQ", href: "/faq" },
  { label: "Sign In", href: "/auth" },
];

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00" });
  useEffect(() => {
    const tick = () => {
      const dist = LAUNCH_DATE.getTime() - Date.now();
      if (dist <= 0) return;
      setTimeLeft({
        days:    String(Math.floor(dist / 86400000)).padStart(2, "0"),
        hours:   String(Math.floor((dist % 86400000) / 3600000)).padStart(2, "0"),
        minutes: String(Math.floor((dist % 3600000) / 60000)).padStart(2, "0"),
        seconds: String(Math.floor((dist % 60000) / 1000)).padStart(2, "0"),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return timeLeft;
}

export default function Home() {
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");

  const timeLeft = useCountdown();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toUpperCase() === SITE_PASSWORD) {
      localStorage.setItem("lb_access", "true");
      router.push("/collections");
    } else {
      setPasswordError(true);
      setPassword("");
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
    if (phoneError) setPhoneError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setPhoneError("Enter your full 10-digit number including area code.");
      return;
    }
    setSubmitState("loading");
    try {
      const { error } = await supabase
        .from("early_access")
        .insert([{ phone_number: digits }]);
      if (error && error.code !== "23505") {
        setPhoneError(error.message);
        setSubmitState("idle");
      } else {
        setSubmitState("success");
        setPhone("");
      }
    } catch {
      setPhoneError("Something went wrong. Try again.");
      setSubmitState("idle");
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] flex flex-col items-center justify-center px-6 py-16 font-sans">

      {/* Nav dropdown — top right */}
      <div className="fixed top-5 right-5 z-50" ref={dropdownRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-neutral-500 hover:text-black transition-colors"
        >
          Menu <ChevronDown size={11} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-neutral-200 shadow-sm py-2">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-neutral-600 hover:text-black hover:bg-neutral-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Logo */}
      <div className="relative w-72 h-24 mb-10">
        <Image
          src="/logo_script_final.png"
          alt="L'Argent Brûlé"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Countdown */}
      <div className="w-full max-w-sm border border-neutral-300 px-6 py-6 flex items-center justify-around mb-10">
        {[
          { val: timeLeft.days, label: "Days" },
          { val: timeLeft.hours, label: "Hrs" },
          { val: timeLeft.minutes, label: "Min" },
          { val: timeLeft.seconds, label: "Sec" },
        ].map((unit, i, arr) => (
          <div key={unit.label} className="flex items-center gap-3 md:gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="text-3xl font-light tracking-[0.1em]">{unit.val}</span>
              <span className="text-[7px] text-neutral-400 uppercase tracking-[0.4em]">{unit.label}</span>
            </div>
            {i < arr.length - 1 && <span className="text-neutral-300 font-thin mb-4">:</span>}
          </div>
        ))}
      </div>

      {/* Password gate */}
      <form onSubmit={handleEnter} className="w-full max-w-sm mb-3">
        <div className="flex gap-2">
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setPasswordError(false); }}
            placeholder="PASSWORD"
            className={`flex-1 border rounded-sm px-4 py-3 text-[11px] tracking-[0.3em] uppercase bg-white outline-none placeholder:text-neutral-400 ${
              passwordError ? "border-red-400 text-red-400" : "border-neutral-300 focus:border-neutral-500"
            }`}
          />
          <button
            type="submit"
            className="bg-[#3a4a6b] hover:bg-[#2e3c58] text-white text-[10px] font-bold tracking-[0.3em] uppercase px-5 rounded-sm transition-colors"
          >
            ENTER
          </button>
        </div>
        {passwordError && (
          <p className="text-[9px] text-red-400 tracking-[0.15em] uppercase mt-2 text-center">
            Incorrect password
          </p>
        )}
      </form>

      {/* Phone signup */}
      <form onSubmit={handleSignup} className="w-full max-w-sm flex flex-col gap-3">
        <div className={`flex items-center border rounded-sm bg-white px-4 py-3 gap-3 ${
          phoneError ? "border-red-400" : "border-neutral-300 focus-within:border-neutral-500"
        }`}>
          <span className="text-lg leading-none">🇺🇸</span>
          <span className="text-[11px] text-neutral-400">+1</span>
          <div className="w-px h-4 bg-neutral-200" />
          <input
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="Phone Number"
            className="flex-1 text-[13px] font-light text-black bg-transparent outline-none placeholder:text-neutral-400"
          />
        </div>
        {phoneError && (
          <p className="text-[9px] text-red-400 tracking-[0.1em] uppercase leading-relaxed">{phoneError}</p>
        )}

        <p className="text-[9px] text-neutral-400 leading-relaxed uppercase tracking-[0.04em]">
          By submitting, you consent to receive marketing texts from L&apos;Argent Brûlé including texts sent by autodialer. Consent is not a condition of purchase. Msg &amp; data rates may apply. Unsubscribe anytime by replying STOP.
        </p>

        <button
          type="submit"
          disabled={submitState === "loading" || submitState === "success"}
          className={`w-full py-4 rounded-sm text-[13px] font-semibold tracking-[0.05em] transition-colors ${
            submitState === "success"
              ? "bg-neutral-300 text-neutral-500 cursor-default"
              : "bg-[#2a2a2a] hover:bg-black text-white"
          }`}
        >
          {submitState === "loading" ? "..." : submitState === "success" ? "You're on the list" : "Sign up"}
        </button>
      </form>

    </div>
  );
}
