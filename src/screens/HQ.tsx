import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
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
  const roomObjectives = CASE002.roomObjectives;

  const remainingForSQL = Math.max(3 - game.placedCount, 0);
  const remainingForAnalysis = Math.max(2 - game.interviewAnswersCount, 0);
  const remainingForReveal = Math.max(2 - game.selectedInsightsCount, 0);
  let currentObjective = "Check your board then move to the next clear action.";
  if (!game.canEnterSQL) {
    currentObjective = `Place ${remainingForSQL} more clue(s) to open the Data Lab.`;
  } else if (!game.canEnterInterviews) {
    currentObjective = "Complete the query so you know what to ask the witnesses.";
  } else if (!game.canEnterAnalysis) {
    currentObjective = `Answer ${remainingForAnalysis} more witness question(s) to unlock Analysis.`;
  } else if (!game.canReveal) {
    currentObjective = `Lock ${remainingForReveal} more insight(s) to close the case.`;
  } else {
    currentObjective = "Path is clear: head to Reveal with your story.";
  }

  const placedNotebook =
    game.cards
      .filter((c) => c.placedIn)
      .map((c) => `${c.title} → ${c.placedIn}`)
      .join(" · ") || "No clues placed yet";

  const interviewNotebook = Object.keys(game.interviewAnswers).length
    ? Object.entries(game.interviewAnswers)
        .map(([q, a]) => `${q}: ${a}`)
        .join(" · ")
    : "No witness answers yet";

  const insightNotebook = game.selectedInsights.length
    ? game.selectedInsights.join(", ")
    : "No insights selected yet";

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs tracking-widest uppercase text-white/60">Headquarters</div>
            <h1 className="mt-2 text-3xl font-bold">Choose your next move</h1>
            <p className="mt-2 text-white/70">
              HQ = command desk. See who you are, the mission, and the next best step.
            </p>
          </div>

          <button
            onClick={() => nav("/")}
            className="rounded-xl border border-white/15 bg-black/30 px-4 py-2 text-sm hover:bg-black/40"
          >
            ← Back
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="hq" />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">Player</div>
            <div className="font-semibold mt-1">Junior Data Detective</div>
            <div className="text-xs text-white/60">Rank: Rookie Analyst</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">Time</div>
            <div className="font-semibold mt-1">{game.time}</div>
            <div className="text-xs text-white/60">Actions left</div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs text-white/60">Trust</div>
            <div className="font-semibold mt-1">{game.trust}</div>
            <div className="text-xs text-white/60">Keep the owner confident</div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80">
          <div className="font-semibold">Case snapshot</div>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Scenario: Missing sales across 3 retail branches.</li>
            <li>Goal: Explain the drop before the day ends.</li>
            <li>Path: HQ → Evidence → Data Lab → Witnesses → Analysis → Reveal.</li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-widest text-white/60">Mission Board</div>
            <ul className="mt-2 space-y-2 list-disc pl-5">
              <li>Evidence Room: {roomObjectives.evidence}</li>
              <li>Data Lab: {roomObjectives.sql}</li>
              <li>Witnesses: {roomObjectives.interviews}</li>
              <li>Analysis Room: {roomObjectives.analysis}</li>
              <li>Reveal: {roomObjectives.reveal}</li>
            </ul>
            <p className="mt-3 text-white/65">
              Time = how many actions you can take. Trust = how confident the boss is. Smart choices protect both.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
            <div className="font-semibold">Notebook preview</div>
            <ul className="mt-2 space-y-2 text-xs text-white/80 list-disc pl-4">
              <li>Placed clues: {placedNotebook}</li>
              <li>Witness answers: {interviewNotebook}</li>
              <li>Insights locked: {insightNotebook}</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/80">
          <div className="font-semibold">Next best step</div>
          <p className="mt-1">{currentObjective}</p>
          <p className="text-xs text-white/60 mt-1">Tip: Go to Evidence Room first to collect and place clues.</p>
        </div>

        <div className="mt-6 grid gap-4">
          <Card
            title="Evidence Room"
            subtitle="Collect clues and place them under a likely cause"
            to="/evidence"
            tag="Opens Data Lab when 3 placed"
          />
          <Card
            title="Data Lab (SQL)"
            subtitle={
              remainingForSQL > 0
                ? `Place ${remainingForSQL} more clue(s) to open`
                : "Complete a simple query to guide witness questions"
            }
            to="/sql"
            tag="Query"
          />
          <Card
            title="Analysis Room"
            subtitle={
              game.canEnterAnalysis
                ? "Filters + charts to craft insights"
                : `Answer ${remainingForAnalysis} more witness question(s)`
            }
            to="/analysis"
            tag="Insight"
          />
          <Card
            title="Witnesses"
            subtitle={
              game.canEnterInterviews
                ? "Ask the manager and cashier"
                : "Run the query first to unlock"
            }
            to="/interviews"
            tag="Choices"
          />
          <Card
            title="Reveal"
            subtitle={
              game.canReveal
                ? "Close the case with evidence and confidence"
                : `Lock ${remainingForReveal} more insight(s)`
            }
            to="/reveal"
            tag="Locked"
          />
        </div>
      </div>
    </main>
  );
}
