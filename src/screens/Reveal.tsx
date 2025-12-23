import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { InvestigationProgress } from "../components/InvestigationProgress";

const branchLabels: Record<string, string> = {
  A: "الفرع أ",
  B: "الفرع ب",
  C: "الفرع ج",
};

type Cause = "المخزون" | "النظام" | "التسعير";

type EvidenceOption = {
  id: string;
  label: string;
  origin: "insight" | "note";
};

type Confidence = {
  score: number;
  label: "مرتفع" | "متوسط" | "منخفض";
  feedback?: string;
};

export default function Reveal() {
  const game = useGame();
  const nav = useNavigate();

  const evidenceOptions: EvidenceOption[] = useMemo(() => {
    const fromInsights = game.lockedInsights.map((ins) => ({
      id: `ins-${ins.id}`,
      label: ins.text,
      origin: "insight" as const,
    }));
    const fromNotes = (game.notebook || []).slice(-4).map((note, idx) => ({
      id: `note-${idx}`,
      label: note,
      origin: "note" as const,
    }));
    return [...fromInsights, ...fromNotes];
  }, [game.lockedInsights, game.notebook]);

  const draft = game.reportDraft ?? {};
  const [cause, setCause] = useState<Cause | "">((draft.cause as Cause | undefined) ?? "");
  const [branch, setBranch] = useState<string>(draft.branch ?? "");
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(draft.evidenceIds ?? []);
  const [summary, setSummary] = useState<string>(draft.summary ?? "");
  const [errors, setErrors] = useState<string>("");
  const [mode, setMode] = useState<"form" | "report">(game.submittedReport ? "report" : "form");

  const notebookStats = {
    clues: `${game.placedCount}/${game.cluesGoal}`,
    witnesses: Object.keys(game.interviewAnswers).length,
    insights: game.lockedInsights.length,
  };

  const evidenceRemaining = 2 - selectedEvidence.length;

  const toggleEvidence = (id: string) => {
    setSelectedEvidence((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  const computeConfidence = (chosenCause: Cause, evidenceIds: string[]): Confidence => {
    let score = 40;

    const causeMap: Record<Cause, string> = {
      "المخزون": "billing",
      "النظام": "product",
      "التسعير": "marketing",
    };

    const categoryCounts = game.cards.reduce<Record<string, number>>((acc, card) => {
      const cat = card.interpretation?.category;
      if (cat) acc[cat] = (acc[cat] ?? 0) + 1;
      return acc;
    }, {});
    const leadingCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (leadingCategory && causeMap[chosenCause] === leadingCategory) {
      score += 20;
    }

    const flagKeys = Object.keys(game.sqlFlags).filter((k) => game.sqlFlags[k]);
    if (
      (chosenCause === "المخزون" && flagKeys.some((f) => f.includes("stock") || f.includes("out"))) ||
      (chosenCause === "النظام" && flagKeys.some((f) => f.includes("fail") || f.includes("system"))) ||
      (chosenCause === "التسعير" && flagKeys.some((f) => f.includes("price") || f.includes("refund")))
    ) {
      score += 20;
    }

    const metricAlignment = game.lockedInsights.some((ins) => {
      if (!ins.meta.metric) return false;
      if (chosenCause === "المخزون" && ins.meta.metric === "out_of_stock") return true;
      if (chosenCause === "النظام" && ins.meta.metric === "failed_txn") return true;
      if (chosenCause === "التسعير" && (ins.meta.metric === "sales" || ins.meta.note?.includes("سعر"))) return true;
      return false;
    });
    if (metricAlignment) score += 20;

    const witnessKeywords = Object.values(game.interviewAnswers || {});
    if (
      (chosenCause === "المخزون" && witnessKeywords.some((w) => w.includes("stock") || w.includes("waited"))) ||
      (chosenCause === "النظام" && witnessKeywords.some((w) => w.includes("pos") || w.includes("reboots"))) ||
      (chosenCause === "التسعير" && witnessKeywords.some((w) => w.includes("price") || w.includes("confusion")))
    ) {
      score += 10;
    }

    if (score === 40) {
      score -= 20;
    }

    score = Math.min(100, Math.max(0, score));
    const label = score >= 75 ? "مرتفع" : score >= 45 ? "متوسط" : "منخفض";
    const feedback = score < 45
      ? "ملاحظة: بعض اختياراتك لا تتطابق تمامًا مع الأدلة التي جمعتها، لذلك مستوى الثقة منخفض."
      : undefined;

    return { score, label, feedback };
  };

  const handleSubmit = () => {
    const validationErrors: string[] = [];
    if (!cause) validationErrors.push("اختر سببًا نهائيًا.");
    if (!branch) validationErrors.push("اختر فرعًا متأثرًا.");
    if (selectedEvidence.length !== 2) validationErrors.push("اختر عنصرين داعمين بالضبط (2/2).");
    if (summary.trim().length < 20) validationErrors.push("اكتب ملخصًا عربيًا من جملتين على الأقل.");

    if (validationErrors.length) {
      setErrors(validationErrors.join(" · "));
      setMode("form");
      return;
    }

    const confidence = computeConfidence(cause as Cause, selectedEvidence);
    const evidenceTexts = selectedEvidence
      .map((id) => evidenceOptions.find((e) => e.id === id)?.label)
      .filter(Boolean) as string[];

    game.submitReport({
      cause: cause as Cause,
      branch,
      evidenceIds: selectedEvidence,
      evidenceTexts,
      summary,
      confidence,
    });
    setErrors("");
    setMode("report");
  };

  const submitted = game.submittedReport;

  const renderForm = () => (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">اختر السبب النهائي</div>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {(["المخزون", "النظام", "التسعير"] as Cause[]).map((c) => (
            <button
              key={c}
              onClick={() => setCause(c)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                cause === c ? "bg-white text-black" : "bg-black/30 text-white/80"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">حدد الفرع المتأثر</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(branchLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setBranch(key)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                branch === key ? "bg-white text-black" : "bg-black/30 text-white/80"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>الأدلة/الملاحظات الداعمة (2/2)</span>
          <span className="text-xs text-white/60">المختار: {selectedEvidence.length}/2</span>
        </div>
        <p className="mt-1 text-xs text-white/60">اختر استنتاجاتك المعتمدة أو ملاحظات مهمة من الرحلة.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {evidenceOptions.map((opt) => {
            const active = selectedEvidence.includes(opt.id);
            return (
              <button
                key={opt.id}
                onClick={() => toggleEvidence(opt.id)}
                className={`rounded-lg border px-3 py-2 text-right text-xs ${
                  active ? "border-emerald-400/60 bg-emerald-400/10" : "border-white/15 bg-white/5"
                }`}
              >
                <div className="font-semibold">{opt.label}</div>
                <div className="text-[10px] text-white/60">المصدر: {opt.origin === "insight" ? "استنتاج" : "ملاحظة"}</div>
              </button>
            );
          })}
        </div>
        {selectedEvidence.length >= 2 && (
          <p className="mt-2 text-xs text-emerald-200">تم اختيار عنصرين. يمكنك إزالة واحد لتبديله.</p>
        )}
        {selectedEvidence.length < 2 && (
          <p className="mt-2 text-xs text-white/60">المتبقي: {evidenceRemaining} عنصر.</p>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold">ملخص قصير</div>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="اكتب ملخصًا من جملتين أو ثلاث يربط بين الأدلة واستنتاجك…"
          className="mt-2 w-full rounded-lg bg-black/40 p-3 text-sm text-white focus:outline-none"
          rows={4}
        />
      </div>

      {errors && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-100">{errors}</div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => nav("/analysis")}
          className="text-sm text-white/80 hover:text-white"
        >
          ← رجوع إلى التحليل
        </button>
        <button
          onClick={handleSubmit}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
        >
          إرسال التقرير
        </button>
      </div>
    </div>
  );

  const renderReport = () => {
    if (!submitted) return null;
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
          <div className="text-xs uppercase tracking-widest text-white/50">تقرير التحقيق — القضية ٠٠٢</div>
          <h2 className="mt-2 text-2xl font-semibold">{submitted.cause}</h2>
          <p className="text-sm text-white/70">الفرع المتأثر: {branchLabels[submitted.branch] ?? submitted.branch}</p>
          <div className="mt-3 text-sm text-white/80">{submitted.summary}</div>
          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="text-xs text-white/60">الأدلة الداعمة</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
              {submitted.evidenceTexts.map((evidence) => (
                <li key={evidence}>{evidence}</li>
              ))}
            </ul>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span>مستوى الثقة: <b>{submitted.confidence.label}</b></span>
            <span className="text-xs text-white/60">النتيجة: {submitted.confidence.score}/100</span>
          </div>
          {submitted.confidence.feedback && (
            <div className="mt-2 rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-xs text-amber-100">
              {submitted.confidence.feedback}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => setMode("form")}
            className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20"
          >
            تعديل التقرير
          </button>
          <button
            onClick={() => nav("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            إنهاء
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">كشف الحقيقة</h1>
            <p className="mt-2 text-sm text-white/70">
              لا يوجد تقرير جاهز تلقائيًا. اختر السبب والفرع والأدلة واكتب خلاصة ثم أرسل التقرير.
            </p>
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
            <div className="text-xs text-white/60">التقدم</div>
            <div className="text-lg font-semibold">
              {notebookStats.insights >= 2 ? "جاهز للتقرير" : "أكمل الاستنتاجات"}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-5">
          {mode === "form" ? renderForm() : renderReport()}
        </div>

        <div className="mt-4 text-xs text-white/60">
          دفتر الملاحظات: أدلة {notebookStats.clues} · الشهود {notebookStats.witnesses} · الاستنتاجات {notebookStats.insights}
        </div>
      </div>
    </div>
  );
}
