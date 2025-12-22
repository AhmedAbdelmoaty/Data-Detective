import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";
import { CASE002 } from "../content/cases/case002";
import { InvestigationProgress } from "../components/InvestigationProgress";

type ResultRow = { metric: string; value: string };
type QueryResult = {
  headline: string;
  suspect: "المخزون" | "النظام" | "التسعير" | "مختلط";
  branches: string;
  next: string;
};

const metricOptions = [
  { key: "sales", label: "المبيعات", helper: "قارن إجمالي المبيعات" },
  { key: "failed_txn", label: "المعاملات الفاشلة", helper: "شاهد المدفوعات الفاشلة" },
  { key: "out_of_stock", label: "نفاد المخزون", helper: "تحقق من نفاد المخزون" },
] as const;

type QuestionConfig = {
  id: "branch_loss" | "failed_ops" | "stockout_link";
  text: string;
  defaultMetric: (typeof metricOptions)[number]["key"];
  defaultDirection: "ASC" | "DESC";
  where?: string;
  limit?: string;
  template: (opts: { metric: string; direction: "ASC" | "DESC" }) => string;
  challenge: {
    selectOptions: { value: string; label: string }[];
    groupOptions: { value: string; label: string }[];
    orderOptions: {
      value: string;
      label: string;
      metricKey: (typeof metricOptions)[number]["key"];
      directionDefault: "ASC" | "DESC";
      directions?: ("ASC" | "DESC")[];
    }[];
  };
  interpretations: {
    id: string;
    text: string;
    flag: string;
    trustDelta?: number;
    notebook: string;
  }[];
};

