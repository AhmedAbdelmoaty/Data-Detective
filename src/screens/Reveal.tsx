import React from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE001 } from "../content/cases/case001";

type EndingKey =
  | "pricing_backlash"
  | "checkout_errors"
  | "marketing_efficiency"
  | "product_regression"
  | "pricing_plus_checkout"
  | "mixed_signals";

type Ending = {
  key: EndingKey;
  title: string;
  summary: string;
  why: string[];
  nextActions: string[];
  confidenceLabel: "High" | "Medium" | "Low";
};

type Signal = "pricing" | "checkout" | "marketing" | "product";

export default function Reveal() {
  const game = useGame();
  const nav = useNavigate();
  const caseData = CASE001;

  // ---- Gather run data ----
  const placed = game.cards.filter((c) => c.placedIn);
  const insights = game.selectedInsights ?? [];
  const interviewAnswers = game.interviewAnswers ?? {};

  // ---- Scoring ----
  const score: Record<Signal, number> = {
    pricing: 0,
    checkout: 0,
    marketing: 0,
    product: 0,
  };

  const bump = (s: Signal, n: number) => {
    score[s] += n;
  };

  // Evidence cards signals (by card id)
  for (const c of placed) {
    switch (c.id) {
      case "pricing_complaints":
        bump("pricing", 4);
        break;
      case "refunds_spike":
        bump("pricing", 3);
        break;

      case "checkout_504":
        bump("checkout", 5);
        break;

      case "paid_ads_cpc":
        bump("marketing", 4);
        break;
      case "lp_conv_down":
        bump("marketing", 2);
        break;

      case "adoption_drop":
        bump("product", 4);
        break;

      default:
        // لو في كروت مستقبلًا
        break;
    }

    // Bonus صغير حسب الـ bucket اللي المستخدم اختاره (placedIn)
    // (عشان اختيار التصنيف نفسه له معنى)
    if (c.placedIn === "billing") bump("pricing", 1);
    if (c.placedIn === "product") bump("product", 1);
    if (c.placedIn === "marketing") bump("marketing", 1);
  }

  // Insights signals (by insight id)
  for (const id of insights) {
    if (id === "pricing") bump("pricing", 3);
    if (id === "checkout") bump("checkout", 3);
    if (id === "cpc") bump("marketing", 3);
    // لو هتزود Insights جديدة لاحقًا، ضيف mapping هنا
  }

  // Interview answers signals (by choice id)
  const answerValues = Object.values(interviewAnswers);
  for (const a of answerValues) {
    // Support Lead
    if (a === "pricing") bump("pricing", 3);
    if (a === "checkout") bump("checkout", 3);
    if (a === "ads") bump("marketing", 2);

    // Growth Marketer
    if (a === "search_budget") bump("marketing", 3);
    if (a === "landing") bump("marketing", 3);
    if (a === "quality") bump("marketing", 3);
  }

  // ---- Decide ending ----
  const ranked = (Object.keys(score) as Signal[])
    .map((k) => ({ k, v: score[k] }))
    .sort((a, b) => b.v - a.v);

  const top = ranked[0];
  const second = ranked[1];

  const hasStrong = top.v >= 8; // threshold
  const clearlyAhead = top.v - second.v >= 3;

  const pricingHigh = score.pricing >= 7;
  const checkoutHigh = score.checkout >= 7;

  const pickEnding = (): Ending => {
    // 1) Combined ending (لو الاتنين واضحين)
    if (pricingHigh && checkoutHigh) {
      return {
        key: "pricing_plus_checkout",
        title: "Root Cause: Pricing backlash + Checkout friction",
        confidenceLabel: "High",
        summary:
          "في إشارات قوية على مشكلتين مرتبطتين بالإيرادات: تسعير/فواتير عملت رد فعل سلبي + أخطاء/احتكاك في الدفع زوّد الفشل والـ refunds.",
        why: [
          "Refunds/Complaints ظهرت بقوة (Pricing/Billing).",
          "Checkout errors ظهرت بقوة ومرتبطة بهبوط الإيرادات.",
        ],
        nextActions: [
          "Fix عاجل لمسار الدفع (monitoring + error budget + rollback/patch).",
          "مراجعة تغييرات التسعير + توضيح الرسالة + سياسة refunds/discounts.",
          "A/B على pricing page + FAQ + تحسين onboarding للتغييرات.",
        ],
      };
    }

    // 2) واضح + عالي
    if (hasStrong && clearlyAhead) {
      if (top.k === "pricing") {
        return {
          key: "pricing_backlash",
          title: "Root Cause: Pricing change backlash",
          confidenceLabel: "High",
          summary:
            "الانخفاض مرتبط برد فعل سلبي بعد تغييرات التسعير: شكاوى أعلى + refunds أعلى → retention أقل وإيراد أقل.",
          why: [
            "Signals قوية في refunds/complaints مرتبطة بالتسعير.",
            "اختياراتك (Insights/Interviews) دعمت سيناريو التسعير.",
          ],
          nextActions: [
            "مراجعة خطة التسعير الجديدة + سياسة refunds/discounts.",
            "تحسين messaging على pricing page + FAQ.",
            "تقسيم العملاء (segments) لمعرفة أكتر شريحة تضررت.",
          ],
        };
      }

      if (top.k === "checkout") {
        return {
          key: "checkout_errors",
          title: "Root Cause: Checkout errors (504) blocking payments",
          confidenceLabel: "High",
          summary:
            "هبوط الإيرادات سببه الرئيسي أخطاء في الدفع (Checkout 504) بتقلل التحويل وتزود فشل عمليات الدفع.",
          why: [
            "Evidence قوي عن checkout_504_errors.",
            "الربط مع revenue drop واضح داخل الـ prototype.",
          ],
          nextActions: [
            "إصلاح الـ 504 (logs + tracing + provider status + rollback).",
            "إضافة monitoring/alerts لمعدل فشل الدفع.",
            "تحسين تجربة retry + graceful fallback أثناء الأعطال.",
          ],
        };
      }

      if (top.k === "marketing") {
        return {
          key: "marketing_efficiency",
          title: "Root Cause: Marketing efficiency drop (CPC↑ / CVR↓)",
          confidenceLabel: "High",
          summary:
            "السبب الأقرب: تكلفة الاكتساب زادت أو جودة الترافيك قلت أو صفحة الهبوط اتأثرت → conversion down.",
          why: [
            "Signals قوية مرتبطة بـ CPC / Conversion / Landing.",
            "اختيارات interviews تميل للتسويق/الترافيك.",
          ],
          nextActions: [
            "مراجعة القنوات (targeting/creative) + quality checks.",
            "تحليل landing page funnel + session recordings.",
            "إعادة توزيع الميزانية للأفضل أداءً + negative keywords إن لزم.",
          ],
        };
      }

      if (top.k === "product") {
        return {
          key: "product_regression",
          title: "Root Cause: Product regression after update",
          confidenceLabel: "High",
          summary:
            "هبوط الاستخدام/التبني بعد تحديث أو تغيير في المنتج أثر على القيمة وبالتالي الإيرادات.",
          why: [
            "Signals قوية في adoption/usage drop.",
            "تصنيف الأدلة اتجه للمنتج بشكل واضح.",
          ],
          nextActions: [
            "مراجعة آخر release + feature flags + rollback إن لزم.",
            "تحليل cohorts قبل/بعد التحديث.",
            "جمع feedback نوعي من العملاء المتأثرين.",
          ],
        };
      }
    }

    // 3) حالة Mixed signals (اللي كنت بتسأل عليها)
    // لو الدرجات متقاربة أو ضعيفة: نعرض نهاية بديلة واضحة بدل ما ندي سبب غلط
    return {
      key: "mixed_signals",
      title: "Root Cause: Mixed signals (needs more evidence)",
      confidenceLabel: "Low",
      summary:
        "الإشارات متقاربة بين أكتر من مسار، فمش آمن نحدد سبب واحد نهائي. محتاج تجمع أدلة إضافية أو تختار insights/answers بشكل أوضح.",
      why: [
        "الـ signals متوزعة ومفيش مسار متفوق بشكل كافي.",
        "ده أفضل من إجابة نهائية غلط.",
      ],
      nextActions: [
        "كمّل Evidence (حط كروت أكتر/صحّح التصنيف).",
        "راجع Interviews واختر إجابات أكثر تحديدًا.",
        "اختَر Insight إضافي يدعم اتجاه واحد.",
      ],
    };
  };

  const ending = pickEnding();
  const evidenceCompleteness = game.cluesGoal
    ? game.placedCount / game.cluesGoal
    : 0;
  const evidenceConfidence: Ending["confidenceLabel"] =
    ending.key === "mixed_signals"
      ? "Low"
      : game.placedCount >= 4
        ? "High"
        : game.placedCount >= 3
          ? "Medium"
          : "Low";
  // ---- UI ----
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-100">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Reveal</h1>
            <p className="mt-1 text-sm text-slate-300">Objective: اربط الأدلة والـ Insights علشان تعرض سبب نهائي وخطوات تالية.</p>
            <p className="mt-2 text-slate-300">
              دي نهاية “حقيقية” مبنية على اختياراتك (شجرة نهايات).
            </p>
            <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-3 text-sm text-slate-200">
              <div className="font-semibold">كيف تعرض النتيجة؟</div>
              <p className="mt-1">{caseData.revealFrame}</p>
            </div>
          </div>

          <button
            className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm hover:bg-slate-900/60"
            onClick={() => nav("/hq")}
          >
            Back to HQ
          </button>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{ending.title}</h2>
            <span className="rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1 text-xs text-slate-200">
              Confidence: {evidenceConfidence}
            </span>
          </div>

          <p className="mt-3 text-slate-300">{ending.summary}</p>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-200">
            <div className="font-semibold">What this means</div>
            <p className="mt-1 text-slate-300">
              ده تفسير تنفيذي مختصر: النتيجة هنا هي السردية الأقرب بناءً على الأدلة اللي جمعتها والـ Insights اللي اخترتها.
            </p>
            <div className="mt-3 font-semibold">What to do next if confidence is Low</div>
            <p className="mt-1 text-slate-300">
              لو الثقة Low، ارجع زوّد Clues في Evidence، شغّل استعلام أوضح في SQL، وجاوب أسئلة Interviews تدعم مسار واحد ثم اختَر Insights تعززه.
            </p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold text-slate-200">Why</div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {ending.why.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold text-slate-200">
                Next Actions
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-300">
                {ending.nextActions.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
            <div className="text-sm font-semibold text-slate-200">
              Your Run Summary
            </div>
            <div className="mt-2 text-sm text-slate-300">
              <div>
                <b>Insights:</b> {insights.length ? insights.join(", ") : "(none)"}
              </div>
              <div className="mt-1">
                <b>Interview Answers:</b>{" "}
                {Object.keys(interviewAnswers).length
                  ? JSON.stringify(interviewAnswers)
                  : "(none)"}
              </div>
              <div className="mt-1">
                <b>Placed Evidence:</b> {placed.length}/{game.cluesGoal}
              </div>
              <div className="mt-1">
                <b>Evidence completeness:</b> {Math.round(evidenceCompleteness * 100)}%
              </div>
              {/* Debug scores (مفيدة حاليًا) */}
              <div className="mt-3 text-xs text-slate-400">
                Scores → pricing:{score.pricing} | checkout:{score.checkout} |
                marketing:{score.marketing} | product:{score.product}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-200"
              onClick={() => nav("/evidence")}
            >
              Go to Evidence Room
            </button>

            <button
              className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm hover:bg-slate-900/60"
              onClick={() => nav("/sql")}
            >
              Go to SQL Lab
            </button>

            <button
              className="rounded-xl border border-slate-700 bg-slate-900/40 px-4 py-2 text-sm hover:bg-slate-900/60"
              onClick={() => {
                game.resetGame();
                nav("/");
              }}
            >
              Restart Case
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
