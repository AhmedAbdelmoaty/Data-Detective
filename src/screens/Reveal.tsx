import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import {
  CASE002,
  type CaseInsight,
  type CaseInterviewQuestion,
  type CaseInterviewChoice,
} from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type Suspect = "Stock" | "System" | "Pricing";

type Ending = {
  title: string;
  summary: string;
  why: string[];
  nextActions: string[];
  confidenceLabel: "High" | "Medium" | "Low";
};

export default function Reveal() {
  const game = useGame();
  const nav = useNavigate();
  const caseData = CASE002;
  const insightLibrary = caseData.insights as ReadonlyArray<CaseInsight>;
  const interviewQuestions = caseData.interviews as ReadonlyArray<CaseInterviewQuestion>;

  const placed = game.cards.filter((c) => c.placedIn);
  const insights = game.selectedInsights ?? [];
  const interviewAnswers = game.interviewAnswers ?? {};

  const { score, evidenceNotes, interviewNotes, insightNotes } = useMemo(() => {
    const s: Record<Suspect, number> = { Stock: 0, System: 0, Pricing: 0 };
    const evidenceNotesList: string[] = [];
    const interviewNotesList: string[] = [];
    const insightNotesList: string[] = [];

    const add = (k: Suspect, n: number) => {
      s[k] += n;
    };

    for (const c of placed) {
      evidenceNotesList.push(`${c.title}${c.placedIn ? ` → placed under ${c.placedIn}` : ""}`);
      switch (c.id) {
        case "branch_b_stockout":
        case "delivery_delay":
          add("Stock", 3);
          break;
        case "pos_errors":
          add("System", 3);
          break;
        case "branch_c_refunds":
        case "price_change":
          add("Pricing", 2);
          break;
        case "foot_traffic":
          add("System", 1);
          break;
        default:
          break;
      }
      if (c.placedIn === "billing") add("Stock", 1);
      if (c.placedIn === "product") add("System", 1);
      if (c.placedIn === "marketing") add("Pricing", 1);
    }

    for (const id of insights) {
      const ins = insightLibrary.find((i) => i.id === id);
      if (ins) insightNotesList.push(ins.title);
      if (id === "stock_issue") add("Stock", 3);
      if (id === "system_issue") add("System", 3);
      if (id === "pricing_issue") add("Pricing", 3);
      if (id === "stable_branch") add("Stock", 1);
    }

    Object.entries(interviewAnswers).forEach(([qid, ans]) => {
      const q = interviewQuestions.find((qq) => qq.id === qid);
      const choice = q?.choices.find((c) => c.id === ans) as CaseInterviewChoice | undefined;
      if (choice) {
        interviewNotesList.push(choice.title);
      }
      switch (ans) {
        case "stock_gap":
        case "customers_waited":
          add("Stock", 3);
          break;
        case "pos_reboots":
          add("System", 3);
          break;
        case "price_pushback":
        case "price_confusion":
          add("Pricing", 2);
          break;
        default:
          break;
      }
    });

    return { score: s, evidenceNotes: evidenceNotesList, interviewNotes: interviewNotesList, insightNotes: insightNotesList };
  }, [insightLibrary, insights, interviewAnswers, interviewQuestions, placed]);

  const ranked = (Object.keys(score) as Suspect[])
    .map((k) => ({ k, v: score[k] }))
    .sort((a, b) => b.v - a.v);
  const top = ranked[0];
  const runner = ranked[1];

  const confidenceLabel: Ending["confidenceLabel"] =
    top.v >= 6 && top.v - (runner?.v ?? 0) >= 2 ? "High" : top.v >= 4 ? "Medium" : "Low";

  const pickEnding = (): Ending => {
    if (!top || top.v === 0) {
      return {
        title: "Signals unclear",
        summary: "Clues are too thin to call a cause yet.",
        confidenceLabel: "Low",
        why: ["Scores for all suspects are tied or empty."],
        nextActions: [
          "Place more evidence and ensure each clue sits under Stock/System/Pricing.",
          "Run the Data Lab with a different metric (failed_txn or out_of_stock).",
          "Ask both witnesses to get at least two answers.",
        ],
      };
    }

    if (top.k === "Stock") {
      return {
        title: "Most likely cause: Stock outage at Branch B",
        summary: "Sales dropped where shelves were empty. Out-of-stock flags and delayed delivery point to inventory gaps.",
        confidenceLabel,
        why: [
          "Branch B stockout and delivery delay surfaced in evidence.",
          "Sales chart shows Branch B lagging while traffic is stable.",
          "Witness notes mention missed delivery or customers leaving when items were missing.",
        ],
        nextActions: [
          "Expedite replenishment for Branch B and set a shelf check at opening.",
          "Add a daily stockout alert on fast movers (simple spreadsheet works).",
          "After refill, re-run sales vs out_of_stock to confirm recovery.",
        ],
      };
    }

    if (top.k === "System") {
      return {
        title: "Most likely cause: POS / system failures",
        summary: "Failed transactions and device resets are blocking payments, especially at Branch C.",
        confidenceLabel,
        why: [
          "POS errors evidence placed under System.",
          "Failed_txn metric ranks Branch C highest.",
          "Witness mentions reboots or card timeouts.",
        ],
        nextActions: [
          "Reboot/patch the POS at Branch C and monitor failed_txn for the next hour.",
          "Set a simple retry/backup payment option while fixing devices.",
          "Re-run the Data Lab on failed_txn after the patch to confirm drop.",
        ],
      };
    }

    return {
      title: "Most likely cause: Pricing pushback",
      summary: "Refunds and complaints spike after the price change, hurting sales at Branch C.",
      confidenceLabel,
      why: [
        "Price change and refunds evidence grouped under Pricing.",
        "Witness mentions customer questions about new prices.",
        "Sales remain stable where prices didn’t shock regulars.",
      ],
      nextActions: [
        "Clarify price tags and signage; honor old price for confused customers today.",
        "Track refunds tomorrow after the clarification to see if they drop.",
        "If refunds stay high, roll back the increase for core items.",
      ],
    };
  };

  const ending = pickEnding();

  const supporting: string[] = [
    ...evidenceNotes,
    ...insightNotes,
    ...interviewNotes,
  ].filter(Boolean);

  const recoveryChecklist = [
    "Collect or reposition at least one more clue if lanes look empty.",
    "Rerun the query with another metric (try failed_txn vs out_of_stock).",
    "Ask the witness you skipped to boost confidence.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Reveal</h1>
            <p className="mt-2 text-sm text-white/70">
              Objective: present the cause, evidence, and confidence. This is your story for the shop owner.
            </p>
          </div>

          <button
            onClick={() => nav("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to HQ
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="reveal" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Time</div>
            <div className="text-lg font-semibold">{game.time}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Trust</div>
            <div className="text-lg font-semibold">{game.trust}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">Confidence</div>
            <div className="text-lg font-semibold">{ending.confidenceLabel}</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-xs uppercase tracking-widest text-white/50">Detective conclusion</div>
          <h2 className="mt-2 text-2xl font-semibold">{ending.title}</h2>
          <p className="mt-2 text-white/80">{ending.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <div className="text-xs text-emerald-200 uppercase tracking-widest">Why</div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
                {ending.why.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-widest text-white/60">Next actions</div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
                {ending.nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/60">Supporting evidence</div>
            {supporting.length ? (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
                {supporting.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-white/70">No evidence recorded. Consider placing clues and answering witnesses.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/60">Notebook</div>
            <ul className="mt-2 space-y-2 list-disc pl-5 text-xs text-white/70">
              <li>Placed clues: {game.placedCount}/{game.cluesGoal}</li>
              <li>Witness answers: {Object.keys(interviewAnswers).length}</li>
              <li>Insights: {game.selectedInsights.length}</li>
            </ul>
            {ending.confidenceLabel === "Low" && (
              <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                <div className="font-semibold text-amber-200">Recovery checklist</div>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {recoveryChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => nav("/analysis")}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to Analysis
          </button>
          <div className="text-xs text-white/60">Confidence rationale: scores {ranked.map((r) => `${r.k}:${r.v}`).join(" · ")}</div>
        </div>
      </div>
    </div>
  );
}
