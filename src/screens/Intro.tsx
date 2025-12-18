import { useNavigate } from "react-router-dom";
import { CASE001 } from "../content/cases/case001";

export default function Intro() {
  const nav = useNavigate();
  const briefing = CASE001.briefing;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/60">
              Modern Startup Thriller
            </div>
            <h1 className="mt-2 text-4xl font-bold">Data Detective</h1>
            <p className="mt-3 text-white/75 leading-relaxed">
              {briefing.role}
              <br />
              المشكلة: Revenue نازل 18% فجأة.
              <br />
              المخاطرة: {briefing.stakes}
              <br />
              {briefing.pressure}
              <br />
              الفوز: {briefing.win}
            </p>
          </div>

          <div className="text-right text-xs text-white/70 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="font-semibold">Case #001</div>
            <div>Revenue Drop</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Role</div>
            <div className="font-semibold mt-1">محقق بيانات لل-CFO</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Win Condition</div>
            <div className="font-semibold mt-1">سبب واحد + خطوتين تنفيذ</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Pressure</div>
            <div className="font-semibold mt-1">الوقت والثقة بيسربوا مع كل اختيار</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">الخريطة</div>
            <div className="font-semibold mt-1">
              Evidence → SQL → Interviews → Analysis → Reveal
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => nav("/hq")}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-3 font-semibold hover:opacity-90 active:opacity-80"
          >
            Start Investigation <span aria-hidden>→</span>
          </button>

          <div className="text-sm text-white/60">
            أنت في وضع حالة طوارئ. كل غرفة لها هدف واضح. فكر كأنك في غرفة
            حرب مش درس.
          </div>
        </div>
      </section>
    </main>
  );
}
