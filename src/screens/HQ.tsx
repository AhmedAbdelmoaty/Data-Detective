import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002, type CaseInterviewChoice } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

function Card({
  title,
  subtitle,
  to,
  tag,
}: {
  title: string;
  subtitle: string;
  to: string;
  tag: string;
}) {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(to)}
      className="text-right w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5 flex items-center justify-between gap-4"
    >
      <div>
        <div className="text-lg font-semibold">{title}</div>
        <div className="text-sm text-white/65 mt-1">{subtitle}</div>
      </div>
      <span className="shrink-0 text-xs rounded-full border border-white/15 bg-black/30 px-3 py-1 text-white/80">
        {tag}
      </span>
    </button>
  );
}

export default function HQ() {
  const game = useGame();
  const nav = useNavigate();
  const roomObjectives = CASE002.roomObjectives;
  const laneTitles: Record<string, string> = {
    billing: "المخزون",
    product: "النظام",
    marketing: "التسعير",
  };
  const insightTitles = new Map<string, string>(CASE002.insights.map((i) => [i.id, i.title]));
  const questionLookup = new Map<string, { header: string; choices: ReadonlyArray<CaseInterviewChoice> }>(
    CASE002.interviews.map((q) => [q.id, { header: q.header, choices: q.choices }]),
  );

  const interpreted = game.cards.filter((c) => c.interpretation);
  const categoryCounts = interpreted.reduce<Record<string, number>>(
    (acc, card) => {
      const cat = card.interpretation?.category;
      if (cat) acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {},
  );
  const leadingCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  const hypothesisSummary = leadingCategory
    ? `المسار الأقوى: ${laneTitles[leadingCategory[0]]} (${leadingCategory[1]} إشارة)`
    : "الفرضية الحالية غير مكتملة";
  const hypothesisDetail = interpreted.length
    ? `عدد التفسيرات: ${interpreted.length} · يحتاج فتح المختبر إلى ٣ تفسيرات مع اتساق.`
    : "ابدأ بتفسير الأدلة في غرفة الأدلة.";
  const notebookEntries = game.notebook.length ? game.notebook.slice(-3).join(" · ") : "لا ملاحظات بعد";

  const remainingForSQL = Math.max(3 - game.placedCount, 0);
  const remainingForAnalysis = Math.max(2 - game.interviewAnswersCount, 0);
  const remainingForReveal = Math.max(2 - game.selectedInsightsCount, 0);
  let currentObjective = "راجع لوحتك ثم انتقل إلى الخطوة التالية الواضحة.";
  if (!game.canEnterSQL) {
    currentObjective = `ضع ${remainingForSQL} دليلًا إضافيًا لفتح مختبر البيانات.`;
  } else if (!game.canEnterInterviews) {
    currentObjective = "أكمل الاستعلام لتعرف ما الذي ستسأل الشهود عنه.";
  } else if (!game.canEnterAnalysis) {
    currentObjective = `أجب على ${remainingForAnalysis} سؤال شاهد إضافي لفتح غرفة التحليل.`;
  } else if (!game.canReveal) {
    currentObjective = `ثبّت ${remainingForReveal} نتيجة إضافية لإغلاق القضية.`;
  } else {
    currentObjective = "المسار مفتوح: اذهب إلى كشف الحقيقة مع قصتك.";
  }

  const placedNotebook =
    game.cards
      .filter((c) => c.placedIn)
      .map((c) => `${c.title} → ${laneTitles[c.placedIn ?? ""] ?? c.placedIn}`)
      .join(" · ") || "لم تُوضع أي أدلة بعد";

  const interviewNotebook = Object.keys(game.interviewAnswers).length
    ? Object.entries(game.interviewAnswers)
        .map(([q, a]) => {
          const qInfo = questionLookup.get(q);
          const choiceTitle = (qInfo?.choices as CaseInterviewChoice[] | undefined)?.find(
            (c: CaseInterviewChoice) => c.id === a,
          )?.title;
          return `${qInfo?.header ?? q}: ${choiceTitle ?? a}`;
        })
        .join(" · ")
    : "لا توجد إجابات شهود بعد";

  const insightNotebook = game.selectedInsights.length
    ? game.selectedInsights
        .map((id) => insightTitles.get(id) ?? id)
        .join(", ")
    : "لم تُحدد أي نتائج بعد";

  return (
    <main className="min-h-screen px-6 py-10" dir="rtl">
      <div className="max-w-5xl mx-auto text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/60">المقر</div>
            <h1 className="mt-2 text-3xl font-bold">اختر خطوتك التالية</h1>
            <p className="mt-2 text-white/70">المقر = مكتب القيادة. اعرف من أنت، المهمة، وأفضل خطوة تالية.</p>
          </div>

          <button
            onClick={() => nav("/")}
            className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm hover:bg-black/40"
          >
            رجوع ←
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="hq" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">اللاعب</div>
            <div className="font-semibold mt-1">محقق بيانات مبتدئ</div>
            <div className="text-xs text-white/60">الرتبة: محلل مبتدئ</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">الوقت</div>
            <div className="font-semibold mt-1">{game.time}</div>
            <div className="text-xs text-white/60">إجراءات متبقية</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">الثقة</div>
            <div className="font-semibold mt-1">{game.trust}</div>
            <div className="text-xs text-white/60">حافظ على ثقة المالك</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="font-semibold">لمحة عن القضية</div>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>المشهد: مبيعات مفقودة في ٣ فروع بيع بالتجزئة.</li>
            <li>الهدف: تفسير الهبوط قبل نهاية اليوم.</li>
            <li>المسار: المقر ← غرفة الأدلة ← مختبر البيانات ← الشهود ← التحليل ← كشف الحقيقة.</li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">لوحة المهمة</div>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>غرفة الأدلة: {roomObjectives.evidence}</li>
              <li>مختبر البيانات: {roomObjectives.sql}</li>
              <li>الشهود: {roomObjectives.interviews}</li>
              <li>غرفة التحليل: {roomObjectives.analysis}</li>
              <li>كشف الحقيقة: {roomObjectives.reveal}</li>
            </ul>
            <p className="mt-3 text-white/65">
              الوقت = كم إجراء يمكنك تنفيذه. الثقة = مدى اطمئنان المالك. الاختيارات الذكية تحمي الاثنين.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="font-semibold">معاينة دفتر الملاحظات</div>
            <ul className="mt-2 space-y-2 text-xs text-white/80 list-disc pl-4">
              <li>ملاحظات التحقيق: {notebookEntries}</li>
              <li>الأدلة الموضوعة: {placedNotebook}</li>
              <li>إجابات الشهود: {interviewNotebook}</li>
              <li>النتائج المثبتة: {insightNotebook}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-white/80">
          <div className="font-semibold">الفرضية الحالية</div>
          <p className="mt-1">{hypothesisSummary}</p>
          <p className="text-xs text-white/70 mt-1">{hypothesisDetail}</p>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
          <div className="font-semibold">الخطوة الأفضل التالية</div>
          <p className="mt-1">{currentObjective}</p>
          <p className="text-xs text-white/60 mt-1">نصيحة: اذهب لغرفة الأدلة أولًا لجمع ووضع البطاقات.</p>
        </div>

        <div className="mt-6 grid gap-4">
          <Card
            title="غرفة الأدلة"
            subtitle="اجمع الأدلة وضعها تحت السبب الأرجح"
            to="/evidence"
            tag="يفتح مختبر البيانات عند وضع ٣"
          />
          <Card
            title="مختبر البيانات (SQL)"
            subtitle={
              remainingForSQL > 0
                ? `ضع ${remainingForSQL} دليلًا إضافيًا للفتح`
                : "أكمل استعلامًا بسيطًا لتوجيه أسئلة الشهود"
            }
            to="/sql"
            tag="استعلام"
          />
          <Card
            title="غرفة التحليل"
            subtitle={
              game.canEnterAnalysis
                ? "فلاتر + رسوم لصياغة النتائج"
                : `أجب على ${remainingForAnalysis} سؤال شاهد إضافي`
            }
            to="/analysis"
            tag="نتائج"
          />
          <Card
            title="الشهود"
            subtitle={
              game.canEnterInterviews
                ? "اسأل المدير والكاشير"
                : "شغّل الاستعلام أولًا للفتح"
            }
            to="/interviews"
            tag="اختيارات"
          />
          <Card
            title="كشف الحقيقة"
            subtitle={
              game.canReveal
                ? "اختتم القضية بأدلة وثقة"
                : `ثبّت ${remainingForReveal} نتيجة إضافية`
            }
            to="/reveal"
            tag="مقفول"
          />
        </div>
      </div>
    </main>
  );
}
