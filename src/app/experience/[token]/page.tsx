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
  XCircle,
  CheckCircle,
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

// -------------------------------------------------------------
// DYNAMIC WORD SEARCH GRID GENERATOR HELPER
// -------------------------------------------------------------
function generateWordSearch(words: string[], gridSize = 9) {
  const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(""));
  const wordCoords: Record<string, { r1: number; c1: number; r2: number; c2: number }> = {};
  
  const directions = [
    { dr: 0, dc: 1 },  // Horizontal
    { dr: 1, dc: 0 },  // Vertical
    { dr: 1, dc: 1 }   // Diagonal
  ];

  words.forEach((rawWord) => {
    const word = rawWord.replace(/[^a-zA-Z]/g, "").toUpperCase();
    if (!word) return;

    let placed = false;
    let attempts = 0;
    
    while (!placed && attempts < 100) {
      attempts++;
      const dir = directions[Math.floor(Math.random() * directions.length)];
      const r = Math.floor(Math.random() * gridSize);
      const c = Math.floor(Math.random() * gridSize);
      
      const len = word.length;
      if (r + dir.dr * (len - 1) >= gridSize || c + dir.dc * (len - 1) >= gridSize) continue;
      
      let collides = false;
      for (let i = 0; i < len; i++) {
        const currR = r + dir.dr * i;
        const currC = c + dir.dc * i;
        const letter = grid[currR][currC];
        if (letter !== "" && letter !== word[i]) {
          collides = true;
          break;
        }
      }
      
      if (!collides) {
        for (let i = 0; i < len; i++) {
          grid[r + dir.dr * i][c + dir.dc * i] = word[i];
        }
        wordCoords[word] = {
          r1: r,
          c1: c,
          r2: r + dir.dr * (len - 1),
          c2: c + dir.dc * (len - 1)
        };
        placed = true;
      }
    }
  });

  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
  }

  return { grid, wordCoords };
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
  
  // SEQUENTIAL PHASE FLOW: "slider" | "word_search" | "trivia_quiz" | "scratch_cards" | "polaroids"
  const [experiencePhase, setExperiencePhase] = useState<string>("slider");

  // Game 1: Word Search States
  const [searchGrid, setSearchGrid] = useState<string[][]>([]);
  const [solvedWords, setSolvedWords] = useState<string[]>([]);
  const [selectedStart, setSelectedStart] = useState<{ r: number; c: number } | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<{ r: number; c: number } | null>(null);
  const [solvedHighlights, setSolvedHighlights] = useState<{ r: number; c: number; color: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Game 2: Trivia Quiz States
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  // Effect items for animations (Crying emoji rain & Heart explosion)
  const [effectType, setEffectType] = useState<"crying" | "hearts" | null>(null);
  const [effectItems, setEffectItems] = useState<any[]>([]);

  // Message Card States
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

  // Final Handwriting completion
  const [handwritingComplete, setHandwritingComplete] = useState(false);

  // Riddle Lock states
  const [typedAnswer, setTypedAnswer] = useState("");
  const [wrongAnswerError, setWrongAnswerError] = useState(false);
  const [wrongAnswerMsg, setWrongAnswerMsg] = useState("");

  const [isMuted, setIsMuted] = useState(false);
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  // Not Found State
  const [notFound, setNotFound] = useState(false);

  // Load basic preview meta data first
  useEffect(() => {
    fetch(`/api/gifts/info?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGiftData(data.gift);
          if (!data.gift.unlockQuestion || data.gift.unlockQuestion.trim() === "") {
            setRiddleUnlocked(true);
          }

          // Generate Word Search grid if questions exist
          if (data.gift.wordPuzzle && data.gift.wordPuzzle.length > 0) {
            const answers = data.gift.wordPuzzle.map((w: any) => w.answer);
            const { grid } = generateWordSearch(answers);
            setSearchGrid(grid);
          }
        } else {
          setNotFound(true);
        }
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });
  }, [token]);

  // Shuffle quiz options on quiz index changes
  useEffect(() => {
    if (giftData?.triviaQuiz && giftData.triviaQuiz[currentQuizIndex]) {
      const q = giftData.triviaQuiz[currentQuizIndex];
      setShuffledOptions(
        Math.random() > 0.5 ? [q.correct, q.wrong] : [q.wrong, q.correct]
      );
    }
  }, [currentQuizIndex, giftData]);

  // Audio synthesizer cascade melody on envelope opening
  const playOpenMelody = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioCtx || new AudioContextClass();
      if (!audioCtx) setAudioCtx(ctx);

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
    } catch (e) {}
  };

  // Sad buzzer tone for wrong quiz selections
  const playSadBuzzer = () => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = audioCtx || new AudioContextClass();
      if (!audioCtx) setAudioCtx(ctx);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(120.00, ctx.currentTime); // Low buzz G2
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch (e) {}
  };

  // Success tone
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

  // Trigger Crying Rain Overlay
  const triggerCryingRain = () => {
    setEffectType("crying");
    const rainItems = Array(26).fill(null).map((_, i) => ({
      id: i,
      char: "😭",
      left: `${Math.random() * 100}%`,
      size: `${18 + Math.random() * 18}px`,
      delay: `${Math.random() * 1.5}s`,
      duration: `${1.5 + Math.random() * 1.5}s`
    }));
    setEffectItems(rainItems);

    playSadBuzzer();

    // Clear after animation duration
    setTimeout(() => {
      setEffectType(null);
      setEffectItems([]);
    }, 3000);
  };

  // Trigger Hearts Explosion Overlay
  const triggerHeartsExplosion = () => {
    setEffectType("hearts");
    const heartItems = Array(30).fill(null).map((_, i) => {
      const theta = Math.random() * 2 * Math.PI;
      const r = 90 + Math.random() * 160;
      const tx = `${r * Math.cos(theta)}px`;
      const ty = `${r * Math.sin(theta)}px`;
      const rot = `${Math.random() * 360}deg`;
      return {
        id: i,
        char: Math.random() > 0.35 ? "❤️" : "💖",
        tx,
        ty,
        rot,
        duration: `${0.8 + Math.random() * 0.4}s`
      };
    });
    setEffectItems(heartItems);

    playFlipTone();

    setTimeout(() => {
      setEffectType(null);
      setEffectItems([]);
    }, 1500);
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
        setWrongAnswerMsg(`Verification failed: ${data.error || "Could not verify"}`);
      }
    } catch (err) {
      console.error(err);
      setWrongAnswerMsg(`Network error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setOpeningAction(false);
    }
  };

  // Lock and fetch if no riddle is configured
  const handleOpenStandardNote = async () => {
    // If we already loaded the full envelope data (unlocked via riddle), just enter the experience
    if (giftData && 'message1' in giftData) {
      setStarted(true);
      return;
    }

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
      } else if (data.wrongAnswer) {
        // The gift has a riddle but we didn't send an answer.
        // This means the riddle was already solved earlier and giftData should have full content.
        if (giftData && 'message1' in giftData) {
          setStarted(true);
        }
      } else {
        alert(`Error loading envelope: ${data.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert(`Network error: ${err instanceof Error ? err.message : String(err)}`);
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

      // Check which phase is next:
      if (giftData.wordPuzzle && giftData.wordPuzzle.length > 0) {
        setExperiencePhase("word_search");
      } else if (giftData.triviaQuiz && giftData.triviaQuiz.length > 0) {
        setExperiencePhase("trivia_quiz");
      } else {
        setExperiencePhase("scratch_cards");
      }
    }
  };

  // Word Search Cell clicking handler
  const HIGHLIGHTER_COLORS = [
    "rgba(253, 224, 71, 0.45)",   // Pastel Yellow
    "rgba(134, 239, 172, 0.45)",   // Pastel Green
    "rgba(147, 197, 253, 0.45)",   // Pastel Blue
    "rgba(244, 143, 177, 0.45)",   // Pastel Pink
    "rgba(216, 180, 254, 0.45)",   // Pastel Purple
    "rgba(253, 186, 116, 0.45)",   // Pastel Orange
  ];

  // Starts selection (mouse)
  const handleStartDrag = (r: number, c: number) => {
    setSelectedStart({ r, c });
    setSelectedEnd({ r, c });
    setIsDragging(true);
  };

  // Updates selection end (mouse)
  const handleDragEnter = (r: number, c: number) => {
    if (!isDragging) return;
    setSelectedEnd({ r, c });
  };

  // Finalizes selection (mouse)
  const handleEndDrag = () => {
    if (!isDragging || !selectedStart || !selectedEnd) return;
    setIsDragging(false);
    validateSelection(selectedStart.r, selectedStart.c, selectedEnd.r, selectedEnd.c);
  };

  // Starts selection (touch mobile)
  const handleTouchStart = (e: React.TouchEvent, r: number, c: number) => {
    e.preventDefault(); // prevents standard touch gestures (page scrolling) inside the grid
    setSelectedStart({ r, c });
    setSelectedEnd({ r, c });
    setIsDragging(true);
  };

  // Updates selection end (touch mobile)
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !selectedStart) return;
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (!element) return;

    const rAttr = element.getAttribute("data-row");
    const cAttr = element.getAttribute("data-col");
    if (rAttr !== null && cAttr !== null) {
      const r = parseInt(rAttr);
      const c = parseInt(cAttr);
      setSelectedEnd({ r, c });
    }
  };

  // Finalizes selection (touch mobile)
  const handleTouchEnd = () => {
    if (!isDragging || !selectedStart || !selectedEnd) return;
    setIsDragging(false);
    validateSelection(selectedStart.r, selectedStart.c, selectedEnd.r, selectedEnd.c);
  };

  // Validates if the selected line matches any riddle word clue
  const validateSelection = (sr: number, sc: number, er: number, ec: number) => {
    const dr = Math.sign(er - sr);
    const dc = Math.sign(ec - sc);
    const isLine = 
      sr === er || 
      sc === ec || 
      Math.abs(sr - er) === Math.abs(sc - ec);

    if (isLine) {
      const len = Math.max(Math.abs(er - sr), Math.abs(ec - sc)) + 1;
      let wordStr = "";
      for (let i = 0; i < len; i++) {
        wordStr += searchGrid[sr + dr * i][sc + dc * i];
      }
      
      const revStr = wordStr.split("").reverse().join("");
      
      // Find matching word
      const matched = giftData.wordPuzzle.find((w: any) => {
        const cleanAns = w.answer.replace(/[^a-zA-Z]/g, "").toUpperCase();
        return cleanAns === wordStr || cleanAns === revStr;
      });

      if (matched) {
        const cleanMatched = matched.answer.replace(/[^a-zA-Z]/g, "").toUpperCase();
        if (!solvedWords.includes(cleanMatched)) {
          setSolvedWords((prev) => [...prev, cleanMatched]);
          
          // Allocate persistent highlighter color for this word
          const color = HIGHLIGHTER_COLORS[solvedWords.length % HIGHLIGHTER_COLORS.length];
          const newHighlights: { r: number; c: number; color: string }[] = [];
          for (let i = 0; i < len; i++) {
            newHighlights.push({
              r: sr + dr * i,
              c: sc + dc * i,
              color
            });
          }
          setSolvedHighlights((prev) => [...prev, ...newHighlights]);
          playFlipTone();
        }
      }
    }
    
    // Clear temporary selection indices
    setSelectedStart(null);
    setSelectedEnd(null);
  };

  // Helper check if cell is inside the active drag path
  const isCellSelected = (r: number, c: number) => {
    if (!selectedStart) return false;
    if (selectedStart.r === r && selectedStart.c === c) return true;
    if (!selectedEnd) return false;

    // Must form a straight vertical, horizontal, or diagonal line
    const dr = Math.sign(selectedEnd.r - selectedStart.r);
    const dc = Math.sign(selectedEnd.c - selectedStart.c);
    const isLine = 
      selectedStart.r === selectedEnd.r || 
      selectedStart.c === selectedEnd.c || 
      Math.abs(selectedStart.r - selectedEnd.r) === Math.abs(selectedStart.c - selectedEnd.c);

    if (!isLine) return false;

    const len = Math.max(Math.abs(selectedEnd.r - selectedStart.r), Math.abs(selectedEnd.c - selectedStart.c)) + 1;
    
    for (let i = 0; i < len; i++) {
      if (selectedStart.r + dr * i === r && selectedStart.c + dc * i === c) {
        return true;
      }
    }
    return false;
  };

  // Quiz Option Click validation
  const handleQuizOption = (opt: string) => {
    const q = giftData.triviaQuiz[currentQuizIndex];
    if (opt === q.correct) {
      triggerHeartsExplosion();
      setTimeout(() => {
        if (currentQuizIndex < giftData.triviaQuiz.length - 1) {
          setCurrentQuizIndex((prev) => prev + 1);
        } else {
          setExperiencePhase("scratch_cards");
        }
      }, 1400);
    } else {
      triggerCryingRain();
    }
  };

  const handleScratchComplete = (index: number) => {
    setCardsScratched(prev => ({ ...prev, [index]: true }));
    playFlipTone();
  };

  const handleNextCard = () => {
    const nextIdx = currentCardIndex + 1;
    setCurrentCardIndex(nextIdx);
    
    if (!isMuted) {
      try {
        const Class = window.AudioContext || (window as any).webkitAudioContext;
        if (Class) {
          const ctx = audioCtx || new Class();
          if (!audioCtx) setAudioCtx(ctx);
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(523.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.04, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.35);
        }
      } catch (e) {}
    }

    if (nextIdx === 3) {
      setExperiencePhase("polaroids");
    }
  };

  const flipPolaroid = (index: number) => {
    setPolaroidsFlipped(prev => ({ ...prev, [index]: !prev[index] }));
    playFlipTone();

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

  // VIEW: Not Found Screen
  if (notFound) {
    return (
      <DottedBackground className="justify-center items-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#FCF8F2] border-thick rounded-[28px] p-8 max-w-md w-full shadow-offset text-center space-y-6"
        >
          <div className="w-16 h-16 bg-pastel-pink border-thick rounded-2xl flex items-center justify-center mx-auto shadow-offset-sm rotate-[-4deg]">
            <XCircle className="w-8 h-8 text-accent-red" strokeWidth={2} />
          </div>
          
          <div className="space-y-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">HeartNote Not Found</h2>
            <p className="text-sm text-[#4A4A4A] leading-relaxed">
              We couldn't find the digital letter you're looking for. Please check the URL link or ask the sender to create it again.
            </p>
          </div>

          <div className="pt-2">
            <Link href="/" className="px-6 py-3 bg-[#171717] hover:bg-neutral-800 text-white font-semibold text-sm rounded-xl transition-all shadow-offset-sm inline-block">
              Create a new note
            </Link>
          </div>
        </motion.div>
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

  // -------------------------------------------------------------
  // RENDER DYNAMIC EFFECTS OVERLAY (CRYING RAIN / HEART EXPLOSION)
  // -------------------------------------------------------------
  const renderEffectsOverlay = () => {
    if (!effectType) return null;

    if (effectType === "crying") {
      return (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden bg-black/10 select-none">
          {effectItems.map((item) => (
            <div
              key={item.id}
              className="absolute animate-rain text-2xl"
              style={{
                left: item.left,
                fontSize: item.size,
                top: "-40px",
                "--dur": item.duration,
                animationDelay: item.delay,
              } as React.CSSProperties}
            >
              {item.char}
            </div>
          ))}
        </div>
      );
    }

    if (effectType === "hearts") {
      return (
        <div className="fixed inset-0 z-50 pointer-events-none select-none">
          {effectItems.map((item) => (
            <div
              key={item.id}
              className="absolute animate-burst text-3xl font-bold"
              style={{
                top: "50%",
                left: "50%",
                "--tx": item.tx,
                "--ty": item.ty,
                "--rot": item.rot,
                "--dur": item.duration,
              } as React.CSSProperties}
            >
              {item.char}
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  // VIEW 3: Main interactive phase viewer
  return (
    <DottedBackground className="p-4 sm:p-6 justify-center items-center relative">
      
      {/* Dynamic hardware accelerated animations injected directly on hydrate */}
      <style>{`
        @keyframes rain {
          0% { transform: translateY(-50px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
        @keyframes burst {
          0% { transform: translate(-50%, -50%) translate(0, 0) scale(0); opacity: 0; }
          15% { opacity: 1; }
          100% { transform: translate(-50%, -50%) translate(var(--tx), var(--ty)) scale(1.3) rotate(var(--rot)); opacity: 0; }
        }
        @keyframes float-heart {
          0% { transform: translateY(0) scale(0.8) rotate(0deg); opacity: 0; }
          10% { opacity: 0.55; }
          90% { opacity: 0.55; }
          100% { transform: translateY(-100vh) scale(1.2) rotate(45deg); opacity: 0; }
        }
        .animate-rain {
          animation: rain var(--dur) linear infinite;
        }
        .animate-burst {
          animation: burst var(--dur) cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }
        .animate-float-heart {
          animation: float-heart var(--dur) ease-in-out infinite;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* Render custom overlay animations */}
      {renderEffectsOverlay()}

      {/* Audio volume control */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 p-3 border-thick bg-[#FCF8F2] hover:bg-neutral-50 rounded-xl transition-all shadow-offset-sm hover-tactile z-50 animate-pulse"
      >
        {isMuted ? <VolumeX className="w-5 h-5 text-[#171717]" /> : <Volume2 className="w-5 h-5 text-[#171717]" />}
      </button>

      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[500px]">
        
        {/* GAME PHASE 1: HEART FUSION SLIDER */}
        {experiencePhase === "slider" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-[4/3] max-w-md bg-pastel-pink border-thick rounded-3xl p-6 shadow-offset relative flex flex-col justify-between items-center text-center overflow-hidden"
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
        )}

        {/* GAME PHASE 2: WORD SEARCH PUZZLE */}
        {experiencePhase === "word_search" && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            onMouseUp={handleEndDrag}
            onTouchEnd={handleTouchEnd}
            className="w-full bg-[#FCF8F2] border-thick rounded-[28px] p-5 shadow-offset relative space-y-5 flex flex-col justify-between"
          >
            <div className="text-center space-y-1">
              <span className="font-handwritten text-accent-red text-3xl rotate-[-2deg] inline-block">Word Search Puzzle</span>
              <h3 className="font-display font-bold text-lg text-black">Find the hidden words ♡</h3>
              <p className="text-[10px] text-neutral-500">Hold and drag across the letters in the grid to highlight.</p>
            </div>

            {/* The Letter Grid */}
            <div 
              onTouchMove={handleTouchMove}
              className="grid grid-cols-9 gap-1.5 max-w-[340px] mx-auto p-3 border-thick bg-white rounded-2xl shadow-offset-sm select-none"
            >
              {searchGrid.map((row, r) => 
                row.map((letter, c) => {
                  const isSelected = isCellSelected(r, c);
                  const highlightColor = solvedHighlights.find((h) => h.r === r && h.c === c)?.color;
                  return (
                    <button
                      key={`${r}-${c}`}
                      data-row={r}
                      data-col={c}
                      onMouseDown={() => handleStartDrag(r, c)}
                      onMouseEnter={() => handleDragEnter(r, c)}
                      onTouchStart={(e) => handleTouchStart(e, r, c)}
                      style={highlightColor ? { backgroundColor: highlightColor } : undefined}
                      className={`w-8 h-8 rounded-lg font-display font-bold text-sm border-2 border-transparent transition-all flex items-center justify-center ${
                        isSelected 
                          ? "bg-pastel-pink border-[#171717] scale-105 shadow-sm"
                          : highlightColor
                            ? "border-transparent" // color applied by style
                            : "bg-neutral-50 text-[#171717] hover:bg-[#FCF8F2]"
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })
              )}
            </div>

            {/* List of Word Clues */}
            <div className="space-y-2 border-t border-[#171717]/10 pt-4 max-h-[140px] overflow-y-auto pr-1">
              <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-500">Clues Remaining</span>
              <div className="grid grid-cols-1 gap-2">
                {giftData.wordPuzzle.map((w: any, idx: number) => {
                  const cleanWord = w.answer.replace(/[^a-zA-Z]/g, "").toUpperCase();
                  const isSolved = solvedWords.includes(cleanWord);
                  return (
                    <div 
                      key={idx}
                      className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                        isSolved 
                          ? "bg-green-50 border-green-300 opacity-60 line-through text-green-700" 
                          : "bg-[#FCF8F2] border-[#171717]"
                      }`}
                    >
                      {isSolved ? (
                        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-[#171717] flex items-center justify-center text-[9px] font-bold shrink-0">
                          {idx + 1}
                        </div>
                      )}
                      <p className="text-[11px] font-semibold flex-1 leading-tight text-left">
                        {w.question} <span className="text-[9px] font-mono text-neutral-400">({cleanWord.length} letters)</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submit / Proceed */}
            {solvedWords.length === giftData.wordPuzzle.length && (
              <motion.button 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={() => {
                  if (giftData.triviaQuiz && giftData.triviaQuiz.length > 0) {
                    setExperiencePhase("trivia_quiz");
                  } else {
                    setExperiencePhase("scratch_cards");
                  }
                }}
                className="w-full py-3.5 bg-primary text-black font-semibold text-sm rounded-xl border-thick hover-tactile flex items-center justify-center gap-1.5 shadow-offset"
              >
                <span>Solved! Proceed to Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* GAME PHASE 3: TRIVIA QUIZ */}
        {experiencePhase === "trivia_quiz" && giftData.triviaQuiz && giftData.triviaQuiz[currentQuizIndex] && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#FCF8F2] border-thick rounded-[28px] p-6 shadow-offset relative space-y-6 flex flex-col justify-between"
          >
            <div className="text-center space-y-1">
              <span className="font-handwritten text-accent-red text-3xl rotate-[-2deg] inline-block">Love Quiz</span>
              <h3 className="font-display font-bold text-sm text-neutral-500 uppercase tracking-wide">
                Question {currentQuizIndex + 1} of {giftData.triviaQuiz.length}
              </h3>
            </div>

            {/* Question display card */}
            <div className="p-6 border-thick bg-pastel-blue rounded-2xl shadow-offset-sm text-left">
              <p className="font-display text-base md:text-lg leading-relaxed text-[#171717] font-semibold">
                &ldquo;{giftData.triviaQuiz[currentQuizIndex].question}&rdquo;
              </p>
            </div>

            {/* Double buttons choice */}
            <div className="grid grid-cols-2 gap-4">
              {shuffledOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleQuizOption(opt)}
                  className="p-4 border-thick bg-white text-[#171717] font-bold text-sm rounded-2xl hover-tactile shadow-offset-sm text-center min-h-[70px] flex items-center justify-center"
                >
                  {opt}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-neutral-400 text-center">Correct answers advance. Incorrect answer triggers tear-rain.</p>
          </motion.div>
        )}

        {/* GAME PHASE 4: SCRATCH OFF MESSAGE CARDS */}
        {experiencePhase === "scratch_cards" && (
          <div className="w-full flex flex-col justify-between min-h-[460px] max-w-md">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, y: 40, scale: 0.95, rotate: -1 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, y: -45, scale: 0.95, rotate: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 14 }}
                className="w-full border-thick rounded-[28px] shadow-offset aspect-[4/5] overflow-hidden"
              >
                <ScratchCard 
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
            </AnimatePresence>
          </div>
        )}

        {/* GAME PHASE 5: 3D POLAROID FLIP GAME & CONFETTI FINALE */}
        {experiencePhase === "polaroids" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full flex flex-col items-center space-y-8 max-w-md relative"
          >
            {/* Background slow-floating love hearts animation inside ending block */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
              {Array(18).fill(null).map((_, idx) => (
                <div 
                  key={idx}
                  className="absolute animate-float-heart text-[#FF5A4E]/20"
                  style={{
                    left: `${5 + Math.random() * 90}%`,
                    fontSize: `${16 + Math.random() * 24}px`,
                    bottom: "-50px",
                    "--dur": `${5 + Math.random() * 5}s`,
                    animationDelay: `${idx * 0.4}s`
                  } as React.CSSProperties}
                >
                  ❤️
                </div>
              ))}
            </div>

            <div className="text-center space-y-1 z-10 relative">
              <span className="font-handwritten text-accent-red text-4xl rotate-[-3deg] inline-block">
                Memory Lane
              </span>
              <p className="text-xs text-[#4A4A4A]">Click each polaroid photo card to flip and reveal memories.</p>
            </div>

            {/* Polaroid Grid for interactive flips */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full min-h-[180px] py-4 relative z-10">
              {giftData.photos && giftData.photos.length > 0 ? (
                giftData.photos.map((photo: string, i: number) => {
                  const isFlipped = polaroidsFlipped[i];
                  return (
                    <div 
                      key={i} 
                      onClick={() => flipPolaroid(i)}
                      className="aspect-[3/4] w-full cursor-pointer perspective-1000 h-full"
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
              <div className="w-full text-center space-y-6 pt-4 z-10 relative">
                {/* Handwritten Animation of "Thank you for coming into my life... ♡" */}
                <motion.div
                  variants={{
                    hidden: {},
                    visible: {
                      transition: {
                        staggerChildren: 0.08,
                      }
                    }
                  }}
                  initial="hidden"
                  animate="visible"
                  onAnimationComplete={() => {
                    setHandwritingComplete(true);
                    triggerConfettiRain();
                  }}
                  className="flex flex-wrap justify-center font-handwritten text-3xl sm:text-4xl md:text-5xl text-accent-red font-bold tracking-wide leading-tight px-2 min-h-[60px]"
                >
                  {"Thank you for coming into my life... ♡".split("").map((char, index) => (
                    <motion.span
                      key={index}
                      variants={{
                        hidden: { opacity: 0, scale: 0.5 },
                        visible: { opacity: 1, scale: 1, transition: { duration: 0.15 } }
                      }}
                      className={char === " " ? "mr-2 sm:mr-3" : ""}
                    >
                      {char}
                    </motion.span>
                  ))}
                  {!handwritingComplete && (
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ repeat: Infinity, duration: 0.8 }}
                      className="inline-block w-1.5 h-7 sm:h-9 bg-accent-red ml-1 align-middle"
                    />
                  )}
                </motion.div>

                {/* Handdrawn Underline Stroke Effect */}
                {handwritingComplete && (
                  <motion.svg
                    width="280"
                    height="20"
                    viewBox="0 0 280 20"
                    className="mx-auto -mt-3 pointer-events-none"
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.path
                      d="M 10 10 C 80 15, 200 15, 270 10"
                      fill="transparent"
                      strokeWidth="3.5"
                      stroke="#FF5A4E"
                      strokeLinecap="round"
                      variants={{
                        hidden: { pathLength: 0 },
                        visible: {
                          pathLength: 1,
                          transition: { duration: 0.8, ease: "easeInOut" }
                        }
                      }}
                    />
                  </motion.svg>
                )}

                <AnimatePresence>
                  {handwritingComplete && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="space-y-6 pt-2"
                    >
                      {/* Pulsating interactive Beating Heart */}
                      <motion.div
                        animate={{ scale: [1, 1.15, 1], rotate: [0, 2, -2, 0] }}
                        transition={{
                          scale: { repeat: Infinity, duration: 1.2, ease: "easeInOut" },
                          rotate: { repeat: Infinity, duration: 2.4, ease: "easeInOut" }
                        }}
                        className="w-16 h-16 bg-accent-red rounded-full border-thick flex items-center justify-center mx-auto shadow-offset-sm relative z-20 cursor-pointer"
                        onClick={triggerConfettiRain}
                      >
                        <Heart className="w-8 h-8 fill-white text-white" />
                      </motion.div>

                      <div className="space-y-1">
                        <p className="font-display font-bold text-2xl text-neutral-800">
                          Sincerely, {giftData.senderName}
                        </p>
                        <p className="text-sm text-neutral-600 font-semibold tracking-wide">
                          Forever yours. ♡
                        </p>
                        <p className="text-[10px] text-neutral-400 font-semibold pt-1">
                          made by- @rexaul__09
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link href="/" className="px-6 py-3 border-thick bg-primary hover-tactile text-[#171717] font-bold text-sm rounded-2xl inline-block shadow-offset">
                          Create Your Own Note
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DottedBackground>
  );
}