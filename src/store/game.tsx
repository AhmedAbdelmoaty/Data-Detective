// src/store/game.tsx
import React, { createContext, useContext, useMemo, useState } from "react";

type BoardBucket = "billing" | "product" | "marketing";

export type EvidenceCard = {
  id: string;
  title: string;
  hint: string;
  placedIn?: BoardBucket;
};

type GameState = {
  time: string; // simple display timer string for now
  trust: "Low" | "Medium" | "High";
  xp: number;
  cluesGoal: number;

  // Evidence
  cards: EvidenceCard[];

  // Derived progress
  placedCount: number;
  canEnterSQL: boolean;
  canEnterInterviews: boolean;
  canEnterAnalysis: boolean;
  canReveal: boolean;

  // Actions
  placeCard: (id: string, bucket: BoardBucket) => void;
  reset: () => void;
};

const initialCards: EvidenceCard[] = [
  { id: "refunds", title: "Spike in Refunds", hint: "زادت Refunds بشكل غير طبيعي." },
  { id: "checkout504", title: "Checkout Error 504", hint: "Errors ارتفعت على خطوة الدفع." },
  { id: "cpcjump", title: "Paid Ads CPC Jump", hint: "CPC زاد بشكل واضح." },
  { id: "pricing", title: "New Pricing Plan Complaints", hint: "شكاوى بعد تغيير الـ Pricing." },
  { id: "adoption", title: "Feature Adoption Drop", hint: "Usage قل بعد Update." },
  { id: "lpconv", title: "Landing Page Conversion Down", hint: "Conversion قل بعد تحديث." },
];

const GameCtx = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [cards, setCards] = useState<EvidenceCard[]>(initialCards);

  const placedCount = useMemo(
    () => cards.filter((c) => Boolean(c.placedIn)).length,
    [cards]
  );

  // “Unlock” rules بسيطة جدًا مؤقتًا:
  // - SQL يفتح بعد ما تحط 3 كروت
  // - Interviews بعد SQL (هنفترض OK لما SQL يفتح)
  // - Analysis بعد 5 كروت
  // - Reveal بعد 6 كروت
  const canEnterSQL = placedCount >= 3;
  const canEnterInterviews = canEnterSQL;
  const canEnterAnalysis = placedCount >= 5;
  const canReveal = placedCount >= 6;

  const value: GameState = useMemo(
    () => ({
      time: "09:40",
      trust: "Medium",
      xp: 75,
      cluesGoal: 6,

      cards,

      placedCount,
      canEnterSQL,
      canEnterInterviews,
      canEnterAnalysis,
      canReveal,

      placeCard: (id, bucket) => {
        setCards((prev) =>
          prev.map((c) => (c.id === id ? { ...c, placedIn: bucket } : c))
        );
      },

      reset: () => setCards(initialCards),
    }),
    [cards, placedCount, canEnterSQL, canEnterInterviews, canEnterAnalysis, canReveal]
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within <GameProvider>");
  return ctx;
}
