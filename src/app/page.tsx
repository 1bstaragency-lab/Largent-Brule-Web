"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

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
      {/* Next Release Section */}
      <div className="mt-20 mb-14">
        <h2 className="text-[14px] uppercase font-bold tracking-[0.3em]">UPCOMING RELEASE</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 w-full items-center bg-[#f7f5f2] p-8 md:p-16 mb-40">
        <div className="aspect-[3/4] bg-white relative overflow-hidden flex items-center justify-center p-4">
          {/* Placeholder for new product image */}
          <div className="absolute inset-0 border-2 border-dashed border-neutral-300 flex items-center justify-center m-4">
            <p className="text-[10px] text-neutral-400 font-bold tracking-[0.2em] uppercase text-center px-4">
              [ Drop Next Product Image Here ]<br/><br/>
              (Upload image in chat)
            </p>
          </div>
        </div>
        
        <div className="space-y-10 max-w-md">
          <div className="space-y-4">
            <p className="font-bold text-[10px] uppercase tracking-[0.4em] opacity-50">L'ARGENT BRÛLÉ EXCLUSIVE</p>
            <h3 className="text-3xl font-bold uppercase tracking-[0.1em]">UNRELEASED SILHOUETTE</h3>
            <p className="text-[12px] opacity-70 tracking-[0.1em] leading-relaxed">
              Our next piece is currently in the final stages of production. Sign up to receive an SMS the moment the vault opens. Limited quantities will be available.
            </p>
          </div>

          <form 
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('phone') as HTMLInputElement;
              const btn = form.elements.namedItem('submitBtn') as HTMLButtonElement;
              
              if (!input.value) return;
              
              const originalText = btn.innerText;
              btn.innerText = "PROCESSING...";
              btn.disabled = true;

              try {
                const { error } = await supabase
                  .from('early_access')
                  .insert([{ phone_number: input.value }]);

                if (error && error.code !== '23505') {
                  alert(`ERROR: ${error.message}`);
                  btn.innerText = originalText;
                  btn.disabled = false;
                } else {
                  btn.innerText = "ADDED TO VIP LIST";
                  btn.classList.replace('bg-black', 'bg-green-800');
                  input.value = "";
                }
              } catch (err) {
                console.error(err);
                btn.innerText = originalText;
                btn.disabled = false;
              }
            }}
          >
            <input 
              type="tel" 
              name="phone"
              placeholder="ENTER PHONE NUMBER" 
              className="w-full h-[52px] bg-white text-black text-[11px] font-medium tracking-[0.2em] px-6 outline-none border border-neutral-200 focus:border-black transition-colors"
              required
            />
            <button 
              type="submit"
              name="submitBtn"
              className="w-full h-[52px] bg-black text-white text-[11px] font-bold tracking-[0.4em] uppercase hover:bg-neutral-800 transition-colors"
            >
              NOTIFY ME ON RELEASE
            </button>
          </form>
        </div>
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
