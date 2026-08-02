import { NextResponse } from "next/server";
import { giftService } from "@/lib/giftService";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, paymentId, orderId, signature, isSandbox } = body;

    if (!token || !paymentId || !orderId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Check if sandbox bypass is requested
    if (isSandbox) {
      const updated = await giftService.markAsPaid(token, paymentId);
      if (updated) {
        return NextResponse.json({ success: true, token });
      } else {
        return NextResponse.json({ error: "Gift not found" }, { status: 404 });
      }
    }

    // Real Razorpay signature verification
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { error: "Razorpay credentials not configured on server" },
        { status: 500 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Mark gift as paid
    const updated = await giftService.markAsPaid(token, paymentId);
    
    if (updated) {
      return NextResponse.json({ success: true, token });
    } else {
      return NextResponse.json({ error: "Gift not found" }, { status: 404 });
    }

  } catch (err: any) {
    console.error("Error verifying payment signature:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
