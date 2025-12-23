import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type MetricKey = "sales" | "failed_txn" | "out_of_stock";

type ViewMode = "trend" | "branches" | "table";

const metricLabels: Record<MetricKey, string> = {
  sales: "المبيعات",
  failed_txn: "العمليات الفاشلة",
  out_of_stock: "نفاد المخزون",
};

const weekLabels: Record<string, string> = {
  this_week: "هذا الأسبوع",
  last_week: "الأسبوع الماضي",
};

export default function AnalysisRoom() {
  const navigate = useNavigate();
  const game = useGame();

  const data = CASE002.salesDataset;
  const frameCopy = CASE002.analysisFrame;

  const [branchFilter, setBranchFilter] = useState<"all" | "A" | "B" | "C">("all");
  const [metricView, setMetricView] = useState<MetricKey>("sales");
  const [weekFilter, setWeekFilter] = useState<"all" | "this_week" | "last_week">("all");
  const [view, setView] = useState<ViewMode>("trend");
  const [status, setStatus] = useState<string>("");

  const branches = useMemo(
    () => (branchFilter === "all" ? ["A", "B", "C"] : [branchFilter]),
    [branchFilter],
  );

  const filtered = useMemo(
    () =>
      data.filter(
        (row) =>
          branches.includes(row.branch) && (weekFilter === "all" || row.week === weekFilter),
      ),
    [branches, data, weekFilter],
  );

  const valueFor = (row: (typeof data)[number]) =>
    metricView === "sales"
      ? row.sales
      : metricView === "failed_txn"
        ? row.failed_txn
        : row.out_of_stock;

  const maxValue = Math.max(...filtered.map((r) => valueFor(r)), 1);

  const trendHighlight = useMemo<
    | {
        branch: string;
        change: number;
        week: string;
        value: number;
        note: string;
      }
    | null
  >(() => {
    let pick: {
      branch: string;
      change: number;
      week: string;
      value: number;
      note: string;
    } | null = null;

    branches.forEach((branch) => {
      const last = data.find((r) => r.branch === branch && r.week === "last_week");
      const current = data.find((r) => r.branch === branch && r.week === "this_week");
      if (!last || !current) return;
      const diff = valueFor(current) - valueFor(last);
      const change = metricView === "sales" ? diff : -diff;
      if (!pick || change < pick.change) {
        pick = {
          branch,
          change,
          week: "this_week",
          value: valueFor(current),
          note:
            metricView === "sales"
              ? "أكبر هبوط أسبوعي في هذا الفرع."
              : "قفزة واضحة هذا الأسبوع في هذا المؤشر.",
        };
      }
    });

    return pick;
  }, [branches, data, metricView]);

  const branchHighlight = useMemo(() => {
    const focusWeek = weekFilter === "all" ? "this_week" : weekFilter;
    const records = data.filter(
      (r) => branches.includes(r.branch) && r.week === focusWeek,
    );
    if (!records.length) return null;
    const selector = metricView === "sales"
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a > b;
    let pick = records[0];
    records.forEach((r) => {
      if (selector(valueFor(r), valueFor(pick))) pick = r;
    });
    return {
      branch: pick.branch,
      week: pick.week,
      value: valueFor(pick),
      note:
        metricView === "sales"
          ? "أضعف مبيعات ضمن الفروع في هذا الأسبوع."
          : "أعلى مؤشر سلبي بين الفروع في هذا الأسبوع.",
    };
  }, [branches, data, metricView, valueFor, weekFilter]);

  const tableHighlight = useMemo(() => {
    if (!filtered.length) return null;
    const selector = metricView === "sales"
      ? (a: number, b: number) => a < b
      : (a: number, b: number) => a > b;
    let pick = filtered[0];
    filtered.forEach((r) => {
      if (selector(valueFor(r), valueFor(pick))) pick = r;
    });
    return {
      branch: pick.branch,
      week: pick.week,
      value: valueFor(pick),
      note:
        metricView === "sales"
          ? "أقل قيمة في الجدول تشير لمشكلة فرعية."
          : "القيمة الأعلى تلفت النظر لإشكال عمليات أو مخزون.",
    };
  }, [filtered, metricView, valueFor]);

  const handleExtract = (source: "chart" | "table", meta: { branch?: string; metric?: string; week?: string; note?: string }) => {
    const title = `${metricLabels[metricView]} — ${meta.branch ? `الفرع ${meta.branch}` : ""} ${meta.week ? weekLabels[meta.week] ?? meta.week : ""}`.trim();
    const insight = {
      id: `${metricView}-${meta.branch ?? "all"}-${meta.week ?? "all"}`,
      text: `${title}: ${meta.note ?? "نتيجة بارزة من الرسم"}`,
      source,
      meta: { ...meta, metric: metricView },
    };
    const result = game.lockInsight(insight, 2);
    if (!result.ok) {
      setStatus(result.reason ?? "تعذر إضافة الاستنتاج.");
    } else {
      setStatus("تم اعتماد الاستنتاج. يمكنك الوصول إلى ٢/٢ للمتابعة.");
    }
  };

  const lockedCount = game.lockedInsights.length;
  const canContinue = game.canReveal;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">غرفة التحليل</h1>
            <p className="mt-2 text-sm text-white/70">
              الهدف: اعتمد <b>استنتاجين</b> فقط من الرسوم أو الجدول قبل الانتقال إلى كشف الحقيقة.
            </p>
            <p className="mt-2 text-xs text-white/60">تم الاعتماد: {lockedCount}/2</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <div className="font-semibold">لماذا فقط ٢؟</div>
              <p className="mt-1">{frameCopy}</p>
              <p className="mt-1 text-xs text-white/60">استخدم الفلاتر والتبديل بين الرسوم كما لو كانت لوحة تحكم مصغّرة.</p>
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
          <InvestigationProgress current="analysis" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <FilterCard title="تصفية الفروع">
            <div className="mt-2 flex flex-wrap gap-2">
              {["all", "A", "B", "C"].map((b) => (
                <button
                  key={b}
                  onClick={() => setBranchFilter(b as typeof branchFilter)}
                  className={`rounded-lg px-3 py-2 text-xs border ${
                    branchFilter === b ? "bg-white text-black" : "bg-black/20 border-white/15 text-white/70"
                  }`}
                >
                  {b === "all" ? "كل الفروع" : `الفرع ${b}`}
                </button>
              ))}
            </div>
          </FilterCard>

          <FilterCard title="اختيار المؤشر">
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  { key: "sales", label: "المبيعات" },
                  { key: "failed_txn", label: "العمليات الفاشلة" },
                  { key: "out_of_stock", label: "نفاد المخزون" },
                ] as const
              ).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setMetricView(m.key)}
                  className={`rounded-lg px-3 py-2 text-xs border ${
                    metricView === m.key ? "bg-white text-black" : "bg-black/20 border-white/15 text-white/70"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </FilterCard>

          <FilterCard title="الأسبوع">
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { key: "all", label: "كل الأسابيع" },
                { key: "this_week", label: "هذا الأسبوع" },
                { key: "last_week", label: "الأسبوع الماضي" },
              ].map((w) => (
                <button
                  key={w.key}
                  onClick={() => setWeekFilter(w.key as typeof weekFilter)}
                  className={`rounded-lg px-3 py-2 text-xs border ${
                    weekFilter === w.key ? "bg-white text-black" : "bg-black/20 border-white/15 text-white/70"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </FilterCard>
        </div>

        <div className="mt-6 flex flex-wrap gap-2 text-sm">
          {(
            [
              { key: "trend", label: "اتجاه أسبوعي" },
              { key: "branches", label: "مقارنة الفروع" },
              { key: "table", label: "الجدول" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              onClick={() => setView(opt.key)}
              className={`rounded-full border px-4 py-2 ${
                view === opt.key ? "bg-white text-black" : "bg-white/10 text-white/80"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {status && (
          <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">
            {status}
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
          {view === "trend" && (
            <div>
              <div className="text-sm font-semibold">اتجاه أسبوعي — {metricLabels[metricView]}</div>
              <p className="text-xs text-white/60">انظر للتغير بين الأسبوع الماضي وهذا الأسبوع لكل فرع.</p>
              <div className="mt-4 space-y-4">
                {branches.map((branch) => {
                  const last = data.find((r) => r.branch === branch && r.week === "last_week");
                  const current = data.find((r) => r.branch === branch && r.week === "this_week");
                  const highlighted = trendHighlight?.branch === branch;
                  const lastValue = last ? valueFor(last) : 0;
                  const currentValue = current ? valueFor(current) : 0;
                  return (
                    <div
                      key={branch}
                      className={`rounded-xl border px-3 py-2 ${
                        highlighted ? "border-emerald-400/60 bg-emerald-400/10" : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>الفرع {branch}</span>
                        <span>
                          {currentValue} ← {lastValue}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-white/20">
                          <div
                            className="h-2 rounded-full bg-emerald-400"
                            style={{ width: `${((currentValue || 0) / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/60">{weekLabels["this_week"]}</span>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-2 flex-1 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-white/50"
                            style={{ width: `${((lastValue || 0) / maxValue) * 100}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-white/60">{weekLabels["last_week"]}</span>
                      </div>
                      {highlighted && trendHighlight && (
                        <button
                          className="mt-3 w-full rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 hover:border-emerald-400/60"
                          onClick={() =>
                            handleExtract("chart", {
                              branch,
                              week: trendHighlight.week,
                              note: trendHighlight.note,
                            })
                          }
                        >
                          انقر لاعتماد الاستنتاج البارز
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "branches" && branchHighlight && (
            <div>
              <div className="text-sm font-semibold">مقارنة الفروع — {metricLabels[metricView]}</div>
              <p className="text-xs text-white/60">اختر الفروع لمعرفة من الأسوأ أو الأفضل في المؤشر المحدد.</p>
              <div className="mt-4 space-y-3">
                {branches.map((branch) => {
                  const record = data.find(
                    (r) => r.branch === branch && (weekFilter === "all" ? r.week === "this_week" : r.week === weekFilter),
                  );
                  const value = record ? valueFor(record) : 0;
                  const isHot = branchHighlight.branch === branch;
                  return (
                    <div key={branch} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>الفرع {branch}</span>
                        <span>{value} ({weekLabels[branchHighlight.week]})</span>
                      </div>
                      <div className="mt-2 h-2 rounded-full bg-white/15">
                        <div
                          className={`h-2 rounded-full ${metricView === "sales" ? "bg-emerald-400" : "bg-amber-400"}`}
                          style={{ width: `${((value || 0) / Math.max(branchHighlight.value || 1, 1)) * 100}%` }}
                        />
                      </div>
                      {isHot && (
                        <button
                          className="mt-3 w-full rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-xs text-emerald-100 hover:border-emerald-400/60"
                          onClick={() =>
                            handleExtract("chart", {
                              branch,
                              week: branchHighlight.week,
                              note: branchHighlight.note,
                            })
                          }
                        >
                          انقر لاعتماد هذه الملاحظة
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {view === "table" && (
            <div>
              <div className="text-sm font-semibold">الجدول التفصيلي</div>
              <p className="text-xs text-white/60">اضغط على الصف البارز لاعتماد استنتاج. التصفية تؤثر مباشرة على الجدول.</p>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-white/60">
                      <th className="py-2 text-right">الفرع</th>
                      <th className="py-2 text-right">الأسبوع</th>
                      <th className="py-2 text-right">{metricLabels[metricView]}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const highlighted =
                        tableHighlight?.branch === row.branch && tableHighlight.week === row.week;
                      const value = valueFor(row);
                      return (
                        <tr
                          key={`${row.branch}-${row.week}`}
                          className={`cursor-pointer border-t border-white/5 ${
                            highlighted ? "bg-emerald-400/10 text-emerald-100" : "hover:bg-white/5"
                          }`}
                          onClick={() =>
                            handleExtract("table", {
                              branch: row.branch,
                              week: row.week,
                              note: highlighted ? tableHighlight?.note : "ملاحظة من الصف المختار",
                            })
                          }
                        >
                          <td className="py-2">الفرع {row.branch}</td>
                          <td className="py-2">{weekLabels[row.week]}</td>
                          <td className="py-2">{value}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">الاستنتاجات المعتمدة ({lockedCount}/2)</div>
              <button
                onClick={() => game.clearLockedInsights()}
                className="text-xs text-white/70 hover:text-white"
              >
                مسح الاستنتاجات
              </button>
            </div>
            <div className="mt-3 space-y-2 text-sm text-white/80">
              {game.lockedInsights.length === 0 && <p className="text-white/60">لا يوجد استنتاجات بعد.</p>}
              {game.lockedInsights.map((ins) => (
                <div
                  key={ins.id}
                  className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 flex items-start justify-between gap-2"
                >
                  <div>
                    <div className="font-semibold">{ins.text}</div>
                    <div className="text-xs text-white/60">
                      المصدر: {ins.source === "chart" ? "الرسم" : "الجدول"} · الفرع {ins.meta.branch ?? "-"} · {ins.meta.metric ? metricLabels[ins.meta.metric as MetricKey] : ""}
                    </div>
                  </div>
                  <button
                    onClick={() => game.removeLockedInsight(ins.id)}
                    className="text-[11px] text-amber-200 hover:text-amber-100"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="font-semibold">دفتر الملاحظات السريع</div>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>تصفية الفروع: {branchFilter === "all" ? "كل الفروع" : `الفرع ${branchFilter}`}</li>
              <li>المؤشر الحالي: {metricLabels[metricView]}</li>
              <li>الأسبوع: {weekFilter === "all" ? "كل الأسابيع" : weekLabels[weekFilter]}</li>
              <li>تم الاعتماد: {lockedCount}/2</li>
              {lockedCount === 2 && <li className="text-emerald-200">جاهز للانتقال إلى كشف الحقيقة.</li>}
            </ul>
            {lockedCount < 2 && (
              <p className="mt-2 text-xs text-white/60">اعتمد استنتاجين من الرسم أو الجدول للمتابعة.</p>
            )}
            {lockedCount >= 2 && (
              <p className="mt-2 text-xs text-emerald-200">يمكنك حذف استنتاج لاستبداله إذا أردت قصة أوضح.</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="text-sm text-white/80 hover:text-white"
          >
            ← رجوع إلى الشهود
          </button>

          <div className="text-right">
            {lockedCount < 2 && (
              <div className="text-xs text-white/60 mb-2">اعتمد استنتاجين من الرسم أو الجدول للمتابعة.</div>
            )}
            <button
              onClick={() => navigate("/reveal")}
              disabled={!canContinue}
              className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                canContinue ? "bg-white text-black hover:bg-white/90" : "cursor-not-allowed bg-white/10 text-white/40"
              }`}
            >
              الانتقال إلى كشف الحقيقة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
      <div className="text-xs text-white/60">{title}</div>
      {children}
    </div>
  );
}
