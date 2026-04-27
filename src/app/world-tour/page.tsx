"use client"

import { GlobePolaroids } from "@/components/ui/cobe-globe-polaroids";

export default function WorldTourPage() {
  return (
    <div className="p-10 pb-40 min-h-screen bg-white">
      <div className="mb-20 space-y-4">
        <h1 className="text-[14px] uppercase font-bold tracking-[0.4em]">WORLD TOUR 2026</h1>
        <p className="text-[11px] uppercase tracking-[0.2em] opacity-40">Locations & Pop-ups</p>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-20">
        <div className="w-full max-w-2xl">
          <GlobePolaroids className="w-full" />
        </div>

        <div className="space-y-12 max-w-sm">
          <div className="space-y-2 border-b border-neutral-100 pb-8">
            <h3 className="text-[12px] font-bold tracking-widest">PARIS</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Avenue Montaigne Pop-up</p>
            <p className="text-[10px] font-medium">April 24 - May 10</p>
          </div>

          <div className="space-y-2 border-b border-neutral-100 pb-8 opacity-40">
            <h3 className="text-[12px] font-bold tracking-widest">TOKYO</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">Shibuya District</p>
            <p className="text-[10px] font-medium">Coming Soon</p>
          </div>

          <div className="space-y-2 border-b border-neutral-100 pb-8 opacity-40">
            <h3 className="text-[12px] font-bold tracking-widest">NEW YORK</h3>
            <p className="text-[10px] text-neutral-500 uppercase tracking-wider">SoHo Flagship</p>
            <p className="text-[10px] font-medium">Coming Soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
