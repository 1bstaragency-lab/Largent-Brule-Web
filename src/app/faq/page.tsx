"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const faqData = [
  {
    question: "WHERE IS L'ARGENT BRÛLÉ DESIGNED?",
    answer: "L'ARGENT BRÛLÉ IS SKETCHED AND CONCEPTUALIZED IN PARIS, DRAWING FROM THE CITY'S ARCHIVAL DESIGN HERITAGE AND CLINICAL MINIMALIST TRADITIONS."
  },
  {
    question: "WHERE ARE THE GARMENTS MANUFACTURED?",
    answer: "EACH PIECE IS SURGICALLY MANUFACTURED IN LOS ANGELES, ENSURING ABSOLUTE TECHNICAL PRECISION AND CRAFTSMANSHIP IN EVERY ARCHIVAL RUN."
  },
  {
    question: "WHAT MATERIALS ARE USED?",
    answer: "WE USE HAND-PICKED, HIGH-END TECHNICAL TEXTILES SOURCED GLOBALLY. OUR FABRICS ARE SELECTED FOR THEIR PERFORMANCE IN THE VOLATILE ERA."
  },
  {
    question: "WHAT IS THE ARCHIVAL PHILOSOPHY?",
    answer: "OUR GARMENTS ARE ARCHIVAL STUDIES OF FORM AND FUNCTION. WE DO NOT DESIGN; WE DOCUMENT. EACH PIECE IS A TECHNICAL ARTIFACT FOR THE DISCERNING COLLECTOR."
  },
  {
    question: "SHIPPING & ARCHIVAL DELIVERY",
    answer: "WE OFFER WHITE GLOVE SHIPPING GLOBALLY. EACH GARMENT IS PACKED WITH CARE AND DELIVERED IN ARCHIVAL PACKAGING WITHIN 10-14 DAYS."
  }
];

export default function FAQPage() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-4xl mx-auto px-6 lg:px-20 py-32 space-y-20">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="space-y-8"
        >
          <h1 className="text-[24px] font-bold tracking-[0.6em] uppercase text-black text-center lg:text-left">
            FAQ
          </h1>
          <div className="h-[1px] w-20 bg-black mx-auto lg:mx-0" />
        </motion.div>

        {/* FAQ List */}
        <div className="space-y-2">
          {faqData.map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="border-b border-neutral-100"
            >
              <button
                onClick={() => setActiveIdx(activeIdx === idx ? null : idx)}
                className="w-full py-10 flex justify-between items-center text-[12px] font-bold uppercase tracking-[0.4em] text-black text-left hover:opacity-50 transition-all"
              >
                {item.question}
                <Plus 
                  size={16} 
                  strokeWidth={1} 
                  className={cn("transition-transform duration-500", activeIdx === idx && "rotate-45")} 
                />
              </button>
              <div className={cn(
                "overflow-hidden transition-all duration-700 ease-in-out",
                activeIdx === idx ? "max-h-[300px] pb-10" : "max-h-0"
              )}>
                <p className="text-[11px] font-medium tracking-[0.1em] leading-relaxed text-neutral-400 uppercase max-w-2xl">
                  {item.answer}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Verification Signature */}
        <div className="pt-24 pb-12 text-center">
          <p className="text-[9px] text-neutral-300 uppercase tracking-[0.5em]">
            L&apos;ARGENT BRÛLÉ &copy; 2026 ARCHIVE | FLAGSHIP V7.8
          </p>
        </div>
      </main>
    </div>
  );
}
