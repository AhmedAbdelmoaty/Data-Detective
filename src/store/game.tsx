import React, { createContext, useContext, useMemo, useState } from "react";
import { CASE001 } from "../content/cases/case001";

export type Bucket = "billing" | "product" | "marketing";

export type EvidenceCard = {
  id: string;
  title: string;
  hint: string;
  bucketHint?: Bucket;
  placedIn?: Bucket | null;
};

export type GameState = {
  // HUD
  time: string;
  trust: "Low" | "Medium" | "High";
  xp: number;

  // Evidence
  cluesGoal: number;
  cards: EvidenceCard[];
  placedCount: number;

  // SQL / Interviews / Analysis
  sqlRan: boolean;
  interviewAnswers: Record<string, string>;
  selectedInsights: string[];

  // Derived unlocks
  interviewAnswersCount: number;
  selectedInsightsCount: number;
  canEnterSQL: boolean;
  canEnterInterviews: boolean;
  canEnterAnalysis: boolean;
  canReveal: boolean;

  // Actions
  placeCard: (cardId: string, bucket: Bucket) => void;
  runSql: () => void;
  setInterviewAnswer: (questionId: string, answerId: string) => void;
  toggleInsight: (insightId: string, max?: number) => void;

  // Reset (support both names to avoid breaking any screen)
  resetCase: () => void;
  resetGame: () => void;
};

const initialCards: EvidenceCard[] = CASE001.evidence.map((e) => ({
  id: e.id,
  title: e.title,
  hint: e.hint,
  bucketHint: e.bucketHint,
  placedIn: null,
}));

const INITIAL_TIME = "09:40";

// ✅ helper: subtract minutes safely from "HH:MM"
function spendTime(prev: string, minutes: number) {
  const [hh, mm] = prev.split(":").map(Number);
  const total = hh * 60 + mm - minutes;
  const clamped = Math.max(total, 0);
  const nh = String(Math.floor(clamped / 60)).padStart(2, "0");
  const nm = String(clamped % 60).padStart(2, "0");
  return `${nh}:${nm}`;
}

const GameCtx = createContext<GameState | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  // ✅ State
  const [time, setTime] = useState(INITIAL_TIME);
  const [cards, setCards] = useState<EvidenceCard[]>(initialCards);

  const [sqlRan, setSqlRan] = useState(false);
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>(
    {},
  );
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);

  // ✅ Derived counts
  const placedCount = useMemo(
    () => cards.filter((c) => Boolean(c.placedIn)).length,
    [cards],
  );

  const interviewAnswersCount = useMemo(
    () => Object.keys(interviewAnswers).length,
    [interviewAnswers],
  );

  const selectedInsightsCount = useMemo(
    () => selectedInsights.length,
    [selectedInsights],
  );

  // --- Unlock rules ---
  const canEnterSQL = placedCount >= 3;
  const canEnterInterviews = canEnterSQL && sqlRan;
  const canEnterAnalysis = canEnterInterviews && interviewAnswersCount >= 2;
  const canReveal = canEnterAnalysis && selectedInsightsCount >= 2;

  // ✅ one reset implementation used by both resetCase & resetGame
  const doReset = () => {
    setTime(INITIAL_TIME);
    setCards(initialCards.map((c) => ({ ...c, placedIn: null })));
    setSqlRan(false);
    setInterviewAnswers({});
    setSelectedInsights([]);
  };

  const value: GameState = useMemo(
    () => ({
      // HUD
      time,
      trust: "Medium",
      xp: 75,

      // Evidence
      cluesGoal: 6,
      cards,
      placedCount,

      // SQL / Interviews / Analysis
      sqlRan,
      interviewAnswers,
      selectedInsights,

      // Derived
      interviewAnswersCount,
      selectedInsightsCount,

      canEnterSQL,
      canEnterInterviews,
      canEnterAnalysis,
      canReveal,

      // Actions
      placeCard: (cardId, bucket) => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  placedIn: bucket,
                }
              : c,
          ),
        );

        // ✅ spend 1 minute per evidence placement
        setTime((t) => spendTime(t, 1));
      },

      runSql: () => setSqlRan(true),

      setInterviewAnswer: (questionId, answerId) => {
        setInterviewAnswers((prev) => ({
          ...prev,
          [questionId]: answerId,
        }));
      },

      toggleInsight: (insightId, max = 2) => {
        setSelectedInsights((prev) => {
          const has = prev.includes(insightId);
          if (has) return prev.filter((x) => x !== insightId);
          if (prev.length >= max) return prev; // block extra picks
          return [...prev, insightId];
        });
      },

      // both are valid now ✅
      resetCase: doReset,
      resetGame: doReset,
    }),
    [
      time,
      cards,
      placedCount,
      sqlRan,
      interviewAnswers,
      selectedInsights,
      interviewAnswersCount,
      selectedInsightsCount,
      canEnterSQL,
      canEnterInterviews,
      canEnterAnalysis,
      canReveal,
    ],
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within <GameProvider />");
  return ctx;
}
