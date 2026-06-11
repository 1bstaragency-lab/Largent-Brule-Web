"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { ChevronDown } from "lucide-react";

// ← change this to whatever password you want
const SITE_PASSWORD = "SS26";

const LAUNCH_DATE = new Date("2026-07-13T23:59:59");

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
  const [logoTaps, setLogoTaps] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const handleLogoTap = () => {
    const next = logoTaps + 1;
    setLogoTaps(next);
    if (next >= 5) {
      setShowPassword(true);
      setLogoTaps(0);
    }
  };
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  // Two-step flow:
  //   phone   → entering phone     phoneLoading → posting phone
  //   email   → entering email     emailLoading → posting email
  //   success → final "on the list" message after either email submit or skip
  const [step, setStep] = useState<
    "phone" | "phoneLoading" | "email" | "emailLoading" | "success"
  >("phone");
  const [submittedDigits, setSubmittedDigits] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");

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

  // Whenever a phone number is captured (from signup form), link it to the
  // browser's cart session so abandoned-cart recovery can text this person.
  const capturePhone = async (digits: string) => {
    try {
      await fetch("/api/cart/capture-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
      });
    } catch {
      // Non-blocking — VIP signup still succeeds.
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
    setStep("phoneLoading");
    try {
      const { error } = await supabase
        .from("early_access")
        .insert([{ phone_number: digits }]);
      if (error && error.code !== "23505") {
        setPhoneError(error.message);
        setStep("phone");
      } else {
        // Link phone to the browser's cart session in the background.
        capturePhone(digits);
        setSubmittedDigits(digits);
        setStep("email");
      }
    } catch {
      setPhoneError("Something went wrong. Try again.");
      setStep("phone");
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setEmailError("Enter a valid email.");
      return;
    }
    setStep("emailLoading");
    try {
      const res = await fetch("/api/vip/attach-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: submittedDigits, email: cleaned }),
      });
      const j = await res.json();
      if (!j.ok) {
        setEmailError(j.error === "invalid_email" ? "Enter a valid email." : "Could not save email — try again.");
        setStep("email");
        return;
      }
      setStep("success");
    } catch {
      setEmailError("Network error — try again.");
      setStep("email");
    }
  };

  const handleEmailSkip = () => {
    setStep("success");
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#f5f3ef] flex flex-col items-center justify-center px-6 py-10 font-sans overflow-y-auto">

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

      {/* Logo — tap 5× to reveal admin password field */}
      <div
        className="relative w-72 h-24 mb-4 cursor-default select-none"
        onClick={handleLogoTap}
      >
        <Image
          src="/logo_script_final.png"
          alt="L'Argent Brûlé"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* VIP heading */}
      <div className="text-center mb-10 space-y-2">
        <p className="text-[9px] text-neutral-500 uppercase tracking-[0.6em] font-light">
          S/S 26 Collection
        </p>
        <h1 className="text-[13px] font-medium uppercase tracking-[0.5em] text-black">
          VIP Early Access
        </h1>
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

      {/* Password gate — hidden, revealed by tapping logo 5× */}
      {showPassword && <form onSubmit={handleEnter} className="w-full max-w-sm mb-3">
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
      </form>}

      {/* Step 1 — Phone signup */}
      {(step === "phone" || step === "phoneLoading") && (
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

          <p className="text-[8px] text-neutral-300 leading-relaxed tracking-[0.03em]">
            By submitting you consent to marketing texts. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
          </p>

          <button
            type="submit"
            disabled={step === "phoneLoading"}
            className="w-full py-4 rounded-sm text-[13px] font-semibold tracking-[0.05em] transition-colors bg-black hover:bg-[#111] text-white disabled:opacity-60"
          >
            {step === "phoneLoading"
              ? "..."
              : <span className="text-[11px] tracking-[0.4em] uppercase font-medium">Join VIP</span>}
          </button>
        </form>
      )}

      {/* Step 2 — Email capture */}
      {(step === "email" || step === "emailLoading") && (
        <form onSubmit={handleEmailSubmit} className="w-full max-w-sm flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <p className="text-[10px] text-neutral-500 uppercase tracking-[0.4em] text-center mb-1">
            Phone added — add your email
          </p>
          <div className={`flex items-center border rounded-sm bg-white px-4 py-3 ${
            emailError ? "border-red-400" : "border-neutral-300 focus-within:border-neutral-500"
          }`}>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
              placeholder="Email Address"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="flex-1 text-[13px] font-light text-black bg-transparent outline-none placeholder:text-neutral-400"
            />
          </div>
          {emailError && (
            <p className="text-[9px] text-red-400 tracking-[0.1em] uppercase leading-relaxed">{emailError}</p>
          )}
          <p className="text-[8px] text-neutral-300 leading-relaxed tracking-[0.03em]">
            We&apos;ll only send drop notices and the occasional editorial.
          </p>
          <button
            type="submit"
            disabled={step === "emailLoading"}
            className="w-full py-4 rounded-sm text-[13px] font-semibold tracking-[0.05em] transition-colors bg-black hover:bg-[#111] text-white disabled:opacity-60"
          >
            {step === "emailLoading"
              ? "..."
              : <span className="text-[11px] tracking-[0.4em] uppercase font-medium">Confirm</span>}
          </button>
          <button
            type="button"
            onClick={handleEmailSkip}
            className="text-[9px] text-neutral-400 uppercase tracking-[0.3em] hover:text-black transition-colors py-1"
          >
            Skip
          </button>
        </form>
      )}

      {/* Final success */}
      {step === "success" && (
        <div className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="w-full py-4 rounded-sm text-center bg-neutral-200 text-neutral-600">
            <span className="text-[11px] tracking-[0.4em] uppercase font-medium">
              You&apos;re on the list
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
