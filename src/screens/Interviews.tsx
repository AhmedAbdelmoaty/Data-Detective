import React from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import {
  CASE001,
  type CaseInterviewChoice,
  type CaseInterviewQuestion,
} from "../content/cases/case001";

export default function Interviews() {
  const navigate = useNavigate();
  const game = useGame();

  const questions: readonly CaseInterviewQuestion[] = CASE001.interviews;
  const frameCopy = CASE001.interviewFrame;
  const answeredCount = Object.values(game.interviewAnswers).filter(Boolean).length;
  const canContinue = game.canEnterAnalysis; // interviewAnswersCount >= 2

  const handleChoice = (
    questionId: string,
    choice: { id: string; timeCostMin: number; trustDelta: number },
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
            <h1 className="text-3xl font-semibold">Interviews</h1>
            <p className="mt-2 text-sm text-white/70">
              Objective: جاوب على <b>2</b> أسئلة علشان يتفتح <b>Analysis Room</b> مع مراعاة Time/Trust.
            </p>
            <p className="mt-2 text-xs text-white/60">Answered: {answeredCount}/2</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <div className="font-semibold">Trust معناها إيه هنا؟</div>
              <p className="mt-1">
                {frameCopy}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to HQ
          </button>
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
                          بتحاول تطلع منه: {q.persona.youNeed}
                        </div>
                      </div>
                    )}
                    <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
                      Investigation Thread: أي إجابة تثبت/تنفي مسار التسعير، الدفع، أو التسويق؟
                    </p>
                  </div>

                  <div className="text-xs text-white/60">
                    Selected:{" "}
                    <span className={selected ? "text-emerald-300" : "text-white/60"}>
                      {selectedChoice ? selectedChoice.title : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {q.choices.map((c: CaseInterviewChoice) => {
                    const active = selected === c.id;
                    const unlocked =
                      !c.requiresEvidenceIds ||
                      c.requiresEvidenceIds.some((id: string) =>
                        game.hasEvidence(id),
                      );
                    if (!unlocked) return null;

                    const trustChip = `${c.trustDelta >= 0 ? "+" : ""}${c.trustDelta}`;

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
                              <span className="rounded-full bg-white/10 px-2 py-1">
                                Trust {trustChip}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-white/60">{c.tag}</div>
                        </div>
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
            ← Back to SQL
          </button>

          <button
            onClick={() => navigate("/analysis")}
            disabled={!canContinue}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              canContinue
                ? "bg-white text-black hover:bg-white/90"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
            title={canContinue ? "Continue" : "جاوب على سؤالين الأول"}
          >
            Continue → Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
