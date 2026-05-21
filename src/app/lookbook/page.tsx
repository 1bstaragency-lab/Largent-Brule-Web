import Image from "next/image";

const images = [
  {
    src: "/leather_pants_back_detail.png",
    alt: "Leather Cargo Pants — Full Look",
    span: "col-span-2 row-span-2",
  },
  {
    src: "/leather_pants_detail.png",
    alt: "Leather Cargo Pants — Side Detail",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/leather_pants_back.jpg",
    alt: "Leather Cargo Pants — Back Detail",
    span: "col-span-1 row-span-1",
  },
  {
    src: "/leather_pants_front.png",
    alt: "Leather Cargo Pants — Front",
    span: "col-span-2 row-span-1",
  },
];

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

      {/* Grid */}
      <div className="px-4 md:px-8 pb-24 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 auto-rows-[320px] md:auto-rows-[420px]">
          {images.map((img, i) => (
            <div
              key={i}
              className={`relative overflow-hidden ${img.span}`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Footer label */}
      <div className="pb-16 text-center">
        <span className="text-[8px] text-neutral-300 uppercase tracking-[0.6em]">
          L&apos;Argent Brûlé
        </span>
      </div>
    </div>
  );
}