const questionConfigs: QuestionConfig[] = [
  {
    id: "branch_loss",
    text: "أي فرع خسر مبيعات أكثر؟",
    defaultMetric: "sales",
    defaultDirection: "ASC",
    where: "week = 'this_week'",
    limit: "LIMIT 3",
    template: ({ metric, direction }) =>
      `SELECT branch, SUM(${metric}) AS اجمالي_المبيعات\nFROM sales_weekly\nWHERE week = 'this_week'\nGROUP BY branch\nORDER BY اجمالي_المبيعات ${direction}\nLIMIT 3;`,
    challenge: {
      selectOptions: [
        { value: "branch, SUM(sales) AS اجمالي_المبيعات", label: "الفرع + إجمالي المبيعات" },
        { value: "branch, SUM(sales) - LAG(SUM(sales)) OVER (ORDER BY branch) AS الفرق", label: "الفرع + فرق المبيعات" },
      ],
      groupOptions: [
        { value: "branch", label: "تجميع حسب الفرع" },
        { value: "branch, week", label: "الفرع + الأسبوع" },
      ],
      orderOptions: [
        {
          value: "SUM(sales)",
          label: "المبيعات",
          metricKey: "sales",
          directionDefault: "ASC",
          directions: ["ASC", "DESC"],
        },
      ],
    },
    interpretations: [
      {
        id: "branch_b_stock",
        text: "هبوط المبيعات يتركز في الفرع ب → مشكلة مخزون واضحة",
        flag: "sqlSuggestsStockShortageBranchB",
        trustDelta: 5,
        notebook: "استنتاج من البيانات: الفرع ب خسر المبيعات أكثر من غيره بسبب نفاد المخزون الواضح.",
      },
      {
        id: "pricing_blend",
        text: "الفروع الأخرى مستقرة → السبب محلي وليس تسعيرًا عامًا",
        flag: "sqlSuggestsLocalIssue",
        trustDelta: 3,
        notebook: "استنتاج من البيانات: الاستقرار في الفروع الأخرى يعني أن المشكلة محلية في فرع ب/ج وليست تسعيرًا عامًا.",
      },
      {
        id: "ambiguous_drop",
        text: "البيانات وحدها لا تكفي، نحتاج تأكيد من الميدان",
        flag: "sqlSuggestsNeedMoreProof",
        trustDelta: -2,
        notebook: "استنتاج من البيانات: لا يوجد حسم نهائي من المبيعات وحدها، يجب سؤال الشهود للتأكيد.",
      },
    ],
  },
  {
    id: "failed_ops",
    text: "أين زادت العمليات الفاشلة؟",
    defaultMetric: "failed_txn",
    defaultDirection: "DESC",
    where: "week = 'this_week'",
    limit: "LIMIT 3",
    template: ({ metric, direction }) =>
      `SELECT branch, SUM(${metric}) AS الاخطاء\nFROM sales_weekly\nWHERE week = 'this_week'\nGROUP BY branch\nORDER BY الاخطاء ${direction};`,
    challenge: {
      selectOptions: [
        { value: "branch, SUM(failed_txn) AS الاخطاء", label: "الفرع + إجمالي العمليات الفاشلة" },
        { value: "branch, SUM(refunds) AS الاستردادات", label: "الفرع + الاستردادات" },
      ],
      groupOptions: [
        { value: "branch", label: "حسب الفرع" },
        { value: "branch, week", label: "حسب الفرع والأسبوع" },
      ],
      orderOptions: [
        {
          value: "SUM(failed_txn)",
          label: "المعاملات الفاشلة",
          metricKey: "failed_txn",
          directionDefault: "DESC",
          directions: ["ASC", "DESC"],
        },
        {
          value: "SUM(out_of_stock)",
          label: "نفاد المخزون",
          metricKey: "out_of_stock",
          directionDefault: "DESC",
        },
      ],
    },
    interpretations: [
      {
        id: "branch_c_system",
        text: "العمليات الفاشلة ترتفع في الفرع ج → عطل نظام",
        flag: "sqlSuggestsSystemIssueInBranchC",
        trustDelta: 5,
        notebook: "استنتاج من البيانات: الفرع ج يظهر أعلى المعاملات الفاشلة، ما يرجح مشكلة نظام نقاط البيع هناك.",
      },
      {
        id: "branch_b_minor",
        text: "الفروع الأخرى أقل تأثرًا → المشكلة ليست تعميمًا",
        flag: "sqlSuggestsSystemLocalized",
        trustDelta: 2,
        notebook: "استنتاج من البيانات: الارتفاع يتركز في فرع واحد، لذا الإصلاح يجب أن يبدأ محليًا وليس على مستوى الشبكة.",
      },
      {
        id: "maybe_pricing",
        text: "قد تكون الشكاوى من السعر هي السبب، نحتاج دليلًا إضافيًا",
        flag: "sqlSuggestsCheckPricing",
        trustDelta: -2,
        notebook: "استنتاج من البيانات: بدون دليل فني قد يكون السعر سببًا، يجب سؤال الشهود للتأكد.",
      },
    ],
  },
  {
    id: "stockout_link",
    text: "هل نفاد المخزون مرتبط بهبوط المبيعات؟",
    defaultMetric: "out_of_stock",
    defaultDirection: "DESC",
    template: ({ metric, direction }) =>
      `SELECT branch, SUM(out_of_stock) AS اشارات_نفاد, SUM(sales) AS المبيعات\nFROM sales_weekly\nGROUP BY branch\nORDER BY ${metric === "sales" ? "SUM(sales)" : "SUM(out_of_stock)"} ${direction};`,
    challenge: {
      selectOptions: [
        { value: "branch, SUM(out_of_stock) AS اشارات_نفاد, SUM(sales) AS المبيعات", label: "الفرع + نفاد المخزون + المبيعات" },
        { value: "branch, SUM(out_of_stock) AS اشارات_نفاد", label: "الفرع + نفاد المخزون" },
      ],
      groupOptions: [
        { value: "branch", label: "حسب الفرع" },
      ],
      orderOptions: [
        {
          value: "SUM(out_of_stock)",
          label: "نفاد المخزون",
          metricKey: "out_of_stock",
          directionDefault: "DESC",
        },
        {
          value: "SUM(sales)",
          label: "المبيعات",
          metricKey: "sales",
          directionDefault: "ASC",
          directions: ["ASC", "DESC"],
        },
      ],
    },
    interpretations: [
      {
        id: "stock_link",
        text: "نعم، نفاد المخزون يفسر الهبوط الحاد في الفرع ب",
        flag: "sqlSuggestsStockCorrelation",
        trustDelta: 5,
        notebook: "استنتاج من البيانات: إشارات نفاد المخزون العالية في الفرع ب تتماشى مع هبوط المبيعات، ما يرجح مشكلة الإمداد.",
      },
      {
        id: "mixed",
        text: "هناك أثر للنظام أيضًا، يجب جمع دليل فني",
        flag: "sqlSuggestsMixedSignal",
        trustDelta: 2,
        notebook: "استنتاج من البيانات: نفاد المخزون ظاهر لكن أخطاء النظام قد تعمق المشكلة، نحتاج سؤال الشهود للتثبيت.",
      },
      {
        id: "no_link",
        text: "لا يوجد ارتباط واضح، ربما الأسعار هي السبب",
        flag: "sqlSuggestsCheckPriceFirst",
        trustDelta: -2,
        notebook: "استنتاج من البيانات: لا يظهر ارتباط صريح بين نفاد المخزون والمبيعات، يجب اختبار فرضية السعر قبل الجزم.",
      },
    ],
  },
];

