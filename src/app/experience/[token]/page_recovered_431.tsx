  // Lock and fetch if no riddle is configured
  const handleOpenStandardNote = async () => {
    // If riddle was already solved, we already retrieved full details from server
    if (giftData && giftData.message1) {
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