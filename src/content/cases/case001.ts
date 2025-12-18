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
    role: "أنت محلل بيانات استدعاه ال-CFO لإنقاذ ربع السنة.",
    stakes:
      "الإيراد نازل 18% الأسبوع ده. لو السبب غلط، فيه خطر Cut للميزانية وFreeze للـ hires.",
    pressure: "الوقت بيجري؛ كل خطوة بتكلف Time/Trust. مفيش رفاهية تجارب عشوائية.",
    win: "تثبت سبب واحد مقنع مدعوم بأدلة + تقترح خطوتين تنفيذيتين.",
  },
  roomObjectives: {
    hq: "اقرأ اللوحة وحدد الغرفة الجاية—هدفها وما يقفلها.",
    evidence: "اجمع 3 أدلة تحطهم في البورد علشان تفتح SQL وتضيق الفرضيات.",
    sql: "شغّل استعلام يثبت اتجاه واحد: الدفع؟ التسويق؟ التسعير؟",
    interviews:
      "اسأل دعم العملاء وGrowth. هدفك تطلع معلومة تنفي أو تثبت المسارات.",
    analysis: "اختر 2 Insights بس علشان السردية تفضل مركزة.",
    reveal:
      "اربط كل حاجة في تقرير تنفيذي: السبب + ليه + دليل + حركة عاجلة.",
  },
  evidenceReason:
    "قبل ما تجري على SQL أو الناس، لازم تجمع إشارات أولية. التصنيف هنا بيقلل الضوضاء ويوفّر Time.",
  timeCostReason:
    "كل محاولة Place بتاخد وقت (تنسيق فرق/جلب بيانات). التسرع بيدفع Time زيادة.",
  sqlFrame:
    "الاستعلام هنا هدفه يكشف لو المشكلة في الدفع أو التسويق أو الفوترة. أنت بتدور على نمط يربط الـ drop بمسار واحد.",
  sqlQuery:
    "WITH weekly AS (\n  SELECT\n    DATE_TRUNC('week', paid_at) AS week,\n    SUM(amount_usd) AS revenue,\n    SUM(CASE WHEN status = 'failed' AND error_code = '504' THEN 1 ELSE 0 END) AS checkout_504_errors,\n    SUM(CASE WHEN refunded = TRUE THEN 1 ELSE 0 END) AS refunds\n  FROM payments\n  WHERE paid_at >= NOW() - INTERVAL '8 weeks'\n  GROUP BY 1\n)\nSELECT\n  week,\n  revenue,\n  checkout_504_errors,\n  refunds,\n  ROUND(100.0 * checkout_504_errors / NULLIF(checkout_504_errors + refunds + 1, 0), 1) AS failure_share_pct\nFROM weekly\nORDER BY week DESC;",
  sqlResultHighlights: [
    "معدل checkout_504_errors زاد +38% في آخر أسبوعين مقارنة بالمتوسط.",
    "Refunds ارتفعت +22% في نفس الفترة، غالبًا بسبب ارتباك تسعير/خصومات.",
    "إيراد الأسبوع الحالي أقل -18% من baseline، متوافق مع spike في الأخطاء.",
  ],
  sqlResultNarrative:
    "البيانات بتقول إن مسار الدفع فيه اختناق حقيقي (504 errors) وفي نفس الوقت العملاء بيرجعوا يطلبوا Refunds بسبب التسعير الجديد. الاتجاه واضح ناحية الدفع + التسعير، وده يحضّر أسئلة الـ Interviews: هل المشكلة تقنية بس ولا في رسالة التسعير؟",
  interviewFrame:
    "Trust = استعداد الفريق يفتح لك دفاتر وأسرار. قراراتك ممكن تكسبهم أو تخليهم يقفلوا الباب.",
  analysisFrame:
    "حوّل الملاحظات لقصتين فقط. 2 Insights = تركيز. ده اللي يخلي القيادة تسمع وتتحرك.",
  revealFrame:
    "اعرض الخلاصة كأنك في غرفة حرب: سبب واحد، لماذا حصل، الدليل، وخطوتين تنفيذيتين.",

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
