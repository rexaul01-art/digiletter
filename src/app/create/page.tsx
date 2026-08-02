"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Camera, 
  Upload, 
  X, 
  Smartphone,
  Check,
  ChevronRight,
  Smile,
  Users,
  Flame,
  Gift,
  Home,
  User,
  GraduationCap,
  Cake,
  Calendar,
  Frown,
  PenTool,
  Lock,
  Loader2
} from "lucide-react";
import { DottedBackground } from "@/components/DottedBackground";
import { compressImage } from "@/lib/utils";

// Relationships definition
const RELATIONSHIPS = [
  { id: "girlfriend", name: "Girlfriend", icon: Heart, color: "bg-pastel-pink" },
  { id: "boyfriend", name: "Boyfriend", icon: Heart, color: "bg-pastel-blue" },
  { id: "wife", name: "Wife", icon: Sparkles, color: "bg-pastel-pink" },
  { id: "husband", name: "Husband", icon: Sparkles, color: "bg-pastel-blue" },
  { id: "bestfriend", name: "Best Friend", icon: Users, color: "bg-pastel-mint" },
  { id: "crush", name: "Crush", icon: Flame, color: "bg-pastel-lavender" },
  { id: "fiance", name: "Fiancé", icon: Gift, color: "bg-pastel-pink" },
  { id: "parents", name: "Parents", icon: Home, color: "bg-pastel-mint" },
  { id: "mother", name: "Mother", icon: User, color: "bg-pastel-pink" },
  { id: "father", name: "Father", icon: User, color: "bg-pastel-blue" },
  { id: "brother", name: "Brother", icon: User, color: "bg-pastel-blue" },
  { id: "sister", name: "Sister", icon: User, color: "bg-pastel-pink" },
  { id: "teacher", name: "Teacher", icon: GraduationCap, color: "bg-pastel-mint" },
  { id: "birthday", name: "Birthday", icon: Cake, color: "bg-pastel-lavender" },
  { id: "anniversary", name: "Anniversary", icon: Calendar, color: "bg-pastel-pink" },
  { id: "apology", name: "Apology", icon: Frown, color: "bg-pastel-blue" },
  { id: "custom", name: "Custom", icon: PenTool, color: "bg-pastel-mint" },
];

// Default message templates
const DEFAULT_MESSAGES: Record<string, Record<string, string[]>> = {
  english: {
    girlfriend: [
      "To the one who makes my world brighter just by being in it. You are my favorite thought, my safest place, and my greatest adventure.",
      "Thank you for the little laughs we share, the quiet comfort of your presence, and the way you understand me like no one else ever could.",
      "I love you more than words can express, and I'm so grateful for every single moment I get to spend by your side. You are my forever."
    ],
    boyfriend: [
      "To the man who makes me feel safe, loved, and completely myself. You are my rock, my voice of reason, and my happiest memory.",
      "Thank you for your warmth, your constant support, and for making even the ordinary days feel like an extraordinary celebration.",
      "I am incredibly lucky to have you in my life. I love you more and more with each passing day. You are my safe haven."
    ],
    bestfriend: [
      "To the person who knows all my secrets, laughs at my dumbest jokes, and stands by me no matter what. You're not just a friend, you're family.",
      "Life would be incredibly boring without you. Thanks for being the therapist I never paid for and the partner-in-crime I always needed.",
      "Here's to more adventures, inside jokes, and late-night talks. I'm so lucky to call you my best friend. Thanks for being you."
    ],
    wife: [
      "To my beautiful wife, you are the heart of our home and the love of my life. Every day with you is a gift I cherish.",
      "Thank you for your endless patience, your support, and the love you pour into us. You make everything beautiful.",
      "I promise to love you, support you, and hold your hand through all of life's seasons. You are my greatest blessing."
    ],
    husband: [
      "To my amazing husband, you are my partner, my best friend, and my greatest supporter. I love building this life with you.",
      "Thank you for your strength, your kindness, and the way you always make me feel loved and protected.",
      "Growing old with you is my favorite plan. I appreciate you more than you will ever know. I love you."
    ],
    crush: [
      "I wanted to send you something special because you have a way of brightening my day whenever you're around.",
      "I really enjoy our conversations and the moments we share. I hope this small note brings a smile to your face.",
      "Just a little reminder that you are appreciated, and you've been on my mind lately. Have a wonderful day!"
    ]
  },
  hinglish: {
    girlfriend: [
      "Mere life ka sabse beautiful part tum ho. Jab bhi tum mere paas hoti ho, mujhe aisa lagta hai sab kuch perfect hai.",
      "Tumhari wo choti choti baatein, humara sath hasna, aur bina kuch kahe ek dusre ko samajhna—ye sab mere liye sabse special hai.",
      "I love you so much. Har din tumhare sath bitana mere liye ek blessing ki tarah hai. Tum humesha meri rehna."
    ],
    boyfriend: [
      "Tum mere life ke sabse bade support system ho. Tumhare sath mujhe sabse safe aur happy feel hota hai.",
      "Thank you meri itni care karne ke liye, mujhe har baat pe hane ke liye, aur mere crazy side ko accept karne ke liye.",
      "I am very lucky to have you. Main tumse bohot pyaar karti hoon aur humesha tumhare sath rehna chahti hoon."
    ],
    bestfriend: [
      "Tu meri life ka sabse bada cartoon hai! Tere bina meri life kitni boring hoti, soch bhi nahi sakta.",
      "Thanks humesha sath dene ke liye, meri faltu baatein sunne ke liye, aur bina judge kiye meri help karne ke liye.",
      "Humari ye dosti humesha aisi hi rahegi. Chal ab jaldi se milte hain aur ek aur crazy adventure plan karte hain!"
    ]
  }
};

