import { useNavigate } from "react-router-dom";

export default function Intro() {
  const nav = useNavigate();

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
              أنت محقق بيانات. المشكلة: Revenue نازل 18%.
              <br />
              الهدف: حدد السبب الحقيقي (مش تخمين).
              <br />
              القيود: الوقت بينقص مع كل خطوة + الثقة بتزيد/تقل مع قراراتك.
              <br />
              الخريطة: Evidence → SQL → Interviews → Analysis → Reveal.
              <br />
              الفوز: توصل لسبب مقنع مع خطوتين تالية (Next Actions).
            </p>
          </div>

          <div className="text-right text-xs text-white/70 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="font-semibold">Case #001</div>
            <div>Revenue Drop</div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Company</div>
            <div className="font-semibold mt-1">NEXORA (SaaS Startup)</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Objective</div>
            <div className="font-semibold mt-1">Identify the true cause</div>
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
            TIP: Prototype — هنمشي ميكانيكس الأول (Flow/Progress/Unlocks) ثم
            Game Feel.
          </div>
        </div>
      </section>
    </main>
  );
}
