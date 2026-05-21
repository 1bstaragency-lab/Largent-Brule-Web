import Image from "next/image";

export default function LookbookPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">

      {/* Header */}
      <div className="px-8 pt-16 pb-12 text-center">
        <p className="text-[8px] text-neutral-400 uppercase tracking-[0.8em] font-light mb-4">
          S/S 26
        </p>
        <h1 className="text-[11px] uppercase tracking-[0.6em] font-medium text-black">
          Lookbook
        </h1>
      </div>

      {/* Full-bleed image stack */}
      <div className="flex flex-col gap-1">

        {/* Image 1 — Model/Editorial */}
        <div className="relative w-full aspect-[16/7]">
          <Image
            src="/hf_20260521_073327_f5f42ea1-bbdd-412c-b885-c5c43a1e1c5b.png"
            alt="L'Argent Brûlé S/S 26 — Editorial"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
          />
        </div>

        {/* Image 2 — Product/Still */}
        <div className="relative w-full aspect-[16/7]">
          <Image
            src="/hf_20260521_073428_d29afd76-3547-4fd5-a1eb-483812ab9283.png"
            alt="L'Argent Brûlé S/S 26 — Leather Cargo Pants"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

        {/* Image 3 — Product/Still */}
        <div className="relative w-full aspect-[16/7]">
          <Image
            src="/hf_20260521_073334_bad353eb-813a-426f-9939-b78904e74044.png"
            alt="L'Argent Brûlé S/S 26 — Leather Pants Detail"
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>

      </div>

      {/* Footer */}
      <div className="py-16 text-center">
        <span className="text-[8px] text-neutral-300 uppercase tracking-[0.6em]">
          L&apos;Argent Brûlé
        </span>
      </div>

    </div>
  );
}
