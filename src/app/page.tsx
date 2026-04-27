import Image from "next/image";
import Link from "next/link";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

const products = [
  {
    id: "bomber",
    name: "CROPPED BOMBER JACKET",
    price: "310 USD",
    image: "/bomber_final_studio.jpg",
    tag: "NEW"
  },
  {
    id: "pants",
    name: "CARGO LEATHER PANTS",
    price: "240 USD",
    image: "/pants_leather_studio.png",
    tag: "NEW"
  }
];

export default function Home() {
  return (
    <div className="p-10 pb-40">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] mb-20 overflow-hidden bg-black flex items-center justify-center">
        <Image
          src="/hero_final_lock_v10.jpg"
          alt="L'argent Brûlé Editorial"
          fill
          className="object-cover brightness-90"
          priority
        />
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <GooeyText 
            texts={["L'ARGENT", "BRÛLÉ"]} 
            morphTime={2}
            cooldownTime={1}
            className="font-bold text-white text-8xl md:text-9xl tracking-[0.2em] uppercase"
            textClassName="text-white text-center"
          />
        </div>
      </section>

      {/* Section Header */}
      <div className="mb-14">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.3em]">NEW</h2>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-10 max-w-[1000px]">
        {products.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-5">
            <div className="aspect-[1/1.35] bg-white relative overflow-hidden flex items-center justify-center p-10 border border-transparent group-hover:border-border transition-colors">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="space-y-2 text-[11px] tracking-wide">
              <p className="font-bold uppercase">{product.name}</p>
              <p className="font-medium">{product.price}</p>
              <p className="font-bold text-[10px] opacity-60 uppercase">{product.tag}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
