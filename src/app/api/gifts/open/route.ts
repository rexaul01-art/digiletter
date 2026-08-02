import { NextResponse } from "next/server";
import { giftService } from "@/lib/giftService";

export async function POST(request: Request) {
  try {
    const { token, unlockAnswer } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const gift = await giftService.getGiftByToken(token);

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    // Verify answer if riddle is enabled
    if (gift.unlockAnswer && gift.unlockAnswer.trim() !== "") {
      if (!unlockAnswer || gift.unlockAnswer.toLowerCase().trim() !== unlockAnswer.toLowerCase().trim()) {
        return NextResponse.json({
          success: false,
          wrongAnswer: true,
        });
      }
    }

    // Check if the experience has already been opened
    if (gift.opened) {
      return NextResponse.json({
        success: false,
        alreadyOpened: true,
        openedAt: gift.openedAt,
      });
    }

    // Mark as opened atomatically
    const updated = await giftService.markAsOpened(token);

    if (!updated) {
      return NextResponse.json({ error: "Failed to lock gift" }, { status: 500 });
    }

    // Safely parse photos JSON string to array
    let photoUrls: string[] = [];
    try {
      photoUrls = JSON.parse(updated.photos);
    } catch (e) {
      photoUrls = [];
    }

    // Safely parse games JSON
    let parsedWordPuzzle = [];
    let parsedTriviaQuiz = [];
    try {
      parsedWordPuzzle = JSON.parse(updated.wordPuzzle || "[]");
      parsedTriviaQuiz = JSON.parse(updated.triviaQuiz || "[]");
    } catch (e) {}

    // Return the full content now that the envelope is officially opened
    return NextResponse.json({
      success: true,
      gift: {
        senderName: updated.senderName,
        receiverName: updated.receiverName,
        language: updated.language,
        relationship: updated.relationship,
        message1: updated.message1,
        message2: updated.message2,
        message3: updated.message3,
        photos: photoUrls,
        wordPuzzle: parsedWordPuzzle,
        triviaQuiz: parsedTriviaQuiz,
        openedAt: updated.openedAt,
      },
    });

  } catch (err: any) {
    console.error("Error opening gift:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
