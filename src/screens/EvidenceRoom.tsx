import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

const laneLabels = {
  billing: { title: "المخزون", subtitle: "نقص الأصناف / توقيت التسليم" },
  product: { title: "النظام", subtitle: "فشل المدفوعات / إعادة تشغيل الأجهزة" },
  marketing: { title: "التسعير", subtitle: "تغيير السعر أو الانطباع" },
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
    <div className="min-h-screen text-white px-6 py-10" dir="rtl">
      <div className="mx-auto max-w-5xl text-right">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">غرفة الأدلة</h1>
            <p className="text-sm text-white/70">
              الهدف: ضع <b>٣ أدلة</b> لفتح مختبر البيانات. جمّعها تحت السبب الأرجح.
            </p>
            <p className="mt-1 text-xs text-white/60">لماذا أولًا؟ {caseData.evidenceReason}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
              onClick={() => navigate("/hq")}
            >
              رجوع ← إلى المقر
            </button>

            <Link
              to="/sql"
              className={`rounded-xl px-3 py-2 text-sm ${
                canContinueToSQL ? "bg-white text-black hover:bg-white/90" : "bg-white/10 text-white/50 pointer-events-none"
              }`}
              title={canContinueToSQL ? "" : `ضع ${neededForSql} أدلة إضافية لفتح مختبر البيانات`}
            >
              متابعة ← مختبر البيانات
            </Link>
          </div>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="evidence" />
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">الوقت</div>
            <div className="mt-1 text-lg font-semibold">{game.time}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">الثقة</div>
            <div className="mt-1 text-lg font-semibold">{game.trust}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">الخبرة</div>
            <div className="mt-1 text-lg font-semibold">{game.xp}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="text-xs text-white/70">الأدلة</div>
            <div className="mt-1 text-lg font-semibold">
              {game.placedCount}/{game.cluesGoal}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="font-semibold">لماذا نصرف الوقت هنا؟</div>
            <p className="mt-1">{caseData.timeCostReason}</p>
          </div>
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-white/80">
            <div className="font-semibold">مساعدة الأدلة</div>
            <p className="mt-1">الوضع هو فرضيتك: أنت تجمع الأدلة حسب السبب (مخزون / نظام / تسعير).</p>
            <p className="mt-1">اختر المسار الأرجح. يمكنك التعديل لاحقًا لكن كل حركة تستهلك وقتًا.</p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* LEFT: Evidence Cards */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">بطاقات الأدلة</h2>
              <div className="text-xs text-white/60">{unplaced.length} غير موضوعة</div>
            </div>

            <div className="space-y-3">
              {unplaced.map((c) => (
                <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold">{c.title}</div>
                      <div className="mt-1 text-sm text-white/70">{c.hint}</div>
                      <div className="mt-2 grid gap-1 text-xs text-white/70">
                        <div><span className="text-white/60">المعنى:</span> {c.meaning}</div>
                        <div><span className="text-white/60">لماذا يهم:</span> {c.why}</div>
                        <div><span className="text-white/60">يشير إلى:</span> {c.pointsToward}</div>
                      </div>
                    </div>

                    <div className="shrink-0 text-xs text-white/60">غير موضوعة</div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <PlaceBtn
                      cardId={c.id}
                      label="المخزون"
                      onPlace={() => game.placeCard(c.id, "billing")}
                      helper="المخزون / التسليم"
                    />
                    <PlaceBtn
                      cardId={c.id}
                      label="النظام"
                      onPlace={() => game.placeCard(c.id, "product")}
                      helper="نقاط البيع أو الدفع"
                    />
                    <PlaceBtn
                      cardId={c.id}
                      label="التسعير"
                      onPlace={() => game.placeCard(c.id, "marketing")}
                      helper="السعر أو الاسترداد"
                    />
                  </div>
                </div>
              ))}

              {unplaced.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                  رائع — كل الأدلة وُضعت. اتجه إلى مختبر البيانات.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Board */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold">لوحة التحقيق</h2>
            <p className="mt-1 text-sm text-white/70">
              صنّف الأدلة تحت مخزون / نظام / تسعير. الهدف: ضع ٣ بطاقات لفتح مختبر البيانات.
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
                تلميح: ضع {neededForSql} دليلًا إضافيًا لتفعيل <b>متابعة ← مختبر البيانات</b>.
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
      ضع ← {label}
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
      <div className="text-xs text-white/60">{items.length} موضوعة</div>
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
            مسار فارغ = لا قصة. ضع دليلًا لتكوين الفرضية.
          </div>
        )}
      </div>
    </div>
  );
}
