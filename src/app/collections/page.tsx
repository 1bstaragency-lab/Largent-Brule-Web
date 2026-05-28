// TEMPORARY: site opened for testing. Original "Coming Soon" + Notify Me
// gate preserved in git history and will be restored on "revert".
// Shows the two live collections (Classics + S/S 26) linking through
// to /collections/[slug] which pulls products live from Shopify.
import Image from "next/image";
import Link from "next/link";

const collections = [
  {
    slug: "classics",
    label: "CLASSICS",
    description: "The permanent archive. Foundational silhouettes built to last.",
    image: "/bomber_final_studio.jpg",
  },
  {
    slug: "ss26",
    label: "S/S 26",
    description: "Spring / Summer 2026. The new season.",
    image: "/hoodie_front_v16.png",
  },
];

export default function CollectionsIndex() {
  return (
    <div className="px-4 sm:px-10 pb-40">
      <div className="h-8 lg:h-0" />
      <div className="mb-20">
        <h1 className="text-[11px] uppercase font-bold tracking-[0.5em] opacity-40">
          Collections
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20 w-full">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={`/collections/${c.slug}`}
            className="group block space-y-8"
          >
            <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-12 border border-transparent group-hover:border-border transition-all duration-700">
              <Image
                src={c.image}
                alt={c.label}
                fill
                className="object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-1000 ease-out p-2"
                style={{ filter: "contrast(1.1) brightness(1.05)" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="space-y-3 text-[13px] tracking-[0.3em]">
              <p className="font-bold uppercase">{c.label}</p>
              <p className="opacity-50 text-[11px] uppercase tracking-[0.2em] leading-relaxed">
                {c.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
