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
  Unlock,
  Loader2,
  Calendar,
  Frown,
  HelpCircle,
  XCircle,
  HelpCircle as QuestionIcon
} from "lucide-react";
import { DottedBackground } from "@/components/DottedBackground";
import { ScratchCard } from "@/components/ScratchCard";
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

  // States for receiver game phases
  const [started, setStarted] = useState(false);
  const [riddleUnlocked, setRiddleUnlocked] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [sealBroken, setSealBroken] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [cardsScratched, setCardsScratched] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false
  });
  
  // Polaroid flip state
  const [polaroidsFlipped, setPolaroidsFlipped] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false
  });

  // Riddle Lock states
  const [typedAnswer, setTypedAnswer] = useState("");
  const [wrongAnswerError, setWrongAnswerError] = useState(false);
  const [wrongAnswerMsg, setWrongAnswerMsg] = useState("");

  const [isMuted, setIsMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Load basic gift preview data first (metadata)
  useEffect(() => {
    fetch(`/api/gifts/info?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGiftData(data.gift);
          // If no riddle is configured, pre-set riddleUnlocked to true
          if (!data.gift.unlockQuestion || data.gift.unlockQuestion.trim() === "") {
            setRiddleUnlocked(true);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  // Audio synthesizer cascade melody on envelope opening
  const playOpenMelody = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioCtx || new AudioContextClass();
      if (!audioCtx) setAudioCtx(ctx);

      // Music-box scale: G4, B4, D5, G5, B5, D6
      const frequencies = [392.00, 493.88, 587.33, 783.99, 987.77, 1174.66];
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "triangle";
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
      console.error("Audio block", e);
    }
  };

  // Soft click chime for UI interactions
  const playFlipTone = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioCtx || new AudioContextClass();
      if (!audioCtx) setAudioCtx(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {}
  };

  // Confetti celebration bursts
  const triggerConfettiRain = () => {
    const end = Date.now() + 2.5 * 1000;
    const colors = ["#FFC928", "#FF5A4E", "#A7F3D0", "#CDEBFF", "#E5DAFF"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Unlock and fetch envelope data by solving riddle lock
  const handleRiddleUnlock = async () => {
    setWrongAnswerError(false);
    setWrongAnswerMsg("");
    setOpeningAction(true);

    try {
      const res = await fetch("/api/gifts/open", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, unlockAnswer: typedAnswer }),
      });
      
      const data = await res.json();

      if (res.ok && data.success) {
        setGiftData(data.gift);
        setRiddleUnlocked(true);
        // Play success tone
        if (!isMuted) {
          try {
            const ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
            if (!audioCtx) setAudioCtx(ctx);
            const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
            notes.forEach((freq, idx) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.frequency.value = freq;
              gain.gain.setValueAtTime(0.04, ctx.currentTime + idx * 0.1);
              gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + idx * 0.1 + 0.3);
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(ctx.currentTime + idx * 0.1);
              osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
            });
          } catch (e) {}
        }
      } else if (data.wrongAnswer) {
        setWrongAnswerError(true);
        setWrongAnswerMsg("Incorrect answer! Try again, love.");
      } else if (data.alreadyOpened) {
        setAlreadyOpened(true);
        setOpenedAtTime(new Date(data.openedAt));
      } else {
        setWrongAnswerMsg("Could not verify. Please check network.");
      }
    } catch (err) {
      console.error(err);
      setWrongAnswerMsg("Network error.");
    } finally {
      setOpeningAction(false);
    }
  };

  // Lock and fetch if no riddle is configured, triggered when enter experience
  const handleOpenStandardNote = async () => {
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
        alert("Error loading envelope.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setOpeningAction(false);
    }
  };

  // Heart Slider completion handler
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setSliderValue(val);

    if (val === 100 && !sealBroken) {
      setSealBroken(true);
      playOpenMelody();
    }
  };

  const handleScratchComplete = (index: number) => {
    setCardsScratched(prev => ({ ...prev, [index]: true }));
    playFlipTone();
  };

  const flipPolaroid = (index: number) => {
    setPolaroidsFlipped(prev => ({ ...prev, [index]: !prev[index] }));
    playFlipTone();

    // Check if this was the last polaroid flipped, if so celebrate!
    const updated = { ...polaroidsFlipped, [index]: true };
    if (updated[0] && updated[1] && updated[2]) {
      setTimeout(triggerConfettiRain, 400);
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

  // VIEW 1: Riddle Padlock keypad lock screen (Runs first if custom question is present)
  if (!riddleUnlocked) {
    return (
      <DottedBackground className="justify-center items-center p-6">
        <motion.div
          animate={wrongAnswerError ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-[#FCF8F2] border-thick rounded-[28px] p-6 sm:p-8 max-w-md w-full shadow-offset text-center space-y-6 relative overflow-hidden"
        >
          {/* Padlock status header */}
          <div className="space-y-2">
            <div className="w-16 h-16 bg-pastel-lavender border-thick rounded-2xl flex items-center justify-center mx-auto shadow-offset-sm rotate-[-3deg] relative">
              <Lock className="w-7 h-7 text-[#171717] animate-pulse" />
            </div>
            <h2 className="font-display font-bold text-2xl">Envelope is Locked</h2>
            <p className="text-xs text-neutral-600">
              Sent with love by <strong className="text-[#171717]">{giftData?.senderName || "someone special"}</strong>. Answer the riddle below to unlock.
            </p>
          </div>

          {/* Riddle Card */}
          <div className="p-5 border-thick bg-pastel-pink rounded-2xl shadow-offset-sm text-left space-y-3 relative">
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-accent-red">
              <QuestionIcon className="w-3.5 h-3.5 fill-accent-red text-white" />
              <span>Unlock Secret Question</span>
            </div>
            <p className="font-display text-sm md:text-base leading-relaxed text-[#171717] font-semibold">
              &ldquo;{giftData?.unlockQuestion}&rdquo;
            </p>
          </div>

          {/* User input keypad box */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Your Answer</label>
              <input
                type="text"
                value={typedAnswer}
                onChange={(e) => {
                  setTypedAnswer(e.target.value);
                  setWrongAnswerError(false);
                  setWrongAnswerMsg("");
                }}
                placeholder="Enter secret answer..."
                className="w-full p-4 border-thick rounded-xl bg-white focus:outline-none focus:shadow-offset text-sm font-semibold transition-all"
              />
            </div>

            {wrongAnswerMsg && (
              <div className="text-xs font-semibold text-accent-red text-center flex items-center justify-center gap-1.5">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{wrongAnswerMsg}</span>
              </div>
            )}

            <button
              onClick={handleRiddleUnlock}
              disabled={openingAction || !typedAnswer.trim()}
              className={`w-full py-4 bg-primary text-[#171717] font-semibold text-base rounded-2xl border-thick hover-tactile flex items-center justify-center gap-2 shadow-offset ${
                !typedAnswer.trim() ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {openingAction ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Answer...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  <span>Unlock Envelope</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </DottedBackground>
    );
  }

  // VIEW 2: Standard Welcome card (Pre-slider setup if riddle unlocked but not entered yet)
  if (!started) {
    return (
      <DottedBackground className="justify-center items-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#FCF8F2] border-thick rounded-[28px] p-8 max-w-md w-full shadow-offset text-center space-y-6"
        >
          <span className="font-handwritten text-accent-red text-3xl rotate-[-3deg] inline-block">Security Cleared!</span>
          
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Unlock Wax Seal</h2>
            <p className="text-sm text-[#4A4A4A]">
              Riddle solved successfully. Prepare to break the envelope seal.
            </p>
          </div>

          <div className="w-48 h-32 bg-pastel-pink border-thick rounded-2xl mx-auto shadow-offset-sm relative flex items-center justify-center">
            <div className="w-10 h-10 bg-accent-red border-2 border-[#171717] rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <div className="absolute inset-0 border-t border-[#171717] rotate-[15deg] origin-top-left" />
            <div className="absolute inset-0 border-t border-[#171717] -rotate-[15deg] origin-top-right" />
          </div>

          <div className="p-4 border-thick bg-pastel-pink rounded-xl text-left flex gap-2">
            <Lock className="w-5 h-5 text-accent-red shrink-0" />
            <p className="text-[10px] sm:text-xs text-[#171717]/85 font-medium leading-relaxed">
              This is a view-once experience. By proceeding, the seal will be officially broken and the letter will lock permanently.
            </p>
          </div>

          <button
            onClick={handleOpenStandardNote}
            disabled={openingAction}
            className="w-full py-4 bg-primary text-[#171717] font-semibold text-lg rounded-2xl border-thick hover-tactile flex items-center justify-center gap-2 shadow-offset"
          >
            {openingAction ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <span>Enter Experience</span>
            )}
          </button>
        </motion.div>
      </DottedBackground>
    );
  }

  // VIEW 3: Magical Interactive Presentation Screen
  return (
    <DottedBackground className="p-6 justify-center items-center">
      {/* Audio volume control */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 p-3 border-thick bg-[#FCF8F2] hover:bg-neutral-50 rounded-xl transition-all shadow-offset-sm hover-tactile z-50 animate-pulse"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-[#171717]" /> : <Volume2 className="w-5 h-5 text-[#171717]" />}
      </button>

      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[500px]">
        
        {/* GAME PHASE 1: HEART FUSION SLIDER */}
        {!sealBroken ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[4/3] bg-pastel-pink border-thick rounded-3xl p-6 shadow-offset relative flex flex-col justify-between items-center text-center overflow-hidden"
          >
            <div className="pt-2 font-display font-bold text-lg">
              To: {giftData?.receiverName}
            </div>

            {/* Split wax seal in center */}
            <div className="relative w-full h-24 flex items-center justify-center">
              {/* Left Half Heart */}
              <motion.div 
                style={{ 
                  x: -30 + (sliderValue * 0.3)
                }}
                className="w-12 h-16 bg-accent-red border-thick border-r-0 rounded-l-full flex items-center justify-end pr-0.5 shadow-md z-20"
              >
                <div className="w-2.5 h-2.5 bg-white rounded-full opacity-60 mr-2 mb-4" />
              </motion.div>
              
              {/* Right Half Heart */}
              <motion.div 
                style={{ 
                  x: 30 - (sliderValue * 0.3)
                }}
                className="w-12 h-16 bg-accent-red border-thick border-l-0 rounded-r-full flex items-center justify-start pl-0.5 shadow-md z-20"
              />
            </div>

            {/* Brass Slider Drag container */}
            <div className="w-full space-y-2 pb-2 z-30">
              <span className="font-handwritten text-accent-red text-2xl rotate-[-2deg] block">
                Slide to fuse heart seal
              </span>
              <input 
                type="range"
                min="0"
                max="100"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full h-8 bg-white border-thick rounded-full cursor-pointer accent-[#FFC928] outline-none"
              />
              <div className="flex justify-between text-[9px] font-bold text-[#171717]/60 uppercase tracking-wide px-1">
                <span>Split Seal</span>
                <span>Complete Seal (100)</span>
              </div>
            </div>

            {/* Fold lines decoration */}
            <div className="absolute inset-0 border-t-2 border-[#171717] rotate-[15deg] origin-top-left pointer-events-none" />
            <div className="absolute inset-0 border-t-2 border-[#171717] -rotate-[15deg] origin-top-right pointer-events-none" />
          </motion.div>
        ) : (
          
          /* GAME PHASE 2: SCRATCH OFF MESSAGE CARDS */
          <div className="w-full flex flex-col justify-between min-h-[460px]">
            <AnimatePresence mode="wait">
              {currentCardIndex < 3 ? (
                <motion.div
                  key={currentCardIndex}
                  initial={{ opacity: 0, y: 40, scale: 0.95, rotate: -1 }}
                  animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, y: -45, scale: 0.95, rotate: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className="w-full border-thick rounded-[28px] shadow-offset aspect-[4/5] overflow-hidden"
                >
                  <ScratchCard 
                    width={410} 
                    height={460} 
                    overlayColor={currentCardIndex === 0 ? "#FFD8E8" : currentCardIndex === 1 ? "#E5DAFF" : "#CDEBFF"}
                    onComplete={() => handleScratchComplete(currentCardIndex)}
                  >
                    {/* Underlying letter message content */}
                    <div className="w-full h-full p-6 sm:p-8 flex flex-col justify-between bg-white relative">
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
                          disabled={!cardsScratched[currentCardIndex]}
                          className={`px-5 py-2.5 bg-[#171717] text-[#FCF8F2] hover:bg-neutral-800 transition-colors font-bold text-sm rounded-xl border border-[#171717] flex items-center gap-1 shadow-offset-sm hover-tactile ${
                            !cardsScratched[currentCardIndex] ? "opacity-30 pointer-events-none" : ""
                          }`}
                        >
                          <span>Next Card</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </ScratchCard>
                </motion.div>
              ) : (
                
                /* GAME PHASE 3: 3D POLAROID FLIP GAME & CELEBRATION */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full flex flex-col items-center space-y-8"
                >
                  <div className="text-center space-y-1">
                    <span className="font-handwritten text-accent-red text-4xl rotate-[-3deg] inline-block">
                      Memory Lane
                    </span>
                    <p className="text-xs text-[#4A4A4A]">Click each polaroid photo card to flip and reveal memories.</p>
                  </div>

                  {/* Polaroid Grid for interactive flips */}
                  <div className="grid grid-cols-3 gap-4 w-full min-h-[180px] py-4 relative">
                    {giftData.photos && giftData.photos.length > 0 ? (
                      giftData.photos.map((photo: string, i: number) => {
                        const isFlipped = polaroidsFlipped[i];
                        return (
                          <div 
                            key={i} 
                            onClick={() => flipPolaroid(i)}
                            className="aspect-[3/4] w-full cursor-pointer perspective-[1000px] h-full"
                          >
                            <motion.div
                              animate={{ rotateY: isFlipped ? 180 : 0 }}
                              transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 12 }}
                              className="w-full h-full relative preserve-3d transition-transform shadow-offset-sm rounded-xl border-thick bg-white"
                            >
                              {/* BACK SIDE (Face Down) */}
                              <div className="absolute inset-0 w-full h-full backface-hidden flex flex-col items-center justify-center p-2 bg-[#FCF8F2] rounded-xl z-20">
                                <div className="w-8 h-8 rounded-full bg-pastel-pink border border-[#171717] flex items-center justify-center">
                                  <Heart className="w-4 h-4 text-accent-red fill-accent-red" />
                                </div>
                                <span className="font-handwritten text-[10px] mt-2">Flip me</span>
                              </div>

                              {/* FRONT SIDE (Face Up) */}
                              <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 flex flex-col justify-between p-2 rounded-xl bg-white z-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo} alt="" className="w-full aspect-square object-cover border border-[#171717] rounded" />
                                <p className="font-handwritten text-center text-[10px] text-black overflow-hidden whitespace-nowrap mt-1 pb-1">
                                  Memories
                                </p>
                              </div>
                            </motion.div>
                          </div>
                        );
                      })
                    ) : (
                      /* Fallback Polaroid representation if no photos uploaded */
                      <div className="col-span-3 flex justify-center">
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
                      </div>
                    )}
                  </div>

                  {/* Final Signature Card Reveal (only shows after all polaroids are flipped) */}
                  {polaroidsFlipped[0] && polaroidsFlipped[1] && polaroidsFlipped[2] && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4 pt-2"
                    >
                      <p className="font-display font-bold text-xl">
                        Sincerely, {giftData.senderName}
                      </p>
                      <p className="text-xs text-[#4A4A4A]">
                        Created with care using HeartNote.
                      </p>
                      <Link href="/" className="px-6 py-2.5 border-thick bg-primary hover-tactile text-[#171717] font-semibold text-sm rounded-xl inline-block shadow-offset-sm">
                        Create Your Own Note
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </DottedBackground>
  );
}
