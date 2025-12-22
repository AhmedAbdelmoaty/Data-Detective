import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type Insight = {
  id: string;
  title: string;
  desc: string;
};

type MetricKey = "sales" | "failed_txn" | "out_of_stock";

const metricLabels: Record<MetricKey, string> = {
  sales: "المبيعات",
  failed_txn: "المعاملات الفاشلة",
  out_of_stock: "نفاد المخزون",
};

export default function AnalysisRoom() {
  const navigate = useNavigate();
  const game = useGame();

  const insights = CASE002.insights;
  const frameCopy = CASE002.analysisFrame;
  const data = CASE002.salesDataset;

  const [branchFilter, setBranchFilter] = useState<"all" | "A" | "B" | "C">("all");
  const [metricView, setMetricView] = useState<MetricKey>("sales");

  const pickedCount = game.selectedInsights.length;
  const canContinue = game.canReveal; // selectedInsightsCount>=2 && canEnterAnalysis

  const branches = useMemo(() => {
    const filtered = branchFilter === "all" ? ["A", "B", "C"] : [branchFilter];
    return filtered.map((b) => {
      const thisWeek = data.find((row) => row.branch === b && row.week === "this_week");
      const lastWeek = data.find((row) => row.branch === b && row.week === "last_week");
      return { branch: b, thisWeek, lastWeek };
    });
  }, [branchFilter, data]);

  const metricByBranch = useMemo(() => {
    return branches.map(({ branch, thisWeek }) => {
      const value = metricView === "sales" ? thisWeek?.sales : metricView === "failed_txn" ? thisWeek?.failed_txn : thisWeek?.out_of_stock;
      return { branch, value: value ?? 0 };
    });
  }, [branches, metricView]);

  const maxSales = Math.max(...branches.map((b) => b.thisWeek?.sales ?? 0, 1));
  const maxMetric = Math.max(...metricByBranch.map((m) => m.value), 1);

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

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">تصفية الفروع</div>
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
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">تبديل المؤشر</div>
            <div className="mt-2 flex flex-wrap gap-2">
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
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <ChartCard
            title="المبيعات حسب الفرع — هذا الأسبوع مقابل السابق"
            subtitle="إذا كانت الحركة مستقرة لكن المبيعات تهبط، انظر للمخزون أو الأنظمة."
          >
            <div className="space-y-3">
              {branches.map(({ branch, thisWeek, lastWeek }) => (
                <div key={branch}>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>الفرع {branch}</span>
                    <span>{thisWeek?.sales ?? 0} (هذا) / {lastWeek?.sales ?? 0} (السابق)</span>
                  </div>
                  <div className="flex gap-2 items-center mt-1">
                    <div
                      className="h-2 rounded-full bg-emerald-400"
                      style={{ width: `${((thisWeek?.sales ?? 0) / maxSales) * 100}%` }}
                    />
                    <div
                      className="h-2 rounded-full bg-white/40"
                      style={{ width: `${((lastWeek?.sales ?? 0) / maxSales) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          <ChartCard
            title={`${metricLabels[metricView] || "المؤشر"} حسب الفرع (هذا الأسبوع)`}
            subtitle="استخدمه كلوحة سريعة: من الأسوأ على هذا المؤشر؟"
          >
            <div className="space-y-3">
              {metricByBranch.map((m) => (
                <div key={m.branch}>
                  <div className="flex justify-between text-xs text-white/70">
                    <span>الفرع {m.branch}</span>
                    <span>{m.value}</span>
                  </div>
                  <div
                    className="mt-1 h-2 rounded-full bg-amber-400"
                    style={{ width: `${(m.value / maxMetric) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-white/60">تلميح: قفزات نفاد المخزون تشير للمخزون، والمعاملات الفاشلة تشير للنظام.</p>
          </ChartCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="font-semibold">دفتر الملاحظات</div>
            <ul className="mt-2 space-y-2 list-disc pl-5 text-xs text-white/70">
              <li>تصفية الفروع: {branchFilter === "all" ? "الكل" : `الفرع ${branchFilter}`}</li>
              <li>عرض المؤشر: {metricLabels[metricView]}</li>
              <li>النتائج المختارة: {game.selectedInsights.join(", ") || "لا شيء بعد"}</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
            <div className="font-semibold">كيف تقرأ هذا</div>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>المخزون: هبوط مبيعات كبير + ارتفاع نفاد المخزون في فرع واحد.</li>
              <li>النظام: المعاملات الفاشلة تتصدر مع حركة مستقرة.</li>
              <li>التسعير: الاستردادات أو الشكاوى تتجمع بعد تغيير السعر.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {insights.map((i) => {
            const active = game.selectedInsights.includes(i.id);

            return (
              <button
                key={i.id}
                onClick={() => game.toggleInsight(i.id, 3)}
                className={`w-full rounded-2xl border p-6 text-right transition ${
                  active ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-lg font-semibold">{i.title}</div>
                    <div className="mt-1 text-sm text-white/70">{i.desc}</div>
                  </div>
                  <div className="text-xs text-white/60">
                    مختارة:{" "}
                    <span className={active ? "text-emerald-300" : "text-white/60"}>{active ? "نعم" : "لا"}</span>
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

function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-white/60">{subtitle}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}
