import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type ResultRow = { metric: string; value: string };
type QueryResult = {
  headline: string;
  suspect: "Stock" | "System" | "Pricing" | "Mixed";
  branches: string;
  next: string;
};

const metricOptions = [
  { key: "sales", label: "sales", helper: "Compare total sales" },
  { key: "failed_txn", label: "failed_txn", helper: "See failed payments" },
  { key: "out_of_stock", label: "out_of_stock", helper: "Check stockouts" },
] as const;

export default function SQLLab() {
  const navigate = useNavigate();
  const game = useGame();
  const caseData = CASE002;

  const [metric, setMetric] = useState<(typeof metricOptions)[number]["key"]>("sales");
  const [direction, setDirection] = useState<"ASC" | "DESC">("ASC");
  const [result, setResult] = useState<QueryResult | null>(null);

  const queryTemplate = caseData.sqlQuery
    .replace("{metric}", metric)
    .replace("{direction}", direction);

  const dataset = caseData.salesDataset;

  const results: ResultRow[] = useMemo(() => {
    const thisWeek = dataset.filter((row) => row.week === "this_week");
    const byMetric = thisWeek.map((row) => {
      const value =
        metric === "sales" ? row.sales : metric === "failed_txn" ? row.failed_txn : row.out_of_stock;
      return { branch: row.branch, value };
    });

    const sorted = [...byMetric].sort((a, b) =>
      direction === "ASC" ? a.value - b.value : b.value - a.value,
    );

    return sorted.map((row) => ({ metric: `Branch ${row.branch}`, value: String(row.value) }));
  }, [dataset, direction, metric]);

  const interpret = (selMetric: QueryResult["suspect"], note: string, branches: string): QueryResult => ({
    headline: note,
    suspect: selMetric,
    branches,
    next:
      selMetric === "Stock"
        ? "Ask the Store Manager if deliveries slipped and confirm which shelves were empty."
        : selMetric === "System"
        ? "Check with the Cashier about POS reboots and failed payment codes."
        : selMetric === "Pricing"
        ? "Validate if refunds/complaints map to the price bump before blaming stock."
        : "Use another metric or interview to narrow it down.",
  });

  const runQuery = () => {
    let output: QueryResult = interpret("Mixed", "", "All branches similar");
    if (metric === "out_of_stock") {
      output = interpret(
        "Stock",
        "Branch B shows the most out-of-stock flags — likely reason sales dipped.",
        "B is highest, C is next",
      );
    } else if (metric === "failed_txn") {
      output = interpret(
        "System",
        "Branch C has the most failed transactions after the price change.",
        "C is highest, A/B are lower",
      );
    } else if (metric === "sales") {
      output = interpret(
        direction === "ASC" ? "Stock" : "Pricing",
        direction === "ASC"
          ? "Branch B has the lowest sales this week while traffic is stable."
          : "Branch A leads, meaning demand exists — issues are local to other branches.",
        direction === "ASC" ? "B lowest, C mid, A highest" : "A highest, B lowest",
      );
    }
    setResult(output);
    game.runSql();
  };

  const canContinue = game.canEnterInterviews; // = canEnterSQL && sqlRan
  const showResults = game.sqlRan;
  const interviewPrep = caseData.sqlInterviewPrep;
  const sqlTable = caseData.sqlResultTable;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Data Lab (SQL)</h1>
            <p className="mt-1 text-sm text-white/70">
              Objective: complete a friendly query, choose a metric, and use the output to aim your witness questions.
            </p>
            <p className="mt-2 text-sm text-white/70">{caseData.sqlFrame}</p>
            <p className="mt-2 text-xs text-white/60">Progress: {game.placedCount}/{game.cluesGoal} clues</p>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            Back to HQ
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="sql" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/90">Query template</h2>
              <div className="text-xs text-white/60">
                SQL: <span className={game.sqlRan ? "text-emerald-300" : "text-white/60"}>{game.sqlRan ? "✅ run" : "not run"}</span>
              </div>
            </div>
            <div className="text-xs text-white/70">
              Fill the blanks: choose the metric and sorting direction. No syntax memorization needed.
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-white/70">
                Metric
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value as typeof metric)}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                >
                  {metricOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.label} — {opt.helper}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs text-white/70">
                Order
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as "ASC" | "DESC")}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                >
                  <option value="ASC">ASC — lowest first</option>
                  <option value="DESC">DESC — highest first</option>
                </select>
              </label>
            </div>

            <pre className="mt-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-emerald-100 overflow-auto">
              {queryTemplate}
            </pre>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={runQuery}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                Run Query
              </button>

              <button
                onClick={() => navigate("/interviews")}
                disabled={!canContinue}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  canContinue ? "bg-white/10 text-white hover:bg-white/15" : "cursor-not-allowed bg-white/5 text-white/40"
                }`}
                title={canContinue ? "Continue" : "Run the query first"}
              >
                Continue → Witnesses
              </button>

              <div className="ml-auto text-xs text-white/60">* Choose a metric to learn what to ask in interviews.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="text-xs uppercase tracking-widest text-white/50">Sample dataset</div>
            <p className="text-sm text-white/75">
              sales_weekly (mock). Use it like a mini spreadsheet: glance at branches, weeks, and flags.
            </p>
            <div className="overflow-auto rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-xs">
                <thead className="bg-black/40 text-white/70">
                  <tr>
                    <th className="px-3 py-2 text-left">branch</th>
                    <th className="px-3 py-2 text-left">week</th>
                    <th className="px-3 py-2 text-left">sales</th>
                    <th className="px-3 py-2 text-left">failed_txn</th>
                    <th className="px-3 py-2 text-left">out_of_stock</th>
                    <th className="px-3 py-2 text-left">price_changed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-black/20">
                  {dataset.map((row, idx) => (
                    <tr key={`${row.branch}-${row.week}-${idx}`} className="text-white/90">
                      <td className="px-3 py-2">{row.branch}</td>
                      <td className="px-3 py-2">{row.week}</td>
                      <td className="px-3 py-2 font-mono">{row.sales}</td>
                      <td className="px-3 py-2 font-mono">{row.failed_txn}</td>
                      <td className="px-3 py-2 font-mono">{row.out_of_stock}</td>
                      <td className="px-3 py-2 font-mono">{row.price_changed ? "true" : "false"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
              Tip: Reading tables is analysis. Spot which branch looks weakest before hitting Run.
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">Results</h3>
            <span className="text-xs text-white/60">{showResults ? "Query executed" : "Run Query to reveal"}</span>
          </div>

          {showResults ? (
            <>
              {sqlTable && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-black/40 text-white/70">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">Week</th>
                        <th className="px-4 py-3 text-left font-semibold">Revenue</th>
                        <th className="px-4 py-3 text-left font-semibold">Failed / Errors</th>
                        <th className="px-4 py-3 text-left font-semibold">Refunds</th>
                        <th className="px-4 py-3 text-left font-semibold">Signal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {sqlTable.map((row) => (
                        <tr key={row.week} className="text-white/90">
                          <td className="px-4 py-3">{row.week}</td>
                          <td className="px-4 py-3 font-mono">{row.revenue}</td>
                          <td className="px-4 py-3 font-mono">{row.errors}</td>
                          <td className="px-4 py-3 font-mono">{row.refunds}</td>
                          <td className="px-4 py-3 font-mono">{row.failureShare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-white/90">
                <div className="text-xs uppercase tracking-widest text-emerald-200">What this tells us</div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-white/80">
                  {(caseData.sqlResultHighlights ?? results.map((r) => `${r.metric}: ${r.value}`)).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-white/80">
                  {result?.headline ||
                    caseData.sqlResultNarrative ||
                    "Data leans toward a main cause. Use it to decide who to ask and what to prove."}
                </p>
                <p className="mt-2 text-xs text-white/70">Branch order: {result?.branches ?? results.map((r) => r.metric).join(", ")}</p>
                <p className="mt-1 text-xs text-white/70">Suspect strongest now: {result?.suspect ?? "—"}</p>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-widest text-white/50">What to ask witnesses</div>
                <p className="mt-2 text-sm text-white/80">{result?.next}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/75">
                  {interviewPrep?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              Choose a metric, set order, then run. The output tells you which suspect to chase.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