const metricLabels: Record<(typeof metricOptions)[number]["key"], string> = {
  sales: "المبيعات",
  failed_txn: "المعاملات الفاشلة",
  out_of_stock: "نفاد المخزون",
};

export default function SQLLab() {
  const navigate = useNavigate();
  const game = useGame();
  const caseData = CASE002;

  const [selectedQuestionId, setSelectedQuestionId] = useState<QuestionConfig["id"]>(
    questionConfigs[0].id,
  );
  const [metric, setMetric] = useState<(typeof metricOptions)[number]["key"]>(
    questionConfigs[0].defaultMetric,
  );
  const [direction, setDirection] = useState<"ASC" | "DESC">(
    questionConfigs[0].defaultDirection,
  );
  const [challengeMode, setChallengeMode] = useState(false);
  const [selectedSelect, setSelectedSelect] = useState<string>(
    questionConfigs[0].challenge.selectOptions[0].value,
  );
  const [selectedGroup, setSelectedGroup] = useState<string>(
    questionConfigs[0].challenge.groupOptions[0]?.value ?? "",
  );
  const [selectedOrder, setSelectedOrder] = useState<string>(
    questionConfigs[0].challenge.orderOptions[0].value,
  );
  const [selectedOrderDirection, setSelectedOrderDirection] = useState<"ASC" | "DESC">
    (questionConfigs[0].challenge.orderOptions[0].directionDefault);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [selectedInterpretation, setSelectedInterpretation] = useState<string | null>(
    game.sqlInterpretation?.interpretationId ?? null,
  );

  const currentQuestion = useMemo(
    () => questionConfigs.find((q) => q.id === selectedQuestionId) ?? questionConfigs[0],
    [selectedQuestionId],
  );

  const dataset = caseData.salesDataset;

  useEffect(() => {
    setMetric(currentQuestion.defaultMetric);
    setDirection(currentQuestion.defaultDirection);
    setSelectedSelect(currentQuestion.challenge.selectOptions[0]?.value ?? "");
    setSelectedGroup(currentQuestion.challenge.groupOptions[0]?.value ?? "");
    const firstOrder = currentQuestion.challenge.orderOptions[0];
    setSelectedOrder(firstOrder?.value ?? "");
    setSelectedOrderDirection(firstOrder?.directionDefault ?? "ASC");
    if (game.sqlInterpretation?.questionId === currentQuestion.id) {
      setSelectedInterpretation(game.sqlInterpretation.interpretationId);
    } else {
      setSelectedInterpretation(null);
    }
  }, [currentQuestion, game.sqlInterpretation]);

  useEffect(() => {
    const match = currentQuestion.challenge.orderOptions.find((o) => o.value === selectedOrder);
    if (match) {
      setMetric(match.metricKey);
      setDirection(selectedOrderDirection);
    }
  }, [currentQuestion.challenge.orderOptions, selectedOrder, selectedOrderDirection]);

  const assembledQuery = useMemo(() => {
    const lines = [
      `SELECT ${selectedSelect || "*"}`,
      "FROM sales_weekly",
    ];
    if (currentQuestion.where) {
      lines.push(`WHERE ${currentQuestion.where}`);
    }
    if (selectedGroup) {
      lines.push(`GROUP BY ${selectedGroup}`);
    }
    if (selectedOrder) {
      lines.push(`ORDER BY ${selectedOrder} ${selectedOrderDirection}`);
    }
    if (currentQuestion.limit) {
      lines.push(currentQuestion.limit);
    }
    return lines.join("\n") + ";";
  }, [currentQuestion.limit, currentQuestion.where, selectedGroup, selectedOrder, selectedOrderDirection, selectedSelect]);

  const queryTemplate = challengeMode
    ? assembledQuery
    : currentQuestion.template({ metric, direction });

  const metricChoices = useMemo(
    () => Array.from(new Set(currentQuestion.challenge.orderOptions.map((o) => o.metricKey))),
    [currentQuestion.id],
  );

  const currentOrderOption = useMemo(
    () =>
      currentQuestion.challenge.orderOptions.find((o) => o.value === selectedOrder) ??
      currentQuestion.challenge.orderOptions[0],
    [currentQuestion, selectedOrder],
  );

  const allowedDirections = useMemo(() => {
    if (currentOrderOption?.directions) return currentOrderOption.directions;
    if (currentOrderOption?.directionDefault === "DESC") return ["DESC", "ASC"] as const;
    return ["ASC", "DESC"] as const;
  }, [currentOrderOption]);

  const results: ResultRow[] = useMemo(() => {
    const relevantRows =
      currentQuestion.id === "branch_loss" || currentQuestion.id === "failed_ops"
        ? dataset.filter((row) => row.week === "this_week")
        : dataset;

    const grouped: Record<string, number> = {};
    relevantRows.forEach((row) => {
      const value =
        metric === "sales"
          ? row.sales
          : metric === "failed_txn"
          ? row.failed_txn
          : row.out_of_stock;
      const key = String(row.branch);
      grouped[key] = (grouped[key] || 0) + value;
    });

    const sorted = Object.entries(grouped).sort((a, b) =>
      direction === "ASC" ? a[1] - b[1] : b[1] - a[1],
    );

    return sorted.map(([branch, value]) => ({ metric: `الفرع ${branch}`, value: String(value) }));
  }, [currentQuestion.id, dataset, direction, metric]);

  const highlightItems = useMemo(
    () => (results.length ? results.map((r) => `${r.metric}: ${r.value}`) : caseData.sqlResultHighlights ?? []),
    [caseData.sqlResultHighlights, results],
  );

  const interpret = (
    selMetric: QueryResult["suspect"],
    note: string,
    branches: string,
    next: string,
  ): QueryResult => ({
    headline: note,
    suspect: selMetric,
    branches,
    next,
  });

  const runQuery = () => {
    const thisWeek = dataset.filter((row) => row.week === "this_week");
    const lastWeek = dataset.filter((row) => row.week === "last_week");
    const orderedSales = [...thisWeek].sort((a, b) => a.sales - b.sales);
    let output: QueryResult = interpret(
      "مختلط",
      "الاستعلام جاهز لكن لم يظهر تباين حاد بعد.",
      orderedSales.map((r) => r.branch).join(", "),
      "تأكد من الصياغة ثم أعد التشغيل لو احتجت.",
    );

    if (currentQuestion.id === "branch_loss") {
      const weakest = orderedSales[0];
      const headline =
        weakest?.branch === "B"
          ? "هبوط المبيعات يتركز في الفرع ب مع إشارات نفاد المخزون."
          : `الفرع ${weakest?.branch ?? "—"} يظهر الهبوط الأكبر.`;
      output = interpret(
        "المخزون",
        headline,
        orderedSales.map((r) => r.branch).join(", "),
        "اسأل مدير المتجر عن الشحنات المتأخرة وأي رفوف كانت فارغة في الفرع الأضعف.",
      );
    } else if (currentQuestion.id === "failed_ops") {
      const orderedFailures = [...thisWeek].sort((a, b) => b.failed_txn - a.failed_txn);
      const top = orderedFailures[0];
      output = interpret(
        "النظام",
        top?.branch === "C"
          ? "الفرع ج يسجل أعلى المعاملات الفاشلة بعد تغيير السعر."
          : `الفرع ${top?.branch ?? "—"} يملك أكبر عدد من الأخطاء.`,
        orderedFailures.map((r) => r.branch).join(", "),
        "تأكد من إعادة تشغيل النظام في الفرع المتأثر واسأل عن أكواد الأخطاء المكررة.",
      );
    } else if (currentQuestion.id === "stockout_link") {
      const stockOrder = [...thisWeek].sort((a, b) => b.out_of_stock - a.out_of_stock);
      const stockTop = stockOrder[0];
      const dropMap = lastWeek.reduce((acc, row) => {
        acc[row.branch] = row.sales;
        return acc;
      }, {} as Record<string, number>);
      const dropText = stockOrder
        .map((r) => {
          const prev = dropMap[r.branch] ?? r.sales;
          const drop = prev - r.sales;
          return `${r.branch}: انخفاض ${drop}`;
        })
        .join("، ");
      output = interpret(
        "المخزون",
        stockTop?.branch === "B"
          ? "نفاد المخزون في الفرع ب يتماشى مع أكبر هبوط في المبيعات."
          : "الفرع الأعلى في نفاد المخزون يفسر جزءًا من هبوط المبيعات.",
        stockOrder.map((r) => r.branch).join(", "),
        `قارن أرفف الفرع المتصدر في نفاد المخزون مع مبيعاته. الفروق: ${dropText}.`,
      );
    }
    setResult(output);
    setSelectedInterpretation(null);
    game.runSql();
  };

  const handleInterpretationChoice = (interpretationId: string) => {
    const choice = currentQuestion.interpretations.find((i) => i.id === interpretationId);
    if (!choice) return;
    setSelectedInterpretation(choice.id);
    game.applySqlInterpretation({
      questionId: currentQuestion.id,
      interpretationId: choice.id,
      flag: choice.flag,
      trustDelta: choice.trustDelta ?? 0,
      note: choice.notebook,
    });
  };

  const canContinue = game.canEnterInterviews; // = canEnterSQL && sqlRan
  const showResults = game.sqlRan;
  const interviewPrep = caseData.sqlInterviewPrep;
  const sqlTable = caseData.sqlResultTable;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#061021] via-[#050b14] to-black text-white" dir="rtl">
      <div className="mx-auto w-full max-w-5xl px-6 py-10 text-right">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">مختبر البيانات (SQL)</h1>
            <p className="mt-1 text-sm text-white/70">
              الهدف: أكمل استعلامًا ودودًا، اختر مؤشرًا، واستخدم النتيجة لتوجيه أسئلة الشهود.
            </p>
            <p className="mt-2 text-sm text-white/70">{caseData.sqlFrame}</p>
            <p className="mt-2 text-xs text-white/60">التقدم: {game.placedCount}/{game.cluesGoal} أدلة</p>
          </div>

          <button
            onClick={() => navigate("/hq")}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
          >
            رجوع إلى المقر
          </button>
        </div>

        <div className="mt-4">
          <InvestigationProgress current="sql" />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white/90">قالب الاستعلام</h2>
              <div className="text-xs text-white/60">
                SQL: <span className={game.sqlRan ? "text-emerald-300" : "text-white/60"}>{game.sqlRan ? "✅ تم التشغيل" : "لم يُشغّل"}</span>
              </div>
            </div>
            <div className="text-xs text-white/70">
              اختر سؤال التحقيق، ثم صِل الاستعلام الودود بالبيانات. يمكنك التبديل إلى وضع التحدّي لملء الخانات بدل كتابة SQL كامل.
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-xs text-white/70">
                السؤال المختار
                <select
                  value={selectedQuestionId}
                  onChange={(e) => setSelectedQuestionId(e.target.value as QuestionConfig["id"])}
                  className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                >
                  {questionConfigs.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.text}
                    </option>
                  ))}
                </select>
              </label>
              <label className="mt-2 flex items-center gap-2 text-xs text-white/70 sm:mt-6 sm:justify-end">
                <input
                  type="checkbox"
                  checked={challengeMode}
                  onChange={(e) => setChallengeMode(e.target.checked)}
                  className="h-4 w-4 rounded border-white/30 bg-black/40"
                />
                <span>وضع التحدّي (املأ الخانات بدل كتابة SQL كامل)</span>
              </label>
            </div>

            {!challengeMode ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-white/70">
                  المؤشر المرتبط بالسؤال
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as typeof metric)}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                  >
                    {metricChoices.map((key) => (
                      <option key={key} value={key}>
                        {metricLabels[key]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-white/70">
                  اتجاه الترتيب
                  <select
                    value={direction}
                    onChange={(e) => setDirection(e.target.value as "ASC" | "DESC")}
                    className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm"
                  >
                    <option value="ASC">تصاعدي — الأقل أولًا</option>
                    <option value="DESC">تنازلي — الأعلى أولًا</option>
                  </select>
                </label>
              </div>
            ) : (
              <div className="space-y-3 rounded-xl border border-amber-300/20 bg-amber-300/5 p-3">
                <p className="text-xs text-white/70">املأ خانات SELECT و GROUP BY و ORDER BY، وسيتم تجميع الاستعلام تلقائيًا.</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs text-white/70">
                    أعمدة SELECT
                    <select
                      value={selectedSelect}
                      onChange={(e) => setSelectedSelect(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2 text-sm"
                    >
                      {currentQuestion.challenge.selectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-white/70">
                    GROUP BY (التجميع)
                    <select
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2 text-sm"
                    >
                      {currentQuestion.challenge.groupOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <label className="text-xs text-white/70">
                    ORDER BY (الترتيب)
                    <select
                      value={selectedOrder}
                      onChange={(e) => setSelectedOrder(e.target.value)}
                      className="mt-1 w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2 text-sm"
                    >
                      {currentQuestion.challenge.orderOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-xs text-white/70">
                    اتجاه الترتيب
                    <select
                      value={selectedOrderDirection}
                      onChange={(e) => setSelectedOrderDirection(e.target.value as "ASC" | "DESC")}
                      className="mt-1 w-full rounded-lg bg-black/40 border border-white/20 px-3 py-2 text-sm"
                    >
                      {allowedDirections.map((dir) => (
                        <option key={dir} value={dir}>
                          {dir === "ASC" ? "تصاعدي" : "تنازلي"}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            )}

            <pre className="mt-2 rounded-xl border border-white/10 bg-black/40 p-3 text-xs text-emerald-100 overflow-auto">
              {queryTemplate}
            </pre>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={runQuery}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
              >
                تشغيل الاستعلام
              </button>

              <button
                onClick={() => navigate("/interviews")}
                disabled={!canContinue}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  canContinue ? "bg-white/10 text-white hover:bg-white/15" : "cursor-not-allowed bg-white/5 text-white/40"
                }`}
                title={canContinue ? "متابعة" : "شغّل الاستعلام أولًا"}
              >
                متابعة ← الشهود
              </button>

              <div className="ml-auto text-xs text-white/60">* السؤال الحالي: {currentQuestion.text}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div className="text-xs uppercase tracking-widest text-white/50">مجموعة بيانات تجريبية</div>
            <p className="text-sm text-white/75">
              جدول sales_weekly التجريبي: راقب الفروع والأسابيع والإشارات لتفهم سياق السؤال.
            </p>
            <div className="overflow-auto rounded-xl border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-xs">
                <thead className="bg-black/40 text-white/70">
                  <tr>
                    <th className="px-3 py-2 text-right">الفرع</th>
                    <th className="px-3 py-2 text-right">الأسبوع</th>
                    <th className="px-3 py-2 text-right">المبيعات</th>
                    <th className="px-3 py-2 text-right">معاملات فاشلة</th>
                    <th className="px-3 py-2 text-right">نفاد مخزون</th>
                    <th className="px-3 py-2 text-right">تغيير السعر</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-black/20">
                  {dataset.map((row, idx) => (
                    <tr key={`${row.branch}-${row.week}-${idx}`} className="text-white/90">
                      <td className="px-3 py-2 text-right">{row.branch}</td>
                      <td className="px-3 py-2 text-right">{row.week === "this_week" ? "هذا الأسبوع" : "الأسبوع الماضي"}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.sales}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.failed_txn}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.out_of_stock}</td>
                      <td className="px-3 py-2 font-mono text-right">{row.price_changed ? "نعم" : "لا"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/70">
              نصيحة: قراءة الجدول تحليل بحد ذاته. حدد أي فرع يبدو أضعف قبل الضغط على تشغيل.
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/90">النتائج</h3>
            <span className="text-xs text-white/60">{showResults ? "تم تنفيذ الاستعلام" : "شغّل الاستعلام للعرض"}</span>
          </div>

          {showResults ? (
            <>
              {sqlTable && (
                <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
                  <table className="min-w-full divide-y divide-white/10 text-sm">
                    <thead className="bg-black/40 text-white/70">
                      <tr>
                        <th className="px-4 py-3 text-right font-semibold">الأسبوع</th>
                        <th className="px-4 py-3 text-right font-semibold">الإيراد</th>
                        <th className="px-4 py-3 text-right font-semibold">فشل / أخطاء</th>
                        <th className="px-4 py-3 text-right font-semibold">استردادات</th>
                        <th className="px-4 py-3 text-right font-semibold">إشارة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 bg-black/20">
                      {sqlTable.map((row) => (
                        <tr key={row.week} className="text-white/90">
                          <td className="px-4 py-3 text-right">{row.week}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.revenue}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.errors}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.refunds}</td>
                          <td className="px-4 py-3 font-mono text-right">{row.failureShare}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-white/90">
                <div className="text-xs uppercase tracking-widest text-emerald-200">ماذا يخبرنا هذا</div>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-white/80">
                  {highlightItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <p className="mt-3 text-white/80">
                  {result?.headline ||
                    caseData.sqlResultNarrative ||
                    "البيانات تميل لسبب رئيسي. استخدمها لتقرر من تسأل وما الذي تثبته."}
                </p>
                <p className="mt-2 text-xs text-white/70">ترتيب الفروع: {result?.branches ?? results.map((r) => r.metric).join(", ")}</p>
                <p className="mt-1 text-xs text-white/70">المشتبه الأقوى الآن: {result?.suspect ?? "—"}</p>
              </div>

              <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-300/5 p-4 text-sm text-white/90">
                <div className="flex items-center justify-between">
                  <div className="text-xs uppercase tracking-widest text-amber-200">ماذا يعني ذلك؟</div>
                  {selectedInterpretation && <span className="text-xs text-amber-100">تم تسجيل الاستنتاج</span>}
                </div>
                <p className="mt-2 text-white/80">اختر التفسير الأقرب للسؤال: {currentQuestion.text}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {currentQuestion.interpretations.map((choice) => (
                    <button
                      key={choice.id}
                      onClick={() => handleInterpretationChoice(choice.id)}
                      className={`rounded-xl border px-3 py-2 text-left text-xs transition ${
                        selectedInterpretation === choice.id
                          ? "border-amber-300 bg-amber-300/20 text-white"
                          : "border-white/10 bg-black/30 text-white/80 hover:border-amber-200/60 hover:text-white"
                      }`}
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-xs text-white/70">سيُضاف الاستنتاج إلى الدفتر ويؤثر على الثقة إن وُجد تغيير.</p>
              </div>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-4">
                <div className="text-xs uppercase tracking-widest text-white/50">ما الذي نسأله للشهود</div>
                <p className="mt-2 text-sm text-white/80">{result?.next}</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-white/75">
                  {interviewPrep?.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
              اختر السؤال، ثم اضبط القالب أو وضع التحدّي، وبعد التشغيل ستختار تفسيرًا لتقييد التحقيق.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
