import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE001 } from "../content/cases/case001";
import { InvestigationProgress } from "../components/InvestigationProgress";

type ResultRow = { metric: string; value: string };

export default function SQLLab() {
  const navigate = useNavigate();
  const game = useGame();
  const caseData = CASE001;

  const [query, setQuery] = useState(
    caseData.sqlQuery ||
      "SELECT *\nFROM payments\nWHERE status = 'failed';"
  );

  const results: ResultRow[] = useMemo(() => {
    return [
      { metric: "checkout_504_errors", value: "+38%" },
      { metric: "refunds", value: "+22%" },
      { metric: "revenue", value: "-18%" },
    ];
  }, []);

  const canContinue = game.canEnterInterviews; // = canEnterSQL && sqlRan
  const showResults = game.sqlRan;
  const interviewPrep = caseData.sqlInterviewPrep;
  const sqlTable = caseData.sqlResultTable;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">SQL Lab</h1>
            <p className="mt-1 text-sm text-white/70">Objective: شغّل استعلام واحد يفتح Interviews ويثبت فرضيتك.</p>
            <p className="mt-2 text-sm text-white/70">
              {caseData.sqlFrame}
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

        <div className="mt-4">
          <InvestigationProgress current="sql" />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/90">محرر الاستعلام</h2>
            <div className="text-xs text-white/60">
              SQL:{" "}
              <span className={game.sqlRan ? "text-emerald-300" : "text-white/60"}>
                {game.sqlRan ? "✅ run" : "not run"}
              </span>
            </div>
          </div>

          <div className="mt-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
            استعلام جاهز يركز على الأسبوعين الأخيرين: يربط الإيراد بـ 504 errors و Refunds ويحسب حصة الفشل.
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
              شغّل الاستعلام
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
          <div className="text-xs uppercase tracking-widest text-white/50">ما الذي تبحث عنه؟</div>
          <p className="mt-1 text-sm text-white/75">
            هل الأخطاء 504 هي السبب؟ هل التسعير خنق التحويل؟ هل CPC خرج عن السيطرة؟
            الاستعلام ده بيكشف اتجاه واضح قبل ما تواجه الناس.
          </p>
          <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
            الاستعلام مكتوب بالكامل: راجع النتائج بدل ما تضيع وقت في تركيب syntax. شغّل Run Query ثم انقل الأسئلة للـ interviews.
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">
              النتائج (تجريبية)
            </h3>
            <span className="text-xs text-white/60">
              {showResults ? "Query executed" : "Run Query to reveal"}
            </span>
          </div>

          {showResults ? (
            <>
              {sqlTable && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-black/40 text-white/70">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold">الأسبوع</th>
                        <th className="px-4 py-3 text-left font-semibold">الإيراد</th>
                        <th className="px-4 py-3 text-left font-semibold">Checkout 504</th>
                        <th className="px-4 py-3 text-left font-semibold">Refunds</th>
                        <th className="px-4 py-3 text-left font-semibold">نسبة الفشل</th>
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
                <div className="text-xs uppercase tracking-widest text-emerald-200">
                  ماذا تقول البيانات؟
                </div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-white/80">
                  {(caseData.sqlResultHighlights ?? results.map((r) => `${r.metric}: ${r.value}`)).map(
                    (item) => (
                      <li key={item}>{item}</li>
                    )
                  )}
                </ul>
                <p className="mt-3 text-white/80">
                  {caseData.sqlResultNarrative ||
                    "الاتجاه واضح: الإيراد نازل مع ارتفاع فشل الدفع والـ refunds. ده يحركنا نسأل الفريق عن السبب الفعلي."}
                </p>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-widest text-white/50">What this tells us → Interviews</div>
                <p className="mt-2 text-sm text-white/80">
                  الأسئلة التالية ترفع الثقة وتحدد المتهم الرئيسي:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/75">
                  {interviewPrep?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              شغّل الاستعلام الأول علشان تشوف بيانات حقيقية تقودك للـ Interviews.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
