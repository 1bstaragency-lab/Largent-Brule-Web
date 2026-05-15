"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function Home() {

  return (
    <div className="p-4 sm:p-10 pb-40 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative w-full h-[90vh] mb-20 overflow-hidden bg-[#050505] flex items-center justify-center">
        <video
          src="/hero_video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-75"
        />
      </section>



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
