"use client";

import React from "react";

interface DottedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function DottedBackground({ children, className = "" }: DottedBackgroundProps) {
  return (
    <div className={`relative min-h-screen w-full dotted-bg flex flex-col overflow-x-hidden ${className}`}>
      {/* Soft ambient lighting overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,201,40,0.04),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(255,90,78,0.03),transparent_70%)] pointer-events-none" />
      
      {/* Vintage letter top accent border */}
      <div className="w-full h-1.5 bg-[#FFC928] border-b border-[#171717] z-10" />

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}
