import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE001 } from "../content/cases/case001";
type Insight = {
  id: string;
  title: string;
  desc: string;
};

export default function AnalysisRoom() {
  const navigate = useNavigate();
  const game = useGame();

  const insights = CASE001.insights;

  const pickedCount = game.selectedInsights.length;
  const canContinue = game.canReveal; // selectedInsightsCount>=2 && canEnterAnalysis

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Analysis Room</h1>
            <p className="mt-2 text-sm text-white/70">
              Objective: اختار على الأقل <b>2 Insights</b> قبل ما تروح <b>Reveal</b> لتثبيت السردية.
            </p>
            <p className="mt-2 text-xs text-white/60">Picked: {pickedCount}/2</p>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to HQ
          </button>
        </div>

        <div className="mt-8 space-y-4">
          {insights.map((i) => {
            const active = game.selectedInsights.includes(i.id);

            return (
              <button
                key={i.id}
                onClick={() => game.toggleInsight(i.id, 3)}
                className={`w-full rounded-2xl border p-6 text-left transition ${
                  active
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">{i.title}</div>
                    <div className="mt-1 text-sm text-white/70">{i.desc}</div>
                  </div>
                  <div className="text-xs text-white/60">
                    Picked:{" "}
                    <span className={active ? "text-emerald-300" : "text-white/60"}>
                      {active ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="text-sm text-white/80 hover:text-white"
          >
            ← Back to Interviews
          </button>

          <button
            onClick={() => navigate("/reveal")}
            disabled={!canContinue}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              canContinue
                ? "bg-white text-black hover:bg-white/90"
                : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
            title={canContinue ? "Continue" : "اختار 2 Insights الأول"}
          >
            Continue → Reveal
          </button>
        </div>
      </div>
    </div>
  );
}
