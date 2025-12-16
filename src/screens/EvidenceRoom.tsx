import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "../store/game";

export default function EvidenceRoom() {
  const navigate = useNavigate();
  const game = useGame();

  const unplaced = useMemo(
    () => game.cards.filter((c) => !c.placedIn),
    [game.cards]
  );

  const placedList = useMemo(
    () => game.cards.filter((c) => c.placedIn),
    [game.cards]
  );

  const canContinueToSQL = game.canEnterSQL;

  return (
    <div className="min-h-screen text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Evidence Room</h1>

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
                canContinueToSQL
                  ? "bg-white text-black hover:bg-white/90"
                  : "bg-white/10 text-white/50 pointer-events-none"
              }`}
              title={canContinueToSQL ? "" : "اجمع Clue واحد على الأقل أولاً"}
            >
              Continue → SQL Lab
            </Link>
          </div>
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

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* LEFT: Evidence Cards */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Evidence Cards</h2>
              <div className="text-xs text-white/60">
                {unplaced.length} unplaced
              </div>
            </div>

            <div className="space-y-3">
              {unplaced.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="mt-1 text-sm text-white/70">{c.hint}</div>
                    </div>

                    <div className="shrink-0 text-xs text-white/60">
                      Not placed
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <PlaceBtn cardId={c.id} label="Billing" onPlace={() => game.placeCard(c.id, "billing")} />
                    <PlaceBtn cardId={c.id} label="Product" onPlace={() => game.placeCard(c.id, "product")} />
                    <PlaceBtn cardId={c.id} label="Marketing" onPlace={() => game.placeCard(c.id, "marketing")} />
                  </div>
                </div>
              ))}

              {unplaced.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                  ممتاز — كل الكروت اتعملها Place.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Board */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold">Investigation Board</h2>
            <p className="mt-1 text-sm text-white/70">
              الهدف دلوقتي: اعمل Place لأي كارت → يزيد Clues → يفتح SQL.
            </p>

            <div className="mt-4 space-y-3">
              <BoardLane title="Billing Signals" subtitle="Refunds / Pricing / Churn" items={placedList.filter(x => x.placedIn === "billing")} />
              <BoardLane title="Product Signals" subtitle="Errors / Adoption / Usage" items={placedList.filter(x => x.placedIn === "product")} />
              <BoardLane title="Marketing Signals" subtitle="CAC / CPC / Conversion" items={placedList.filter(x => x.placedIn === "marketing")} />
            </div>

            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              تلميح: أول ما تجمع 1 Clue (حالياً) هتقدر تضغط <b>Continue → SQL Lab</b>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlaceBtn({ cardId, label, onPlace }: { cardId: string; label: string; onPlace: () => void }) {
  return (
    <button
      onClick={onPlace}
      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10"
      data-card={cardId}
    >
      Place → {label}
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
            Drop evidence here (placeholder)
          </div>
        )}
      </div>
    </div>
  );
}
