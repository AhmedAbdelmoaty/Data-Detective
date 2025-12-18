import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
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
      className="text-left w-full rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-5 flex items-center justify-between gap-4"
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

  const remainingForSQL = Math.max(3 - game.placedCount, 0);
  const remainingForAnalysis = Math.max(2 - game.interviewAnswersCount, 0);
  const remainingForReveal = Math.max(2 - game.selectedInsightsCount, 0);

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/60">
              Headquarters
            </div>
            <h1 className="mt-2 text-3xl font-bold">Choose your next move</h1>
            <p className="mt-2 text-white/70">
              دي خريطة التحقيق. اختار غرفة—كل خطوة هتفتح تقدم لاحقًا.
            </p>
          </div>

          <button
            onClick={() => nav("/")}
            className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm hover:bg-black/40"
          >
            ← Back
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">Time</div>
            <div className="font-semibold mt-1">{game.time}</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">Progress</div>
            <div className="font-semibold mt-1">
              {game.placedCount} / {game.cluesGoal}
            </div>

          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="text-xs uppercase tracking-widest text-white/60">Mission Board</div>
          <p className="mt-2">
            Evidence: جمع Clues علشان تفتح SQL. SQL: شغّل استعلام يفتح Interviews.
            Interviews: اختيارات تقل/تزود Time & Trust وتفتح Analysis. Analysis: اختار Insights
            تدعم سردية واضحة وتفتح Reveal.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          <Card
            title="Evidence Room"
            subtitle="جمع الأدلة الأولية"
            to="/evidence"
            tag="Clues +1"
          />
          <Card
            title="SQL Lab"
            subtitle={
              remainingForSQL > 0
                ? `عايز ${remainingForSQL} Clues علشان SQL يتفتح`
                : "استعلامات تكشف الحقيقة — مفتوح"
            }
            to="/sql"
            tag="Query"
          />
          <Card
            title="Analysis Room"
            subtitle={
              game.canEnterAnalysis
                ? "Dashboards & KPIs — جاه"
                : `جاوب على ${remainingForAnalysis} أسئلة كمان في Interviews`
            }
            to="/analysis"
            tag="Insight"
          />
          <Card
            title="Interviews"
            subtitle={
              game.canEnterInterviews
                ? "حوارات تفتح مسارات — مفتوح"
                : "اعمل Run Query في SQL Lab الأول"
            }
            to="/interviews"
            tag="Choices"
          />
          <Card
            title="Reveal"
            subtitle={
              game.canReveal
                ? "اقفل القضية"
                : `اختار ${remainingForReveal} Insights كمان علشان يتفتح`
            }
            to="/reveal"
            tag="Locked"
          />
        </div>
      </div>
    </main>
  );
}
