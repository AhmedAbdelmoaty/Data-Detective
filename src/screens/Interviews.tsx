import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type AnswerStyle = "confirming" | "conflicting" | "vague";

type WitnessQuestion = {
  id: string;
  text: string;
  answer: string;
  style: AnswerStyle;
  timeCostMin: number;
  trustDelta?: number;
  notebookNote: string;
  isBonus?: boolean;
  gate?: (flags: Record<string, boolean>, lean?: string) => boolean;
};

type WitnessConfig = {
  id: string;
  title: string;
  intro: string;
  persona: { role: string; vibe: string; youNeed: string };
  baseline: WitnessQuestion[];
  bonus: WitnessQuestion[];
};

const answerLabels: Record<AnswerStyle, string> = {
  confirming: "مؤكِّد",
  conflicting: "متعارض",
  vague: "غامض",
};

export default function Interviews() {
  const navigate = useNavigate();
  const game = useGame();

  const frameCopy = CASE002.interviewFrame;
  const askedCount = Object.keys(game.interviewAnswers).length;

  const lean = useMemo(() => {
    const tally = game.cards.reduce(
      (acc, card) => {
        const category = card.interpretation?.category;
        if (category) acc[category] += 1;
        return acc;
      },
      { billing: 0, product: 0, marketing: 0 } as Record<string, number>,
    );
    const entries = Object.entries(tally).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[1] > 0 ? entries[0][0] : undefined;
  }, [game.cards]);

  const witnesses: WitnessConfig[] = useMemo(
    () => [
      {
        id: "manager",
        title: "مقابلة مدير المتجر",
        intro: "ركز على ما تغيّر في المخزون والتسعير هذا الأسبوع.",
        persona: {
          role: "مدير المتجر",
          vibe: "هادئ لكنه قلق من الرفوف الفارغة.",
          youNeed: "تثبيت هل التأخير في التوريد حقيقي أم مجرد انطباع.",
        },
        baseline: [
          {
            id: "manager_delivery_delay",
            text: "هل تأخرت شحنة الفرع ب يوم الجمعة؟",
            answer:
              "الشاحنة وصلت متأخرة بساعات. الرفوف بقيت ناقصة حتى بعد الظهر، ولا أعرف إن كان السبب من المورد أم من النظام.",
            style: "confirming",
            timeCostMin: 5,
            trustDelta: 0.5,
            notebookNote: "المدير أكد تأخر شحنة الفرع ب مما يفسر رفوفًا فارغة في ذروة الجمعة.",
          },
          {
            id: "manager_price_reaction",
            text: "كيف كانت ردود فعل الزبائن على زيادة الأسعار؟",
            answer:
              "البعض سأل عن الزيادة وقال إن العروض اختفت. لكن الأكثر غضبًا كانوا عند الدفع لما تأخر النظام أو لم يجدوا صنفهم.",
            style: "conflicting",
            timeCostMin: 5,
            trustDelta: -0.2,
            notebookNote: "المدير يرى أن السعر أزعج بعض الزبائن لكن الأعطال ونقص الأصناف زادت الموقف سوءًا.",
          },
          {
            id: "manager_floor_observation",
            text: "هل لاحظت نقاط اختناق واضحة داخل المتجر؟",
            answer:
              "الزحام كان عند الدفع أكثر من الممرات. لما يتجمد الجهاز نجبر الزبون ينتظر أو يعيد المحاولة، وبعضهم يترك السلة.",
            style: "vague",
            timeCostMin: 4,
            trustDelta: 0,
            notebookNote: "ازدحام نقاط البيع يتكرر، ما يعني أن التجمدات تؤثر على مبيعات نهاية اليوم.",
          },
        ],
        bonus: [
          {
            id: "manager_system_sync",
            text: "هل لاحظت أن النظام لا يحدّث الكميات قبل الذروة؟",
            answer:
              "أحيانًا يظهر الصنف متاحًا ثم نجده ناقصًا فعليًا. أبلغت الدعم لكن قالوا سنراجع السجل. لا أقدر أجزم إن كان السبب الرئيسي.",
            style: "vague",
            timeCostMin: 6,
            trustDelta: 0.2,
            notebookNote: "إشارة احتمالية لخلل مزامنة المخزون قبل الذروة في الفرع ب.",
            isBonus: true,
            gate: (flags, currentLean) =>
              Boolean(
                flags.sqlSuggestsStockShortageBranchB ||
                  flags.sqlSuggestsStockCorrelation ||
                  flags.sqlSuggestsMixedSignal ||
                  currentLean === "billing",
              ),
          },
          {
            id: "manager_price_conflict",
            text: "هل استرجع الناس مشتريات بسبب الزيادة الأخيرة؟",
            answer:
              "بعض الزبائن أعادوا سلعًا صغيرة وقالوا السعر ارتفع بلا عروض. لكن أغلب الاستردادات جاءت بعد أخطاء دفع.",
            style: "conflicting",
            timeCostMin: 6,
            trustDelta: -0.3,
            notebookNote: "استردادات متداخلة بين السعر وأعطال الدفع؛ لا يوجد حسم على سبب واحد.",
            isBonus: true,
            gate: (flags, currentLean) =>
              Boolean(flags.sqlSuggestsCheckPriceFirst || currentLean === "marketing"),
          },
        ],
      },
      {
        id: "cashier",
        title: "مقابلة الكاشير / العمليات",
        intro: "اسأل عن الأجهزة ونبض الزبائن أمام نقطة الدفع.",
        persona: {
          role: "كاشير الوردية المسائية",
          vibe: "متعب لكنه يرى كل التفاصيل.",
          youNeed: "تأكيد هل الأعطال أو الأسعار تدفع الناس للمغادرة.",
        },
        baseline: [
          {
            id: "cashier_reboots",
            text: "هل تجمد جهاز نقاط البيع هذا الأسبوع؟",
            answer:
              "الجهاز تجمد مرتين مساء الخميس وثلاث مرات الجمعة. نعيد التشغيل ونخسر الدور، وبعض الزبائن يمشون قبل الإتمام.",
            style: "confirming",
            timeCostMin: 6,
            trustDelta: 0.6,
            notebookNote: "الكاشير أكد تجمد الجهاز بشكل متكرر مع خسارة صفوف دفع كاملة.",
          },
          {
            id: "cashier_stock_comment",
            text: "هل غادر زبائن لأن الصنف غير متوفر؟",
            answer:
              "نعم، خاصة بعد الظهر. يسأل عن مشروب معين أو وجبة جاهزة ونضطر نقول خلصت. بعضهم ينتظر شحنة الليل وبعضهم يغادر فورًا.",
            style: "confirming",
            timeCostMin: 5,
            trustDelta: 0.3,
            notebookNote: "الزبائن يغادرون بسبب نفاد أصناف شعبية في فترة الذروة.",
          },
          {
            id: "cashier_price_pushback",
            text: "كيف تفاعل الناس مع السعر عند الدفع؟",
            answer:
              "استغربوا، لكن المشكلة الأكبر لما يحاولوا الدفع مرتين بسبب خطأ. وقتها يطلبون إلغاء أو استرداد ويتركوا المشتريات.",
            style: "conflicting",
            timeCostMin: 4,
            trustDelta: -0.1,
            notebookNote: "شكاوى السعر تظهر لكن تتفاقم مع أخطاء النظام أثناء الدفع.",
          },
        ],
        bonus: [
          {
            id: "cashier_network_peak",
            text: "هل تتباطأ الشبكة في وقت الذروة تحديدًا؟",
            answer:
              "في الذروة ننتظر المصادقة أكثر. أحيانًا ننتقل للمدفوعات النقدية. ما أعرف إن كان الخلل من الشبكة أو النظام نفسه.",
            style: "vague",
            timeCostMin: 6,
            trustDelta: 0.2,
            notebookNote: "إشارة ضبابية لبطء شبكة في الذروة قد يزيد المعاملات الفاشلة.",
            isBonus: true,
            gate: (flags, currentLean) =>
              Boolean(
                flags.sqlSuggestsSystemIssueInBranchC ||
                  flags.sqlSuggestsSystemLocalized ||
                  flags.sqlSuggestsMixedSignal ||
                  currentLean === "product",
              ),
          },
          {
            id: "cashier_price_clarity",
            text: "هل بطاقات السعر الجديدة تربك الخط عند الدفع؟",
            answer:
              "بعض الأكواد تظهر بسعرين. أضطر أشرح أو أعدل يدويًا. الزبائن يتوترون ويشكّون أننا نغالي، بس مو كل مرة.",
            style: "conflicting",
            timeCostMin: 5,
            trustDelta: -0.2,
            notebookNote: "احتمال ارتباك في الأكواد بعد تغيير الأسعار يزيد شكوك الزبائن لكن ليس سببًا وحيدًا.",
            isBonus: true,
            gate: (flags, currentLean) =>
              Boolean(flags.sqlSuggestsCheckPricing || flags.sqlSuggestsCheckPriceFirst || currentLean === "marketing"),
          },
        ],
      },
    ],
    [lean],
  );

  const askedAnswer = (id: string) => game.interviewAnswers[id];

  const handleAsk = (q: WitnessQuestion) => {
    if (askedAnswer(q.id)) return;
    game.applyInterviewChoiceEffects({
      timeCostMin: q.timeCostMin,
      trustDelta: q.trustDelta ?? 0,
      note: q.notebookNote,
    });
    game.setInterviewAnswer(q.id, q.style);
  };

  const handleContinue = () => {
    if (game.canEnterAnalysis) {
      navigate("/analysis");
      return;
    }

    game.forceAnalysisAccess({
      timeCostMin: 2,
      trustDelta: -0.2,
      note: "تابعت للتحليل دون سؤالين كاملين مما قلل الثقة قليلًا.",
    });
    navigate("/analysis");
  };

  const styleChipColor = (style: AnswerStyle) => {
    if (style === "confirming") return "text-emerald-200 bg-emerald-400/10";
    if (style === "conflicting") return "text-amber-200 bg-amber-400/10";
    return "text-sky-200 bg-sky-400/10";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">الشهود</h1>
            <p className="text-sm text-white/80">
              أنت المحقق. اختر سؤالًا لطرحِه. كل سؤال يستهلك وقتًا وقد يؤثر على الثقة.
            </p>
            <p className="text-xs text-white/60">أُجيبت: {askedCount} سؤال/أسئلة</p>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
              <div className="font-semibold">إطار الثقة</div>
              <p className="mt-1">{frameCopy}</p>
              <p className="mt-1 text-xs text-white/60">اختر بين سرعة التقدم أو جمع إشارات أعمق.</p>
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
          <InvestigationProgress current="interviews" />
        </div>

        <div className="mt-8 space-y-6">
          {witnesses.map((w) => {
            const visibleQuestions = [
              ...w.baseline,
              ...w.bonus.filter((b) => !b.gate || b.gate(game.sqlFlags, lean)),
            ];
            const askedForWitness = visibleQuestions.filter((q) => askedAnswer(q.id)).length;

            return (
              <div
                key={w.id}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{w.title}</h2>
                    <p className="mt-1 text-sm text-white/70">{w.intro}</p>
                    <div className="mt-2 text-xs text-white/70">
                      <b>{w.persona.role}</b> — {w.persona.vibe}
                      <div className="mt-1 text-[11px] text-white/60">تحتاج إلى: {w.persona.youNeed}</div>
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-widest text-white/40">
                      الأسئلة الأساسية دائمًا متاحة. الأسئلة الإضافية تظهر عند توفر إشارات.
                    </p>
                  </div>

                  <div className="text-xs text-white/60 text-right">
                    الملاحظات المسجلة: {askedForWitness}
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {visibleQuestions.map((q) => {
                    const asked = Boolean(askedAnswer(q.id));
                    const trustChip = `${q.trustDelta && q.trustDelta > 0 ? "+" : ""}${q.trustDelta ?? 0}`;

                    return (
                      <div key={q.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-[13px] text-white/80">
                              {q.isBonus && <span className="rounded-full bg-purple-400/20 px-2 py-1 text-xs text-purple-100">سؤال إضافي</span>}
                              <span className={`rounded-full px-2 py-1 text-xs ${styleChipColor(q.style)}`}>
                                {answerLabels[q.style]}
                              </span>
                            </div>
                            <div className="mt-2 font-semibold text-white">{q.text}</div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/70">
                              <span className="rounded-full bg-white/10 px-2 py-1">-{q.timeCostMin} دقيقة</span>
                              <span className="rounded-full bg-white/10 px-2 py-1">الثقة {trustChip}</span>
                              <span className="rounded-full bg-white/10 px-2 py-1">دفتر: {q.notebookNote}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAsk(q)}
                            disabled={asked}
                            className={`min-w-[120px] rounded-xl px-4 py-2 text-sm font-semibold transition ${
                              asked
                                ? "cursor-not-allowed bg-emerald-500/10 text-emerald-100"
                                : "bg-white text-black hover:bg-white/90"
                            }`}
                          >
                            {asked ? "سُئل" : "اطرح السؤال"}
                          </button>
                        </div>

                        {asked && (
                          <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/80">
                            <div className="text-xs text-white/50">إجابة الشاهد:</div>
                            <p className="mt-1 leading-relaxed">{q.answer}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-3 text-sm text-white/70">
          {!game.canEnterAnalysis && (
            <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-amber-50">
              لم تطرح سؤالين بعد. المتابعة ممكنة، لكن ذلك يقلل الثقة ويستهلك دقيقتين.
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/sql")}
              className="text-sm text-white/80 hover:text-white"
            >
              ← رجوع إلى مختبر البيانات
            </button>

            <button
              onClick={handleContinue}
              className={`rounded-xl px-5 py-3 text-sm font-semibold ${
                game.canEnterAnalysis ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white"
              }`}
              title={game.canEnterAnalysis ? "متابعة" : "تابع مع تكلفة بسيطة"}
            >
              متابعة ← التحليل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
