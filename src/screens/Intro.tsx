import { useNavigate } from "react-router-dom";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

export default function Intro() {
  const nav = useNavigate();
  const briefing = CASE002.briefing;

  return (
    <main className="min-h-screen flex items-center justify-center px-6" dir="rtl">
      <section className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 space-y-6 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/60">موجز القضية</div>
            <h1 className="mt-2 text-4xl font-bold">محقق البيانات</h1>
            <p className="mt-2 text-white/70 text-sm">
              القضية 002 لغز بيع بالتجزئة صغير. أنت لا تصلح نظام SaaS — أنت تنقذ متجر الحي قبل الإغلاق.
            </p>
          </div>

          <div className="text-right text-xs text-white/70 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="font-semibold">القضية 002</div>
            <div>مبيعات مفقودة</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">بطاقة اللاعب</div>
            <div className="font-semibold mt-1">محقق بيانات مبتدئ</div>
            <div className="text-xs text-white/60">الرتبة: محلل مبتدئ</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">الوقت</div>
            <div className="font-semibold mt-1">الإجراءات قبل الموعد</div>
            <div className="text-xs text-white/60">اصرفه بحكمة</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">الثقة</div>
            <div className="font-semibold mt-1">ثقة المالك بك</div>
            <div className="text-xs text-white/60">تزيد مع قرارات ذكية</div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="text-xs text-white/60">موجز</div>
            <div className="font-semibold">من أنت</div>
            <p className="text-sm text-white/80">{briefing.role}</p>
            <div className="font-semibold">المشكلة</div>
            <p className="text-sm text-white/80">{briefing.stakes}</p>
            <div className="font-semibold">الضغط</div>
            <p className="text-sm text-white/80">{briefing.pressure}</p>
            <div className="font-semibold">شروط الفوز</div>
            <p className="text-sm text-white/80">{briefing.win}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="text-xs text-white/60">الخريطة</div>
            <div className="font-semibold">المقر ← غرفة الأدلة ← مختبر البيانات ← الشهود ← التحليل ← كشف الحقيقة</div>
            <p className="text-sm text-white/70">
              كل غرفة تجيب سؤالًا: ترتيبا، جمع أدلة، اختبار استعلام، سؤال الناس، قراءة الرسوم، ثم الإغلاق.
            </p>
            <InvestigationProgress current="hq" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">ما ستتعلمه</div>
            <ul className="mt-2 space-y-2 text-sm text-white/80 list-disc pl-4">
              <li>قراءة مجموعات بيانات بسيطة مثل جدول المبيعات.</li>
              <li>اختيار الفحص الصحيح (تصفية أو رسم) للسؤال.</li>
              <li>إكمال استعلام SQL ودود دون حفظ الصياغة.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-white/90">
          <div className="font-semibold">عرض سينمائي سريع</div>
          <p className="mt-1">
            صاحب متجر بثلاثة فروع يرى المبيعات الأسبوعية تختفي. الأسباب المحتملة: رفوف فارغة، أجهزة دفع تتعطل، أو زبائن منزعجون من زيادة سعر. لديك يوم واحد للعثور على السبب الحقيقي وإخباره بما يجب إصلاحه.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => nav("/hq")}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-3 font-semibold hover:opacity-90 active:opacity-80"
          >
            ابدأ التحقيق <span aria-hidden>←</span>
          </button>

          <div className="text-sm text-white/60">
            الوضوح أولًا: كل غرفة تخبرك لماذا هي مهمة. اصرف الوقت واكسب الثقة أثناء التقدم.
          </div>
        </div>
      </section>
    </main>
  );
}
