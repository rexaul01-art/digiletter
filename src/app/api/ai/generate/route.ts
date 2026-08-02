import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { senderName, receiverName, relationship, language, currentMessage, cardIndex } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Local fallback rewrite if Gemini key is missing: adds custom warm formatting and signature accents.
      let fallbackText = currentMessage;
      if (language === "english") {
        if (cardIndex === 1) fallbackText = `To my dearest ${receiverName || "love"}, ${currentMessage} (Always thinking of you)`;
        else if (cardIndex === 2) fallbackText = `${currentMessage} — You have no idea how much you mean to me.`;
        else fallbackText = `${currentMessage} (All my love, ${senderName || "forever"})`;
      } else {
        if (cardIndex === 1) fallbackText = `Priya ${receiverName || "love"}, ${currentMessage} (Aap mere sabse special ho)`;
        else if (cardIndex === 2) fallbackText = `${currentMessage} — Tumhare bina life bilkul adhuri hai.`;
        else fallbackText = `${currentMessage} (Sirf tumhara, ${senderName || "humesha"})`;
      }

      return NextResponse.json({ text: fallbackText });
    }

    const prompt = `You are a professional editorial writer and creative director specializing in emotional greeting cards. 
Rephrase the following message to make it sound more heartfelt, premium, emotional, and poetic. 
The card is from "${senderName || "Me"}" to their "${relationship || "partner"}" written in "${language}" language.
Maintain the core meaning of the user's input, but refine the vocabulary and rhythm to make it sound incredibly elegant. 
Keep the text under 250 characters. 
Do NOT wrap the output in quotes. Do NOT include any introductory or concluding remarks. Just output the refined message.

User Message: "${currentMessage}"`;

    const apiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 150,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!apiResponse.ok) {
      throw new Error(`Gemini API returned status ${apiResponse.status}`);
    }

    const resData = await apiResponse.json();
    const refinedText = resData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (refinedText) {
      return NextResponse.json({ text: refinedText });
    } else {
      throw new Error("Failed to parse Gemini response");
    }

  } catch (err: any) {
    console.error("AI Generation error:", err);
    return NextResponse.json(
      { error: "AI generation failed, fallback applied", text: "Love is the closest thing we have to magic." },
      { status: 200 } // Return 200 to keep UI running
    );
  }
}
