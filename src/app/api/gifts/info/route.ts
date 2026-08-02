import { NextResponse } from "next/server";
import { giftService } from "@/lib/giftService";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const gift = await giftService.getGiftByToken(token);

    if (!gift) {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

    // Securely return ONLY the sender, receiver names, and game configuration (no messages or photos)
    let parsedWordPuzzle = [];
    let parsedTriviaQuiz = [];
    try {
      parsedWordPuzzle = JSON.parse(gift.wordPuzzle || "[]");
      parsedTriviaQuiz = JSON.parse(gift.triviaQuiz || "[]");
    } catch (e) {}

    return NextResponse.json({
      success: true,
      gift: {
        senderName: gift.senderName,
        receiverName: gift.receiverName,
        paid: gift.paid,
        gameType: gift.gameType,
        unlockQuestion: gift.unlockQuestion,
        wordPuzzle: parsedWordPuzzle,
        triviaQuiz: parsedTriviaQuiz,
      },
    });

  } catch (err: any) {
    console.error("Error retrieving gift details:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
