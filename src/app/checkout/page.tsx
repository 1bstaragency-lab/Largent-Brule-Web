"use client"

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle2, CreditCard, Lock } from "lucide-react";
import { useCart } from "@/components/cart-drawer";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBillingSame, setIsBillingSame] = useState(true);
  const [step, setStep] = useState(1); 
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((acc, item) => {
    const price = parseInt(item.price.replace(/[^0-9]/g, ""));
    return acc + price;
  }, 0);
  const shipping = 0;
  const total = subtotal + shipping;

  const handleComplete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      setStep(3);
    }, 2000);
  };

  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-white z-[4000] flex flex-col items-center justify-center p-10 text-center space-y-24">
        <div className="animate-[fade-in_0.3s_ease-out_forwards] opacity-0">
          <CheckCircle2 size={40} strokeWidth={1} className="text-[#4a0404]" />
        </div>
        <div className="animate-[fade-in_1s_ease-out_forwards] opacity-0 delay-300 fill-mode-both">
          <h1 className="text-[16px] font-bold tracking-[0.6em] uppercase text-black">THANKS FOR YOUR PURCHASE</h1>
        </div>
        <Link href="/" className="text-[10px] uppercase font-bold tracking-[0.4em] opacity-20 hover:opacity-100 transition-opacity">
          RETURN TO COLLECTIONS
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10 text-center space-y-6">
        <h1 className="text-[14px] uppercase font-bold tracking-[0.4em]">YOUR BAG IS EMPTY</h1>
        <Link href="/" className="pt-10 text-[10px] uppercase font-bold tracking-widest underline underline-offset-8">
          RETURN TO COLLECTIONS
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Left Side: Information & Payment */}
      <div className="flex-1 p-10 lg:p-20 border-r border-border">
        <div className="max-w-xl mx-auto space-y-12">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-40">
            <span>BAG</span>
            <ChevronRight size={10} />
            <span className={step === 1 ? "text-black" : ""}>SHIPPING</span>
            <ChevronRight size={10} />
            <span className={step === 2 ? "text-black" : ""}>PAYMENT</span>
          </nav>

          {step === 1 ? (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="space-y-6">
                <h2 className="text-[12px] font-bold uppercase tracking-widest">CONTACT INFORMATION</h2>
                <input 
                  type="email" 
                  placeholder="EMAIL ADDRESS" 
                  className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent"
                />
              </section>

              <section className="space-y-6">
                <h2 className="text-[12px] font-bold uppercase tracking-widest">SHIPPING ADDRESS</h2>
                <div className="grid grid-cols-2 gap-6">
                  <input placeholder="FIRST NAME" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                  <input placeholder="LAST NAME" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                </div>
                <input placeholder="ADDRESS" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                <div className="grid grid-cols-3 gap-6">
                  <input placeholder="CITY" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                  <input placeholder="STATE" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                  <input placeholder="ZIP" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                </div>
              </section>

              {/* CAFE LARGENT BRULE Subscription */}
              <section className="bg-[#fafafa] p-5 space-y-4 border-[0.5px] border-black/10">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.3em]">CAFE L&apos;ARGENT BRÛLÉ</h3>
                    <div className="flex items-center gap-2">
                      <p className="text-[8px] uppercase tracking-[0.2em] opacity-40 font-medium">MEMBERSHIP SELECTION</p>
                      <span className="text-[7px] bg-black text-white px-1.5 py-0.5 font-bold tracking-widest">1ST DROP COMPLIMENTARY</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsSubscribed(!isSubscribed)}
                    className={`w-10 h-5 rounded-full relative transition-all duration-500 ${isSubscribed ? 'bg-black' : 'bg-neutral-200'}`}
                  >
                    <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-500 ${isSubscribed ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-x-8 gap-y-2 pt-2 border-t border-black/5">
                  {["15M EARLY ACCESS", "ARCHIVAL GIFTS", "PRIVATE RSVP"].map((perk, i) => (
                    <div key={i} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.2em]">
                      <div className={`w-1 h-1 rounded-full ${isSubscribed ? 'bg-black' : 'bg-neutral-300'}`} />
                      <span className={isSubscribed ? 'opacity-100' : 'opacity-40'}>{perk}</span>
                    </div>
                  ))}
                </div>
              </section>

              <button 
                onClick={() => setStep(2)}
                className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-900 transition-colors"
              >
                CONTINUE TO PAYMENT
              </button>
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <section className="space-y-6">
                <h2 className="text-[12px] font-bold uppercase tracking-widest">PAYMENT METHOD</h2>
                <div className="border border-border p-8 space-y-8 bg-[#fafafa]">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <div className="flex items-center gap-3">
                      <CreditCard size={18} />
                      <span className="text-[11px] font-bold tracking-widest uppercase">CREDIT CARD</span>
                    </div>
                    <div className="flex gap-2 grayscale opacity-50">
                      <span className="text-[10px] border px-1 border-border">VISA</span>
                      <span className="text-[10px] border px-1 border-border">MC</span>
                      <span className="text-[10px] border px-1 border-border">AMEX</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <input placeholder="CARD NUMBER" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                    <input placeholder="NAME ON CARD" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                    <div className="grid grid-cols-2 gap-6">
                      <input placeholder="EXPIRATION (MM/YY)" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                      <input placeholder="SECURITY CODE" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[9px] text-neutral-400 uppercase tracking-widest pt-4">
                    <Lock size={12} />
                    <span>SECURE ENCRYPTED TRANSACTION</span>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h2 className="text-[12px] font-bold uppercase tracking-widest">BILLING ADDRESS</h2>
                <div className="flex items-center gap-3 p-4 border border-border bg-white">
                  <button 
                    onClick={() => setIsBillingSame(!isBillingSame)}
                    className={`w-4 h-4 border border-black flex items-center justify-center transition-colors ${isBillingSame ? 'bg-black text-white' : 'bg-white'}`}
                  >
                    {isBillingSame && <div className="w-2 h-2 bg-white" />}
                  </button>
                  <span className="text-[10px] font-bold uppercase tracking-widest">SAME AS SHIPPING ADDRESS</span>
                </div>
                
                {!isBillingSame && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="grid grid-cols-2 gap-6">
                      <input placeholder="FIRST NAME" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                      <input placeholder="LAST NAME" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                    </div>
                    <input placeholder="ADDRESS" className="w-full border-b border-border py-4 text-[11px] uppercase tracking-widest outline-none focus:border-black transition-colors bg-transparent" />
                  </div>
                )}
              </section>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setStep(3)}
                  className="w-full h-14 bg-black text-white text-[11px] font-bold uppercase tracking-[0.3em] hover:bg-neutral-900 transition-colors"
                >
                  COMPLETE PURCHASE
                </button>
                <button 
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity"
                >
                  RETURN TO SHIPPING
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side: Order Summary */}
      <div className="lg:w-[450px] bg-[#f6f6f6] p-10 lg:p-20 space-y-12 h-screen sticky top-0 overflow-y-auto">
        <h2 className="text-[12px] font-bold uppercase tracking-widest">ORDER SUMMARY</h2>
        
        <div className="space-y-8">
          {items.map((item, i) => (
            <div key={i} className="flex gap-6 animate-in slide-in-from-right duration-500">
              <div className="w-24 h-32 bg-white relative border border-border">
                <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest">{item.name}</p>
                <p className="text-[9px] opacity-60 uppercase tracking-widest">SIZE: M / COLOR: BLACK</p>
                <p className="text-[10px] font-bold uppercase tracking-widest pt-2">{item.price}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-8 border-t border-border">
          <div className="flex justify-between text-[10px] uppercase tracking-widest">
            <span>SUBTOTAL</span>
            <span>{subtotal} USD</span>
          </div>
          <div className="flex justify-between text-[10px] uppercase tracking-widest">
            <span>SHIPPING</span>
            <span className="text-green-600">COMPLIMENTARY</span>
          </div>
          <div className="flex justify-between text-[12px] font-bold uppercase tracking-[0.2em] pt-4">
            <span>TOTAL</span>
            <span>{total} USD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
