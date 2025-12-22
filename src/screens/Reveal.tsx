import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import {
  CASE002,
  type CaseInsight,
  type CaseInterviewQuestion,
  type CaseInterviewChoice,
} from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type Suspect = "Stock" | "System" | "Pricing";

type Ending = {
  title: string;
  summary: string;
  why: string[];
  nextActions: string[];
  confidenceLabel: "High" | "Medium" | "Low";
};

export default function Reveal() {
  const game = useGame();
  const nav = useNavigate();
  const caseData = CASE002;
  const insightLibrary = caseData.insights as ReadonlyArray<CaseInsight>;
  const interviewQuestions = caseData.interviews as ReadonlyArray<CaseInterviewQuestion>;
  const laneNames: Record<string, string> = {
    billing: "المخزون",
    product: "النظام",
    marketing: "التسعير",
  };
  const suspectLabels: Record<Suspect, string> = {
    Stock: "المخزون",
    System: "النظام",
    Pricing: "التسعير",
  };

  const placed = game.cards.filter((c) => c.placedIn);
  const insights = game.selectedInsights ?? [];
  const interviewAnswers = game.interviewAnswers ?? {};

  const { score, evidenceNotes, interviewNotes, insightNotes } = useMemo(() => {
    const s: Record<Suspect, number> = { Stock: 0, System: 0, Pricing: 0 };
    const evidenceNotesList: string[] = [];
    const interviewNotesList: string[] = [];
    const insightNotesList: string[] = [];

    const add = (k: Suspect, n: number) => {
      s[k] += n;
    };

    for (const c of placed) {
      evidenceNotesList.push(
        `${c.title}${c.placedIn ? ` → موضوعة تحت ${laneNames[c.placedIn] ?? c.placedIn}` : ""}`,
      );
      switch (c.id) {
        case "branch_b_stockout":
        case "delivery_delay":
          add("Stock", 3);
          break;
        case "pos_errors":
          add("System", 3);
          break;
        case "branch_c_refunds":
        case "price_change":
          add("Pricing", 2);
          break;
        case "foot_traffic":
          add("System", 1);
          break;
        default:
          break;
      }
      if (c.placedIn === "billing") add("Stock", 1);
      if (c.placedIn === "product") add("System", 1);
      if (c.placedIn === "marketing") add("Pricing", 1);
    }

    for (const id of insights) {
      const ins = insightLibrary.find((i) => i.id === id);
      if (ins) insightNotesList.push(ins.title);
      if (id === "stock_issue") add("Stock", 3);
      if (id === "system_issue") add("System", 3);
      if (id === "pricing_issue") add("Pricing", 3);
      if (id === "stable_branch") add("Stock", 1);
    }

    Object.entries(interviewAnswers).forEach(([qid, ans]) => {
      const q = interviewQuestions.find((qq) => qq.id === qid);
      const choice = q?.choices.find((c) => c.id === ans) as CaseInterviewChoice | undefined;
      if (choice) {
        interviewNotesList.push(choice.title);
      }
      switch (ans) {
        case "stock_gap":
        case "customers_waited":
          add("Stock", 3);
          break;
        case "pos_reboots":
          add("System", 3);
          break;
        case "price_pushback":
        case "price_confusion":
          add("Pricing", 2);
          break;
        default:
          break;
      }
    });

    return { score: s, evidenceNotes: evidenceNotesList, interviewNotes: interviewNotesList, insightNotes: insightNotesList };
  }, [insightLibrary, insights, interviewAnswers, interviewQuestions, placed]);

  const ranked = (Object.keys(score) as Suspect[])
    .map((k) => ({ k, v: score[k] }))
    .sort((a, b) => b.v - a.v);
  const top = ranked[0];
  const runner = ranked[1];

  const confidenceLabel: Ending["confidenceLabel"] =
    top.v >= 6 && top.v - (runner?.v ?? 0) >= 2 ? "High" : top.v >= 4 ? "Medium" : "Low";

  const pickEnding = (): Ending => {
    if (!top || top.v === 0) {
      return {
        title: "الإشارات غير واضحة",
        summary: "الأدلة ضعيفة لنداء سبب محدد حتى الآن.",
        confidenceLabel: "Low",
        why: ["النقاط لكل المشتبهين متساوية أو فارغة."],
        nextActions: [
          "ضع مزيدًا من الأدلة وتأكد أن كل بطاقة تحت مخزون/نظام/تسعير.",
          "شغّل مختبر البيانات بمؤشر مختلف (المعاملات الفاشلة أو نفاد المخزون).",
          "اسأل الشاهدين لتحصل على إجابتين على الأقل.",
        ],
      };
    }

    if (top.k === "Stock") {
      return {
        title: "السبب الأرجح: نفاد مخزون في الفرع ب",
        summary: "المبيعات هبطت حيث كانت الرفوف فارغة. إشارات نفاد المخزون وتأخر التسليم تشير لفجوات المخزون.",
        confidenceLabel,
        why: [
          "نفاد المخزون وتأخر التسليم في الفرع ب ظهرت في الأدلة.",
          "رسم المبيعات يوضح تأخر الفرع ب مع حركة مستقرة.",
          "ملاحظات الشهود تشير لتأخر الشحنة أو مغادرة الزبائن عند فقد الأصناف.",
        ],
        nextActions: [
          "سرّع إعادة التوريد للفرع ب وضع فحص رفوف عند الافتتاح.",
          "أضف تنبيهًا يوميًا لنفاد المخزون على السلع السريعة (جدول بسيط يكفي).",
          "بعد التعويض، أعد تشغيل المبيعات مقابل نفاد المخزون للتأكد من التعافي.",
        ],
      };
    }

    if (top.k === "System") {
      return {
        title: "السبب الأرجح: أعطال نقاط البيع / النظام",
        summary: "المعاملات الفاشلة وإعادة تشغيل الأجهزة تعيق المدفوعات، خصوصًا في الفرع ج.",
        confidenceLabel,
        why: [
          "أدلة أخطاء نقاط البيع موضوعة تحت النظام.",
          "مؤشر المعاملات الفاشلة يضع الفرع ج في الصدارة.",
          "الشهود يذكرون إعادة التشغيل أو انتهاء وقت البطاقات.",
        ],
        nextActions: [
          "أعد تشغيل/تحديث نقاط البيع في الفرع ج وراقب المعاملات الفاشلة للساعة القادمة.",
          "ضع خيار دفع احتياطي بسيط أثناء إصلاح الأجهزة.",
          "أعد تشغيل مختبر البيانات على المعاملات الفاشلة بعد الإصلاح لتأكيد الانخفاض.",
        ],
      };
    }

    return {
      title: "السبب الأرجح: رفض التسعير",
      summary: "الاستردادات والشكاوى ارتفعت بعد تغيير السعر مما أضر بمبيعات الفرع ج.",
      confidenceLabel,
      why: [
        "أدلة تغيير السعر والاستردادات مجمعة تحت التسعير.",
        "الشهود يذكرون أسئلة الزبائن حول الأسعار الجديدة.",
        "المبيعات مستقرة حيث لم تصدم الأسعار الزبائن الدائمين.",
      ],
      nextActions: [
        "وضّح بطاقات الأسعار واللافتات؛ احترم السعر القديم للزبائن المرتبكين اليوم.",
        "تتبع الاستردادات غدًا بعد التوضيح لترى إن كانت ستنخفض.",
        "إذا بقيت الاستردادات مرتفعة، أعد السعر السابق للمنتجات الأساسية.",
      ],
    };
  };

  const ending = pickEnding();
  const confidenceDisplay =
    ending.confidenceLabel === "High"
      ? "مرتفعة"
      : ending.confidenceLabel === "Medium"
        ? "متوسطة"
        : "منخفضة";

  const supporting: string[] = [
    ...evidenceNotes,
    ...insightNotes,
    ...interviewNotes,
  ].filter(Boolean);

  const recoveryChecklist = [
    "اجمع أو أعد وضع دليل واحد إضافي إذا كانت المسارات فارغة.",
    "أعد تشغيل الاستعلام بمؤشر آخر (جرّب المعاملات الفاشلة مقابل نفاد المخزون).",
    "اسأل الشاهد الذي تخطيته لرفع الثقة.",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">كشف الحقيقة</h1>
            <p className="mt-2 text-sm text-white/70">الهدف: اعرض السبب، الأدلة، ومستوى الثقة. هذه قصتك لصاحب المتجر.</p>
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
            <div className="text-xs text-white/60">مستوى الثقة</div>
            <div className="text-lg font-semibold">{confidenceDisplay}</div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-black/30 p-6">
          <div className="text-xs uppercase tracking-widest text-white/50">خلاصة المحقق</div>
          <h2 className="mt-2 text-2xl font-semibold">{ending.title}</h2>
          <p className="mt-2 text-white/80">{ending.summary}</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
              <div className="text-xs text-emerald-200 uppercase tracking-widest">لماذا</div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
                {ending.why.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs uppercase tracking-widest text-white/60">الخطوات التالية</div>
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
                {ending.nextActions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/60">الأدلة الداعمة</div>
            {supporting.length ? (
              <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-white/80">
                {supporting.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-white/70">لا توجد أدلة مسجلة. ضع الأدلة وأجب أسئلة الشهود.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs uppercase tracking-widest text-white/60">دفتر الملاحظات</div>
            <ul className="mt-2 space-y-2 list-disc pl-5 text-xs text-white/70">
              <li>الأدلة الموضوعة: {game.placedCount}/{game.cluesGoal}</li>
              <li>إجابات الشهود: {Object.keys(interviewAnswers).length}</li>
              <li>النتائج: {game.selectedInsights.length}</li>
            </ul>
            {ending.confidenceLabel === "Low" && (
              <div className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-xs text-amber-100">
                <div className="font-semibold text-amber-200">قائمة التعافي</div>
                <ul className="mt-1 list-disc space-y-1 pl-5">
                  {recoveryChecklist.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => nav("/analysis")}
            className="text-sm text-white/80 hover:text-white"
          >
            ← رجوع إلى التحليل
          </button>
          <div className="text-xs text-white/60">مبرر الثقة: الدرجات {ranked.map((r) => `${suspectLabels[r.k] ?? r.k}:${r.v}`).join(" · ")}</div>
        </div>
      </div>
    </div>
  );
}
