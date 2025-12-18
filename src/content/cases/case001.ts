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
};

export type CaseInterviewQuestion = {
  id: string;
  header: string;
  question: string;
  choices: CaseInterviewChoice[];
};

export type CaseInsight = {
  id: string;
  title: string;
  desc: string;
};

export const CASE001 = {
  id: "case001_revenue_drop",
  title: "Case #001 — Revenue Drop",

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
      header: "Interview #1 — Support Lead",
      question: "إيه أكتر حاجة لاحظتوها في الشكاوى آخر أسبوعين؟",
      choices: [
        {
          id: "pricing",
          title: "شكاوى عن الفواتير والخصومات",
          tag: "Pricing/Billing",
        },
        {
          id: "checkout",
          title: "شكاوى عن أخطاء في الدفع",
          tag: "Checkout errors",
        },
        { id: "ads", title: "شكاوى عن الإعلانات", tag: "CAC/Conversion" },
      ],
    },
    {
      id: "q2_growth",
      header: "Interview #2 — Growth Marketer",
      question: "إيه اللي اتغير في الحملات مؤخرًا؟",
      choices: [
        {
          id: "search_budget",
          title: "زودنا الميزانية على Search",
          tag: "CPC ↑",
        },
        // ✅ نخلي IDs دي قياسية: landing / quality
        { id: "landing", title: "غيّرنا Landing Page", tag: "Conversion ↓" },
        { id: "quality", title: "غيّرنا targeting", tag: "Quality ↓" },
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
