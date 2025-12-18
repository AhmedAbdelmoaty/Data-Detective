import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE001 } from "../content/cases/case001";

type InterviewChoice = {
  id: string;
  title: string;
  tag: string;
};

type InterviewQ = {
  id: string;
  header: string;
  question: string;
  choices: InterviewChoice[];
};

export default function Interviews() {
  const navigate = useNavigate();
  const game = useGame();

  const questions = CASE001.interviews;
  const answeredCount = Object.values(game.interviewAnswers).filter(Boolean).length;
  const canContinue = game.canEnterAnalysis; // interviewAnswersCount >= 2

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Interviews</h1>
            <p className="mt-2 text-sm text-white/70">
              الهدف: تجاوب على <b>2</b> أسئلة علشان يتفتح <b>Analysis Room</b>.
            </p>
            <p className="mt-2 text-xs text-white/60">Answered: {answeredCount}/2</p>
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

            return (
              <div
                key={q.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{q.header}</h2>
                    <p className="mt-1 text-sm text-white/70">{q.question}</p>
                  </div>

                  <div className="text-xs text-white/60">
                    Selected:{" "}
                    <span className={selected ? "text-emerald-300" : "text-white/60"}>
                      {selected ? selected : "—"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {q.choices.map((c) => {
                    const active = selected === c.id;
                    return (
                      <button
                        key={c.id}
                        onClick={() => game.setInterviewAnswer(q.id, c.id)}
                        className={`w-full rounded-2xl border px-5 py-4 text-left transition ${
                          active
                            ? "border-emerald-400/40 bg-emerald-400/10"
                            : "border-white/10 bg-black/20 hover:bg-black/30"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="font-semibold">{c.title}</div>
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