function getDefaultMessages(language: string, relationship: string): string[] {
  const lang = language === "hinglish" ? "hinglish" : "english";
  const messagesForLang = DEFAULT_MESSAGES[lang] || DEFAULT_MESSAGES.english;
  
  if (messagesForLang[relationship]) {
    return messagesForLang[relationship];
  }
  
  // Generic fallbacks
  const generalSet = lang === "hinglish" ? [
    "Ek bohot hi special insaan ke liye. Main chahta tha ki aaj tumhare liye kuch alag aur sundar banaun.",
    "Thank you humesha mere sath rehne ke liye, mere khayalon mein aane ke liye, aur mujhe itni khushi dene ke liye.",
    "Aapki dosti aur aapka sath mere liye bohot important hai. I hope ye chota sa note padh kar aapke face par smile aayegi."
  ] : [
    "To a very special person. I wanted to create a handcrafted digital note to express how much you mean to me.",
    "Thank you for being in my life, for the wonderful conversations we share, and for all the warmth you bring.",
    "I appreciate you more than you know, and I hope this little letter brings a big smile to your face today."
  ];

  return generalSet;
}

export default function CreatorWizard() {
  const router = useRouter();
  
  // Form States
  const [currentStep, setCurrentStep] = useState(1);
  const [language, setLanguage] = useState("english");
  const [relationship, setRelationship] = useState("girlfriend");
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [unlockQuestion, setUnlockQuestion] = useState("");
  const [unlockAnswer, setUnlockAnswer] = useState("");
  const [gameType, setGameType] = useState("heart_slider");

  // Game Builder States (3 to 5 items) with cute romantic defaults
  const [wordPuzzle, setWordPuzzle] = useState<{ question: string; answer: string }[]>([
    { question: "My favorite pet name for you?", answer: "PANDA" },
    { question: "Where did we first travel together?", answer: "GOA" },
    { question: "My favorite ice cream flavor?", answer: "MANGO" },
  ]);

  const [triviaQuiz, setTriviaQuiz] = useState<{ question: string; correct: string; wrong: string }[]>([
    { question: "Who said 'I love you' first?", correct: "Me", wrong: "You" },
    { question: "What is my favorite color?", correct: "Yellow", wrong: "Blue" },
    { question: "Where did we first meet?", correct: "Cafe", wrong: "Office" },
  ]);

  const addWordPuzzleItem = () => {
    if (wordPuzzle.length < 5) {
      setWordPuzzle(prev => [...prev, { question: "", answer: "" }]);
    }
  };

  const removeWordPuzzleItem = (index: number) => {
    if (wordPuzzle.length > 3) {
      setWordPuzzle(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addTriviaQuizItem = () => {
    if (triviaQuiz.length < 5) {
      setTriviaQuiz(prev => [...prev, { question: "", correct: "", wrong: "" }]);
    }
  };

  const removeTriviaQuizItem = (index: number) => {
    if (triviaQuiz.length > 3) {
      setTriviaQuiz(prev => prev.filter((_, i) => i !== index));
    }
  };
  
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [message3, setMessage3] = useState("");
  
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [photoCaptions, setPhotoCaptions] = useState<string[]>(["", "", ""]);
  
  // Loading & Execution state
  const [isAiLoading, setIsAiLoading] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  
  // Receiver interactive mockup state inside phone preview
  const [previewSealBroken, setPreviewSealBroken] = useState(false);
  const [previewCardIndex, setPreviewCardIndex] = useState(0);
  const [previewConfettiFired, setPreviewConfettiFired] = useState(false);

  // Initialize/Update default messages when language or relationship changes
  useEffect(() => {
    const defaults = getDefaultMessages(language, relationship);
    setMessage1(defaults[0] || "");
    setMessage2(defaults[1] || "");
    setMessage3(defaults[2] || "");
    // Reset preview states on configuration changes
    setPreviewSealBroken(false);
    setPreviewCardIndex(0);
    setPreviewConfettiFired(false);
  }, [language, relationship]);

  // Image upload handler
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    // Max 3 images
    const remainingSlots = 3 - uploadedPhotos.length;
    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      try {
        const compressed = await compressImage(file);
        setUploadedPhotos(prev => [...prev, compressed]);
      } catch (err) {
        console.error("Image compression failed:", err);
      }
    }
  };

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const updateCaption = (index: number, val: string) => {
    setPhotoCaptions(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // AI "Generate Better" trigger
  const generateBetterWithAi = async (cardIndex: number) => {
    setIsAiLoading(cardIndex);
    const currentText = cardIndex === 1 ? message1 : cardIndex === 2 ? message2 : message3;
    
    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          receiverName,
          relationship,
          language,
          currentMessage: currentText,
          cardIndex
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.text) {
        if (cardIndex === 1) setMessage1(data.text);
        else if (cardIndex === 2) setMessage2(data.text);
        else setMessage3(data.text);
      } else {
        // Fallback simple rewrite locally if endpoint errors
        const suffix = language === "hinglish" ? " (Aur bohot sara pyaar!)" : " (With all my heart)";
        if (cardIndex === 1) setMessage1(prev => prev + suffix);
        else if (cardIndex === 2) setMessage2(prev => prev + suffix);
        else setMessage3(prev => prev + suffix);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAiLoading(null);
    }
  };

  // Lock and submit note
  const handlePayment = async () => {
    setPaymentError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/gifts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          receiverName,
          language,
          relationship,
          message1,
          message2,
          message3,
          photos: uploadedPhotos,
          captions: photoCaptions,
          unlockQuestion,
          unlockAnswer,
          gameType,
          wordPuzzle,
          triviaQuiz,
        })
      });

      const giftData = await response.json();

      if (!response.ok) {
        throw new Error(giftData.error || "Failed to lock note");
      }

      const { token } = giftData;
      router.push(`/share/${token}`);
    } catch (err: any) {
      console.error(err);
      setPaymentError(err.message || "Failed to process gift order. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Navigations
  const nextStep = () => {
    if (currentStep === 3 && (!senderName.trim() || !receiverName.trim())) {
      return; // validate names
    }
    setCurrentStep(prev => Math.min(prev + 1, 8));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Dynamic Icon resolver
  const getRelationIcon = (iconName: any) => {
    return iconName; // returns React Component class
  };

  return (
    <DottedBackground>
      {/* Razorpay Script loader */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      {/* Header bar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-[#171717]/10 bg-[#FCF8F2]/80 backdrop-blur-sm z-30 sticky top-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 border-thick rounded-xl hover:bg-[#171717] hover:text-[#FCF8F2] transition-colors shadow-offset-sm">
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Link>
          <span className="font-display font-bold text-lg text-[#171717] hidden sm:inline">
            Create note letter
          </span>
        </div>
        
        {/* Stepper Progress bar */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div key={s} className="flex items-center">
              <div 
                className={`w-6 h-6 rounded-full border-2 border-[#171717] flex items-center justify-center text-[10px] font-bold transition-all duration-300 ${
                  currentStep === s 
                    ? "bg-primary text-[#171717] scale-110 shadow-offset-sm" 
                    : currentStep > s 
                      ? "bg-[#171717] text-[#FCF8F2]" 
                      : "bg-[#FCF8F2] text-[#171717]/50"
                }`}
              >
                {currentStep > s ? <Check className="w-3 h-3 text-[#FCF8F2]" strokeWidth={3} /> : s}
              </div>
              {s < 8 && (
                <div 
                  className={`w-4 sm:w-6 h-0.5 border-t-2 border-[#171717] transition-all duration-300 ${
                    currentStep > s ? "opacity-100" : "opacity-30"
                  }`} 
                />
              )}
            </div>
          ))}
        </div>
      </header>

      {/* Workspace split */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: THE STEPPER WIZARD FORM */}
        <div className="lg:col-span-7 bg-[#FCF8F2] border-thick rounded-[28px] p-6 sm:p-8 shadow-offset min-h-[500px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              {/* STEP 1: Choose Language */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 1</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Select your Language</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">We will load templates according to the writing flow you select.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button 
                      onClick={() => setLanguage("english")}
                      className={`p-6 border-thick rounded-2xl text-left hover-tactile flex items-center justify-between transition-all ${
                        language === "english" ? "bg-pastel-pink shadow-offset" : "bg-[#FCF8F2] shadow-offset-sm"
                      }`}
                    >
                      <div>
                        <h3 className="font-display font-bold text-xl">English</h3>
                        <p className="text-xs text-[#4A4A4A] mt-1">Clean, classical editorial letters.</p>
                      </div>
                      {language === "english" && (
                        <div className="w-6 h-6 bg-[#171717] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#FCF8F2]" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>

                    <button 
                      onClick={() => setLanguage("hinglish")}
                      className={`p-6 border-thick rounded-2xl text-left hover-tactile flex items-center justify-between transition-all ${
                        language === "hinglish" ? "bg-pastel-lavender shadow-offset" : "bg-[#FCF8F2] shadow-offset-sm"
                      }`}
                    >
                      <div>
                        <h3 className="font-display font-bold text-xl">Hinglish</h3>
                        <p className="text-xs text-[#4A4A4A] mt-1">Casual, romantic, playful Hindi in Latin script.</p>
                      </div>
                      {language === "hinglish" && (
                        <div className="w-6 h-6 bg-[#171717] rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-[#FCF8F2]" strokeWidth={2.5} />
                        </div>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Choose Relationship */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 2</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Select your Relationship</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">This configures matching illustration icons and text templates.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[340px] overflow-y-auto pr-2 border border-[#171717]/10 p-2 rounded-xl bg-neutral-50/50">
                    {RELATIONSHIPS.map((rel) => {
                      const Icon = rel.icon;
                      return (
                        <button
                          key={rel.id}
                          onClick={() => setRelationship(rel.id)}
                          className={`p-3.5 border-thick rounded-xl text-center hover-tactile flex flex-col items-center gap-2 transition-all ${
                            relationship === rel.id ? `${rel.color} shadow-offset-sm` : "bg-[#FCF8F2]"
                          }`}
                        >
                          <div className="p-2 bg-[#FCF8F2] border border-[#171717] rounded-lg">
                            <Icon className="w-5 h-5 text-[#171717]" strokeWidth={2} />
                          </div>
                          <span className="text-xs font-semibold tracking-tight">{rel.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 3: Enter Names */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 3</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Whose names are on the envelope?</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">Enter your name and the recipient's name to personalize the letter seal.</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#171717]">Your Name (Sender)</label>
                      <input 
                        type="text" 
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="e.g. Rahul"
                        className="p-4 border-thick rounded-xl bg-[#FCF8F2] focus:outline-none focus:bg-white transition-all text-base shadow-offset-sm focus:shadow-offset"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#171717]">Their Name (Receiver)</label>
                      <input 
                        type="text" 
                        value={receiverName}
                        onChange={(e) => setReceiverName(e.target.value)}
                        placeholder="e.g. Priya"
                        className="p-4 border-thick rounded-xl bg-[#FCF8F2] focus:outline-none focus:bg-white transition-all text-base shadow-offset-sm focus:shadow-offset"
                      />
                    </div>

                    {/* Game selection */}
                    <div className="flex flex-col gap-1.5 pt-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#171717]">Select Envelope Unlock Game</label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setGameType("heart_slider")}
                          className={`p-2.5 border-thick rounded-xl font-bold text-xs hover-tactile text-center transition-all ${
                            gameType === "heart_slider" ? "bg-pastel-pink shadow-offset-sm" : "bg-[#FCF8F2]"
                          }`}
                        >
                          Heart Slider
                        </button>
                        <button
                          type="button"
                          onClick={() => setGameType("riddle")}
                          className={`p-2.5 border-thick rounded-xl font-bold text-xs hover-tactile text-center transition-all ${
                            gameType === "riddle" ? "bg-pastel-lavender shadow-offset-sm" : "bg-[#FCF8F2]"
                          }`}
                        >
                          Riddle Padlock
                        </button>
                        <button
                          type="button"
                          onClick={() => setGameType("both")}
                          className={`p-2.5 border-thick rounded-xl font-bold text-xs hover-tactile text-center transition-all ${
                            gameType === "both" ? "bg-pastel-mint shadow-offset-sm" : "bg-[#FCF8F2]"
                          }`}
                        >
                          Both Games
                        </button>
                      </div>
                    </div>

                    {/* Conditional secret lock configurations */}
                    {(gameType === "riddle" || gameType === "both") && (
                      <div className="p-4 border-thick bg-pastel-lavender/50 rounded-2xl shadow-offset-sm space-y-3 pt-2">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717]">Secret Unlock Question</label>
                          <input 
                            type="text" 
                            value={unlockQuestion}
                            onChange={(e) => setUnlockQuestion(e.target.value)}
                            placeholder="e.g. Where did we first meet?"
                            className="p-3 border-thick rounded-lg bg-[#FCF8F2] focus:outline-none focus:bg-white transition-all text-xs"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[#171717]">Correct Secret Answer</label>
                          <input 
                            type="text" 
                            value={unlockAnswer}
                            onChange={(e) => setUnlockAnswer(e.target.value)}
                            placeholder="e.g. Mumbai"
                            className="p-3 border-thick rounded-lg bg-[#FCF8F2] focus:outline-none focus:bg-white transition-all text-xs font-semibold"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Game Questions Configuration (Word Search & Trivia Quiz) */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 4</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Setup Receiver Mini-Games</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">
                      Configure custom puzzles and quizzes that the recipient must play to unlock the envelope.
                    </p>
                  </div>

                  {/* Section A: Word Search Configuration */}
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 border border-[#171717]/10 p-4 rounded-2xl bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm flex items-center gap-1.5">
                        <span>🔍 Word Search Clues</span>
                        <span className="text-[10px] text-neutral-500 font-sans font-normal">({wordPuzzle.length} items, max 5)</span>
                      </h3>
                      {wordPuzzle.length < 5 && (
                        <button 
                          type="button"
                          onClick={addWordPuzzleItem}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#171717] text-white hover:bg-neutral-800 rounded-md transition-colors shadow-offset-sm"
                        >
                          + Add Word
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      {wordPuzzle.map((item, idx) => (
                        <div key={idx} className="p-3 border-thick bg-pastel-pink rounded-xl relative space-y-2">
                          {wordPuzzle.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removeWordPuzzleItem(idx)}
                              className="absolute top-2 right-2 p-1 bg-white border border-[#171717] rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Clue/Question {idx + 1}</label>
                            <input 
                              type="text"
                              value={item.question}
                              onChange={(e) => {
                                const copy = [...wordPuzzle];
                                copy[idx].question = e.target.value;
                                setWordPuzzle(copy);
                              }}
                              placeholder="e.g. My favorite nickname for you?"
                              className="p-2 border border-[#171717] rounded-lg bg-[#FCF8F2] text-xs focus:outline-none focus:bg-white"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Hidden Word Answer (No spaces/numbers, max 8 letters)</label>
                            <input 
                              type="text"
                              value={item.answer}
                              onChange={(e) => {
                                const copy = [...wordPuzzle];
                                copy[idx].answer = e.target.value.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 8);
                                setWordPuzzle(copy);
                              }}
                              placeholder="e.g. PANDA"
                              className="p-2 border border-[#171717] rounded-lg bg-[#FCF8F2] text-xs font-semibold focus:outline-none focus:bg-white tracking-wide"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Section B: Multiple Choice Trivia Configuration */}
                  <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 border border-[#171717]/10 p-4 rounded-2xl bg-neutral-50/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-bold text-sm flex items-center gap-1.5">
                        <span>❓ Love Quiz Questions</span>
                        <span className="text-[10px] text-neutral-500 font-sans font-normal">({triviaQuiz.length} items, max 5)</span>
                      </h3>
                      {triviaQuiz.length < 5 && (
                        <button 
                          type="button"
                          onClick={addTriviaQuizItem}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#171717] text-white hover:bg-neutral-800 rounded-md transition-colors shadow-offset-sm"
                        >
                          + Add Quiz
                        </button>
                      )}
                    </div>

                    <div className="space-y-3.5">
                      {triviaQuiz.map((item, idx) => (
                        <div key={idx} className="p-3 border-thick bg-pastel-blue rounded-xl relative space-y-2">
                          {triviaQuiz.length > 3 && (
                            <button
                              type="button"
                              onClick={() => removeTriviaQuizItem(idx)}
                              className="absolute top-2 right-2 p-1 bg-white border border-[#171717] rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">Quiz Question {idx + 1}</label>
                            <input 
                              type="text"
                              value={item.question}
                              onChange={(e) => {
                                const copy = [...triviaQuiz];
                                copy[idx].question = e.target.value;
                                setTriviaQuiz(copy);
                              }}
                              placeholder="e.g. Who fell in love first?"
                              className="p-2 border border-[#171717] rounded-lg bg-[#FCF8F2] text-xs focus:outline-none focus:bg-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-green-700">Correct Option</label>
                              <input 
                                type="text"
                                value={item.correct}
                                onChange={(e) => {
                                  const copy = [...triviaQuiz];
                                  copy[idx].correct = e.target.value;
                                  setTriviaQuiz(copy);
                                }}
                                placeholder="e.g. Me"
                                className="p-2 border border-green-600 rounded-lg bg-green-50/50 text-xs focus:outline-none focus:bg-white"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] font-bold uppercase tracking-wider text-red-700">Wrong Option</label>
                              <input 
                                type="text"
                                value={item.wrong}
                                onChange={(e) => {
                                  const copy = [...triviaQuiz];
                                  copy[idx].wrong = e.target.value;
                                  setTriviaQuiz(copy);
                                }}
                                placeholder="e.g. You"
                                className="p-2 border border-red-600 rounded-lg bg-red-50/50 text-xs focus:outline-none focus:bg-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: Write Messages */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-handwritten text-accent-red text-2xl">Step 5</span>
                      <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Write Your Messages</h2>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 py-2">
                    {/* Card 1 */}
                    <div className="p-4 border-thick bg-pastel-pink rounded-xl shadow-offset-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm">Message Card 1</span>
                        <button 
                          onClick={() => generateBetterWithAi(1)}
                          disabled={isAiLoading !== null}
                          className="px-2.5 py-1 bg-[#171717] text-white hover:bg-white hover:text-black hover:border-thick border border-[#171717] text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                        >
                          {isAiLoading === 1 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3 h-3 fill-white" />}
                          <span>Generate Better</span>
                        </button>
                      </div>
                      <textarea
                        value={message1}
                        onChange={(e) => setMessage1(e.target.value)}
                        maxLength={350}
                        rows={3}
                        className="w-full p-3 border-2 border-[#171717] rounded-lg bg-white/80 focus:outline-none focus:bg-white text-sm"
                      />
                      <div className="flex justify-end text-[10px] font-bold text-[#171717]/60">
                        {message1.length} / 350 characters
                      </div>
                    </div>

                    {/* Card 2 */}
                    <div className="p-4 border-thick bg-[#FCF8F2] rounded-xl shadow-offset-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm">Message Card 2</span>
                        <button 
                          onClick={() => generateBetterWithAi(2)}
                          disabled={isAiLoading !== null}
                          className="px-2.5 py-1 bg-[#171717] text-white hover:bg-white hover:text-black hover:border-thick border border-[#171717] text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                        >
                          {isAiLoading === 2 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3 h-3 fill-white" />}
                          <span>Generate Better</span>
                        </button>
                      </div>
                      <textarea
                        value={message2}
                        onChange={(e) => setMessage2(e.target.value)}
                        maxLength={350}
                        rows={3}
                        className="w-full p-3 border-2 border-[#171717] rounded-lg bg-white/80 focus:outline-none focus:bg-white text-sm"
                      />
                      <div className="flex justify-end text-[10px] font-bold text-[#171717]/60">
                        {message2.length} / 350 characters
                      </div>
                    </div>

                    {/* Card 3 */}
                    <div className="p-4 border-thick bg-pastel-blue rounded-xl shadow-offset-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-display font-bold text-sm">Message Card 3</span>
                        <button 
                          onClick={() => generateBetterWithAi(3)}
                          disabled={isAiLoading !== null}
                          className="px-2.5 py-1 bg-[#171717] text-white hover:bg-white hover:text-black hover:border-thick border border-[#171717] text-xs font-semibold rounded-lg flex items-center gap-1 transition-all"
                        >
                          {isAiLoading === 3 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3 h-3 fill-white" />}
                          <span>Generate Better</span>
                        </button>
                      </div>
                      <textarea
                        value={message3}
                        onChange={(e) => setMessage3(e.target.value)}
                        maxLength={350}
                        rows={3}
                        className="w-full p-3 border-2 border-[#171717] rounded-lg bg-white/80 focus:outline-none focus:bg-white text-sm"
                      />
                      <div className="flex justify-end text-[10px] font-bold text-[#171717]/60">
                        {message3.length} / 350 characters
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Photo Upload */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 6</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Attach Polaroid Photos</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">Upload up to 3 memories. We format them as vintage polaroid frames. (Optional)</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {/* Placeholder and existing slots */}
                    {[0, 1, 2].map((idx) => {
                      const photo = uploadedPhotos[idx];
                      return (
                        <div key={idx} className="border-thick border-dashed rounded-2xl aspect-[3/4] flex flex-col items-center justify-center p-3 relative bg-neutral-50/50">
                          {photo ? (
                            <div className="w-full h-full flex flex-col justify-between">
                              <div className="relative flex-1 rounded-lg border border-[#171717] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={photo} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                                <button 
                                  onClick={() => removePhoto(idx)}
                                  className="absolute top-1.5 right-1.5 p-1 bg-white border border-[#171717] rounded-full hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <input 
                                type="text"
                                value={photoCaptions[idx] || ""}
                                onChange={(e) => updateCaption(idx, e.target.value)}
                                placeholder="Write caption..."
                                className="w-full mt-2 p-1.5 text-xs text-center border-b border-dashed border-[#171717] focus:outline-none font-handwritten"
                              />
                            </div>
                          ) : (
                            <label className="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer">
                              <div className="p-3 bg-[#FCF8F2] border border-[#171717] rounded-xl shadow-offset-sm">
                                <Upload className="w-5 h-5 text-neutral-600" />
                              </div>
                              <span className="text-[10px] font-bold text-neutral-500 text-center uppercase tracking-wide">Upload Photo</span>
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handlePhotoUpload} 
                                className="hidden" 
                              />
                            </label>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* STEP 7: Interactive Preview Guidelines */}
              {currentStep === 7 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 7</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Review Live Preview</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">Review the final output in the mobile mockup on the right. You can break the seal and slide the cards to verify animations.</p>
                  </div>

                  <div className="p-6 border-thick bg-pastel-mint rounded-2xl shadow-offset-sm space-y-4">
                    <h3 className="font-display font-bold text-lg flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      <span>Interactive Mockup Guidance</span>
                    </h3>
                    <ul className="text-xs space-y-2 list-disc list-inside text-[#171717]/85 font-medium leading-relaxed">
                      <li>Click the <strong>Wax Seal</strong> on the phone mockup envelope to break and open the letter.</li>
                      <li>Slide through all 3 message cards to ensure they fit correctly.</li>
                      <li>View your polaroid attachments layout.</li>
                      <li>Double-check spellings. You can return to any step to make edits.</li>
                    </ul>
                    <div className="lg:hidden w-full pt-4">
                      <p className="text-xs text-[#4A4A4A] italic text-center">Scroll down to view and test the preview phone mockup below!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: Payment & Link Generation */}
              {currentStep === 8 && (
                <div className="space-y-6">
                  <div>
                    <span className="font-handwritten text-accent-red text-2xl">Step 8</span>
                    <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#171717]">Finalize & Lock Note</h2>
                    <p className="text-[#4A4A4A] text-sm mt-1">Locks your note and generates a secure one-time sharing view link.</p>
                  </div>

                  <div className="border-thick rounded-2xl bg-white p-6 shadow-offset-sm space-y-5">
                    <div className="flex justify-between items-center border-b border-[#171717]/10 pb-4">
                      <div>
                        <h4 className="font-display font-bold text-lg">HeartNote License</h4>
                        <p className="text-xs text-[#4A4A4A]">Interactive view-once server link</p>
                      </div>
                      <span className="font-display font-bold text-2xl text-green-600">Free</span>
                    </div>

                    {paymentError && (
                      <div className="p-3 border-thick bg-red-100 text-accent-red font-semibold text-xs rounded-xl flex items-center gap-2">
                        <X className="w-4 h-4 shrink-0" />
                        <span>{paymentError}</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={handlePayment}
                        disabled={isSubmitting}
                        className="w-full py-4 bg-primary text-[#171717] font-semibold text-lg rounded-2xl border-thick hover-tactile flex items-center justify-center gap-2 shadow-offset"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Locking Note...</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            <span>Lock Note & Generate Link</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Bottom actions */}
          <div className="flex items-center justify-between border-t border-[#171717]/10 pt-6 mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`px-5 py-2.5 border-thick rounded-xl font-bold flex items-center gap-1 shadow-offset-sm hover-tactile ${
                currentStep === 1 ? "opacity-30 pointer-events-none" : "bg-[#FCF8F2]"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            {currentStep < 8 ? (
              <button
                onClick={nextStep}
                disabled={currentStep === 3 && (!senderName.trim() || !receiverName.trim())}
                className={`px-5 py-2.5 bg-[#171717] text-white border-thick border-[#171717] rounded-xl font-bold flex items-center gap-1 shadow-offset-sm hover-tactile ${
                  currentStep === 3 && (!senderName.trim() || !receiverName.trim()) ? "opacity-30" : ""
                }`}
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="w-10 h-1" />
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTIVE PHONE PREVIEW */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[320px] bg-[#FCF8F2] border-thick rounded-[48px] shadow-offset-lg p-5 flex flex-col aspect-[9/18] relative bg-radial-[circle_at_center,rgba(255,201,40,0.03),transparent_100%] overflow-hidden select-none">
            {/* Phone Speaker notch */}
            <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-28 h-5 bg-[#171717] rounded-full border border-[#171717]" />
            <div className="absolute top-10 left-5 text-[10px] font-bold text-[#171717]/60">9:41</div>
            <div className="absolute top-10 right-5 text-[10px] font-bold text-[#171717]/60">5G</div>

            {/* PREVIEW WATERMARK */}
            <div className="absolute top-14 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-red/90 text-white font-bold text-[10px] uppercase tracking-widest border border-black rounded shadow z-40 rotate-[2deg]">
              Live Preview Watermark
            </div>

            {/* SCREEN VIEWPORT */}
            <div className="mt-12 flex-1 flex flex-col items-center justify-center w-full relative">
              {!previewSealBroken ? (
                /* VIEW 1: ENVELOPE SEAL SCREEN */
                <div className="flex flex-col items-center justify-center space-y-6 w-full px-2">
                  <span className="font-handwritten text-accent-red text-2xl rotate-[-3deg] animate-pulse">
                    Click seal to open
                  </span>
                  
                  {/* Digital envelope */}
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="w-full aspect-[4/3] bg-pastel-pink border-thick rounded-2xl shadow-offset-sm relative flex items-center justify-center cursor-pointer"
                    onClick={() => setPreviewSealBroken(true)}
                  >
                    {/* Wax seal */}
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="absolute w-12 h-12 bg-accent-red border-thick rounded-full flex items-center justify-center shadow z-10"
                    >
                      <Heart className="w-6 h-6 fill-[#FCF8F2] text-[#FCF8F2]" />
                    </motion.div>
                  </motion.div>

                  <div className="text-center">
                    <p className="font-display font-bold text-sm text-[#171717]">To: {receiverName || "[Receiver]"}</p>
                    <p className="font-handwritten text-xs text-[#171717]/80 mt-1">From: {senderName || "[Sender]"}</p>
                  </div>
                </div>
              ) : (
                /* VIEW 2: SLIDING CARD PRESENTATION */
                <div className="w-full h-full flex flex-col justify-between py-2">
                  {/* Interactive cards container */}
                  <div className="flex-1 flex flex-col justify-center items-center relative w-full px-2">
                    <AnimatePresence mode="wait">
                      {previewCardIndex < 3 ? (
                        <motion.div
                          key={previewCardIndex}
                          initial={{ opacity: 0, y: 30, rotate: -2 }}
                          animate={{ opacity: 1, y: 0, rotate: 0 }}
                          exit={{ opacity: 0, y: -30, rotate: 2 }}
                          className={`w-full p-4 border-thick rounded-2xl shadow-offset-sm aspect-[4/5] flex flex-col justify-between ${
                            previewCardIndex === 0 
                              ? "bg-pastel-pink" 
                              : previewCardIndex === 1 
                                ? "bg-pastel-lavender" 
                                : "bg-pastel-blue"
                          }`}
                        >
                          <span className="font-handwritten text-xs opacity-75">Card {previewCardIndex + 1} of 3</span>
                          
                          <p className="font-display text-[#171717] leading-relaxed text-sm my-auto text-left font-normal select-none overflow-y-auto max-h-[140px] pr-1">
                            {previewCardIndex === 0 ? message1 : previewCardIndex === 1 ? message2 : message3}
                          </p>

                          <div className="flex justify-end">
                            <span className="font-handwritten text-accent-red text-base">♡</span>
                          </div>
                        </motion.div>
                      ) : (
                        /* Polaroids and Celebration End Screen */
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="w-full flex flex-col items-center space-y-4"
                        >
                          <span className="font-handwritten text-accent-red text-3xl">Celebrating Love!</span>
                          
                          {/* Floating polaroid group */}
                          <div className="relative w-full h-36 flex items-center justify-center">
                            {uploadedPhotos.length > 0 ? (
                              uploadedPhotos.map((photo, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ rotate: 0 }}
                                  animate={{ 
                                    rotate: i === 0 ? -6 : i === 1 ? 5 : -1,
                                    x: i === 0 ? -25 : i === 1 ? 25 : 0,
                                    y: i === 2 ? -10 : 0
                                  }}
                                  className="w-24 bg-white border border-[#171717] p-1.5 shadow absolute rounded"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={photo} alt="" className="w-full aspect-square object-cover" />
                                  <p className="font-handwritten text-[8px] text-center mt-1 text-black overflow-hidden whitespace-nowrap">
                                    {photoCaptions[i] || "Memories"}
                                  </p>
                                </motion.div>
                              ))
                            ) : (
                              <div className="w-24 bg-white border border-[#171717] p-1.5 shadow rounded flex flex-col items-center justify-center">
                                <div className="w-full aspect-square bg-[#FCF8F2] flex items-center justify-center">
                                  <Heart className="w-5 h-5 text-accent-red fill-accent-red" />
                                </div>
                                <p className="font-handwritten text-[8px] mt-1 text-black">Love always</p>
                              </div>
                            )}
                          </div>
                          
                          <p className="text-[10px] text-center text-[#4A4A4A]">You have reached the end of the letter!</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Actions inside phone footer */}
                  <div className="flex justify-between items-center pt-2 px-2 border-t border-[#171717]/10">
                    <button 
                      onClick={() => setPreviewSealBroken(false)}
                      className="px-2.5 py-1 text-[10px] font-bold border border-[#171717] rounded-lg bg-[#FCF8F2] transition-colors"
                    >
                      Reset Seal
                    </button>

                    {previewSealBroken && previewCardIndex < 3 && (
                      <button 
                        onClick={() => setPreviewCardIndex(prev => prev + 1)}
                        className="px-3 py-1 bg-[#171717] text-white text-[10px] font-bold rounded-lg hover:bg-neutral-800 transition-colors flex items-center gap-0.5"
                      >
                        <span>Next Card</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Phone bottom swipe bar */}
            <div className="w-24 h-1 bg-[#171717] rounded-full mx-auto mt-2" />
          </div>
        </div>
      </div>
    </DottedBackground>
  );
}
