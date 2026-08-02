"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { 
  Heart, 
  Copy, 
  Check, 
  Share2, 
  Send, 
  AlertTriangle,
  QrCode,
  ArrowRight,
  Sparkles,
  RefreshCw,
  X
} from "lucide-react";
import { DottedBackground } from "@/components/DottedBackground";
import { motion } from "framer-motion";

interface SharePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default function SharePage({ params }: SharePageProps) {
  const { token } = use(params);
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [giftInfo, setGiftInfo] = useState<{ senderName: string; receiverName: string; paid: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/experience/${token}`;
      setShareUrl(url);

      // Generate QR Code data URL
      QRCode.toDataURL(url, { 
        width: 300, 
        margin: 2,
        color: {
          dark: "#171717",
          light: "#FCF8F2"
        }
      })
        .then(setQrCodeUrl)
        .catch(err => console.error("Failed to generate QR code", err));
    }
  }, [token]);

  useEffect(() => {
    fetch(`/api/gifts/info?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGiftInfo(data.gift);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link", err);
    }
  };

  const triggerNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `A HeartNote for you`,
          text: `Hey, I created a handcrafted digital letter just for you. Open it here:`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Native share cancelled or failed", err);
      }
    } else {
      copyToClipboard();
    }
  };

  // WhatsApp share link
  const getWhatsAppLink = () => {
    const text = `Hey! I created a handcrafted digital letter for you on HeartNote. It has a beautiful opening experience, but you can only open it ONCE. Open it here: ${shareUrl}`;
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  };

  // Telegram share link
  const getTelegramLink = () => {
    const text = `I created a handcrafted digital letter for you. (Note: It can only be opened once!)`;
    return `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
  };

  if (loading) {
    return (
      <DottedBackground className="justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-8 h-8 animate-spin text-[#171717]" />
          <p className="font-display font-bold text-lg text-neutral-600">Loading share screen...</p>
        </div>
      </DottedBackground>
    );
  }

  return (
    <DottedBackground>
      {/* Mini header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 bg-primary border-thick rounded-xl flex items-center justify-center shadow-offset-sm hover-tactile">
            <Heart className="w-5 h-5 fill-[#171717] text-[#171717]" strokeWidth={2} />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight text-[#171717]">
            HeartNote
          </span>
        </Link>
        <span className="font-handwritten text-accent-red text-2xl rotate-[-2deg]">
          Note Locked ✨
        </span>
      </header>

      {/* Share Container */}
      <main className="max-w-2xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center w-full">
        <div className="bg-[#FCF8F2] border-thick rounded-[28px] p-6 sm:p-8 shadow-offset space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-pastel-mint border-thick rounded-2xl flex items-center justify-center mx-auto shadow-offset-sm rotate-[-3deg]">
              <Sparkles className="w-8 h-8 text-[#171717]" strokeWidth={2} />
            </div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Your HeartNote is ready!</h2>
            <p className="text-sm text-[#4A4A4A] max-w-md mx-auto">
              We have generated a secure link for{" "}
              <strong className="text-[#171717]">{giftInfo?.receiverName || "your partner"}</strong>.
            </p>
          </div>

          {/* WARNING CARD */}
          <div className="p-4 border-thick bg-pastel-pink rounded-2xl shadow-offset-sm flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-accent-red shrink-0" strokeWidth={2} />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-sm text-[#171717]">One-Time View Enabled</h4>
              <p className="text-xs text-[#171717]/85 font-medium leading-relaxed">
                This digital letter is sealed. Once your recipient clicks to open it, the experience locks permanently. Ensure you share the link securely and only with them.
              </p>
            </div>
          </div>

          {/* LINK COPY BAR */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#171717]">Share Link</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 p-4 border-thick rounded-xl bg-white font-mono text-xs sm:text-sm select-all overflow-x-auto whitespace-nowrap scrollbar-none flex items-center">
                {shareUrl}
              </div>
              <button 
                onClick={copyToClipboard}
                className="px-6 py-4 bg-primary text-[#171717] font-semibold rounded-xl border-thick hover-tactile flex items-center justify-center gap-2 shadow-offset-sm shrink-0"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Link"}</span>
              </button>
            </div>
          </div>

          {/* MULTI PLATFORM SHARE BUTTONS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* WhatsApp */}
            <a 
              href={getWhatsAppLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 border-thick bg-[#FCF8F2] rounded-xl hover-tactile flex flex-col items-center justify-center gap-1.5 shadow-offset-sm font-semibold text-xs"
            >
              <Send className="w-5 h-5 text-green-600 rotate-[45deg]" strokeWidth={2} />
              <span>WhatsApp</span>
            </a>

            {/* Telegram */}
            <a 
              href={getTelegramLink()} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-3 border-thick bg-[#FCF8F2] rounded-xl hover-tactile flex flex-col items-center justify-center gap-1.5 shadow-offset-sm font-semibold text-xs"
            >
              <Send className="w-5 h-5 text-blue-500" strokeWidth={2} />
              <span>Telegram</span>
            </a>

            {/* QR Code trigger */}
            <button 
              onClick={() => setShowQrModal(true)}
              className="p-3 border-thick bg-[#FCF8F2] rounded-xl hover-tactile flex flex-col items-center justify-center gap-1.5 shadow-offset-sm font-semibold text-xs"
            >
              <QrCode className="w-5 h-5 text-purple-600" strokeWidth={2} />
              <span>Show QR</span>
            </button>

            {/* Native share / Generic share */}
            <button 
              onClick={triggerNativeShare}
              className="p-3 border-thick bg-[#FCF8F2] rounded-xl hover-tactile flex flex-col items-center justify-center gap-1.5 shadow-offset-sm font-semibold text-xs"
            >
              <Share2 className="w-5 h-5 text-amber-600" strokeWidth={2} />
              <span>Native Share</span>
            </button>
          </div>
        </div>

        {/* Info label */}
        <div className="text-center mt-6">
          <Link href="/" className="text-xs font-semibold underline text-[#171717]/60 hover:text-[#171717] transition-colors">
            Create another HeartNote
          </Link>
        </div>
      </main>

      {/* QR CODE MODAL DIALOG */}
      {showQrModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#FCF8F2] border-thick p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-offset-lg text-center relative"
          >
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 bg-white border border-[#171717] rounded-full hover:bg-neutral-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-display font-bold text-lg">Scan to Open HeartNote</h3>
            <p className="text-xs text-[#4A4A4A]">Point your phone camera to scan and immediately experience the digital letter.</p>

            <div className="border-thick p-4 bg-white rounded-2xl inline-block mx-auto shadow-offset-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code Link" className="w-48 h-48 mx-auto" />}
            </div>

            <button 
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-[#171717] text-white hover:bg-white hover:text-black hover:border-thick border border-[#171717] font-semibold text-sm rounded-xl transition-all shadow-offset-sm"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </DottedBackground>
  );
}
