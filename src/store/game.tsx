import React, { createContext, useContext, useMemo, useState } from "react";
import { CASE002 } from "../content/cases/case002";

export type Bucket = "billing" | "product" | "marketing";

export type PrimaryHypothesis = "stock" | "system" | "pricing" | null;

export type EvidenceCard = {
  id: string;
  title: string;
  hint: string;
  bucketHint?: Bucket;
  meaning?: string;
  why?: string;
  placedIn?: Bucket | null;
};

export type GameState = {
  // HUD
  time: string;
  trust: "Low" | "Medium" | "High";
  trustScore: number;
  xp: number;

  // Evidence
  cluesGoal: number;
  cards: EvidenceCard[];
  placedCount: number;
  committedEvidenceIds: string[];
  evidenceCommitCount: number;
  primaryHypothesis: PrimaryHypothesis;

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
  commitEvidence: (
    cardId: string,
    bucket: Bucket,
  ) => { success: boolean; reason?: string; primaryHypothesis: PrimaryHypothesis };
  getPlacedEvidenceIds: () => string[];
  hasEvidence: (evidenceId: string) => boolean;
  runSql: () => void;
  setInterviewAnswer: (questionId: string, answerId: string) => void;
  applyInterviewChoiceEffects: (opts: {
    timeCostMin: number;
    trustDelta: number;
  }) => void;
  toggleInsight: (insightId: string, max?: number) => void;

  // Reset (support both names to avoid breaking any screen)
  resetCase: () => void;
  resetGame: () => void;
};

const initialCards: EvidenceCard[] = CASE002.evidence.map((e) => ({
  id: e.id,
  title: e.title,
  hint: e.hint,
  bucketHint: e.bucketHint,
  meaning: e.meaning,
  why: e.why,
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
  const [trustScore, setTrustScore] = useState(50);
  const [cards, setCards] = useState<EvidenceCard[]>(initialCards);
  const [committedEvidenceIds, setCommittedEvidenceIds] = useState<string[]>([]);
  const [primaryHypothesis, setPrimaryHypothesis] =
    useState<PrimaryHypothesis>(null);

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

  const evidenceCommitCount = useMemo(
    () => committedEvidenceIds.length,
    [committedEvidenceIds],
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

  const trust: GameState["trust"] =
    trustScore < 40 ? "Low" : trustScore < 70 ? "Medium" : "High";

  const commitEvidence = (cardId: string, bucket: Bucket) => {
    const alreadyCommitted = committedEvidenceIds.includes(cardId);

    if (!alreadyCommitted && committedEvidenceIds.length >= 3) {
      return {
        success: false,
        reason: "limit",
        primaryHypothesis,
      } as const;
    }

    let updatedHypothesis: PrimaryHypothesis = primaryHypothesis;

    setCards((prev) => {
      const next = prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              placedIn: bucket,
            }
          : c,
      );
      updatedHypothesis = computePrimaryHypothesis(next);
      return next;
    });

    if (!alreadyCommitted) {
      setCommittedEvidenceIds((prev) => [...prev, cardId]);
      setTime((t) => spendTime(t, 1));
    }

    setPrimaryHypothesis(updatedHypothesis);

    return { success: true, primaryHypothesis: updatedHypothesis } as const;
  };

  // ✅ one reset implementation used by both resetCase & resetGame
  const doReset = () => {
    setTime(INITIAL_TIME);
    setTrustScore(50);
    setCards(initialCards.map((c) => ({ ...c, placedIn: null })));
    setCommittedEvidenceIds([]);
    setPrimaryHypothesis(null);
    setSqlRan(false);
    setInterviewAnswers({});
    setSelectedInsights([]);
  };

  const computePrimaryHypothesis = (nextCards: EvidenceCard[]): PrimaryHypothesis => {
    const tally = nextCards.reduce(
      (acc, card) => {
        if (!card.placedIn) return acc;
        acc[card.placedIn] = (acc[card.placedIn] || 0) + 1;
        return acc;
      },
      {} as Partial<Record<Bucket, number>>,
    );

    const pairs: Array<{ bucket: Bucket; count: number }> = (
      Object.keys(tally) as Bucket[]
    ).map((bucket) => ({ bucket, count: tally[bucket] ?? 0 }));

    pairs.sort((a, b) => b.count - a.count);
    if (pairs.length === 0) return null;
    if (pairs.length > 1 && pairs[0].count === pairs[1].count) return null;

    const top = pairs[0]?.bucket;
    if (!top) return null;
    if (top === "billing") return "stock";
    if (top === "product") return "system";
    if (top === "marketing") return "pricing";
    return null;
  };

  const value: GameState = useMemo(
    () => ({
      // HUD
      time,
      trust,
      trustScore,
      xp: 75,

      // Evidence
      cluesGoal: 6,
      cards,
      placedCount,
      committedEvidenceIds,
      evidenceCommitCount,
      primaryHypothesis,

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
        commitEvidence(cardId, bucket);
      },

      commitEvidence,

      getPlacedEvidenceIds: () =>
        cards.filter((c) => c.placedIn != null).map((c) => c.id),

      hasEvidence: (evidenceId) =>
        cards.some((c) => c.id === evidenceId && c.placedIn != null),

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

      applyInterviewChoiceEffects: ({ timeCostMin, trustDelta }) => {
        setTime((t) => spendTime(t, timeCostMin));
        setTrustScore((prev) =>
          Math.min(100, Math.max(0, prev + trustDelta * 10)),
        );
      },

      // both are valid now ✅
      resetCase: doReset,
      resetGame: doReset,
    }),
    [
      time,
      cards,
      trust,
      trustScore,
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
      committedEvidenceIds,
      evidenceCommitCount,
      primaryHypothesis,
    ],
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within <GameProvider />");
  return ctx;
}
