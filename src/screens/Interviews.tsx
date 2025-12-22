import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import {
  CASE002,
  type CaseInterviewChoice,
  type CaseInterviewQuestion,
} from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

export default function Interviews() {
  const navigate = useNavigate();
  const game = useGame();

  const questions: readonly CaseInterviewQuestion[] = CASE002.interviews;
  const frameCopy = CASE002.interviewFrame;
  const answeredCount = Object.values(game.interviewAnswers).filter(Boolean).length;
  const canContinue = game.canEnterAnalysis; // interviewAnswersCount >= 2

  const orderedQuestions = useMemo(() => {
    const priority =
      game.primaryHypothesis === "system"
        ? ["q2_cashier", "q1_manager"]
        : game.primaryHypothesis === "pricing"
        ? ["q2_cashier", "q1_manager"]
        : ["q1_manager", "q2_cashier"];

    return [...questions].sort((a, b) => {
      const aIdx = priority.indexOf(a.id);
      const bIdx = priority.indexOf(b.id);
      return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
    });
  }, [game.primaryHypothesis, questions]);

  const interviewFocus = useMemo(() => {
    if (game.primaryHypothesis === "stock")
      return "ابدأ بالأسئلة عن التوريد والنواقص لتثبت مشكلة المخزون.";
    if (game.primaryHypothesis === "system")
      return "ابدأ بالسؤال عن أعطال الدفع أو إعادة تشغيل أجهزة POS.";
    if (game.primaryHypothesis === "pricing")
      return "ركز على أسئلة تغييرات السعر والاعتراضات أو المرتجعات.";
    return "اختر سؤالين يخلّوك تثبت أو تنفي فرضيتك.";
  }, [game.primaryHypothesis]);

  const primaryTag = useMemo(() => {
    if (game.primaryHypothesis === "stock") return "stock";
    if (game.primaryHypothesis === "system") return "system";
    if (game.primaryHypothesis === "pricing") return "pricing";
    return "";
  }, [game.primaryHypothesis]);

  const handleChoice = (
    questionId: string,
    choice: { id: string; timeCostMin: number; trustDelta: number; note?: string },
  ) => {
    if (game.interviewAnswers[questionId] === choice.id) return;
    game.applyInterviewChoiceEffects({
      timeCostMin: choice.timeCostMin,
      trustDelta: choice.trustDelta,
    });
    game.setInterviewAnswer(questionId, choice.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">الشهود</h1>
            <p className="mt-2 text-sm text-white/70">
              الهدف: جاوب على <b>٢</b> أسئلة لفتح التحليل. الأسئلة الأعمق تكلف وقت أكتر لكن ممكن تزود الثقة.
            </p>
            <p className="mt-2 text-xs text-white/60">إجابات: {answeredCount}/2</p>
            <p className="mt-2 text-sm text-emerald-200">{interviewFocus}</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <div className="font-semibold">ليه الثقة مهمة؟</div>
              <p className="mt-1">{frameCopy}</p>
              <p className="mt-1 text-xs text-white/60">الأسئلة المفصلة = وقت أطول. اختار اللي يدعم فرضيتك.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to HQ
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="interviews" />
        </div>

        <div className="mt-8 space-y-6">
          {orderedQuestions.map((q, idx) => {
            const selected = game.interviewAnswers[q.id];
            const selectedChoice = q.choices.find((c) => c.id === selected);
            const isPriority = idx === 0 && !!primaryTag;

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{q.header}</h2>
                    <p className="mt-1 text-sm text-white/70">{q.question}</p>
                    {isPriority && (
                      <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-100">
                        أولوية بحسب فرضيتك
                      </div>
                    )}
                    {q.persona && (
                      <div className="mt-2 text-xs text-white/70">
                        <b>{q.persona.role}</b> — {q.persona.vibe}
                        <div className="mt-1 text-[11px] text-white/60">
                          You need: {q.persona.youNeed}
                        </div>
                      </div>
                    )}
                    <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
                      اختر الإجابة اللي تدعم مخزون / سيستم / تسعير حسب فرضيتك.
                    </p>
                  </div>

                  <div className="text-xs text-white/60 text-right">
                    Selected:{" "}
                    <span className={selected ? "text-emerald-300" : "text-white/60"}>
                      {selectedChoice ? selectedChoice.title : "—"}
                    </span>
                    {selectedChoice?.note && (
                      <div className="mt-1 text-[11px] text-white/60">Notebook: {selectedChoice.note}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {q.choices.map((c: CaseInterviewChoice) => {
                    const active = selected === c.id;
                    const unlocked =
                      !c.requiresEvidenceIds ||
                      c.requiresEvidenceIds.some((id: string) => game.hasEvidence(id));
                    if (!unlocked) return null;

                    const trustChip = `${c.trustDelta >= 0 ? "+" : ""}${c.trustDelta}`;
                    const relevant = primaryTag
                      ? c.tag.toLowerCase().includes(primaryTag)
                      : false;

                    return (
                      <button
                        key={c.id}
                        onClick={() => handleChoice(q.id, c)}
                        className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                          active
                            ? "border-emerald-400/40 bg-emerald-400/10"
                            : "border-white/10 bg-black/20 hover:bg-black/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{c.title}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                              <span className="rounded-full bg-white/10 px-2 py-1">-{c.timeCostMin} min</span>
                              <span className="rounded-full bg-white/10 px-2 py-1">Trust {trustChip}</span>
                              {relevant && (
                                <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-1 text-emerald-100">
                                  أنسب لفرضيتك
                                </span>
                              )}
                              {c.note && (
                                <span className="rounded-full bg-white/10 px-2 py-1">Notebook: {c.note}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-white/60">{c.tag}</div>
                        </div>
                        <p className="mt-2 text-xs text-white/60">Why this costs time: more detail = longer chat.</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/sql")}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to Data Lab
          </button>

          <button
            onClick={() => navigate("/analysis")}
            disabled={!canContinue}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              canContinue ? "bg-white text-black hover:bg-white/90" : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
            title={canContinue ? "Continue" : "Answer two questions first"}
          >
            Continue → Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
