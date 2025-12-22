import React, { createContext, useContext, useMemo, useState } from "react";
import { CASE002 } from "../content/cases/case002";

export type Bucket = "billing" | "product" | "marketing";

export type EvidenceCard = {
  id: string;
  title: string;
  hint: string;
  bucketHint?: Bucket;
  meaning?: string;
  why?: string;
  pointsToward?: string;
  interpretations?: typeof CASE002.evidence[number]["interpretations"];
  interpretation?: {
    interpretationId: string;
    category: Bucket;
    confidence: "low" | "medium" | "high";
  };
  placedIn?: Bucket | null;
};

export type GameState = {
  // HUD
  time: string;
  trust: "Low" | "Medium" | "High";
  trustScore: number;
  xp: number;
  notebook: string[];
  forcedSqlAccess: boolean;

  // Evidence
  cluesGoal: number;
  cards: EvidenceCard[];
  placedCount: number;

  // SQL / Interviews / Analysis
  sqlRan: boolean;
  sqlInterpretation?: { questionId: string; interpretationId: string; flag: string } | null;
  sqlFlags: Record<string, boolean>;
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
  interpretCard: (opts: {
    cardId: string;
    interpretationId: string;
    confidence: "low" | "medium" | "high";
  }) => void;
  getPlacedEvidenceIds: () => string[];
  hasEvidence: (evidenceId: string) => boolean;
  runSql: () => void;
  applySqlInterpretation: (opts: {
    questionId: string;
    interpretationId: string;
    note: string;
    trustDelta?: number;
    flag: string;
  }) => void;
  setInterviewAnswer: (questionId: string, answerId: string) => void;
  applyInterviewChoiceEffects: (opts: {
    timeCostMin: number;
    trustDelta: number;
    notebookEntry?: string;
  }) => void;
  toggleInsight: (insightId: string, max?: number) => void;

  // Reset (support both names to avoid breaking any screen)
  resetCase: () => void;
  resetGame: () => void;
  proceedLowConfidence: (opts: { timeCostMin: number }) => void;
};

