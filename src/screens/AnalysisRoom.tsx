import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type ViewMode = "trend" | "compare" | "table";

type MetricKey = "sales" | "failed_txn" | "out_of_stock";

const metricLabels: Record<MetricKey, string> = {
  sales: "المبيعات",
  failed_txn: "المعاملات الفاشلة",
  out_of_stock: "نفاد المخزون",
};

const weekLabels: Record<string, string> = {
  this_week: "هذا الأسبوع",
  last_week: "الأسبوع الماضي",
};

export default function AnalysisRoom() {
  const navigate = useNavigate();
  const game = useGame();

  const frameCopy = CASE002.analysisFrame;
  const data = CASE002.salesDataset;

  const [branchFilter, setBranchFilter] = useState<"all" | "A" | "B" | "C">("all");
  const [metricView, setMetricView] = useState<MetricKey>("sales");
  const [weekFilter, setWeekFilter] = useState<"all" | "this_week" | "last_week">("all");
  const [viewMode, setViewMode] = useState<ViewMode>("trend");
  const [insightMessage, setInsightMessage] = useState<string | null>(null);

  const lockedInsights = game.selectedInsights;
  const pickedCount = lockedInsights.length;
  const canContinue = game.canReveal && pickedCount === 2;

  const filteredData = useMemo(() => {
    return data.filter(
      (row) =>
        (branchFilter === "all" ? true : row.branch === branchFilter) &&
        (weekFilter === "all" ? true : row.week === weekFilter),
    );
  }, [branchFilter, data, weekFilter]);

  const branches = useMemo(() => {
    const filtered = branchFilter === "all" ? ["A", "B", "C"] : [branchFilter];
    return filtered.map((b) => {
      const thisWeek = data.find((row) => row.branch === b && row.week === "this_week");
      const lastWeek = data.find((row) => row.branch === b && row.week === "last_week");
      return { branch: b, thisWeek, lastWeek };
    });
  }, [branchFilter, data]);

  const metricByBranch = useMemo(() => {
    const targetWeek = weekFilter === "all" ? "this_week" : weekFilter;
    return branches.map(({ branch }) => {
      const row = data.find((r) => r.branch === branch && r.week === targetWeek);
      const value = metricView === "sales" ? row?.sales : metricView === "failed_txn" ? row?.failed_txn : row?.out_of_stock;
      return { branch, value: value ?? 0, week: targetWeek };
    });
  }, [branches, data, metricView, weekFilter]);

  const trendPoints = useMemo(() => {
    const weeks: Array<"last_week" | "this_week"> = ["last_week", "this_week"];
    return weeks
      .filter((w) => weekFilter === "all" || weekFilter === w)
      .map((week) => {
        const rows = data.filter(
          (r) => (branchFilter === "all" ? true : r.branch === branchFilter) && r.week === week,
        );
        const total = rows.reduce((acc, r) => acc + (metricView === "sales" ? r.sales : metricView === "failed_txn" ? r.failed_txn : r.out_of_stock), 0);
        return {
          week,
          value: total,
          branches: rows.map((r) => r.branch).join(", ") || "الكل",
        };
      });
  }, [branchFilter, data, metricView, weekFilter]);

  const tableRows = useMemo(() => {
    return filteredData.map((row) => ({
      ...row,
      metricValue: metricView === "sales" ? row.sales : metricView === "failed_txn" ? row.failed_txn : row.out_of_stock,
    }));
  }, [filteredData, metricView]);

  const maxTrendValue = Math.max(...trendPoints.map((p) => p.value), 1);
  const maxMetric = Math.max(...metricByBranch.map((m) => m.value), 1);

  const handleExtract = (opts: { id: string; branch: string; week: string; value: number }) => {
    const branchLabel = opts.branch === "all" ? "كل الفروع" : `الفرع ${opts.branch}`;
    const sentence = `لوحظ ${metricLabels[metricView]} عند ${opts.value} في ${branchLabel} خلال ${weekLabels[opts.week] ?? opts.week}.`;
    const blocked = game.toggleInsight(
      {
        id: opts.id,
        text: sentence,
        metric: metricView,
        branch: opts.branch,
        week: opts.week,
      },
      2,
    );
    if (blocked) {
      setInsightMessage("يمكنك اعتماد استنتاجين فقط. احذف واحدًا لاعتماد آخر.");
      return;
    }
    setInsightMessage("تمت إضافة الاستنتاج إلى دفتر الملاحظات.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">غرفة التحليل</h1>
            <p className="mt-2 text-sm text-white/70">
              الهدف: اختر على الأقل <b>٢ نتيجة</b> من الرسوم قبل الذهاب إلى <b>كشف الحقيقة</b>.
            </p>
            <p className="mt-2 text-xs text-white/60">تم الاختيار: {pickedCount}/2</p>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <div className="font-semibold">لماذا فقط ٢؟</div>
              <p className="mt-1">{frameCopy}</p>
              <p className="mt-1 text-xs text-white/60">استخدم الفلاتر للتحقق من قصتك مثل لوحة تحكم صغيرة.</p>
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
          <FilterCard label="تصفية الفروع">
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
          </FilterCard>

          <FilterCard label="تبديل المؤشر">
            {(
              [
                { key: "sales", label: "المبيعات" },
                { key: "failed_txn", label: "المعاملات الفاشلة" },
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
          </FilterCard>

          <FilterCard label="الأسبوع">
            {(
              [
                { key: "all", label: "كل الأسابيع" },
                { key: "this_week", label: "هذا الأسبوع" },
                { key: "last_week", label: "الأسبوع الماضي" },
              ] as const
            ).map((w) => (
              <button
                key={w.key}
                onClick={() => setWeekFilter(w.key)}
                className={`rounded-lg px-3 py-2 text-xs border ${
                  weekFilter === w.key ? "bg-white text-black" : "bg-black/20 border-white/15 text-white/70"
                }`}
              >
                {w.label}
              </button>
            ))}
          </FilterCard>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
            <span className="font-semibold text-white">عرض البيانات</span>
            {(
              [
                { key: "trend", label: "مخطط زمني" },
                { key: "compare", label: "مقارنة الفروع" },
                { key: "table", label: "جدول" },
              ] as const
            ).map((v) => (
              <button
                key={v.key}
                onClick={() => setViewMode(v.key)}
                className={`rounded-full border px-3 py-1 ${
                  viewMode === v.key ? "bg-white text-black" : "border-white/20 bg-black/20 text-white/70"
                }`}
              >
                {v.label}
              </button>
            ))}
            <span className="text-[11px] text-white/60">انقر على نقطة أو صف لاستخراج استنتاج.</span>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
            {viewMode === "trend" && (
              <div>
                <div className="text-sm font-semibold">تغير {metricLabels[metricView]} حسب الأسبوع</div>
                <div className="text-xs text-white/60">النقر على نقطة الزمن يضيف استنتاجًا.</div>
                <div className="mt-3 flex justify-center">
                  <svg viewBox="0 0 320 180" className="w-full max-w-2xl">
                    <polyline
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      points={trendPoints
                        .map((p, idx) => {
                          const x = 40 + idx * 130;
                          const y = 150 - (p.value / maxTrendValue) * 120;
                          return `${x},${y}`;
                        })
                        .join(" ")}
                    />
                    {trendPoints.map((p, idx) => {
                      const x = 40 + idx * 130;
                      const y = 150 - (p.value / maxTrendValue) * 120;
                      return (
                        <g
                          key={p.week}
                          className="cursor-pointer transition hover:opacity-90"
                          onClick={() =>
                            handleExtract({
                              id: `trend-${branchFilter}-` + p.week + metricView,
                              branch: branchFilter === "all" ? "all" : branchFilter,
                              week: p.week,
                              value: p.value,
                            })
                          }
                        >
                          <circle cx={x} cy={y} r={8} fill="#fbbf24" stroke="#fef3c7" strokeWidth={2} />
                          <text x={x} y={y - 12} textAnchor="middle" className="fill-white text-[10px]">
                            {p.value}
                          </text>
                          <text x={x} y={170} textAnchor="middle" className="fill-white/70 text-[11px]">
                            {weekLabels[p.week]}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            )}

            {viewMode === "compare" && (
              <div>
                <div className="text-sm font-semibold">{metricLabels[metricView]} حسب الفرع ({weekLabels[metricByBranch[0]?.week ?? "this_week"]})</div>
                <div className="text-xs text-white/60">اضغط على عمود فرع لتثبيت استنتاج.</div>
                <div className="mt-4 space-y-3">
                  {metricByBranch.map((m) => (
                    <div
                      key={m.branch}
                      className="cursor-pointer rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                      onClick={() =>
                        handleExtract({
                          id: `compare-${m.branch}-${m.week}-${metricView}`,
                          branch: m.branch,
                          week: m.week,
                          value: m.value,
                        })
                      }
                    >
                      <div className="flex items-center justify-between text-xs text-white/70">
                        <span>الفرع {m.branch}</span>
                        <span>{m.value}</span>
                      </div>
                      <div className="mt-2 h-3 rounded-full bg-amber-400" style={{ width: `${(m.value / maxMetric) * 100}%` }} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {viewMode === "table" && (
              <div>
                <div className="text-sm font-semibold">جدول المؤشر حسب الفرع والأسبوع</div>
                <div className="text-xs text-white/60">اختر صفًا لتوليد ملاحظة.</div>
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="text-white/60">
                      <tr>
                        <th className="pb-2 font-semibold">الفرع</th>
                        <th className="pb-2 font-semibold">الأسبوع</th>
                        <th className="pb-2 font-semibold">{metricLabels[metricView]}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {tableRows.map((row) => (
                        <tr
                          key={`${row.branch}-${row.week}`}
                          className="cursor-pointer transition hover:bg-white/5"
                          onClick={() =>
                            handleExtract({
                              id: `table-${row.branch}-${row.week}-${metricView}`,
                              branch: row.branch,
                              week: row.week,
                              value: row.metricValue,
                            })
                          }
                        >
                          <td className="py-2">الفرع {row.branch}</td>
                          <td className="py-2">{weekLabels[row.week] ?? row.week}</td>
                          <td className="py-2">{row.metricValue}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {insightMessage && (
          <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-50">
            {insightMessage}
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="font-semibold">الاستنتاجات المثبتة</div>
            {lockedInsights.length ? (
              <ul className="mt-2 space-y-2 text-xs text-white/80">
                {lockedInsights.map((ins) => (
                  <li key={ins.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 p-2">
                    <span>{ins.text}</span>
                    <button
                      className="text-[11px] text-amber-200 hover:text-white"
                      onClick={() => game.removeInsight(ins.id)}
                    >
                      حذف
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-white/60">انقر على نقطة أو صف لاعتماد استنتاج.</p>
            )}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="font-semibold">كيف تقرأ هذا</div>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>المخزون: هبوط مبيعات كبير + ارتفاع نفاد المخزون في فرع واحد.</li>
              <li>النظام: المعاملات الفاشلة تتصدر مع حركة مستقرة.</li>
              <li>التسعير: الاستردادات أو الشكاوى تتجمع بعد تغيير السعر.</li>
            </ul>
            <p className="mt-3 text-xs text-white/60">تستطيع تثبيت استنتاجين فقط قبل كشف الحقيقة.</p>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <button
            onClick={() => navigate("/interviews")}
            className="text-sm text-white/80 hover:text-white"
          >
            ← رجوع إلى الشهود
          </button>

          <button
            onClick={() => navigate("/reveal")}
            disabled={!canContinue}
            className={`rounded-xl px-5 py-3 text-sm font-semibold ${
              canContinue ? "bg-white text-black hover:bg-white/90" : "cursor-not-allowed bg-white/10 text-white/40"
            }`}
            title={canContinue ? "متابعة" : "اختر نتيجتين أولًا"}
          >
            متابعة ← كشف الحقيقة
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
