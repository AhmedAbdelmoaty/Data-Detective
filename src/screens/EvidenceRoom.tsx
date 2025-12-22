import { useMemo, useState } from "react";
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

  const [selections, setSelections] = useState<
    Record<string, { interpretationId: string; confidence: "low" | "medium" | "high" }>
  >({});

  const unplaced = useMemo(() => game.cards.filter((c) => !c.interpretation), [game.cards]);

  const placedList = useMemo(() => game.cards.filter((c) => c.interpretation), [game.cards]);

  const categoryCounts = useMemo(() => {
    return placedList.reduce<Record<string, number>>((acc, c) => {
      const key = c.interpretation?.category ?? "";
      if (key) {
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {});
  }, [placedList]);

  const canContinueToSQL = game.canEnterSQL;
  const neededForSql = Math.max(3 - game.placedCount, 0);
  const hasConsistency = Object.values(categoryCounts).some((c) => c >= 2);

  return (
    <div className="min-h-screen text-white px-6 py-10" dir="rtl">
      <div className="mx-auto max-w-5xl text-right">
        <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">غرفة الأدلة</h1>
              <p className="text-sm text-white/70">
                اختر تفسيرًا لكل دليل وحدد مستوى الثقة. الهدف هو بناء فرضية قابلة للاختبار.
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
              title={
                canContinueToSQL
                  ? ""
                  : `فسّر ${neededForSql} أدلة إضافية${hasConsistency ? "" : " واجعل اثنين بنفس التصنيف"} لفتح مختبر البيانات`
              }
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
              <p className="mt-1">اختر تفسيرًا واحدًا لكل بطاقة وأضف مستوى ثقة (منخفض/متوسط/مرتفع).</p>
              <p className="mt-1">التفسيرات تجمع الإشارات تحت مخزون/نظام/تسعير. الثقة المرتفعة تستهلك وقتًا إضافيًا.</p>
            </div>
          </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {/* LEFT: Evidence Cards */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">بطاقات الأدلة</h2>
              <div className="text-xs text-white/60">{unplaced.length} غير مفسرة</div>
            </div>

            <div className="space-y-3">
              {unplaced.map((c) => {
                const defaultInterpretationId = c.interpretations?.[0]?.id ?? "";
                const current = selections[c.id] ?? {
                  interpretationId: defaultInterpretationId,
                  confidence: "medium" as const,
                };
                return (
                  <div key={c.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{c.title}</div>
                        <div className="mt-1 text-sm text-white/70">{c.hint}</div>
                        <div className="mt-2 grid gap-1 text-xs text-white/70">
                          <div><span className="text-white/60">المعنى:</span> {c.meaning}</div>
                          <div><span className="text-white/60">لماذا يهم:</span> {c.why}</div>
                          <div><span className="text-white/60">إشارات محتملة:</span> {c.pointsToward}</div>
                        </div>
                      </div>

                      <div className="shrink-0 text-xs text-white/60">لم تُفسر بعد</div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="text-xs text-white/60">التفسير المحتمل</div>
                      <div className="flex flex-wrap gap-2">
                        {c.interpretations?.map((i) => (
                          <button
                            key={i.id}
                            onClick={() =>
                              setSelections((prev) => ({
                                ...prev,
                                [c.id]: {
                                  interpretationId: i.id,
                                  confidence: prev[c.id]?.confidence ?? "medium",
                                },
                              }))
                            }
                            className={`rounded-xl border px-3 py-2 text-xs ${
                              current.interpretationId === i.id
                                ? "border-emerald-400/60 bg-emerald-400/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            {i.text}
                            <div className="text-[10px] text-white/50">
                              التصنيف: {laneLabels[i.category as LaneKey].title}
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="text-xs text-white/60">مستوى الثقة</div>
                      <div className="flex flex-wrap gap-2">
                        {["low", "medium", "high"].map((conf) => (
                          <button
                            key={conf}
                            onClick={() =>
                              setSelections((prev) => ({
                                ...prev,
                                [c.id]: {
                                  interpretationId: current.interpretationId,
                                  confidence: conf as typeof current.confidence,
                                },
                              }))
                            }
                            className={`rounded-xl border px-3 py-2 text-xs ${
                              current.confidence === conf
                                ? "border-emerald-400/60 bg-emerald-400/10"
                                : "border-white/10 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            {conf === "low" ? "منخفض" : conf === "medium" ? "متوسط" : "مرتفع"}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-white/60">
                        <span>الوقت: ١ دقيقة · الثقة المرتفعة = +١ دقيقة</span>
                        <button
                          onClick={() =>
                            game.interpretCard({
                              cardId: c.id,
                              interpretationId: current.interpretationId,
                              confidence: current.confidence,
                            })
                          }
                          disabled={!current.interpretationId}
                          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:bg-white/30"
                        >
                          تسجيل التفسير
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {unplaced.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/70">
                  رائع — كل الأدلة فُسرت. اتجه إلى مختبر البيانات أو عدّل فرضيتك هنا.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Board */}
          <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
            <h2 className="text-lg font-semibold">لوحة التحقيق</h2>
            <p className="mt-1 text-sm text-white/70">
              فسّر ٣ أدلة على الأقل مع اتساق (٢ بنفس التصنيف) لفتح مختبر البيانات.
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
              <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                <div>
                  <div className="font-semibold text-white">الحالة الحالية</div>
                  <p className="mt-1 text-white/80">فسّر {game.placedCount} / 3 بطاقات.</p>
                  {!hasConsistency && <p className="text-white/70">أضف تفسيرًا ثانيًا بنفس التصنيف لزيادة الثقة.</p>}
                </div>
                <button
                  onClick={() => game.proceedLowConfidence({ timeCostMin: 3 })}
                  className="w-full rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-sm font-semibold text-amber-100 hover:bg-amber-400/20"
                >
                  يمكنك المتابعة رغم ضعف الثقة، لكن ذلك يستهلك وقتًا إضافيًا.
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BoardLane({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Array<{
    id: string;
    title: string;
    hint: string;
    interpretation?: { interpretationId: string; confidence: "low" | "medium" | "high" };
    interpretations?: ReadonlyArray<{ id: string; text: string }>;
  }>;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-xs text-white/60">{subtitle}</div>
        </div>
        <div className="text-xs text-white/60">{items.length} مفسرة</div>
      </div>

      <div className="mt-3 space-y-2">
        {items.map((it) => (
          <div key={it.id} className="rounded-xl border border-white/10 bg-black/20 p-3">
            <div className="text-sm font-semibold">{it.title}</div>
            <div className="mt-1 text-xs text-white/70">{it.hint}</div>
            {it.interpretation && (
              <div className="mt-2 text-[11px] text-emerald-200/80">
                التفسير: {it.interpretations?.find((x) => x.id === it.interpretation?.interpretationId)?.text}
                <span className="ml-2 text-white/60">
                  الثقة: {it.interpretation.confidence === "high" ? "مرتفعة" : it.interpretation.confidence === "medium" ? "متوسطة" : "منخفضة"}
                </span>
              </div>
            )}
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
