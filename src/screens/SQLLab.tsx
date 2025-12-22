import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type ResultRow = { metric: string; value: string };
type QueryResult = {
  headline: string;
  suspect: "المخزون" | "النظام" | "التسعير" | "مختلط";
  branches: string;
  next: string;
};

const metricOptions = [
  { key: "sales", label: "المبيعات", helper: "قارن إجمالي المبيعات" },
  { key: "failed_txn", label: "المعاملات الفاشلة", helper: "شاهد المدفوعات الفاشلة" },
  { key: "out_of_stock", label: "نفاد المخزون", helper: "تحقق من نفاد المخزون" },
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

    return sorted.map((row) => ({ metric: `الفرع ${row.branch}`, value: String(row.value) }));
  }, [dataset, direction, metric]);

  const interpret = (selMetric: QueryResult["suspect"], note: string, branches: string): QueryResult => ({
    headline: note,
    suspect: selMetric,
    branches,
    next:
      selMetric === "المخزون"
        ? "اسأل مدير المتجر عن تأخر الشحنات وحدد أي الرفوف كانت فارغة."
        : selMetric === "النظام"
        ? "تأكد مع الكاشير من إعادة تشغيل النظام وأكواد المدفوعات الفاشلة."
        : selMetric === "التسعير"
        ? "تحقق إن كانت الاستردادات/الشكاوى مرتبطة بزيادة السعر قبل لوم المخزون."
        : "استخدم مؤشرًا آخر أو مقابلة إضافية لتضييق الاحتمالات.",
  });

  const runQuery = () => {
    let output: QueryResult = interpret("مختلط", "", "الفروع متشابهة");
    if (metric === "out_of_stock") {
      output = interpret(
        "المخزون",
        "الفرع ب يظهر أعلى إشارات نفاد المخزون — السبب الأرجح لهبوط المبيعات.",
        "ب الأعلى، ج بعده",
      );
    } else if (metric === "failed_txn") {
      output = interpret(
        "النظام",
        "الفرع ج لديه أكثر المعاملات الفاشلة بعد تغيير السعر.",
        "ج الأعلى، أ/ب أقل",
      );
    } else if (metric === "sales") {
      output = interpret(
        direction === "ASC" ? "المخزون" : "التسعير",
        direction === "ASC"
          ? "الفرع ب لديه أدنى مبيعات هذا الأسبوع بينما الحركة مستقرة."
          : "الفرع أ في الصدارة، أي أن الطلب موجود — المشكلة محلية في الفروع الأخرى.",
        direction === "ASC" ? "ب الأدنى، ج متوسط، أ الأعلى" : "أ الأعلى، ب الأدنى",
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
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">مختبر البيانات (SQL)</h1>
            <p className="mt-1 text-sm text-white/70">
              الهدف: أكمل استعلامًا ودودًا، اختر مؤشرًا، واستخدم النتيجة لتوجيه أسئلة الشهود.
            </p>
            <p className="mt-2 text-sm text-white/70">{caseData.sqlFrame}</p>
            <p className="mt-2 text-xs text-white/60">التقدم: {game.placedCount}/{game.cluesGoal} أدلة</p>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            رجوع إلى المقر
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="sql" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/90">قالب الاستعلام</h2>
              <div className="text-xs text-white/60">
                SQL: <span className={game.sqlRan ? "text-emerald-300" : "text-white/60"}>{game.sqlRan ? "✅ تم التشغيل" : "لم يُشغّل"}</span>
              </div>
            </div>
            <div className="text-xs text-white/70">
              املأ الفراغات: اختر المؤشر واتجاه الترتيب. لا حاجة لحفظ الصياغة.
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <label className="text-xs text-white/70">
                المؤشر
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
                الترتيب
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as "ASC" | "DESC")}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                >
                  <option value="ASC">تصاعدي — الأقل أولًا</option>
                  <option value="DESC">تنازلي — الأعلى أولًا</option>
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
                تشغيل الاستعلام
              </button>

              <button
                onClick={() => navigate("/interviews")}
                disabled={!canContinue}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  canContinue ? "bg-white/10 text-white hover:bg-white/15" : "cursor-not-allowed bg-white/5 text-white/40"
                }`}
                title={canContinue ? "متابعة" : "شغّل الاستعلام أولًا"}
              >
                متابعة ← الشهود
              </button>

              <div className="ml-auto text-xs text-white/60">* اختر مؤشرًا لتعرف ما الذي ستسأل عنه في المقابلات.</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="text-xs uppercase tracking-widest text-white/50">مجموعة بيانات تجريبية</div>
            <p className="text-sm text-white/75">
              sales_weekly (تجريبية). استخدمها كجدول صغير: انظر للفروع والأسابيع والإشارات.
            </p>
            <div className="overflow-auto rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-xs">
                <thead className="bg-black/40 text-white/70">
                  <tr>
                    <th className="px-3 py-2 text-right">الفرع</th>
                    <th className="px-3 py-2 text-right">الأسبوع</th>
                    <th className="px-3 py-2 text-right">المبيعات</th>
                    <th className="px-3 py-2 text-right">معاملات فاشلة</th>
                    <th className="px-3 py-2 text-right">نفاد مخزون</th>
                    <th className="px-3 py-2 text-right">تغيير السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-black/20">
                  {dataset.map((row, idx) => (
                    <tr key={`${row.branch}-${row.week}-${idx}`} className="text-white/90">
                      <td className="px-3 py-2 text-right">{row.branch}</td>
                      <td className="px-3 py-2 text-right">{row.week === "this_week" ? "هذا الأسبوع" : "الأسبوع الماضي"}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.sales}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.failed_txn}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.out_of_stock}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.price_changed ? "نعم" : "لا"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
              نصيحة: قراءة الجدول تحليل بحد ذاته. حدد أي فرع يبدو أضعف قبل الضغط على تشغيل.
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">النتائج</h3>
            <span className="text-xs text-white/60">{showResults ? "تم تنفيذ الاستعلام" : "شغّل الاستعلام للعرض"}</span>
          </div>

          {showResults ? (
            <>
              {sqlTable && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-black/40 text-white/70">
                      <tr>
                        <th className="px-4 py-3 text-right font-semibold">الأسبوع</th>
                        <th className="px-4 py-3 text-right font-semibold">الإيراد</th>
                        <th className="px-4 py-3 text-right font-semibold">فشل / أخطاء</th>
                        <th className="px-4 py-3 text-right font-semibold">استردادات</th>
                        <th className="px-4 py-3 text-right font-semibold">إشارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {sqlTable.map((row) => (
                        <tr key={row.week} className="text-white/90">
                          <td className="px-4 py-3 text-right">{row.week}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.revenue}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.errors}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.refunds}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.failureShare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-white/90">
                <div className="text-xs uppercase tracking-widest text-emerald-200">ماذا يخبرنا هذا</div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-white/80">
                  {(caseData.sqlResultHighlights ?? results.map((r) => `${r.metric}: ${r.value}`)).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-white/80">
                  {result?.headline ||
                    caseData.sqlResultNarrative ||
                    "البيانات تميل لسبب رئيسي. استخدمها لتقرر من تسأل وما الذي تثبته."}
                </p>
                <p className="mt-2 text-xs text-white/70">ترتيب الفروع: {result?.branches ?? results.map((r) => r.metric).join(", ")}</p>
                <p className="mt-1 text-xs text-white/70">المشتبه الأقوى الآن: {result?.suspect ?? "—"}</p>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-widest text-white/50">ما الذي نسأله للشهود</div>
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
              اختر مؤشرًا، اضبط الترتيب، ثم شغّل. النتيجة تخبرك أي مشتبه تتبعه.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
