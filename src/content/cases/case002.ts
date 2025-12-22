// src/content/cases/case002.ts
export type CaseBucket = "billing" | "product" | "marketing";

export type CaseEvidenceInterpretation = {
  id: string;
  text: string;
  category: "billing" | "product" | "marketing";
  confidenceCost?: number;
};

export type CaseEvidence = {
  id: string;
  title: string;
  hint: string;
  bucketHint: CaseBucket;
  meaning?: string;
  why?: string;
  pointsToward?: string;
  interpretations?: ReadonlyArray<CaseEvidenceInterpretation>;
};

export type CaseInterviewChoice = {
  id: string;
  title: string;
  tag: string;
  timeCostMin: number;
  trustDelta: number;
  answer: string;
  notebook: string;
  style: "confirming" | "conflicting" | "vague";
  requiresSqlFlags?: ReadonlyArray<string>;
  requiresCategoryLean?: ReadonlyArray<CaseBucket>;
  requiresEvidenceIds?: ReadonlyArray<string>;
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
      "فسّر ٣ أدلة لتكوين فرضية أولية. اختر التفسير + الثقة لكل بطاقة.",
    sql: "أكمل استعلامًا بسيطًا لمقارنة الفروع واكتشاف أضعف مؤشر.",
    interviews:
      "اسأل مدير المتجر والكاشير لتأكيد أو تحدي فرضيتك.",
    analysis: "راجع الرسوم السريعة، طبّق الفلاتر، وثبّت نتيجتين بلغة واضحة.",
    reveal: "اعرض الخلاصة + لماذا تؤمن بها + ما الذي يجب إصلاحه.",
  },
  evidenceReason:
    "التفسير = فرضية عمل. تجميع الإشارات تحت المخزون/النظام/التسعير يوضح أين تبحث في المختبر.",
  timeCostReason:
    "كل تفسير يمثل تحققًا سريعًا (مكالمة/رسالة). الثقة المرتفعة تستهلك وقتًا إضافيًا.",
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
    "أنت المحقق. اختر سؤالًا واحدًا في كل مرة. كل سؤال يستهلك وقتًا وقد يؤثر على الثقة.",
  analysisFrame:
    "اختر فقط النتائج التي تثبت السبب مباشرة. الوضوح والبساطة أفضل من المصطلحات الثقيلة.",
  revealFrame:
    "الإغلاق = سبب واحد، أدلة داعمة، وقائمة إصلاحات يمكن للمالك تنفيذها اليوم.",

  evidence: [
    {
      id: "branch_b_stockout",
      title: "الفرع ب: صور رفوف شبه فارغة",
      hint: "الموظف أرسل صورًا لمنتجات نفدت مساء الخميس والجمعة.",
      bucketHint: "billing",
      meaning: "الأصناف السريعة النفاد غير متاحة في نهاية اليوم.",
      why: "نفاد المخزون يوقف الطلب حتى لو كان الزوار موجودين.",
      pointsToward: "المخزون",
      interpretations: [
        {
          id: "late_restock",
          text: "التوريد تأخر فخسرت المبيعات المسائية",
          category: "billing",
        },
        {
          id: "system_not_sync",
          text: "نظام الطلب الآلي لم يحدّث الكميات",
          category: "product",
        },
        {
          id: "price_shift",
          text: "الزبائن اشتروا أقل بعد زيادة السعر فبقيت الفوارغ",
          category: "marketing",
        },
      ],
    },
    {
      id: "branch_c_refunds",
      title: "الفرع ج: طابور استرداد غير معتاد",
      hint: "المحاسب ذكر أن الناس يعيدون مشتريات بعد دقائق من الدفع.",
      bucketHint: "billing",
      meaning: "الاستردادات تقطع دورة البيع وتدل على إحباط ما.",
      why: "قد تكون أسعار مربكة أو أجهزة دفع تعطي أخطاء متأخرة.",
      pointsToward: "التسعير",
      interpretations: [
        {
          id: "price_confusion",
          text: "الأسعار الجديدة سببت سوء فهم وطلبات استرداد",
          category: "marketing",
        },
        {
          id: "pos_voids",
          text: "النظام يعكس بعض العمليات تلقائيًا",
          category: "product",
        },
      ],
    },
    {
      id: "pos_errors",
      title: "أخطاء نقاط البيع: إعادة تشغيل متعددة",
      hint: "الكاشير يذكر تجمد الجهاز بعد كل ١٠-١٢ عملية.",
      bucketHint: "product",
      meaning: "التجمد يدفع الزبائن للمغادرة أو الدفع نقدًا فقط.",
      why: "المعاملات الفاشلة = إيراد مفقود + إحباط زبائن.",
      pointsToward: "النظام",
      interpretations: [
        {
          id: "software_patch",
          text: "تحديث النظام الأخير به خطأ يعلق الطرفية",
          category: "product",
        },
        {
          id: "network_issue",
          text: "الشبكة بطيئة بسبب ضغط المساء",
          category: "billing",
        },
        {
          id: "price_lookup",
          text: "الطرفية تبحث عن أسعار جديدة وتتعطل",
          category: "marketing",
        },
      ],
    },
    {
      id: "price_change",
      title: "تغيير الأسعار: بطاقات جديدة الثلاثاء",
      hint: "الزيادة بسيطة (٣-٥٪) لكنها جاءت مع نقص عروض.",
      bucketHint: "marketing",
      meaning: "العملاء لاحظوا التغيير لكن لا دليل أنه سبب وحيد.",
      why: "السعر يحرّك الحساسية بسرعة خاصة مع أخطاء الدفع.",
      pointsToward: "التسعير",
      interpretations: [
        {
          id: "elastic_demand",
          text: "الزيادة جعلت الزبائن يشترون أقل فجأة",
          category: "marketing",
        },
        {
          id: "mixed_signal",
          text: "الزيادة تزامنت مع نفاد مخزون فخلطت الإشارة",
          category: "billing",
        },
      ],
    },
    {
      id: "foot_traffic",
      title: "حركة الزوار: العدّاد مستقر",
      hint: "الكاميرات تظهر دخولًا ثابتًا، لا هبوط في الزيارات.",
      bucketHint: "marketing",
      meaning: "المشكلة ليست قلة زوار بل ما يحدث داخل المتجر.",
      why: "يشير إلى أن السبب داخلي (مخزون/نظام/سعر) وليس تسويقًا خارجيًا.",
      pointsToward: "النظام",
      interpretations: [
        {
          id: "ops_bottleneck",
          text: "الزوار ينتظرون عند الدفع فيغادر بعضهم",
          category: "product",
        },
        {
          id: "interest_ok",
          text: "الطلب موجود لكن العرض مضطرب",
          category: "billing",
        },
      ],
    },
    {
      id: "delivery_delay",
      title: "التسليم: الشاحنة وصلت متأخرة",
      hint: "المورد تأخر نصف يوم للفرع ب صباح الجمعة.",
      bucketHint: "billing",
      meaning: "الأصناف الشعبية وصلت بعد ذروة الظهر.",
      why: "التأخير يعطل بيع يوم كامل في نهاية الأسبوع.",
      pointsToward: "المخزون",
      interpretations: [
        {
          id: "supplier_slip",
          text: "المورد أخطأ في الجدولة لهذه الشحنة",
          category: "billing",
        },
        {
          id: "receiving_queue",
          text: "الفريق لم يفرّغ الشحنة سريعًا بسبب ازدحام النظام",
          category: "product",
        },
      ],
    },
    {
      id: "promo_poster",
      title: "ملصق عرض قديم في الفرع أ",
      hint: "عرض انتهى الأسبوع الماضي لكن الملصق ما زال مرفوعًا.",
      bucketHint: "marketing",
      meaning: "إشارة ضجيج: قد يربك بعض الزبائن لكن لا يفسر الهبوط وحده.",
      why: "تشتيت بسيط، يساعد فقط على فهم التجربة داخل المتجر.",
      pointsToward: "التسعير",
      interpretations: [
        {
          id: "minor_confusion",
          text: "الزبائن يقارنون أسعار الملصق بالسعر الجديد",
          category: "marketing",
        },
        {
          id: "ignored",
          text: "الإشارة ضجيج ولا تؤثر فعليًا",
          category: "billing",
        },
      ],
    },
    {
      id: "sensor_noise",
      title: "تنبيه نقص مزيف من الحساس",
      hint: "حساس رف في الفرع ج يرسل إشعارات نفاد غير متسقة.",
      bucketHint: "product",
      meaning: "التنبيه قد يكون خطأ قراءة وليس نقصًا حقيقيًا.",
      why: "يوحي بضجيج بيانات: قد يربك الطلبات لكنه ليس سببًا مباشرًا.",
      pointsToward: "المخزون",
      interpretations: [
        {
          id: "false_alarm",
          text: "الحساس يضخم المشكلة بلا أثر كبير",
          category: "product",
        },
        {
          id: "missed_restock",
          text: "الإشعارات المتضاربة عطلت إعادة التعبئة",
          category: "billing",
        },
      ],
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
          id: "delay_window",
          title: "اسأل عن توقيت الشحنة المتأخرة",
          tag: "المخزون",
          timeCostMin: 7,
          trustDelta: 1,
          style: "confirming",
          answer:
            "يقول إن الشاحنة وصلت بعد الظهر بساعات، ويشير إلى أن الرفوف بقيت نصف فارغة حتى المساء.",
          notebook:
            "إشارة من المدير: تأخر الشحنة للفرع ب أبقى الرفوف فارغة لفترة طويلة؛ قد يفسر نقص المبيعات هناك.",
          requiresSqlFlags: ["sqlSuggestsStockShortageBranchB", "sqlSuggestsStockCorrelation"],
        },
        {
          id: "promo_conflict",
          title: "اسأل عن رد فعل الناس على الأسعار الجديدة",
          tag: "التسعير",
          timeCostMin: 6,
          trustDelta: -1,
          style: "conflicting",
          answer:
            "يذكر أن بعض الزبائن اعترضوا لكن المبيعات كانت تتحرك؛ لا يجزم إن كان السعر هو السبب أو مجرد ضجيج.",
          notebook:
            "إشارة من المدير: اعتراضات على الأسعار موجودة لكن لا يجزم أنها السبب الرئيسي، الإشارة تبقى متعارضة مع مسار المخزون.",
          requiresCategoryLean: ["marketing"],
        },
        {
          id: "ops_blur",
          title: "اسأل إن كان النظام يبطئ استلام الشحنات",
          tag: "النظام",
          timeCostMin: 8,
          trustDelta: -1,
          style: "vague",
          answer:
            "يقول إن النظام طلب إعادة إدخال بنود الاستلام مرتين، وقد يكون التأخير من الأجهزة أو من الفريق، غير متأكد.",
          notebook:
            "إشارة من المدير: النظام أربك استلام الشحنة وربما أخر التفريغ؛ إشارة غامضة بين عطل جهاز أو ضغط الفريق.",
          requiresSqlFlags: ["sqlSuggestsSystemIssueInBranchC", "sqlSuggestsMixedSignal"],
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
          id: "pos_freeze",
          title: "اسأل عن تجمد الجهاز أثناء الدفع",
          tag: "النظام",
          timeCostMin: 8,
          trustDelta: 1,
          style: "confirming",
          answer:
            "يؤكد أن الجهاز تجمد مرتين أو ثلاث، لكن أحيانًا يعود للعمل بعد إعادة البطاقة؛ لا يجزم إن كان الخطأ من الشبكة أو التحديث الأخير.",
          notebook:
            "إشارة من الكاشير: تجمدات متقطعة في الفرع ج تعطل الدفع لبضع دقائق، قد تكون من الشبكة أو التحديث.",
          requiresSqlFlags: ["sqlSuggestsSystemIssueInBranchC", "sqlSuggestsCheckPricing"],
        },
        {
          id: "discount_confusion",
          title: "اسأل عن ارتباك الخصومات بعد تغيير الأسعار",
          tag: "التسعير",
          timeCostMin: 6,
          trustDelta: -1,
          style: "conflicting",
          answer:
            "يقول إن بعض الفواتير أظهرت خصمًا غير متوقع ثم أزالته عند الإعادة، وربما كان مجرد تحديث سعر لم يكتمل.",
          notebook:
            "إشارة من الكاشير: خصومات تظهر ثم تختفي في الفواتير، إشارة متضاربة قد تعني تزامن سعر أو خطأ إدخال.",
          requiresCategoryLean: ["marketing"],
          requiresSqlFlags: ["sqlSuggestsCheckPriceFirst", "sqlSuggestsCheckPricing"],
        },
        {
          id: "stock_line",
          title: "اسأل إن كان الزبائن غادروا بسبب نقص صنف معين",
          tag: "المخزون",
          timeCostMin: 5,
          trustDelta: 1,
          style: "confirming",
          answer:
            "يذكر أن طابورًا صغيرًا تشكل عند سؤال الزبائن عن مشروب نفد، بعضهم انتظر وآخرون غادروا دون شراء شيء آخر.",
          notebook:
            "إشارة من الكاشير: زبائن غادروا بسبب نفاد صنف سريع، يؤكد تأثير المخزون على المبيعات.",
          requiresSqlFlags: ["sqlSuggestsStockShortageBranchB", "sqlSuggestsStockCorrelation", "sqlSuggestsMixedSignal"],
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
