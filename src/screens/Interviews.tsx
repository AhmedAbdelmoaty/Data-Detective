import React from "react";
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
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">الشهود</h1>
            <p className="mt-2 text-sm text-white/70">
              الهدف: أجب على <b>٢</b> سؤالين لفتح <b>التحليل</b>. الأسئلة الأعمق تستهلك وقتًا أكثر لكنها قد ترفع الثقة.
            </p>
            <p className="mt-2 text-xs text-white/60">أُجيبت: {answeredCount}/2</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <div className="font-semibold">لماذا الثقة مهمة</div>
              <p className="mt-1">{frameCopy}</p>
              <p className="mt-1 text-xs text-white/60">التحقيق الأعمق يأخذ وقتًا أطول — اختر متى تصرف الدقائق.</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            رجوع إلى المقر
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="interviews" />
        </div>

        <div className="mt-8 space-y-6">
          {questions.map((q) => {
            const selected = game.interviewAnswers[q.id];
            const selectedChoice = q.choices.find((c) => c.id === selected);

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{q.header}</h2>
                    <p className="mt-1 text-sm text-white/70">{q.question}</p>
                    {q.persona && (
                      <div className="mt-2 text-xs text-white/70">
                        <b>{q.persona.role}</b> — {q.persona.vibe}
                        <div className="mt-1 text-[11px] text-white/60">
                          تحتاج إلى: {q.persona.youNeed}
                        </div>
                      </div>
                    )}
                    <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
                      خيط التحقيق: أي إجابة تميل للمخزون / النظام / التسعير؟
                    </p>
                  </div>

                  <div className="text-xs text-white/60 text-right">
                    المختار:{" "}
                    <span className={selected ? "text-emerald-300" : "text-white/60"}>
                      {selectedChoice ? selectedChoice.title : "—"}
                    </span>
                    {selectedChoice?.note && (
                      <div className="mt-1 text-[11px] text-white/60">دفتر الملاحظات: {selectedChoice.note}</div>
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

                    return (
                      <button
                        key={c.id}
                        onClick={() => handleChoice(q.id, c)}
                        className={`w-full rounded-2xl border px-5 py-4 text-right transition ${
                          active
                            ? "border-emerald-400/40 bg-emerald-400/10"
                            : "border-white/10 bg-black/20 hover:bg-black/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="font-semibold">{c.title}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                              <span className="rounded-full bg-white/10 px-2 py-1">-{c.timeCostMin} دقيقة</span>
                              <span className="rounded-full bg-white/10 px-2 py-1">الثقة {trustChip}</span>
                              {c.note && (
                                <span className="rounded-full bg-white/10 px-2 py-1">دفتر: {c.note}</span>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-white/60">{c.tag}</div>
                        </div>
                        <p className="mt-2 text-xs text-white/60">لماذا يستهلك وقتًا: تفاصيل أكثر = حديث أطول.</p>
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
            ← رجوع إلى مختبر البيانات
          </button>

          <button
            onClick={() => navigate("/analysis")}
            disabled={!canContinue}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              canContinue ? "bg-white text-black hover:bg-white/90" : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
            title={canContinue ? "متابعة" : "أجب على سؤالين أولًا"}
          >
            متابعة ← التحليل
          </button>
        </div>
      </div>
    </div>
  );
}
