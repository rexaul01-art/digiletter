"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  ChevronRight, 
  Sparkles,
  Lock,
  Loader2,
  Calendar,
  Frown
} from "lucide-react";
import { DottedBackground } from "@/components/DottedBackground";
import { formatFriendlyDate } from "@/lib/utils";

interface ExperiencePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function ExperiencePage({ params }: ExperiencePageProps) {
  const { token } = use(params);
  
  // Page load states
  const [loading, setLoading] = useState(true);
  const [openingAction, setOpeningAction] = useState(false);
  const [giftData, setGiftData] = useState<any>(null);
  const [alreadyOpened, setAlreadyOpened] = useState(false);
  const [openedAtTime, setOpenedAtTime] = useState<Date | null>(null);

  // Receiver active states
  const [started, setStarted] = useState(false);
  const [sealBroken, setSealBroken] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Load basic gift preview data first (safe names)
  useEffect(() => {
    fetch(`/api/gifts/info?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGiftData({
            senderName: data.gift.senderName,
            receiverName: data.gift.receiverName,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // Audio synthesize cascade melody
  const playOpenMelody = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioCtx || new AudioContextClass();
      if (!audioCtx) setAudioCtx(ctx);

      // Cute warm music-box chord scale: G4, B4, D5, G5, B5, D6
      const frequencies = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "triangle"; // warm analog shape
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
        
        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + index * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + index * 0.12 + 0.7);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(ctx.currentTime + index * 0.12);
        osc.stop(ctx.currentTime + index * 0.12 + 0.75);
      });
    } catch (e) {
      console.error("Audio context play blocked or failed", e);
    }
  };

  // Confetti celebration bursts
  const triggerConfettiRain = () => {
    const end = Date.now() + 2 * 1000; // 2 seconds of confetti
    const colors = ["#FFC928", "#FF5A4E", "#A7F3D0", "#CDEBFF", "#E5DAFF"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Lock note and enter experience
  const handleOpenNote = async () => {
    setOpeningAction(true);
    try {
      const res = await fetch("/api/gifts/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setGiftData(data.gift);
        setStarted(true);
      } else if (data.alreadyOpened) {
        setAlreadyOpened(true);
        setOpenedAtTime(new Date(data.openedAt));
      } else {
        alert("Could not load experience. Try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setOpeningAction(false);
    }
  };

  const handleSealBreak = () => {
    setSealBroken(true);
    playOpenMelody();
  };

  const handleNextCard = () => {
    const nextIdx = currentCardIndex + 1;
    setCurrentCardIndex(nextIdx);
    
    // Play a single soft tone
    if (!isMuted && audioCtx) {
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    }

    if (nextIdx === 3) {
      triggerConfettiRain();
    }
  };

  if (loading) {
    return (
      <DottedBackground className="justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#171717]" />
          <p className="font-display font-bold text-lg text-[#171717]">Preparing letter envelope...</p>
        </div>
      </DottedBackground>
    );
  }

  // VIEW: Already Opened Screen
  if (alreadyOpened) {
    return (
      <DottedBackground className="justify-center items-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FCF8F2] border-thick rounded-[28px] p-8 max-w-md w-full shadow-offset text-center space-y-6"
        >
          <div className="w-16 h-16 bg-pastel-pink border-thick rounded-2xl flex items-center justify-center mx-auto shadow-offset-sm rotate-[-4deg]">
            <Frown className="w-8 h-8 text-[#171717]" strokeWidth={2} />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Note already read</h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              This digital letter was a view-once experience. The security seal was broken and it is now locked forever.
            </p>
          </div>

          <div className="p-4 border-thick bg-neutral-50 rounded-xl text-left space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#171717]">
              <Calendar className="w-3.5 h-3.5 text-neutral-600" />
              <span>Opened Timestamp</span>
            </div>
            <p className="text-xs font-mono text-neutral-600">
              {openedAtTime ? formatFriendlyDate(openedAtTime) : "Unknown time"}
            </p>
          </div>

          <div className="pt-2">
            <Link href="/" className="px-6 py-3 bg-[#171717] hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl transition-all shadow-offset-sm inline-block">
              Create your own note
            </Link>
          </div>
        </motion.div>
      </DottedBackground>
    );
  }

  // VIEW: Welcome Entry screen
  if (!started) {
    return (
      <DottedBackground className="justify-center items-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FCF8F2] border-thick rounded-[28px] p-8 max-w-md w-full shadow-offset text-center space-y-6"
        >
          <span className="font-handwritten text-accent-red text-3xl rotate-[-3deg] inline-block">Special Delivery!</span>
          
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">You have a HeartNote</h2>
            <p className="text-sm text-[#4A4A4A]">
              Sent with love by <strong className="text-[#171717]">{giftData?.senderName || "someone special"}</strong>.
            </p>
          </div>

          {/* Letter envelope mockup graphic */}
          <div className="w-48 h-32 bg-pastel-pink border-thick rounded-2xl mx-auto shadow-offset-sm relative flex items-center justify-center rotate-[1deg]">
            <div className="w-10 h-10 bg-accent-red border-2 border-[#171717] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="absolute inset-0 border-t border-[#171717] rotate-[15deg] origin-top-left" />
            <div className="absolute inset-0 border-t border-[#171717] -rotate-[15deg] origin-top-right" />
          </div>

          <div className="p-4 border-thick bg-pastel-pink rounded-xl text-left flex gap-2">
            <Lock className="w-5 h-5 text-accent-red shrink-0" />
            <p className="text-[10px] sm:text-xs text-[#171717]/85 font-medium leading-relaxed">
              This letter can only be opened <strong>once</strong>. Please ensure you are ready to read and enjoy the experience in full before entering.
            </p>
          </div>

          <button
            onClick={handleOpenNote}
            disabled={openingAction}
            className="w-full py-4 bg-primary text-[#171717] font-semibold text-lg rounded-2xl border-thick hover-tactile flex items-center justify-center gap-2 shadow-offset"
          >
            {openingAction ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Breaking seal...</span>
              </>
            ) : (
              <span>Open Note Letter</span>
            )}
          </button>
        </motion.div>
      </DottedBackground>
    );
  }

  // VIEW: Magical Presentation Screen
  return (
    <DottedBackground className="p-6 justify-center items-center">
      {/* Audio volume toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 p-3 border-thick bg-[#FCF8F2] hover:bg-neutral-50 rounded-xl transition-all shadow-offset-sm hover-tactile z-50"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-[#171717]" /> : <Volume2 className="w-5 h-5 text-[#171717]" />}
      </button>

      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[500px]">
        {!sealBroken ? (
          /* DIGITAL SEAL CARD */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[4/3] bg-pastel-pink border-thick rounded-3xl p-6 shadow-offset relative flex flex-col justify-between items-center cursor-pointer text-center group"
            onClick={handleSealBreak}
          >
            <div className="pt-4 font-display font-bold text-lg">
              To: {giftData?.receiverName}
            </div>

            {/* Floating breakable seal */}
            <motion.div 
              whileHover={{ scale: 1.08 }}
              className="w-16 h-16 bg-accent-red border-thick rounded-full flex items-center justify-center shadow-lg group-hover:bg-red-600 transition-colors z-20"
            >
              <Heart className="w-8 h-8 fill-[#FCF8F2] text-[#FCF8F2] animate-pulse" />
            </motion.div>

            <span className="font-handwritten text-accent-red text-2xl rotate-[-2deg] pb-4">
              Break seal to read
            </span>

            {/* Fold lines */}
            <div className="absolute inset-0 border-t-2 border-[#171717] rotate-[15deg] origin-top-left" />
            <div className="absolute inset-0 border-t-2 border-[#171717] -rotate-[15deg] origin-top-right" />
          </motion.div>
        ) : (
          /* MAGICAL LETTER INTERACTION */
          <div className="w-full flex flex-col justify-between min-h-[460px]">
            <AnimatePresence mode="wait">
              {currentCardIndex < 3 ? (
                /* MESSAGE CARD VIEW */
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0, y: 40, scale: 0.95, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: -45, scale: 0.95, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className={`w-full p-6 sm:p-8 border-thick rounded-[28px] shadow-offset aspect-[4/5] flex flex-col justify-between relative ${
                    currentCardIndex === 0 
                      ? "bg-pastel-pink" 
                      : currentCardIndex === 1 
                        ? "bg-pastel-lavender" 
                        : "bg-pastel-blue"
                  }`}
                >
                  <span className="font-handwritten text-sm opacity-80">
                    Card {currentCardIndex + 1} of 3
                  </span>

                  <p className="font-display text-lg sm:text-xl text-[#171717] leading-relaxed text-left font-normal select-none overflow-y-auto max-h-[220px] pr-2">
                    {currentCardIndex === 0 
                      ? giftData.message1 
                      : currentCardIndex === 1 
                        ? giftData.message2 
                        : giftData.message3
                    }
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-[#171717]/10">
                    <span className="font-handwritten text-accent-red text-2xl">With love ♡</span>
                    
                    <button 
                      onClick={handleNextCard}
                      className="px-5 py-2.5 bg-[#171717] text-[#FCF8F2] hover:bg-neutral-800 transition-colors font-bold text-sm rounded-xl border border-[#171717] flex items-center gap-1 shadow-offset-sm hover-tactile"
                    >
                      <span>Next Card</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* POLAROIDS SLIDESHOW & END CARD */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center space-y-8"
                >
                  <span className="font-handwritten text-accent-red text-4xl rotate-[-3deg] inline-block">
                    Together Forever
                  </span>

                  {/* Polaroids Display */}
                  <div className="relative w-full min-h-[240px] flex items-center justify-center">
                    {giftData.photos && giftData.photos.length > 0 ? (
                      giftData.photos.map((photo: string, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: 1, 
                            scale: 1,
                            rotate: i === 0 ? -8 : i === 1 ? 6 : -1,
                            x: i === 0 ? -60 : i === 1 ? 60 : 0,
                            y: i === 2 ? -15 : 0
                          }}
                          className="w-36 bg-white border-2 border-[#171717] p-3 shadow-offset absolute rounded-xl"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="" className="w-full aspect-square object-cover border border-[#171717]" />
                          <p className="font-handwritten text-center text-xs mt-3 text-black overflow-hidden whitespace-nowrap">
                            Memories
                          </p>
                        </motion.div>
                      ))
                    ) : (
                      /* Fallback Polaroid representation */
                      <motion.div
                        animate={{ rotate: [-3, 3, -3] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-36 bg-white border-2 border-[#171717] p-3 shadow-offset rounded-xl"
                      >
                        <div className="w-full aspect-square bg-pastel-pink border border-[#171717] flex items-center justify-center">
                          <Heart className="w-10 h-10 text-accent-red fill-accent-red" />
                        </div>
                        <p className="font-handwritten text-center text-xs mt-3 text-black">Love always</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="text-center space-y-4">
                    <p className="font-display font-bold text-lg">
                      Sincerely, {giftData.senderName}
                    </p>
                    <p className="text-xs text-[#4A4A4A]">
                      Created with care using HeartNote.
                    </p>
                    <Link href="/" className="px-6 py-2.5 border-thick bg-primary hover-tactile text-[#171717] font-semibold text-sm rounded-xl inline-block shadow-offset-sm">
                      Create Your Own Note
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DottedBackground>
  );
}
