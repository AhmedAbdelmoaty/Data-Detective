// src/content/cases/case002.ts
export type CaseBucket = "billing" | "product" | "marketing";

export type CaseEvidence = {
  id: string;
  title: string;
  hint: string;
  bucketHint: CaseBucket;
  meaning?: string;
  why?: string;
};

export type CaseInterviewChoice = {
  id: string;
  title: string;
  tag: string;
  timeCostMin: number;
  trustDelta: number;
  requiresEvidenceIds?: ReadonlyArray<string>;
  note?: string;
};

export type CaseInterviewQuestion = {
  id: string;
  header: string;
  question: string;
  persona?: {
    role: string;
    vibe: string;
    youNeed: string;
  };
  choices: ReadonlyArray<CaseInterviewChoice>;
};

export type CaseInsight = {
  id: string;
  title: string;
  desc: string;
};

export const CASE002 = {
  id: "case002_missing_sales",
  title: "القضية ٠٠٢: مبيعات مفقودة في سلسلة محلية",
  briefing: {
    role: "أنت المحقق البياني الصغير اللي صاحب المحل جابه للمساعدة.",
    stakes:
      "تلات فروع في الحي خسروا مبيعات الأسبوع ده. المالك عايز إجابة واضحة قبل نهاية اليوم.",
    pressure: "الوقت = عدد التحركات قبل ما المحل يقفل. الثقة = مدى اقتناع المالك بقراراتك.",
    win: "حدد السبب الحقيقي + الأدلة + خطة تصحيح سريعة.",
  },
  roomObjectives: {
    hq: "شوف البطاقة، خريطة القضية، والهدف الحالي.",
    evidence:
      "اربط ٣ إشارات على اللوحة عشان تفتح معمل البيانات. اجمع كل إشارة تحت السبب الأقرب.",
    sql: "شغّل استعلام بسيط يقارن الفروع ويظهر أضعف مؤشر.",
    interviews:
      "اسأل مدير الفرع والكاشير لتأكيد أو نفي فرضيتك.",
    analysis: "راجع الرسوم السريعة، اختار ٢ استنتاج واضح.",
    reveal: "اعرض النتيجة + ليه مقتنع + إيه اللي يتصلح فوراً.",
  },
  evidenceReason:
    "ربط الدليل هو فرضيتك. ترتيب الإشارات حسب السبب يمنعك من تتبع ضوضاء عشوائية.",
  timeCostReason:
    "كل ربط = مكالمة أو رسالة استفسار. الاستعجال بيحرق الوقت قبل المعمل.",
  sqlFrame:
    "استخدم جدول sales_weekly البسيط. اختار المقياس ورتبه عشان تشوف أي فرع واقع.",
  sqlQuery:
    "SELECT branch, week, SUM({metric}) AS metric_value\nFROM sales_weekly\nWHERE week IN ('this_week', 'last_week')\nGROUP BY branch, week\nORDER BY metric_value {direction};",
  sqlResultHighlights: [
    "Branch B sales dipped the hardest when out-of-stock flags spiked.",
    "Branch C shows the most failed payments after the price change.",
    "Branch A looks stable: steady traffic and no pricing drama.",
  ],
  sqlResultNarrative:
    "The query frames the story: Branch B is losing sales because shelves are empty. Branch C has payment errors. Interviews should confirm stock delivery and system resets.",
  sqlResultTable: [
    {
      week: "This week",
      revenue: "$42,000 (B is low)",
      errors: "Failed txns highest at C",
      refunds: "Refunds climbing at C",
      failureShare: "B: out-of-stock flags up",
    },
    {
      week: "Last week",
      revenue: "$51,000",
      errors: "Lower errors",
      refunds: "Refunds normal",
      failureShare: "No price backlash",
    },
  ],
  sqlInterviewPrep: [
    "اسأل مدير الفرع لو التوريد اتأخر عند فرع ب.",
    "اسأل الكاشير عن أعطال الـPOS وشكاوى السعر.",
    "اتأكد لو تعديل السعر لخبط الزباين أو لو البضاعة خلصت فعلاً.",
  ],
  interviewFrame:
    "الأسئلة الأعمق تاخد وقت. قرر هتصرف الدقايق فين: تفاصيل ولا سرعة تكسب الثقة.",
  analysisFrame:
    "اختار الاستنتاجات اللي بتثبت السبب مباشرة. البساطة أوضح من الكلام الكبير.",
  revealFrame:
    "الخلاصة = سبب واحد + أدلته + خطوات تصليح يقدر المالك ينفذها النهاردة.",

  evidence: [
    {
      id: "branch_b_stockout",
      title: "فرع ب: بلاغات نقص في الرفوف",
      hint: "زبائن لقوا منتجات أساسية مش موجودة.",
      bucketHint: "billing",
      meaning: "الرفوف فاضية في وقت الزحمة.",
      why: "الناس عايزة تشتري لكن مفيش بضاعة، فتضيع المبيعات.",
    },
    {
      id: "branch_c_refunds",
      title: "فرع ج: المرتجعات زادت",
      hint: "العملا بيرجعوا مشتريات أكتر من المعتاد.",
      bucketHint: "billing",
      meaning: "الكاشير بيقضي وقت في المرتجعات.",
      why: "الارتباك في الأسعار أو السيستم بيخلي الناس ترجع المشتريات.",
    },
    {
      id: "pos_errors",
      title: "فرع ج: أعطال ماكينة الدفع",
      hint: "ماكينة POS بتفصل وتتعمل ريستارت.",
      bucketHint: "product",
      meaning: "مدفوعات الكروت بتفشل في وسط اليوم.",
      why: "عملية دفع فاشلة = بيع ضايع وعميل متضايق.",
    },
    {
      id: "price_change",
      title: "تغيير أسعار قريب من وقت الهبوط",
      hint: "زيادة بسيطة في منتجات أساسية.",
      bucketHint: "marketing",
      meaning: "العملا واخدين بالهم إن الأسعار عليت فجأة.",
      why: "الإحساس بالغلاء يخلي الناس تبطل تشتري أو تطلب خصم.",
    },
    {
      id: "foot_traffic",
      title: "عدد الزوار ثابت",
      hint: "عدد اللي داخلين المحل زي قبل كده.",
      bucketHint: "marketing",
      meaning: "مافيش هبوط في الإقبال على الفروع.",
      why: "الطلب موجود، يبقى المشكلة جوه: مخزون أو سيستم أو تسعير.",
    },
    {
      id: "delivery_delay",
      title: "تأخر شحنة مخزون",
      hint: "عربية التوريد اتأخرت لفرع ب.",
      bucketHint: "billing",
      meaning: "المنتجات الأكثر مبيعاً وصلت متأخر نص يوم.",
      why: "التأخير بيخلي الرف فاضي في وقت البيع العالي.",
    },
  ] as const,

  interviews: [
    {
      id: "q1_manager",
      header: "Interview #1 — Store Manager",
      question: "What changed in stock and pricing this week?",
      persona: {
        role: "Store Manager",
        vibe: "Calm but worried about empty shelves.",
        youNeed: "Verify if supply issues are real or just excuses.",
      },
      choices: [
        {
          id: "stock_gap",
          title: "Delivery for Branch B missed Friday morning",
          tag: "Stock timing",
          timeCostMin: 7,
          trustDelta: 2,
          note: "Confirms stockout path.",
        },
        {
          id: "price_pushback",
          title: "Regulars asked why prices jumped",
          tag: "Pricing concern",
          timeCostMin: 6,
          trustDelta: -1,
          note: "Points to pricing friction.",
        },
        {
          id: "nothing_major",
          title: "No big changes reported",
          tag: "Neutral",
          timeCostMin: 4,
          trustDelta: 0,
          note: "Keeps signals weak.",
        },
      ],
    },
    {
      id: "q2_cashier",
      header: "Interview #2 — Cashier / Ops",
      question: "Are checkouts failing or customers walking away?",
      persona: {
        role: "Cashier on evening shift",
        vibe: "Tired, hands-on, sees every issue.",
        youNeed: "Know if system errors or price tags are breaking sales.",
      },
      choices: [
        {
          id: "pos_reboots",
          title: "POS rebooted several times at Branch C",
          tag: "System issue",
          timeCostMin: 8,
          trustDelta: 2,
          note: "Supports system/scheduler cause.",
        },
        {
          id: "price_confusion",
          title: "People complained about the new prices",
          tag: "Pricing pushback",
          timeCostMin: 6,
          trustDelta: -1,
          note: "Supports pricing suspect.",
        },
        {
          id: "customers_waited",
          title: "Some left because items were missing",
          tag: "Stock frustration",
          timeCostMin: 5,
          trustDelta: 1,
          note: "Supports stock suspect.",
        },
      ],
    },
  ] as const,

  insights: [
    {
      id: "stock_issue",
      title: "Branch B sales dropped with out-of-stock flags up",
      desc: "The biggest dip matches missing items → Stock problem.",
    },
    {
      id: "system_issue",
      title: "Branch C shows the most failed transactions",
      desc: "POS resets and failed payments cut revenue → System issue.",
    },
    {
      id: "pricing_issue",
      title: "Price change triggered refunds",
      desc: "Refunds and complaints cluster after the price bump → Pricing issue.",
    },
    {
      id: "stable_branch",
      title: "Branch A is stable",
      desc: "Controls prove demand is intact; issue is local to B/C.",
    },
  ] as const,

  salesDataset: [
    {
      branch: "A",
      week: "last_week",
      sales: 18000,
      failed_txn: 6,
      out_of_stock: 1,
      price_changed: false,
    },
    {
      branch: "A",
      week: "this_week",
      sales: 17800,
      failed_txn: 7,
      out_of_stock: 1,
      price_changed: false,
    },
    {
      branch: "B",
      week: "last_week",
      sales: 17000,
      failed_txn: 5,
      out_of_stock: 2,
      price_changed: true,
    },
    {
      branch: "B",
      week: "this_week",
      sales: 12000,
      failed_txn: 7,
      out_of_stock: 9,
      price_changed: true,
    },
    {
      branch: "C",
      week: "last_week",
      sales: 16000,
      failed_txn: 8,
      out_of_stock: 2,
      price_changed: true,
    },
    {
      branch: "C",
      week: "this_week",
      sales: 15000,
      failed_txn: 15,
      out_of_stock: 3,
      price_changed: true,
    },
  ],
} as const;
