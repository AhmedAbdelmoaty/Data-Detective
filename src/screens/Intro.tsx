import { useNavigate } from "react-router-dom";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

export default function Intro() {
  const nav = useNavigate();
  const briefing = CASE002.briefing;

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section className="w-full max-w-4xl rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/60">
              Case Briefing
            </div>
            <h1 className="mt-2 text-4xl font-bold">Data Detective</h1>
            <p className="mt-2 text-white/70 text-sm">
              Case 002 is a small retail mystery. You are not debugging a SaaS —
              you are saving a neighborhood shop before closing time.
            </p>
          </div>

          <div className="text-right text-xs text-white/70 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <div className="font-semibold">Case 002</div>
            <div>Missing Sales</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Player Card</div>
            <div className="font-semibold mt-1">Junior Data Detective</div>
            <div className="text-xs text-white/60">Rank: Rookie Analyst</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Time</div>
            <div className="font-semibold mt-1">Actions before deadline</div>
            <div className="text-xs text-white/60">Spend wisely</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">Trust</div>
            <div className="font-semibold mt-1">Boss confidence in you</div>
            <div className="text-xs text-white/60">Grows with smart calls</div>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="text-xs text-white/60">Briefing</div>
            <div className="font-semibold">Who you are</div>
            <p className="text-sm text-white/80">{briefing.role}</p>
            <div className="font-semibold">The problem</div>
            <p className="text-sm text-white/80">{briefing.stakes}</p>
            <div className="font-semibold">Pressure</div>
            <p className="text-sm text-white/80">{briefing.pressure}</p>
            <div className="font-semibold">Win condition</div>
            <p className="text-sm text-white/80">{briefing.win}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4 space-y-2">
            <div className="text-xs text-white/60">Map</div>
            <div className="font-semibold">HQ → Evidence → Data Lab → Witnesses → Analysis → Reveal</div>
            <p className="text-sm text-white/70">
              Each room answers one question: orient, collect clues, test a query, ask people,
              read charts, then close.
            </p>
            <InvestigationProgress current="hq" />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-xs text-white/60">What you will learn</div>
            <ul className="mt-2 space-y-2 text-sm text-white/80 list-disc pl-4">
              <li>Read simple datasets like a sales table.</li>
              <li>Choose the right check (filter or chart) for the question.</li>
              <li>Complete a friendly SQL query without needing to memorize syntax.</li>
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-white/90">
          <div className="font-semibold">Cinematic Brief</div>
          <p className="mt-1">
            A retail owner with three branches sees weekly sales vanish. Possible causes: shelves empty,
            card terminals glitching, or customers upset about a price bump. You have one day to find
            the real cause and tell them what to fix.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => nav("/hq")}
            className="inline-flex items-center gap-2 rounded-xl bg-white text-black px-5 py-3 font-semibold hover:opacity-90 active:opacity-80"
          >
            Start Investigation <span aria-hidden>→</span>
          </button>

          <div className="text-sm text-white/60">
            Clarity first: every room tells you why it matters. Spend Time and earn Trust as you move.
          </div>
        </div>
      </section>
    </main>
  );
}