const initialCards: EvidenceCard[] = CASE002.evidence.map((e) => ({
  id: e.id,
  title: e.title,
  hint: e.hint,
  bucketHint: e.bucketHint,
  meaning: e.meaning,
  why: e.why,
  pointsToward: e.pointsToward,
  interpretations: e.interpretations,
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
  const [notebook, setNotebook] = useState<string[]>([]);
  const [cards, setCards] = useState<EvidenceCard[]>(initialCards);
  const [forcedSqlAccess, setForcedSqlAccess] = useState(false);

  const [sqlRan, setSqlRan] = useState(false);
  const [sqlInterpretation, setSqlInterpretation] = useState<{
    questionId: string;
    interpretationId: string;
    flag: string;
  } | null>(null);
  const [sqlFlags, setSqlFlags] = useState<Record<string, boolean>>({});
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>(
    {},
  );
  const [selectedInsights, setSelectedInsights] = useState<string[]>([]);

  // ✅ Derived counts
  const placedCount = useMemo(
    () => cards.filter((c) => Boolean(c.interpretation)).length,
    [cards],
  );

  const categoryCounts = useMemo(() => {
    return cards.reduce<Record<Bucket, number>>(
      (acc, card) => {
        if (card.interpretation?.category) {
          acc[card.interpretation.category] += 1;
        }
        return acc;
      },
      { billing: 0, product: 0, marketing: 0 },
    );
  }, [cards]);

  const interviewAnswersCount = useMemo(
    () => Object.keys(interviewAnswers).length,
    [interviewAnswers],
  );

  const selectedInsightsCount = useMemo(
    () => selectedInsights.length,
    [selectedInsights],
  );

  // --- Unlock rules ---
  const hasCategoryConsistency = Object.values(categoryCounts).some((c) => c >= 2);
  const canEnterSQL = (placedCount >= 3 && hasCategoryConsistency) || forcedSqlAccess;
  const canEnterInterviews = canEnterSQL && sqlRan;
  const canEnterAnalysis = canEnterInterviews && interviewAnswersCount >= 2;
  const canReveal = canEnterAnalysis && selectedInsightsCount >= 2;

  const trust: GameState["trust"] =
    trustScore < 40 ? "Low" : trustScore < 70 ? "Medium" : "High";

  // ✅ one reset implementation used by both resetCase & resetGame
  const doReset = () => {
    setTime(INITIAL_TIME);
    setTrustScore(50);
    setCards(initialCards.map((c) => ({ ...c, placedIn: null, interpretation: undefined })));
    setSqlRan(false);
    setSqlInterpretation(null);
    setSqlFlags({});
    setInterviewAnswers({});
    setSelectedInsights([]);
    setNotebook([]);
    setForcedSqlAccess(false);
  };

  const value: GameState = useMemo(
    () => ({
      // HUD
      time,
      trust,
      trustScore,
      xp: 75,
      notebook,
      forcedSqlAccess,

      // Evidence
      cluesGoal: 6,
      cards,
      placedCount,

      // SQL / Interviews / Analysis
      sqlRan,
      sqlInterpretation,
      sqlFlags,
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
                  interpretation: {
                    interpretationId: "placement",
                    category: bucket,
                    confidence: "medium",
                  },
                }
              : c,
          ),
        );

        // ✅ spend 1 minute per evidence placement
        setTime((t) => spendTime(t, 1));
      },

      getPlacedEvidenceIds: () =>
        cards.filter((c) => c.placedIn != null).map((c) => c.id),

      hasEvidence: (evidenceId) =>
        cards.some((c) => c.id === evidenceId && c.placedIn != null),

      interpretCard: ({ cardId, interpretationId, confidence }) => {
        setCards((prev) =>
          prev.map((c) => {
            if (c.id !== cardId) return c;
            const interpretations = c.interpretations as
              | ReadonlyArray<{ id: string; category: Bucket; text: string }>
              | undefined;
            const match = interpretations?.find((i) => i.id === interpretationId);
            if (!match) return c;
            const confidenceCost = confidence === "high" ? 2 : 1;
            setTime((t) => spendTime(t, confidenceCost));
            setNotebook((notes) => [
              ...notes,
              `فسّرت الدليل: ${c.title} (التصنيف: ${match.category === "billing" ? "المخزون" : match.category === "product" ? "النظام" : "التسعير"}، الثقة: ${
                confidence === "high" ? "مرتفع" : confidence === "medium" ? "متوسط" : "منخفض"
              })`,
            ]);
            return {
              ...c,
              interpretation: {
                interpretationId,
                category: match.category,
                confidence,
              },
              placedIn: match.category,
            };
          }),
        );
      },

      runSql: () => setSqlRan(true),

      applySqlInterpretation: ({
        questionId,
        interpretationId,
        note,
        trustDelta = 0,
        flag,
      }) => {
        setNotebook((prev) => [...prev, note]);
        if (trustDelta !== 0) {
          setTrustScore((prev) =>
            Math.min(100, Math.max(0, prev + trustDelta)),
          );
        }
        setSqlFlags((prev) => ({ ...prev, [flag]: true }));
        setSqlInterpretation({ questionId, interpretationId, flag });
      },

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

      applyInterviewChoiceEffects: ({ timeCostMin, trustDelta, notebookEntry }) => {
        setTime((t) => spendTime(t, timeCostMin));
        setTrustScore((prev) =>
          Math.min(100, Math.max(0, prev + trustDelta * 10)),
        );
        if (notebookEntry) {
          setNotebook((prev) => [...prev, notebookEntry]);
        }
      },

      proceedLowConfidence: ({ timeCostMin }) => {
        setForcedSqlAccess(true);
        setTime((t) => spendTime(t, timeCostMin));
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
      notebook,
      sqlInterpretation,
      sqlFlags,
      forcedSqlAccess,
    ],
  );

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used within <GameProvider />");
  return ctx;
}
