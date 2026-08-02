"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Heart, 
  ArrowRight, 
  Sparkles, 
  Lock, 
  Camera, 
  Layers, 
  CheckCircle,
  HelpCircle,
  ChevronDown
} from "lucide-react";
import { DottedBackground } from "@/components/DottedBackground";

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <DottedBackground>
      {/* Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary border-thick rounded-xl flex items-center justify-center shadow-offset-sm hover-tactile">
            <Heart className="w-5 h-5 fill-[#171717] text-[#171717]" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-[#171717]">
            Heart<span className="text-accent-red font-handwritten text-3xl align-middle ml-0.5">Note</span>
          </span>
        </Link>
        <Link 
          href="/create" 
          className="px-5 py-2.5 bg-[#171717] text-[#FCF8F2] font-semibold rounded-xl border-thick border-[#171717] hover:bg-[#FCF8F2] hover:text-[#171717] transition-colors duration-250 text-sm md:text-base shadow-offset-sm flex items-center gap-2 group"
        >
          <span>Create Note</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-10 pb-20 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Hero Left Content */}
        <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-pastel-pink border-thick rounded-full text-xs font-semibold uppercase tracking-wider text-[#171717]"
          >
            <Sparkles className="w-3.5 h-3.5 fill-[#171717]" />
            <span>Introducing Digital Heirlooms</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] text-[#171717]"
          >
            Give a gift that feels like a{" "}
            <span className="relative inline-block text-accent-red font-handwritten text-5xl sm:text-6xl lg:text-7xl px-2 rotate-[-2deg]">
              handwritten
            </span>{" "}
            letter.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-[#4A4A4A] max-w-xl font-normal leading-relaxed"
          >
            Create a premium, interactive digital letter for your loved ones. Combine warm custom messages, Polaroid photos, and a magical view-once opening experience. All for just <strong className="text-[#171717]">₹29</strong>.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="w-full sm:w-auto flex flex-col sm:flex-row gap-4 pt-4"
          >
            <Link 
              href="/create" 
              className="px-8 py-4 bg-primary text-[#171717] font-semibold text-lg rounded-2xl border-thick hover-tactile text-center shadow-offset flex items-center justify-center gap-2.5 group"
            >
              <span>Begin Your HeartNote</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a 
              href="#how-it-works" 
              className="px-8 py-4 bg-[#FCF8F2] text-[#171717] font-semibold text-lg rounded-2xl border-thick hover-tactile text-center shadow-offset-sm flex items-center justify-center gap-2"
            >
              <span>How it works</span>
            </a>
          </motion.div>
        </div>

        {/* Hero Right Graphic */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 flex justify-center items-center relative"
        >
          {/* Animated Graphic Mockup */}
          <div className="w-[310px] h-[480px] bg-[#FCF8F2] border-thick rounded-[40px] shadow-offset p-6 flex flex-col relative bg-radial-[circle_at_center,rgba(255,201,40,0.06),transparent_100%] overflow-hidden">
            {/* Phone notch */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#171717] rounded-full border border-[#171717]" />
            
            {/* Mini preview frame */}
            <div className="mt-8 flex-1 flex flex-col items-center justify-center space-y-6">
              {/* Floating Letter Envelope */}
              <motion.div 
                animate={{ 
                  y: [0, -12, 0],
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
                className="w-48 h-36 bg-pastel-pink border-thick rounded-2xl shadow-offset-sm relative flex items-center justify-center group cursor-pointer"
              >
                {/* Wax seal */}
                <div className="absolute w-10 h-10 bg-accent-red border-2 border-[#171717] rounded-full flex items-center justify-center shadow-sm z-10 transition-transform duration-300 hover:scale-110">
                  <Heart className="w-5 h-5 fill-[#FCF8F2] text-[#FCF8F2]" />
                </div>
              </motion.div>

              {/* Floating photo frame */}
              <motion.div 
                animate={{ 
                  y: [0, 8, 0],
                  rotate: [-3, 3, -3]
                }}
                transition={{ 
                  duration: 5, 
                  repeat: Infinity, 
                  ease: "easeInOut",
                  delay: 0.5
                }}
                className="w-32 bg-white border-thick p-2 shadow-offset-sm rotate-[-3deg]"
              >
                <div className="w-full aspect-square bg-pastel-blue border border-[#171717] flex items-center justify-center text-xs text-[#171717]">
                  <Camera className="w-6 h-6 opacity-60" />
                </div>
                <p className="font-handwritten text-center text-xs mt-2 text-[#171717]">Together ♡</p>
              </motion.div>
            </div>
            
            {/* Premium tag */}
            <div className="absolute bottom-4 left-6 right-6 py-2 bg-pastel-mint border-thick rounded-xl text-center text-xs font-semibold">
              ✨ Experience Live Recipient View
            </div>
          </div>
        </motion.div>
      </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full border-t-2 border-[#171717] py-20 bg-[#FCF8F2]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
              <span className="font-handwritten text-accent-red text-3xl">Handcrafted magic</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171717]">
                How HeartNote Works
              </h2>
              <p className="text-[#4A4A4A]">Creating an emotional, beautiful, and secure view-once gift is simple.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset hover-tactile flex flex-col space-y-4">
                <div className="w-12 h-12 bg-pastel-pink border-thick rounded-xl flex items-center justify-center font-display font-bold text-lg">
                  1
                </div>
                <h3 className="font-display font-bold text-xl">Customize Details</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Choose your language (English or Hinglish), recipient relationship, and write up to 3 custom text letters. Use our optional smart generator if you need help finding the words.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset hover-tactile flex flex-col space-y-4">
                <div className="w-12 h-12 bg-pastel-blue border-thick rounded-xl flex items-center justify-center font-display font-bold text-lg">
                  2
                </div>
                <h3 className="font-display font-bold text-xl">Attach Memories</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Upload up to 3 photographs. They will automatically be formatted into retro Polaroid frames with handwritten custom titles to give them an authentic tactile feel.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset hover-tactile flex flex-col space-y-4">
                <div className="w-12 h-12 bg-pastel-lavender border-thick rounded-xl flex items-center justify-center font-display font-bold text-lg">
                  3
                </div>
                <h3 className="font-display font-bold text-xl">Secure & Generate</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Interact with a watermarked live phone preview. If you love it, make a single secure checkout payment of ₹29 to lock the letter and get a cryptographic view-once link.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset hover-tactile flex flex-col space-y-4">
                <div className="w-12 h-12 bg-pastel-mint border-thick rounded-xl flex items-center justify-center font-display font-bold text-lg">
                  4
                </div>
                <h3 className="font-display font-bold text-xl">Magical Reveal</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Send the link. When opened, the envelope breaks, custom animations slide your letters into view, polaroids rotate, and confetti rains down to make it unforgettable.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full border-t-2 border-[#171717] py-20 bg-radial-[circle_at_center,rgba(167,243,208,0.06),transparent_100%]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
              <span className="font-handwritten text-accent-red text-3xl">Crafted to perfection</span>
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                Designed for Emotional Impact
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-[#FCF8F2] border-thick rounded-2xl p-8 shadow-offset-sm relative overflow-hidden">
                <div className="w-12 h-12 bg-primary border-thick rounded-xl flex items-center justify-center mb-6">
                  <Lock className="w-6 h-6 text-[#171717]" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">One-Time View Security</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Just like physical mail, once opened, the seal is broken. The page locks down permanently after opening, making the viewing experience a singular, undivided moment of attention.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-[#FCF8F2] border-thick rounded-2xl p-8 shadow-offset-sm relative overflow-hidden">
                <div className="w-12 h-12 bg-pastel-pink border-thick rounded-xl flex items-center justify-center mb-6">
                  <Camera className="w-6 h-6 text-[#171717]" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">Tactile Polaroid Frames</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Your photos are converted into vintage polaroid layouts. They tilt dynamically on user scroll and load with smooth fades to replicate looking at photos on a desk.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-[#FCF8F2] border-thick rounded-2xl p-8 shadow-offset-sm relative overflow-hidden">
                <div className="w-12 h-12 bg-pastel-blue border-thick rounded-xl flex items-center justify-center mb-6">
                  <Layers className="w-6 h-6 text-[#171717]" strokeWidth={2} />
                </div>
                <h3 className="font-display font-bold text-xl mb-3">Editorial Aesthetics</h3>
                <p className="text-sm text-[#4A4A4A] leading-relaxed">
                  Built on a beautiful grid with classic serifs, rounded corners, soft pastel cues, and a dotted background. No generic templates, zero flashing banners, and zero ads.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="w-full border-t-2 border-[#171717] py-20 bg-[#FCF8F2]">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">
              Loved by Gift Givers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset-sm rotate-[-1deg]">
                <p className="text-base italic text-[#4A4A4A] mb-6">
                  &ldquo;I sent this to my boyfriend for our anniversary. The look on his face when he clicked to break the wax seal and the confetti popped was priceless. Best 29 rupees I ever spent.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pastel-pink border-thick rounded-full flex items-center justify-center font-bold text-xs">
                    KA
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Kavya A.</h4>
                    <p className="text-xs text-[#4A4A4A]">Sent to Boyfriend</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset-sm rotate-[1.5deg]">
                <p className="text-base italic text-[#4A4A4A] mb-6">
                  &ldquo;Most digital greetings feel like cheap spam, but HeartNote feels incredibly premium. It loads like a beautiful designer document. My sister loved the Polaroids.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pastel-blue border-thick rounded-full flex items-center justify-center font-bold text-xs">
                    RD
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Rohan D.</h4>
                    <p className="text-xs text-[#4A4A4A]">Sent to Sister</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#FCF8F2] border-thick p-6 rounded-2xl shadow-offset-sm rotate-[-1deg]">
                <p className="text-base italic text-[#4A4A4A] mb-6">
                  &ldquo;The AI prompt generation helped me write a beautiful message for my dad's birthday when I couldn't find the words. The layout is beautiful.&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pastel-mint border-thick rounded-full flex items-center justify-center font-bold text-xs">
                    SS
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Siddharth S.</h4>
                    <p className="text-xs text-[#4A4A4A]">Sent to Father</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full border-t-2 border-[#171717] py-20 bg-[#FCF8F2] flex-1">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-center mb-12">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {[
                {
                  q: "Why is it a one-time view experience?",
                  a: "To preserve the feeling of anticipation. Just like a real, hand-sealed physical envelope, opening a HeartNote is a unique event. Once opened, it cannot be read again by anyone, which makes the recipient pay close attention and cherish the moment."
                },
                {
                  q: "Can I preview my HeartNote before paying?",
                  a: "Yes! We build a live, fully-interactive preview mockup inside an animated phone frame. You can experience the exact card reveals, see your polaroid uploads, and test the animations before committing."
                },
                {
                  q: "What payment methods are supported?",
                  a: "We support all major payment options, including UPI (Google Pay, PhonePe, Paytm), Netbanking, and Credit/Debit Cards via our secure payment gateway partner, Razorpay."
                },
                {
                  q: "How long does the link stay active if unopened?",
                  a: "Unopened letters will remain securely saved in our database for up to 90 days. Once opened, the one-time lock is immediately triggered."
                }
              ].map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#FCF8F2] border-thick rounded-2xl overflow-hidden shadow-offset-sm transition-all"
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-5 text-left font-display font-bold text-lg flex justify-between items-center bg-[#FCF8F2] hover:bg-neutral-50 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${activeFaq === index ? "rotate-180" : ""}`} />
                  </button>
                  {activeFaq === index && (
                    <div className="px-6 pb-6 pt-1 border-t border-[#171717]/10 text-sm text-[#4A4A4A] leading-relaxed">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full border-t-2 border-[#171717] bg-[#FCF8F2] py-8 z-10">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#4A4A4A]">
            <div className="flex items-center gap-1.5 font-display font-semibold text-[#171717]">
              <span>HeartNote</span>
              <span className="font-handwritten text-accent-red text-xl">© 2026</span>
            </div>
            <div>
              Handcrafted in India by @rexaul__09 with ❤️
            </div>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer">Terms</span>
              <span className="hover:underline cursor-pointer">Privacy</span>
            </div>
          </div>
        </footer>
    </DottedBackground>
  );
}
