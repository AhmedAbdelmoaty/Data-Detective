import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";

type ResultRow = { metric: string; value: string };

export default function SQLLab() {
  const navigate = useNavigate();
  const game = useGame();

  const [query, setQuery] = useState(
    "SELECT *\nFROM payments\nWHERE status = 'failed';"
  );

  const results: ResultRow[] = useMemo(
    () => [
      { metric: "checkout_504_errors", value: "+38%" },
      { metric: "refunds", value: "+22%" },
      { metric: "revenue", value: "-18%" },
    ],
    []
  );

  const canContinue = game.canEnterInterviews; // = canEnterSQL && sqlRan

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">SQL Lab</h1>
            <p className="mt-1 text-sm text-white/70">Objective: شغّل استعلام واحد يفتح Interviews ويثبت فرضيتك.</p>
            <p className="mt-2 text-sm text-white/70">
              بعد ما تعمل <b>Run Query</b> هيتفتح <b>Interviews</b>.
            </p>
            <p className="mt-2 text-xs text-white/60">
              Progress: {game.placedCount}/{game.cluesGoal} clues
            </p>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to HQ
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">Query Editor</h2>
            <div className="text-xs text-white/60">
              SQL:{" "}
              <span className={game.sqlRan ? "text-emerald-300" : "text-white/60"}>
                {game.sqlRan ? "✅ run" : "not run"}
              </span>
            </div>
          </div>

          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="mt-3 h-40 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-4 font-mono text-sm text-white outline-none focus:border-white/20"
          />

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => game.runSql()}
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
            >
              Run Query
            </button>

            <button
              onClick={() => navigate("/interviews")}
              disabled={!canContinue}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                canContinue
                  ? "bg-white/10 text-white hover:bg-white/15"
                  : "cursor-not-allowed bg-white/5 text-white/40"
              }`}
              title={
                canContinue
                  ? "Continue"
                  : "لازم تعمل Run Query الأول"
              }
            >
              Continue → Interviews
            </button>

            <div className="ml-auto text-xs text-white/60">
              * النتائج Prototype — المهم هنا هو unlock بعد “Run Query”.
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">
              Results (Prototype)
            </h3>
            <span className="text-xs text-white/60">
              {game.sqlRan ? "Query executed" : "Run Query to reveal"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {results.map((r) => (
              <div
                key={r.metric}
                className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3"
              >
                <span className="font-mono text-sm text-white/90">{r.metric}</span>
                <span className="text-sm font-semibold">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
