import { NextResponse } from "next/server";
import { giftService } from "@/lib/giftService";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { z } from "zod";

const createGiftSchema = z.object({
  senderName: z.string().min(1, "Sender name is required"),
  receiverName: z.string().min(1, "Receiver name is required"),
  language: z.string().min(1, "Language is required"),
  relationship: z.string().min(1, "Relationship is required"),
  message1: z.string().min(1, "Message 1 is required"),
  message2: z.string().min(1, "Message 2 is required"),
  message3: z.string().min(1, "Message 3 is required"),
  photos: z.array(z.string()).max(3, "Max 3 photos allowed"),
  captions: z.array(z.string()).max(3),
  unlockQuestion: z.string().optional(),
  unlockAnswer: z.string().optional(),
  gameType: z.string().optional(),
  wordPuzzle: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
  triviaQuiz: z.array(z.object({ question: z.string(), correct: z.string(), wrong: z.string() })).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = createGiftSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.format() },
        { status: 400 }
      );
    }

    const {
      senderName,
      receiverName,
      language,
      relationship,
      message1,
      message2,
      message3,
      photos,
      captions,
      unlockQuestion,
      unlockAnswer,
      gameType,
      wordPuzzle,
      triviaQuiz,
    } = result.data;

    // We can pre-generate token to use as receipt in order
    const mockToken = Math.random().toString(36).substring(2, 12);
    let orderId = `order_mock_${Math.random().toString(36).substring(2, 10)}`;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (keyId && keySecret) {
      try {
        const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${basicAuth}`,
          },
          body: JSON.stringify({
            amount: 2900, // ₹29 in paise
            currency: "INR",
            receipt: `rcpt_${mockToken}`,
          }),
        });

        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          orderId = orderData.id;
        } else {
          console.error("Razorpay order API failed:", await orderResponse.text());
        }
      } catch (err) {
        console.error("Failed to connect to Razorpay, using mock order:", err);
      }
    }

    // Upload photos to Cloudinary (signed server upload) with base64 fallback
    const uploadedPhotoUrls = await Promise.all(
      photos.map((photo) => uploadToCloudinary(photo))
    );

    // Save record in database
    const createdGift = await giftService.createGift({
      senderName,
      receiverName,
      language,
      relationship,
      message1,
      message2,
      message3,
      photos: uploadedPhotoUrls,
      unlockQuestion,
      unlockAnswer,
      gameType,
      wordPuzzle: wordPuzzle ? JSON.stringify(wordPuzzle) : "[]",
      triviaQuiz: triviaQuiz ? JSON.stringify(triviaQuiz) : "[]",
      orderId,
    });

    // Mark as paid/active immediately on creation (since the experience is completely free)
    await giftService.markAsPaid(createdGift.token, "free_activation");

    return NextResponse.json({
      success: true,
      token: createdGift.token,
      amount: 0,
    });

  } catch (err: any) {
    console.error("Error creating gift draft:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
