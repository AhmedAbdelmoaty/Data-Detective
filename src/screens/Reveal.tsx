import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

const causeOptions = [
  { key: "المخزون", value: "المخزون" },
  { key: "النظام", value: "النظام" },
  { key: "التسعير", value: "التسعير" },
] as const;

const branchOptions = ["A", "B", "C"] as const;

const causeToCategory: Record<string, "billing" | "product" | "marketing" | null> = {
  "المخزون": "billing",
  "النظام": "product",
  "التسعير": "marketing",
};

const flagCategoryMap: Record<string, "billing" | "product" | "marketing" | null> = {
  sqlSuggestsStockShortageBranchB: "billing",
  sqlSuggestsLocalIssue: "billing",
  sqlSuggestsNeedMoreProof: null,
  sqlSuggestsSystemIssueInBranchC: "product",
  sqlSuggestsSystemLocalized: "product",
  sqlSuggestsCheckPricing: "marketing",
  sqlSuggestsStockCorrelation: "billing",
  sqlSuggestsMixedSignal: "marketing",
  sqlSuggestsCheckPriceFirst: "marketing",
};

function metricToCategory(metric?: string) {
  if (metric === "out_of_stock") return "billing";
  if (metric === "failed_txn") return "product";
  return null;
}

export default function Reveal() {
  const game = useGame();
  const nav = useNavigate();
  const caseData = CASE002;
  const existingReport = game.case002Report;

  const [cause, setCause] = useState(existingReport?.cause ?? "");
  const [branch, setBranch] = useState<string>(existingReport?.branch ?? "");
  const [selectedNotes, setSelectedNotes] = useState<string[]>(existingReport?.notes ?? []);
  const [summary, setSummary] = useState(existingReport?.summary ?? "");
  const [submittedReport, setSubmittedReport] = useState(existingReport ?? null);

  const notebookOptions = useMemo(
    () => game.notebook.map((text, idx) => ({ id: `note-${idx}`, text })),
    [game.notebook],
  );

  const leadingCategory = useMemo(() => {
    const counts = game.cards.reduce<Record<string, number>>((acc, card) => {
      if (card.interpretation?.category) {
        acc[card.interpretation.category] = (acc[card.interpretation.category] || 0) + 1;
      }
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0));
    return sorted[0]?.[0] ?? null;
  }, [game.cards]);

  const toggleNote = (id: string) => {
    setSelectedNotes((prev) => {
      const has = prev.includes(id);
      if (has) return prev.filter((n) => n !== id);
      if (prev.length >= 2) return prev; // enforce exactly 2
      return [...prev, id];
    });
  };

  const readyToSubmit = cause && branch && selectedNotes.length === 2 && summary.trim().length > 25;

  const calculateConfidence = () => {
    const category = causeToCategory[cause] ?? null;
    let score = 50;

    if (category && leadingCategory && category === leadingCategory) score += 10;

    const flagMatch = Object.entries(game.sqlFlags).some(
      ([flag, active]) => active && flagCategoryMap[flag] && flagCategoryMap[flag] === category,
    );
    if (flagMatch) score += 10;

    const insightMatch = game.selectedInsights.some((ins) => metricToCategory(ins.metric) === category);
    if (insightMatch) score += 10;

    if (category && leadingCategory && category !== leadingCategory && !flagMatch) score -= 10;

    score = Math.max(0, Math.min(100, score));
    const confidenceLabel: "مرتفع" | "متوسط" | "منخفض" = score >= 70 ? "مرتفع" : score >= 50 ? "متوسط" : "منخفض";
    const feedback =
      confidenceLabel === "منخفض" || confidenceLabel === "متوسط"
        ? "ملاحظة: بعض اختياراتك لا تتطابق تمامًا مع الأدلة التي جمعتها، لذا انخفض مستوى الثقة."
        : undefined;

    return { score, confidenceLabel, feedback };
  };

  const handleSubmit = () => {
    if (!readyToSubmit) return;
    const notes = selectedNotes
      .map((id) => notebookOptions.find((n) => n.id === id)?.text)
      .filter(Boolean) as string[];
    const { score, confidenceLabel, feedback } = calculateConfidence();
    const report = {
      cause,
      branch,
      notes,
      summary,
      confidenceScore: score,
      confidenceLabel,
      feedback,
    };
    game.setCaseReport(report);
    setSubmittedReport(report);
  };

  const selectedNoteTexts = submittedReport
    ? submittedReport.notes
    : ((selectedNotes
        .map((id) => notebookOptions.find((n) => n.id === id)?.text)
        .filter(Boolean) as string[])
      );

  const confidenceDisplay = submittedReport?.confidenceLabel ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">كشف الحقيقة</h1>
            <p className="mt-2 text-sm text-white/70">{caseData.revealFrame}</p>
            <p className="mt-2 text-xs text-white/60">لا يتم إنشاء التقرير تلقائيًا؛ اكتب نتيجتك بنفسك.</p>
          </div>

          <button
            onClick={() => nav("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            رجوع إلى المقر
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="reveal" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">الوقت</div>
            <div className="text-lg font-semibold">{game.time}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">الثقة</div>
            <div className="text-lg font-semibold">{game.trust}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/60">الاستنتاجات</div>
            <div className="text-lg font-semibold">{game.selectedInsights.length}/2</div>
          </div>
        </div>

        {!submittedReport && (
          <div className="mt-6 space-y-5 rounded-3xl border border-white/10 bg-black/30 p-6">
            <div>
              <div className="text-xs text-white/60">السبب النهائي</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {causeOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setCause(opt.value)}
                    className={`rounded-xl px-4 py-2 text-sm border ${
                      cause === opt.value ? "bg-white text-black" : "bg-white/5 border-white/15 text-white/80"
                    }`}
                  >
                    {opt.value}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60">الفرع المتأثر</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {branchOptions.map((b) => (
                  <button
                    key={b}
                    onClick={() => setBranch(b)}
                    className={`rounded-xl px-4 py-2 text-sm border ${
                      branch === b ? "bg-white text-black" : "bg-white/5 border-white/15 text-white/80"
                    }`}
                  >
                    الفرع {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60">اختر أدلتك (بالضبط ٢)</div>
              <div className="mt-3 space-y-2">
                {notebookOptions.length ? (
                  notebookOptions.map((note) => {
                    const checked = selectedNotes.includes(note.id);
                    const disable = !checked && selectedNotes.length >= 2;
                    return (
                      <label
                        key={note.id}
                        className={`flex cursor-pointer items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm transition hover:bg-white/10 ${
                          disable ? "opacity-50" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={checked}
                          disabled={disable}
                          onChange={() => toggleNote(note.id)}
                        />
                        <span className="text-white/80">{note.text}</span>
                      </label>
                    );
                  })
                ) : (
                  <p className="text-xs text-white/60">دفترك فارغ. ارجع لجمع ملاحظات.</p>
                )}
              </div>
            </div>

            <div>
              <div className="text-xs text-white/60">ملخصك (٢-٣ جمل عربية)</div>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white focus:border-white/30 focus:outline-none"
                rows={4}
                placeholder="اكتب خلاصة واضحة تربط السبب بالأدلة والخطوة التالية."
              />
              <p className="mt-1 text-[11px] text-white/60">اكتب بلغة بسيطة؛ سيتم عرض هذه الجمل في التقرير.</p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!readyToSubmit}
              className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold ${
                readyToSubmit ? "bg-white text-black hover:bg-white/90" : "cursor-not-allowed bg-white/10 text-white/40"
              }`}
            >
              إرسال التقرير
            </button>
          </div>
        )}

        {submittedReport && (
          <div className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-black/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/60">تقرير التحقيق — القضية ٠٠٢</div>
                <h2 className="text-2xl font-semibold">{submittedReport.cause}</h2>
              </div>
              <div className="rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-100">
                مستوى الثقة: {confidenceDisplay}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">الفرع المتأثر</div>
                <div className="mt-1 text-lg font-semibold">الفرع {submittedReport.branch}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">الأدلة المختارة</div>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
                  {submittedReport.notes.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-white/60">ملخص اللاعب</div>
              <p className="mt-2 text-sm text-white/80 whitespace-pre-wrap">{submittedReport.summary}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">مستوى الثقة</div>
                <div className="mt-1 text-lg font-semibold">{submittedReport.confidenceScore} / 100 ({submittedReport.confidenceLabel})</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-xs text-white/60">ملاحظات التوافق</div>
                <p className="mt-1 text-sm text-white/70">
                  {submittedReport.feedback ?? "اختياراتك متوافقة مع المسار الذي بنيته."}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-white/60">
              <button onClick={() => nav("/analysis")} className="text-white/80 hover:text-white">
                ← رجوع إلى التحليل
              </button>
              <div>
                الأدلة الداعمة المختارة: {selectedNoteTexts.join(" · ") || "—"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
