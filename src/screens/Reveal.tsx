import React from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import {
  CASE001,
  type CaseEvidence,
  type CaseInsight,
  type CaseInterviewQuestion,
  type CaseInterviewChoice,
} from "../content/cases/case001";
import { InvestigationProgress } from "../components/InvestigationProgress";

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
  const evidenceLibrary = caseData.evidence as ReadonlyArray<CaseEvidence>;
  const insightLibrary = caseData.insights as ReadonlyArray<CaseInsight>;
  const interviewQuestions = caseData.interviews as ReadonlyArray<CaseInterviewQuestion>;
  const signalLabels: Record<Signal, string> = {
    pricing: "تسعير/فوترة",
    checkout: "دفع/Checkout",
    marketing: "تسويق",
    product: "منتج",
  };

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

      case "feature_adoption":
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
  const signalGap = top.v - second.v;

  const pricingHigh = score.pricing >= 7;
  const checkoutHigh = score.checkout >= 7;

  const pickEnding = (): Ending => {
    // 1) Combined ending (لو الاتنين واضحين)
    if (pricingHigh && checkoutHigh) {
      return {
        key: "pricing_plus_checkout",
        title: "السبب: تسعير أربك + أخطاء دفع",
        confidenceLabel: "High",
        summary:
          "الإيراد نازل بسبب عاملين: رسالة تسعير أربكت العملاء + أخطاء Checkout 504 تعطل الدفع.",
        why: [
          "Refunds وشكاوى التسعير مرتفعة بوضوح.",
          "أخطاء الدفع 504 ارتفعت مع نفس فترة الهبوط.",
        ],
        nextActions: [
          "إصلاح عاجل لمسار الدفع + مراقبة فورية.",
          "توضيح الرسائل والأسعار في صفحة التسعير والـ FAQ.",
          "مراجعة الخصومات / الاستردادات مع فريق الفوترة.",
        ],
      };
    }

    // 2) واضح + عالي
    if (hasStrong && clearlyAhead) {
      if (top.k === "pricing") {
        return {
          key: "pricing_backlash",
          title: "السبب: اعتراض على التسعير",
          confidenceLabel: "High",
          summary:
            "الهبوط مرتبط بتغيير أسعار أحدث رد فعل سلبي: شكاوى + Refunds ↑.",
          why: [
            "شكاوى التسعير وRefunds في القمة.",
            "الإشارات الأخرى أقل وزنًا من مسار التسعير.",
          ],
          nextActions: [
            "راجع التغيير الأخير في الأسعار مع فريق الفوترة.",
            "وضح الرسالة في صفحة الأسعار وأرسل FAQ مختصر.",
            "تابع شريحة العملاء المتضررة وحدد التعويض.",
          ],
        };
      }

      if (top.k === "checkout") {
        return {
          key: "checkout_errors",
          title: "السبب: أعطال Checkout 504",
          confidenceLabel: "High",
          summary:
            "أخطاء 504 في الدفع تعطل التحويلات وترفع الفشل، متزامنة مع الهبوط.",
          why: [
            "زيادة واضحة في checkout_504_errors.",
            "الهبوط في الإيراد متزامن مع ارتفاع الأخطاء.",
          ],
          nextActions: [
            "جمع الـ logs وتتبع مزود الدفع، طبق rollback أو patch سريع.",
            "أضف مراقبة Alerts لمعدل فشل الدفع.",
            "فعّل تجربة retry بسيطة للعملاء أثناء العطل.",
          ],
        };
      }

      if (top.k === "marketing") {
        return {
          key: "marketing_efficiency",
          title: "السبب: كفاءة تسويق ضعفت",
          confidenceLabel: "High",
          summary:
            "الترافيك أو الرسالة التسويقية أصبحت أضعف: CPC ↑ أو Conversion ↓ بعد تغيير الحملات.",
          why: [
            "إشارات CPC/Conversion مسيطرة.",
            "اختيارات المقابلات تدعم مسار التسويق.",
          ],
          nextActions: [
            "راجع التارجتنج والـ creative واكشف انخفاض الجودة.",
            "افحص landing page funnel بسرعة (session recordings).",
            "حرك الميزانية نحو القنوات الأقل تكلفة/أفضل تحويل.",
          ],
        };
      }

      if (top.k === "product") {
        return {
          key: "product_regression",
          title: "السبب: تراجع منتج بعد تحديث",
          confidenceLabel: "High",
          summary:
            "تحديث المنتج أضعف التبني والاستخدام، فقلّت القيمة والإيرادات.",
          why: [
            "إشارات انخفاض استخدام/تبني واضحة.",
            "تصنيف الأدلة يميل للمنتج.",
          ],
          nextActions: [
            "راجع آخر Release والـ feature flags، حضر rollback.",
            "قارن سلوك العملاء قبل/بعد التغيير.",
            "اجمع Feedback سريع من العملاء المتأثرين.",
          ],
        };
      }
    }

    // 3) حالة Mixed signals (اللي كنت بتسأل عليها)
    // لو الدرجات متقاربة أو ضعيفة: نعرض نهاية بديلة واضحة بدل ما ندي سبب غلط
    return {
      key: "mixed_signals",
      title: "الإشارات متداخلة (تحتاج أدلة إضافية)",
      confidenceLabel: "Low",
      summary:
        "المسارات قريبة من بعض. غير آمن إعلان سبب واحد. اجمع دليل أو إجابة أدق.",
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

  const confidenceReason =
    evidenceConfidence === "High"
      ? "أنت جمعت معظم الأدلة، شغّلت SQL، وأجوبة الـ Interviews دعمت نفس الاتجاه. الفارق بين المسارات واضح."
      : evidenceConfidence === "Medium"
        ? "الاتجاه الأقوى ظاهر لكن لسه في فجوات بسيطة (أدلة أقل من المطلوب أو إشارات قريبة في المسار التاني)."
        : "الثقة منخفضة: الإشارات متقاربة أو البيانات ناقصة. النتيجة هنا أفضل تخمين، وليست حكم نهائي.";
  const confidenceLabelAr: Record<Ending["confidenceLabel"], string> = {
    High: "عالية",
    Medium: "متوسطة",
    Low: "منخفضة",
  };

  const evidenceTitleMap = new Map(evidenceLibrary.map((e) => [e.id, e.title]));
  const insightTitleMap = new Map(insightLibrary.map((i) => [i.id, i.title]));
  const interviewChoiceLines = Object.entries(interviewAnswers).map(
    ([questionId, choiceId]) => {
      const question = interviewQuestions.find((q) => q.id === questionId);
      const choiceList = question?.choices as CaseInterviewChoice[] | undefined;
      const choice = choiceList?.find((c) => c.id === choiceId);
      return choice ? `${question?.header}: ${choice.title}` : `${questionId}: ${choiceId}`;
    },
  );
  const evidenceTitles = placed
    .map((c) => evidenceTitleMap.get(c.id) ?? c.title ?? c.id)
    .filter(Boolean);
  const insightTitles = insights
    .map((id) => insightTitleMap.get(id as CaseInsight["id"]) ?? id)
    .filter(Boolean);
  const supportingEvidenceLines = [
    ...ending.why,
    `الأدلة الموضوعة: ${evidenceTitles.length ? evidenceTitles.join("، ") : "لا يوجد"}.`,
    `Insights: ${insightTitles.length ? insightTitles.join("، ") : "لا يوجد"}.`,
    `إجابات المقابلات: ${
      interviewChoiceLines.length ? interviewChoiceLines.join(" | ") : "لا يوجد"
    }.`,
    `أعلى مسار نقاط: ${signalLabels[top.k]} (${top.v}) ثم ${signalLabels[second.k]} (${second.v}).`,
  ];

  const tightenList: string[] = [];
  if (!game.sqlRan) tightenList.push("ارجع لـ SQL Lab وشغّل الاستعلام علشان تعزل السبب (checkout vs pricing vs marketing).");
  if (game.placedCount < game.cluesGoal)
    tightenList.push(`كمّل الأدلة في Evidence Room (${game.placedCount}/${game.cluesGoal}) علشان توزن المسارات.`);
  if (insights.length < 2) tightenList.push("اختر Insight إضافي يساند الاتجاه الأقوى (pricing / checkout / cpc).");
  if (Object.keys(interviewAnswers).length < 2)
    tightenList.push("جاوب أسئلة Interviews بإجابات حادة تكشف السبب الرئيسي بدل إشارات عامة.");
  if (signalGap > 0 && signalGap < 3)
    tightenList.push("الإشارات متقاربة بين مسارين؛ ركز أسئلتك القادمة على مسار واحد لتوضيح الفارق.");
  const showTighten = evidenceConfidence === "Low";
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

        <div className="mt-4">
          <InvestigationProgress current="reveal" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950/40 p-6 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">{ending.title}</h2>
            <span className="rounded-full border border-slate-700 bg-slate-900/40 px-3 py-1 text-xs text-slate-200">
              الثقة: {confidenceLabelAr[evidenceConfidence]}
            </span>
          </div>

          <p className="mt-3 text-slate-300">{ending.summary}</p>
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-slate-200">
            <div className="text-xs uppercase tracking-widest text-emerald-200">Detective conclusion</div>
            <p className="mt-2 text-slate-200">
              المتهم الأقوى: {signalLabels[top.k]}. الأدلة، الـ SQL، والمقابلات كلها تميل لنفس المسار.
              {signalGap < 3 ? " المسار التالي قريب؛ راقب الفارق." : ""}
            </p>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/30 p-4 text-sm text-slate-200">
            <div className="font-semibold">Supporting evidence</div>
            <p className="mt-1 text-slate-300">
              السردية مستندة إلى خط الأدلة التالي: نتائج SQL، وضع الأدلة في الـ board، وإجابات المقابلات.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-300">
              {supportingEvidenceLines.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/30 p-4">
              <div className="text-sm font-semibold text-slate-200">Confidence rationale</div>
              <p className="mt-2 text-sm text-slate-300">{confidenceReason}</p>
              {signalGap > 0 && (
                <p className="mt-2 text-xs text-slate-400">
                  الفارق بين المسار الأول والثاني: {signalGap} نقاط.
                </p>
              )}
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

          {showTighten && (
            <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <div className="text-sm font-semibold text-amber-100">
                الثقة Low — خطوات محددة لرفعها
              </div>
              <p className="mt-2 text-sm text-amber-50/90">
                النتيجة الحالية مؤقتة. خذ خطوة واحدة من القائمة لزيادة الثقة قبل ما تعرض التقرير.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-50/90">
                {tightenList.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

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
