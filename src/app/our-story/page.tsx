"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/sidebar";
import { MobileNavbar } from "@/components/mobile-navbar";

const storyContent = [
  {
    title: "THE ARCHIVAL STUDY",
    text: "L'ARGENT BRÛLÉ IS AN ARCHIVAL STUDY OF FORM, FUNCTION, AND THE TRANSIENCE OF MATERIALITY. FOUNDED ON THE PRINCIPLES OF CLINICAL MINIMALISM AND TECHNICAL PRECISION, EACH GARMENT IS A TESTAMENT TO THE ARCHIVAL PROCESS—A FUSION OF HISTORICAL SILHOUETTES AND FUTURISTIC TEXTILES.",
    image: "/archive/factory_1.png"
  },
  {
    title: "TECHNICAL PRECISION",
    text: "WE DO NOT DESIGN; WE DOCUMENT. THE COLLECTION IS A CURATED SELECTION OF TECHNICAL ARTIFACTS, PRODUCED IN LIMITED ARCHIVAL RUNS FOR THE DISCERNING COLLECTOR. EVERY STITCH IS CALCULATED, EVERY SEAM IS SURGICAL.",
    image: "/archive/factory_2.png"
  },
  {
    title: "THE FACTORY FOUNDATION",
    text: "OUR PRODUCTION IS CENTERED ON ABSOLUTE QUALITY. BY BRIDGING THE GAP BETWEEN TRADITIONAL CRAFTSMANSHIP AND ADVANCED TEXTILE ENGINEERING, WE CREATE GARMENTS THAT TRANSCEND SEASONALITY. THIS IS THE ARCHIVE.",
    image: "/archive/factory_3.png"
  }
];

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-20 py-24 space-y-32">
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h1 className="text-[24px] font-bold tracking-[0.6em] uppercase text-black text-center lg:text-left">
              OUR STORY
            </h1>
            <div className="h-[1px] w-20 bg-black mx-auto lg:mx-0" />
          </motion.div>

          {/* Story Sections */}
          {storyContent.map((section, idx) => (
            <motion.section 
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className={`flex flex-col ${idx % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 lg:gap-20 items-center`}
            >
              <div className="flex-1 space-y-6">
                <h2 className="text-[14px] font-bold tracking-[0.4em] uppercase text-black">
                  {section.title}
                </h2>
                <p className="text-[12px] font-medium tracking-[0.1em] leading-relaxed text-neutral-400 uppercase">
                  {section.text}
                </p>
              </div>
              <div className="flex-1 relative aspect-[4/5] w-full bg-neutral-50 overflow-hidden">
                <Image 
                  src={section.image} 
                  alt={section.title} 
                  fill 
                  className="object-cover grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </div>
            </motion.section>
          ))}

          {/* Verification Signature */}
          {/* Verification Signature */}
          <div className="pt-24 pb-12 text-center">
            <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">
              L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | FLAGSHIP V7.8
            </p>
          </div>
        </div>
    </div>
  );
}
