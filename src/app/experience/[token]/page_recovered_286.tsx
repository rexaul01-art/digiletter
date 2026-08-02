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
      triggerConfettiRain();
    }
  };

  const flipPolaroid = (index: number) => {