"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { GooeyText } from "@/components/ui/gooey-text-morphing";
import { motion, AnimatePresence } from "framer-motion";

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
  },
  {
    id: "hoodie",
    name: "LEMONDROP HOODIE",
    price: "185 USD",
    image: "/hoodie_front_v15.png",
    tag: "NEW"
  },
  {
    id: "raglan",
    name: "RAGLAN L/S TEE",
    price: "87 USD",
    image: "/raglan_front_white_v2.png",
    tag: "NEW"
  }
];

const heroImages = [
  "/hero_final_lock_v10.jpg",
  "/hero_editorial_v11.jpg"
];

export default function Home() {
  const [heroIdx, setHeroIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroImages.length);
    }, 15000); // 15 seconds rotation
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-4 sm:p-10 pb-40 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] mb-20 overflow-hidden bg-[#050505] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroIdx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroImages[heroIdx]}
              alt="L'argent Brûlé Editorial"
              fill
              className="object-cover brightness-75"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none p-2">
          <GooeyText
            texts={["L'ARGENT", "BRÛLÉ"]}
            morphTime={2}
            cooldownTime={1}
            className="font-bold text-white text-4xl sm:text-6xl lg:text-9xl tracking-[0.2em] uppercase"
            textClassName="text-white text-center"
          />
        </div>
      </section>

      {/* CLASSICS Collection */}
      <div className="mb-14">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.3em]">CLASSICS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32 w-full mb-40">
        {[
          { id: "bomber", name: "CROPPED BOMBER JACKET", price: "310 USD", image: "/bomber_final_studio.jpg", tag: "NEW" },
          { id: "pants", name: "CARGO LEATHER PANTS", price: "240 USD", image: "/pants_leather_studio.png", tag: "NEW" },
        ].map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-8">
            <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-12 border border-transparent group-hover:border-border transition-all duration-700">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-contain mix-blend-multiply group-hover:scale-125 transition-transform duration-1000 ease-out p-2"
                style={{ filter: 'contrast(1.1) brightness(1.05)' }}
              />
            </div>
            <div className="space-y-3 text-[13px] tracking-[0.3em]">
              <p className="font-bold uppercase">{product.name}</p>
              <div className="flex items-center justify-between opacity-50">
                <p className="font-medium">{product.price}</p>
                <p className="font-bold text-[10px] uppercase border-l border-black/20 pl-4">{product.tag}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* S/S 26 Collection */}
      <div className="mb-14">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.3em]">S/S 26</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32 w-full">
        {[
          { id: "hoodie", name: "LEMONDROP HOODIE", price: "185 USD", image: "/hoodie_front_v15.png", tag: "NEW" },
          { id: "raglan", name: "RAGLAN L/S TEE", price: "87 USD", image: "/raglan_front_white_v2.png", tag: "NEW" },
        ].map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group block space-y-8">
            <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-12 border border-transparent group-hover:border-border transition-all duration-700">
              <Image 
                src={product.image} 
                alt={product.name} 
                fill 
                className="object-contain mix-blend-multiply group-hover:scale-125 transition-transform duration-1000 ease-out p-2"
                style={{ filter: 'contrast(1.1) brightness(1.05)' }}
              />
            </div>
            <div className="space-y-3 text-[13px] tracking-[0.3em]">
              <p className="font-bold uppercase">{product.name}</p>
              <div className="flex items-center justify-between opacity-50">
                <p className="font-medium">{product.price}</p>
                <p className="font-bold text-[10px] uppercase border-l border-black/20 pl-4">{product.tag}</p>
              </div>
            </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Community Section */}
      <div className="mt-40 mb-20">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.3em] mb-20">COMMUNITY</h2>

        <div className="relative w-full overflow-x-auto">
          <div className="flex gap-8 pb-8" style={{ width: 'max-content' }}>
            {[
              { src: "/community_1.jpg", rotate: "-3deg", y: "20px" },
              { src: "/community_2.jpg", rotate: "2deg",  y: "0px"  },
              { src: "/community_3.jpg", rotate: "-1.5deg", y: "30px" },
              { src: "/community_4.jpg", rotate: "3deg",  y: "10px"  },
              { src: "/community_5.png", rotate: "-2deg", y: "25px"  },
            ].map((p, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-white shadow-xl p-3 pb-10 transition-transform duration-500 hover:scale-105 hover:rotate-0 hover:z-10 cursor-pointer"
                style={{
                  transform: `rotate(${p.rotate}) translateY(${p.y})`,
                  width: '260px',
                  boxShadow: '0 8px 40px rgba(0,0,0,0.13)'
                }}
              >
                <div className="w-full aspect-[3/4] relative overflow-hidden bg-neutral-100">
                  <Image
                    src={p.src}
                    alt={`Community ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
