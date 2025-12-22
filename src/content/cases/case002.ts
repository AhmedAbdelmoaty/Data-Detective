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
    "التحقيق الأعمق يستغرق وقتًا أطول. اصرف الوقت للتفاصيل أو سرع الخطى لربح الثقة سريعًا.",
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
