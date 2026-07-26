"use client";

import { useCountdown } from "@/lib/countdown";

export default function CollectionsPage() {
  const { timeLeft } = useCountdown();

  return (
    <div className="px-4 sm:px-10 pb-40">
      {/* Mobile spacer to clear fixed header */}
      <div className="h-8 lg:h-0" />
      <div className="mb-20">
        <h1 className="text-[11px] uppercase font-bold tracking-[0.5em] opacity-40">Collections</h1>
      </div>

      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-12">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.4em]">S/S 26 COLLECTION COMING SOON</h2>
        <p className="opacity-50 text-[11px] tracking-[0.2em] uppercase max-w-md leading-relaxed">
          The shop is closed as we prepare the new collection. Join VIP for early access.
        </p>

        <div className="flex items-center justify-around gap-3 border border-neutral-300 px-4 py-3">
          {[
            { val: timeLeft.days, label: "Days" },
            { val: timeLeft.hours, label: "Hrs" },
            { val: timeLeft.minutes, label: "Min" },
            { val: timeLeft.seconds, label: "Sec" },
          ].map((unit, i, arr) => (
            <div key={unit.label} className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col items-center gap-1">
                <span className="text-base sm:text-lg font-light tracking-[0.1em]">{unit.val}</span>
                <span className="text-[7px] text-neutral-400 uppercase tracking-[0.3em]">{unit.label}</span>
              </div>
              {i < arr.length - 1 && <span className="text-neutral-300 font-thin mb-3">:</span>}
            </div>
          ))}
        </div>

        <form
          className="w-full max-w-sm space-y-4"
          onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing."); }}
        >
          <input
            type="tel"
            placeholder="PHONE NUMBER"
            className="w-full h-[52px] bg-neutral-50 text-black text-[11px] font-medium tracking-[0.2em] px-4 outline-none border border-transparent focus:border-black transition-colors"
            required
          />
          <button
            type="submit"
            className="w-full h-[52px] bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-neutral-800 transition-colors"
          >
            NOTIFY ME
          </button>
        </form>
      </div>
    </div>
  );
}
