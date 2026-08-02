import { db } from "./db";
import fs from "fs";
import path from "path";

export interface Gift {
  id: string;
  token: string;
  senderName: string;
  receiverName: string;
  language: string;
  relationship: string;
  message1: string;
  message2: string;
  message3: string;
  photos: string; // Serialized JSON string of image URLs
  unlockQuestion: string;
  unlockAnswer: string;
  gameType: string;
  wordPuzzle: string; // JSON string of word search clues/answers
  triviaQuiz: string; // JSON string of trivia questions/options
  paid: boolean;
  paymentId: string | null;
  orderId: string | null;
  opened: boolean;
  openedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// Fallback JSON database file path
const FALLBACK_DB_PATH = path.join(process.cwd(), "gifts_fallback.json");

// Helper to read fallback DB
function readFallbackDb(): Gift[] {
  try {
    if (!fs.existsSync(FALLBACK_DB_PATH)) {
      return [];
    }
    const data = fs.readFileSync(FALLBACK_DB_PATH, "utf8");
    const parsed = JSON.parse(data);
    return parsed.map((g: any) => ({
      ...g,
      openedAt: g.openedAt ? new Date(g.openedAt) : null,
      createdAt: new Date(g.createdAt),
      updatedAt: new Date(g.updatedAt),
    }));
  } catch (err) {
    console.error("Error reading fallback JSON database:", err);
    return [];
  }
}

// Helper to write fallback DB
function writeFallbackDb(gifts: Gift[]): void {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(gifts, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing fallback JSON database:", err);
  }
}

export const giftService = {
  async createGift(data: {
    senderName: string;
    receiverName: string;
    language: string;
    relationship: string;
    message1: string;
    message2: string;
    message3: string;
    photos: string[];
    unlockQuestion?: string;
    unlockAnswer?: string;
    gameType?: string;
    wordPuzzle?: string;
    triviaQuiz?: string;
    orderId?: string;
  }): Promise<Gift> {
    const token = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
    const id = crypto.randomUUID();
    const photosString = JSON.stringify(data.photos);

    const giftRecord: Omit<Gift, "createdAt" | "updatedAt"> = {
      id,
      token,
      senderName: data.senderName,
      receiverName: data.receiverName,
      language: data.language,
      relationship: data.relationship,
      message1: data.message1,
      message2: data.message2,
      message3: data.message3,
      photos: photosString,
      unlockQuestion: data.unlockQuestion || "",
      unlockAnswer: data.unlockAnswer || "",
      gameType: data.gameType || "heart_slider",
      wordPuzzle: data.wordPuzzle || "[]",
      triviaQuiz: data.triviaQuiz || "[]",
      paid: false,
      paymentId: null,
      orderId: data.orderId || null,
      opened: false,
      openedAt: null,
    };

    if (db) {
      try {
        const created = await db.gift.create({
          data: {
            ...giftRecord,
            photos: photosString,
          },
        });
        return created as unknown as Gift;
      } catch (err) {
        console.error("Prisma create failed, falling back to JSON storage:", err);
      }
    }

    // Fallback mode
    const gifts = readFallbackDb();
    const fullRecord: Gift = {
      ...giftRecord,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    gifts.push(fullRecord);
    writeFallbackDb(gifts);
    return fullRecord;
  },

  async getGiftByToken(token: string): Promise<Gift | null> {
    if (db) {
      try {
        const found = await db.gift.findUnique({
          where: { token },
        });
        if (found) return found as unknown as Gift;
      } catch (err) {
        console.error("Prisma query failed, falling back to JSON storage:", err);
      }
    }

    // Fallback mode
    const gifts = readFallbackDb();
    return gifts.find((g) => g.token === token) || null;
  },

  async getGiftByOrderId(orderId: string): Promise<Gift | null> {
    if (db) {
      try {
        const found = await db.gift.findFirst({
          where: { orderId },
        });
        if (found) return found as unknown as Gift;
      } catch (err) {
        console.error("Prisma order query failed, falling back to JSON storage:", err);
      }
    }

    const gifts = readFallbackDb();
    return gifts.find((g) => g.orderId === orderId) || null;
  },

  async markAsPaid(token: string, paymentId: string): Promise<Gift | null> {
    if (db) {
      try {
        const updated = await db.gift.update({
          where: { token },
          data: {
            paid: true,
            paymentId,
          },
        });
        return updated as unknown as Gift;
      } catch (err) {
        console.error("Prisma update failed, falling back to JSON storage:", err);
      }
    }

    // Fallback mode
    const gifts = readFallbackDb();
    const index = gifts.findIndex((g) => g.token === token);
    if (index !== -1) {
      gifts[index].paid = true;
      gifts[index].paymentId = paymentId;
      gifts[index].updatedAt = new Date();
      writeFallbackDb(gifts);
      return gifts[index];
    }
    return null;
  },

  async markAsOpened(token: string): Promise<Gift | null> {
    if (db) {
      try {
        const updated = await db.gift.update({
          where: { token },
          data: {
            opened: true,
            openedAt: new Date(),
          },
        });
        return updated as unknown as Gift;
      } catch (err) {
        console.error("Prisma opened update failed, falling back to JSON storage:", err);
      }
    }

    // Fallback mode
    const gifts = readFallbackDb();
    const index = gifts.findIndex((g) => g.token === token);
    if (index !== -1) {
      gifts[index].opened = true;
      gifts[index].openedAt = new Date();
      gifts[index].updatedAt = new Date();
      writeFallbackDb(gifts);
      return gifts[index];
    }
    return null;
  },
};
