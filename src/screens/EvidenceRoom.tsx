import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

const laneLabels = {
  billing: { title: "Stock (Inventory)", subtitle: "Missing items / delivery timing" },
  product: { title: "System (POS)", subtitle: "Payment failures / device resets" },
  marketing: { title: "Pricing", subtitle: "Price change or perception" },
};

type LaneKey = keyof typeof laneLabels;

export default function EvidenceRoom() {
  const navigate = useNavigate();
  const game = useGame();
  const caseData = CASE002;

  const unplaced = useMemo(() => game.cards.filter((c) => !c.placedIn), [game.cards]);

  const placedList = useMemo(() => game.cards.filter((c) => c.placedIn), [game.cards]);

  const canContinueToSQL = game.canEnterSQL;
  const neededForSql = Math.max(3 - game.placedCount, 0);

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Evidence Room</h1>
            <p className="text-sm text-white/70">
              Objective: place <b>3 clues</b> to unlock the Data Lab. Group them by the most likely cause.
            </p>
            <p className="mt-1 text-xs text-white/60">Why first? {caseData.evidenceReason}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => navigate("/hq")}
            >
              ← Back to HQ
            </button>

            <Link
              to="/sql"
              className={`rounded-xl px-3 py-2 text-sm ${
                canContinueToSQL ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/50 pointer-events-none"
              }`}
              title={canContinueToSQL ? "" : `Place ${neededForSql} more clues to open Data Lab`}
            >
              Continue → Data Lab
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="evidence" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">Time</div>
            <div className="mt-1 text-lg font-semibold">{game.time}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">Trust</div>
            <div className="mt-1 text-lg font-semibold">{game.trust}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">XP</div>
            <div className="mt-1 text-lg font-semibold">{game.xp}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">Clues</div>
            <div className="mt-1 text-lg font-semibold">
              {game.placedCount}/{game.cluesGoal}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="font-semibold">Why Time is spent here?</div>
            <p className="mt-1">{caseData.timeCostReason}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-white/80">
            <div className="font-semibold">Evidence Help</div>
            <p className="mt-1">Placing is your hypothesis: you are grouping clues by cause (Stock / System / Pricing).</p>
            <p className="mt-1">Pick the lane that feels most likely. You can adjust later, but each move spends Time.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* LEFT: Evidence Cards */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Evidence Cards</h2>
              <div className="text-xs text-white/60">{unplaced.length} unplaced</div>
            </div>

            <div className="space-y-3">
              {unplaced.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="mt-1 text-sm text-white/70">{c.hint}</div>
                      <div className="mt-2 grid gap-1 text-xs text-white/70">
                        <div><span className="text-white/60">What it means:</span> {c.meaning}</div>
                        <div><span className="text-white/60">Why it matters:</span> {c.why}</div>
                        <div><span className="text-white/60">Points toward:</span> {c.pointsToward}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-white/60">Not placed</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <PlaceBtn
                      cardId={c.id}
                      label="Stock"
                      onPlace={() => game.placeCard(c.id, "billing")}
                      helper="Inventory / delivery"
                    />
                    <PlaceBtn
                      cardId={c.id}
                      label="System"
                      onPlace={() => game.placeCard(c.id, "product")}
                      helper="POS or payment"
                    />
                    <PlaceBtn
                      cardId={c.id}
                      label="Pricing"
                      onPlace={() => game.placeCard(c.id, "marketing")}
                      helper="Price or refund"
                    />
                  </div>
                </div>
              ))}

              {unplaced.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                  Great — every clue is placed. Head to the Data Lab.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Board */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold">Investigation Board</h2>
            <p className="mt-1 text-sm text-white/70">
              Sort clues under Stock / System / Pricing. Target: place 3 cards to unlock the Data Lab.
            </p>

            <div className="mt-4 space-y-3">
              {(Object.keys(laneLabels) as LaneKey[]).map((lane) => (
                <BoardLane
                  key={lane}
                  title={laneLabels[lane].title}
                  subtitle={laneLabels[lane].subtitle}
                  items={placedList.filter((x) => x.placedIn === lane)}
                />
              ))}
            </div>

            {!canContinueToSQL && (
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                Hint: place {neededForSql} more clue(s) to enable <b>Continue → Data Lab</b>.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceBtn({
  cardId,
  label,
  helper,
  onPlace,
}: {
  cardId: string;
  label: string;
  helper: string;
  onPlace: () => void;
}) {
  return (
    <button
      onClick={onPlace}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
      data-card={cardId}
    >
      Place → {label}
      <div className="text-[10px] text-white/50">{helper}</div>
    </button>
  );
}

function BoardLane({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Array<{ id: string; title: string; hint: string }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-white/60">{subtitle}</div>
        </div>
        <div className="text-xs text-white/60">{items.length} placed</div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="mt-1 text-xs text-white/70">{it.hint}</div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/15 bg-black/10 p-3 text-xs text-white/60">
            Empty lane = no story. Place a clue to shape the hypothesis.
          </div>
        )}
      </div>
    </div>
  );
}
