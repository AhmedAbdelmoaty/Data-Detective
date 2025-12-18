// src/content/cases/case001.ts
export type CaseBucket = "billing" | "product" | "marketing";

export type CaseEvidence = {
  id: string;
  title: string;
  hint: string;
  bucketHint: CaseBucket;
};

export type CaseInterviewChoice = {
  id: string;
  title: string;
  tag: string;
  timeCostMin: number;
  trustDelta: number;
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

export const CASE001 = {
  id: "case001_revenue_drop",
  title: "Case #001 — Revenue Drop",
  briefing: {
    role: "أنت محقق بيانات يستدعيه ال-CFO لو وقف الإيراد.",
    stakes: "الإيراد نازل 18% هذا الأسبوع. خطأ في التشخيص يعني Cuts وتجمد تعيينات.",
    pressure: "الوقت والثقة بيقلّوا مع كل حركة. لازم خط سير واضح.",
    win: "سبب واحد مقنع + دليلين واضحين + خطوتين تنفيذ.",
  },
  roomObjectives: {
    hq: "اعرف دورك، المشكلة، وخريطة الخطوات.",
    evidence: "ضع 3 أدلة في البورد لتفتح SQL وتضيق الفرضيات.",
    sql: "شغّل استعلام يفرز المسار الأقوى (دفع/تسعير/تسويق).",
    interviews:
      "اسأل دعم العملاء وGrowth. هدفك تطلع معلومة تنفي أو تثبت المسارات.",
    analysis: "اختر 2 Insights مركزين يدعموا النتيجة.",
    reveal: "اعرض الاستنتاج + الثقة + ما يجب أن يحدث فورًا.",
  },
  evidenceReason:
    "الأدلة الأولية تحميك من قفزات غلط. التصنيف السريع يقلل الضوضاء ويوفر وقت.",
  timeCostReason:
    "كل Place = وقت تنسيق مع فريق أو طلب بيانات. الاختيارات العشوائية تحرق الوقت.",
  sqlFrame:
    "الاستعلام يفصل: هل السبب checkout errors؟ ولا تسعير؟ ولا تسويق؟ ركّز على الأسبوعين الأخيرين.",
  sqlQuery:
    "WITH weekly AS (\n  SELECT\n    DATE_TRUNC('week', paid_at) AS week,\n    SUM(amount_usd) AS revenue,\n    SUM(CASE WHEN status = 'failed' AND error_code = '504' THEN 1 ELSE 0 END) AS checkout_504_errors,\n    SUM(CASE WHEN refunded = TRUE THEN 1 ELSE 0 END) AS refunds\n  FROM payments\n  WHERE paid_at >= NOW() - INTERVAL '8 weeks'\n  GROUP BY 1\n)\nSELECT\n  week,\n  revenue,\n  checkout_504_errors,\n  refunds,\n  ROUND(100.0 * checkout_504_errors / NULLIF(checkout_504_errors + refunds + 1, 0), 1) AS failure_share_pct\nFROM weekly\nORDER BY week DESC;",
  sqlResultHighlights: [
    "أخطاء Checkout 504 زادت +38% آخر أسبوعين.",
    "Refunds زادت +22% مع شكاوى تسعير.",
    "إيراد الأسبوع الحالي أقل 18% عن الخط الأساس.",
  ],
  sqlResultNarrative:
    "البيانات تميل لمسار الدفع + التسعير: أخطاء دفع واضحة، وRefunds بسبب ارتباك أسعار. هذا ما يجب أن تسأل عنه في المقابلات.",
  sqlResultTable: [
    {
      week: "الأسبوع الحالي",
      revenue: "$1.2M (-18%)",
      errors: "312 (+38%)",
      refunds: "210 (+22%)",
      failureShare: "9.1%",
    },
    {
      week: "الأسبوع السابق",
      revenue: "$1.35M (-8%)",
      errors: "240 (+18%)",
      refunds: "188 (+14%)",
      failureShare: "7.2%",
    },
    {
      week: "Baseline",
      revenue: "$1.47M",
      errors: "174",
      refunds: "154",
      failureShare: "5.1%",
    },
  ],
  sqlInterviewPrep: [
    "اسأل الدعم: هل الـ refunds مرتبطة بالخصومات أو التوقيت؟",
    "اسأل Growth: هل التغيير في landing أو targeting خفض التحويل؟",
    "اسأل فريق الدفع: ما خطة rollback / مراقبة الأخطاء 504؟",
  ],
  interviewFrame:
    "Trust = استعداد الفرق للبوح بالتفاصيل. اختيار سؤال غلط يكلف وقت وثقة.",
  analysisFrame:
    "Insight واضح = قصة مركزة. اختَر اثنين فقط لتوجيه الحديث.",
  revealFrame:
    "الخاتمة = جملة سبب، الدليل، وخطوات فورية. خليك قصير ومحدد.",

  // ✅ IDs هنا لازم تطابق اللي موجود فعليًا في store/game.tsx (cards)
  evidence: [
    {
      id: "refunds_spike",
      title: "Spike in Refunds",
      hint: "زادت Refunds بشكل غير طبيعي.",
      bucketHint: "billing",
    },
    {
      id: "checkout_504",
      title: "Checkout Error 504",
      hint: "ارتفعت أخطاء 504 في خطوة الدفع.",
      bucketHint: "product",
    },
    {
      id: "paid_ads_cpc",
      title: "Paid Ads CPC ↑",
      hint: "تكلفة النقرة زادت في الحملات المدفوعة.",
      bucketHint: "marketing",
    },
    {
      id: "pricing_complaints",
      title: "Pricing Complaints",
      hint: "شكاوى أكتر عن الأسعار/الخصومات.",
      bucketHint: "billing",
    },
    {
      id: "feature_adoption",
      title: "Feature Adoption Drop",
      hint: "استخدام ميزة مهمة قل فجأة.",
      bucketHint: "product",
    },
    {
      id: "lp_conv_down",
      title: "Landing Conversion Down",
      hint: "الـConversion rate قل بعد تغيير الـLanding.",
      bucketHint: "marketing",
    },
  ] as const,

  // ✅ هنا بنثبت IDs بحيث Reveal يقدر يقيّمها بدون mismatch
  interviews: [
    {
      id: "q1_support",
      header: "Interview #1 — Support Lead (منى الشناوي)",
      question: "إيه أكتر حاجة لاحظتوها في الشكاوى آخر أسبوعين؟",
      persona: {
        role: "Head of Support",
        vibe: "متوترة عشان ال-CFO بيسأل يوميًا.",
        youNeed: "تحدد لو الفوترة/التسعير هي اللي مولّعة refunds.",
      },
      choices: [
        {
          id: "pricing",
          title: "شكاوى عن الفواتير والخصومات",
          tag: "Pricing/Billing",
          timeCostMin: 6,
          trustDelta: 3,
        },
        {
          id: "checkout",
          title: "شكاوى عن أخطاء في الدفع",
          tag: "Checkout errors",
          timeCostMin: 7,
          trustDelta: -2,
        },
        {
          id: "ads",
          title: "شكاوى عن الإعلانات",
          tag: "CAC/Conversion",
          timeCostMin: 5,
          trustDelta: -1,
        },
      ],
    },
    {
      id: "q2_growth",
      header: "Interview #2 — Growth Marketer (كريم فؤاد)",
      question: "إيه اللي اتغير في الحملات مؤخرًا؟",
      persona: {
        role: "Sr. Growth Marketer",
        vibe: "واثق بس دفاعي عن التجارب الجديدة.",
        youNeed: "تعرف إذا الترافيك هو السبب ولا الدعاية بريئة.",
      },
      choices: [
        {
          id: "search_budget",
          title: "زودنا الميزانية على Search",
          tag: "CPC ↑",
          timeCostMin: 8,
          trustDelta: -2,
          requiresEvidenceIds: ["paid_ads_cpc"],
        },
        // ✅ نخلي IDs دي قياسية: landing / quality
        {
          id: "landing",
          title: "غيّرنا Landing Page",
          tag: "Conversion ↓",
          timeCostMin: 6,
          trustDelta: -1,
          requiresEvidenceIds: ["lp_conv_down"],
        },
        {
          id: "quality",
          title: "غيّرنا targeting",
          tag: "Quality ↓",
          timeCostMin: 6,
          trustDelta: 2,
          requiresEvidenceIds: ["feature_adoption"],
        },
      ],
    },
  ] as const,

  // ✅ Insights IDs لازم تبقى متسقة مع Reveal (pricing / checkout / cpc)
  insights: [
    {
      id: "pricing",
      title: "Pricing backlash signal",
      desc: "في إشارات إن تغيير الأسعار رفع refunds وزوّد الشكاوى.",
    },
    {
      id: "checkout",
      title: "Checkout reliability issue",
      desc: "أخطاء الدفع بتأثر مباشرة على الإيراد والتحويل.",
    },
    {
      id: "cpc",
      title: "CPC jump + conversion down",
      desc: "إما CPC زاد أو الـlanding page أثرت على التحويل.",
    },
  ] as const,
};
