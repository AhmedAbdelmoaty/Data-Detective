// src/content/cases/case002.ts
export type CaseBucket = "billing" | "product" | "marketing";

export type CaseEvidence = {
  id: string;
  title: string;
  hint: string;
  bucketHint: CaseBucket;
  meaning?: string;
  why?: string;
  pointsToward?: string;
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
  title: "القضية 002: مبيعات مفقودة (لغز البيع بالتجزئة)",
  briefing: {
    role: "أنت محقق البيانات المبتدئ الذي استعان به صاحب المتجر.",
    stakes:
      "ثلاثة فروع في الحي خسرت المبيعات هذا الأسبوع. المالك يريد إجابة واضحة قبل نهاية اليوم.",
    pressure: "الوقت = عدد الأفعال قبل الإغلاق. الثقة = مدى اطمئنان المالك لقراراتك.",
    win: "اختر السبب الحقيقي + اعرض الأدلة + قائمة إصلاح قصيرة.",
  },
  roomObjectives: {
    hq: "اعرض شارتك، خريطة القضية، والهدف الفوري.",
    evidence:
      "ضع ٣ أدلة على اللوحة لفتح مختبر البيانات. جمّعها حسب السبب الأرجح.",
    sql: "أكمل استعلامًا بسيطًا لمقارنة الفروع واكتشاف أضعف مؤشر.",
    interviews:
      "اسأل مدير المتجر والكاشير لتأكيد أو تحدي فرضيتك.",
    analysis: "راجع الرسوم السريعة، طبّق الفلاتر، وثبّت نتيجتين بلغة واضحة.",
    reveal: "اعرض الخلاصة + لماذا تؤمن بها + ما الذي يجب إصلاحه.",
  },
  evidenceReason:
    "وضع البطاقات هو فرضيتك. تجميع الأدلة حسب السبب يمنعك من ملاحقة ضجيج عشوائي.",
  timeCostReason:
    "كل وضع بطاقة يمثل مكالمة أو رسالة. الاستعجال يستهلك الوقت قبل الوصول للمختبر.",
  sqlFrame:
    "استخدم جدول sales_weekly الصغير. اختر المؤشر ورتّب لتعرف أي فرع في ورطة.",
  sqlQuery:
    "SELECT branch, week, SUM({metric}) AS metric_value\nFROM sales_weekly\nWHERE week IN ('this_week', 'last_week')\nGROUP BY branch, week\nORDER BY metric_value {direction};",
  sqlResultHighlights: [
    "انخفضت مبيعات الفرع ب بقوة مع ارتفاع إشارات نفاد المخزون.",
    "الفرع ج يظهر أكثر المدفوعات الفاشلة بعد تعديل الأسعار.",
    "الفرع أ مستقر: حركة ثابتة بلا مشاكل أسعار.",
  ],
  sqlResultNarrative:
    "الاستعلام يرسم القصة: الفرع ب يخسر المبيعات لأن الرفوف فارغة. الفرع ج يعاني من أخطاء دفع. المقابلات يجب أن تؤكد تسليم المخزون وإعادة تشغيل النظام.",
  sqlResultTable: [
    {
      week: "هذا الأسبوع",
      revenue: "$42,000 (الفرع ب منخفض)",
      errors: "أعلى المدفوعات الفاشلة في ج",
      refunds: "الاستردادات تتصاعد في ج",
      failureShare: "ب: إشارات نفاد المخزون مرتفعة",
    },
    {
      week: "الأسبوع الماضي",
      revenue: "$51,000",
      errors: "أخطاء أقل",
      refunds: "استردادات طبيعية",
      failureShare: "لا ارتداد بسبب السعر",
    },
  ],
  sqlInterviewPrep: [
    "اسأل مدير المتجر إن كانت شحنات الفرع ب تأخرت.",
    "اسأل الكاشير عن أخطاء نقاط البيع وشكاوى الأسعار.",
    "أكد هل تعديل السعر أربك الزبائن أم أن المخزون نفد ببساطة.",
  ],
  interviewFrame:
    "التحقيق الأعمق يستغرق وقتًا أطول. اصرف الوقت للتفاصيل أو سرع الخطى لربح الثقة سريعًا.",
  analysisFrame:
    "اختر فقط النتائج التي تثبت السبب مباشرة. الوضوح والبساطة أفضل من المصطلحات الثقيلة.",
  revealFrame:
    "الإغلاق = سبب واحد، أدلة داعمة، وقائمة إصلاحات يمكن للمالك تنفيذها اليوم.",

  evidence: [
    {
      id: "branch_b_stockout",
      title: "الفرع ب: تقارير نفاد المخزون ارتفعت",
      hint: "الرفوف فارغة في منتجات نهاية الأسبوع.",
      bucketHint: "billing",
      meaning: "المنتجات الأكثر طلبًا مفقودة وقت الذروة.",
      why: "نفاد المخزون يوقف المبيعات حتى مع وجود الطلب.",
      pointsToward: "المخزون",
    },
    {
      id: "branch_c_refunds",
      title: "الاستردادات زادت في الفرع ج",
      hint: "الزبائن يعيدون المشتريات بشكل أكبر.",
      bucketHint: "billing",
      meaning: "منطقة الاسترداد مزدحمة بعد ارتباك عند الدفع.",
      why: "ارتفاع الاستردادات قد يشير لمشكلة سعر أو دفع.",
      pointsToward: "التسعير",
    },
    {
      id: "pos_errors",
      title: "أخطاء نقاط البيع زادت (مدفوعات فاشلة)",
      hint: "رفض بطاقات أكثر/إعادة تشغيل للأجهزة.",
      bucketHint: "product",
      meaning: "الأجهزة تتوقف أثناء الدفع.",
      why: "المعاملات الفاشلة تعني خسارة إيراد.",
      pointsToward: "النظام",
    },
    {
      id: "price_change",
      title: "تم تغيير السعر الأسبوع الماضي",
      hint: "بطاقات الأسعار الجديدة ظهرت يوم الثلاثاء.",
      bucketHint: "marketing",
      meaning: "الزبائن لاحظوا زيادة سعر بسيطة.",
      why: "انطباع السعر يغيّر الطلب بسرعة.",
      pointsToward: "التسعير",
    },
    {
      id: "foot_traffic",
      title: "حركة الزوار مستقرة",
      hint: "عدد الداخلين للمتجر ثابت.",
      bucketHint: "marketing",
      meaning: "لا يوجد انخفاض في الزيارات بين الفروع.",
      why: "الحركة ليست السبب. انظر لما يحدث داخل المتجر.",
      pointsToward: "النظام",
    },
    {
      id: "delivery_delay",
      title: "تسليم المخزون تأخر",
      hint: "الشاحنة وصلت متأخرة للفرع ب.",
      bucketHint: "billing",
      meaning: "الأصناف الأكثر مبيعًا وصلت متأخرة نصف يوم.",
      why: "التأخير يترك الرفوف فارغة وقت الذروة.",
      pointsToward: "المخزون",
    },
  ] as const,

  interviews: [
    {
      id: "q1_manager",
      header: "مقابلة #1 — مدير المتجر",
      question: "ما الذي تغيّر في المخزون والتسعير هذا الأسبوع؟",
      persona: {
        role: "مدير المتجر",
        vibe: "هادئ لكنه قلق من الرفوف الفارغة.",
        youNeed: "تحقق إن كانت مشاكل التوريد حقيقية أو مجرد أعذار.",
      },
      choices: [
        {
          id: "stock_gap",
          title: "شحنة الفرع ب فاتتها صباح الجمعة",
          tag: "توقيت المخزون",
          timeCostMin: 7,
          trustDelta: 2,
          note: "يؤكد مسار نفاد المخزون.",
        },
        {
          id: "price_pushback",
          title: "الزبائن الدائمون سألوا عن سبب زيادة الأسعار",
          tag: "قلق التسعير",
          timeCostMin: 6,
          trustDelta: -1,
          note: "يشير لاحتكاك في الأسعار.",
        },
        {
          id: "nothing_major",
          title: "لا تغييرات كبيرة مذكورة",
          tag: "حيادي",
          timeCostMin: 4,
          trustDelta: 0,
          note: "يبقي الإشارات ضعيفة.",
        },
      ],
    },
    {
      id: "q2_cashier",
      header: "مقابلة #2 — الكاشير / العمليات",
      question: "هل عمليات الدفع تفشل أم أن الزبائن يغادرون؟",
      persona: {
        role: "كاشير الوردية المسائية",
        vibe: "متعب لكنه يرى كل مشكلة بنفسه.",
        youNeed: "اكتشف إن كانت أخطاء النظام أو بطاقات السعر توقف المبيعات.",
      },
      choices: [
        {
          id: "pos_reboots",
          title: "نظام نقاط البيع أعيد تشغيله عدة مرات في الفرع ج",
          tag: "مشكلة نظام",
          timeCostMin: 8,
          trustDelta: 2,
          note: "يدعم سبب النظام/الجدولة.",
        },
        {
          id: "price_confusion",
          title: "الناس اشتكوا من الأسعار الجديدة",
          tag: "رفض التسعير",
          timeCostMin: 6,
          trustDelta: -1,
          note: "يدعم اشتباه التسعير.",
        },
        {
          id: "customers_waited",
          title: "بعضهم غادر بسبب نقص الأصناف",
          tag: "إحباط المخزون",
          timeCostMin: 5,
          trustDelta: 1,
          note: "يدعم اشتباه المخزون.",
        },
      ],
    },
  ] as const,

  insights: [
    {
      id: "stock_issue",
      title: "مبيعات الفرع ب هبطت مع ارتفاع إشارات نفاد المخزون",
      desc: "أكبر انخفاض يطابق نقص الأصناف → مشكلة مخزون.",
    },
    {
      id: "system_issue",
      title: "الفرع ج يظهر أكثر المعاملات الفاشلة",
      desc: "إعادة تشغيل نقاط البيع والمدفوعات الفاشلة تقلل الإيراد → مشكلة نظام.",
    },
    {
      id: "pricing_issue",
      title: "تغيير السعر تسبب في استردادات",
      desc: "الاستردادات والشكاوى تزايدت بعد رفع السعر → مشكلة تسعير.",
    },
    {
      id: "stable_branch",
      title: "الفرع أ مستقر",
      desc: "الرقابة تثبت أن الطلب سليم؛ المشكلة محلية في ب/ج.",
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
