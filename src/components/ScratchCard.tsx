"use client";

import React, { useRef, useEffect, useState } from "react";

interface ScratchCardProps {
  children: React.ReactNode;
  width?: number;
  height?: number;
  onComplete?: () => void;
  overlayColor?: string;
  brushRadius?: number;
}

export function ScratchCard({
  children,
  width: propWidth,
  height: propHeight,
  onComplete,
  overlayColor = "#E5DAFF",
  brushRadius = 24,
}: ScratchCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: propWidth || 0, height: propHeight || 0 });
  const [isCompleted, setIsCompleted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Measure parent container dynamically if width/height are not hardcoded
  useEffect(() => {
    if (propWidth && propHeight) {
      setDimensions({ width: propWidth, height: propHeight });
      return;
    }

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDimensions({
      width: rect.width || 320,
      height: rect.height || 400,
    });

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width && height) {
          setDimensions({ width, height });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [propWidth, propHeight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;

    // High-DPI screens scaling support
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Fill cover background
    ctx.fillStyle = overlayColor;
    ctx.fillRect(0, 0, width, height);

    // Draw nice dotted pattern
    ctx.fillStyle = "rgba(23, 23, 23, 0.07)";
    for (let x = 8; x < width; x += 12) {
      for (let y = 8; y < height; y += 12) {
        ctx.beginPath();
        ctx.arc(x, y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Write instruction text
    ctx.fillStyle = "#171717";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Rub / Swipe here to reveal ♡", width / 2, height / 2);
    
    // Draw envelope seal doodle icon
    ctx.font = "24px serif";
    ctx.fillText("✉", width / 2, height / 2 - 28);
  }, [dimensions, overlayColor]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const draw = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, brushRadius, 0, Math.PI * 2);
    ctx.fill();
    
    checkScratchPercentage();
  };

  const checkScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(width * dpr);
    const h = Math.floor(height * dpr);
    
    try {
      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      let transparentPixels = 0;
      const step = 4 * 12; // Sample every 12th pixel channel
      let totalSamples = 0;

      for (let i = 3; i < data.length; i += step) {
        totalSamples++;
        if (data[i] === 0) {
          transparentPixels++;
        }
      }

      const percent = (transparentPixels / totalSamples) * 100;
      if (percent > 40 && !isCompleted) {
        setIsCompleted(true);
        if (onComplete) onComplete();
      }
    } catch (e) {
      console.error("Failed to check canvas transparency", e);
    }
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    draw(x, y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || isCompleted) return;
    
    // Prevent touch scrolling to allow scratching on mobile
    if (e.cancelable) {
      e.preventDefault();
    }
    const { x, y } = getCoordinates(e);
    draw(x, y);
  };

  const handleEnd = () => {
    setIsDrawing(false);
  };

  return (
    <div ref={containerRef} className="relative overflow-hidden select-none w-full h-full rounded-2xl">
      {/* Behind container content */}
      <div className="w-full h-full relative z-10">
        {children}
      </div>

      {/* Floating Canvas */}
      {!isCompleted && dimensions.width > 0 && dimensions.height > 0 && (
        <canvas
          ref={canvasRef}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          className="absolute inset-0 z-20 cursor-pointer touch-none"
        />
      )}
    </div>
  );
}
