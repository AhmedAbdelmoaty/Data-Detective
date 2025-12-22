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
  title: "Case 002: Missing Sales (Retail Mystery)",
  briefing: {
    role: "You are the Junior Data Detective hired by the shop owner.",
    stakes:
      "Three neighborhood branches lost sales this week. The owner needs a clean answer by end of day.",
    pressure: "Time = actions before the shop closes. Trust = how confident the owner is in your calls.",
    win: "Pick the real cause + show evidence + a short fix list.",
  },
  roomObjectives: {
    hq: "See your badge, the case map, and the immediate objective.",
    evidence:
      "Place 3 clues on the board to open Data Lab. Group them by the most likely cause.",
    sql: "Complete a simple query to compare branches and spot the weakest metric.",
    interviews:
      "Ask the Store Manager and Cashier to confirm or challenge your hypothesis.",
    analysis: "Review quick charts, apply filters, and lock 2 insights in plain language.",
    reveal: "Present the conclusion + why you believe it + what to fix next.",
  },
  evidenceReason:
    "Placing is your hypothesis. Grouping clues by cause keeps you from chasing random noise.",
  timeCostReason:
    "Each placement is a phone call or Slack message. Rushing burns the clock before you hit the lab.",
  sqlFrame:
    "Use a tiny sales_weekly table. Choose the metric and sort to see which branch is in trouble.",
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
    "Ask the Store Manager if deliveries slipped for Branch B.",
    "Ask the Cashier about POS errors and price complaints.",
    "Confirm if the price tweak confused regulars or if stock simply ran out.",
  ],
  interviewFrame:
    "Deeper investigation takes longer. Spend time for detail or go fast for quick trust wins.",
  analysisFrame:
    "Pick only the insights that directly prove the cause. Clear, simple language beats jargon.",
  revealFrame:
    "Closure = one cause, supporting clues, and a fix list the owner can act on today.",

  evidence: [
    {
      id: "branch_b_stockout",
      title: "Branch B: Out-of-stock report increased",
      hint: "Shelves empty on weekend items.",
      bucketHint: "billing",
      meaning: "Popular SKUs missing during peak hours.",
      why: "Missing stock blocks sales even if demand is there.",
      pointsToward: "Stock",
    },
    {
      id: "branch_c_refunds",
      title: "Refunds increased at Branch C",
      hint: "Customers returning items more often.",
      bucketHint: "billing",
      meaning: "Refund desk busy after checkout confusion.",
      why: "Refund spikes can signal pricing or payment pain.",
      pointsToward: "Pricing",
    },
    {
      id: "pos_errors",
      title: "POS errors increased (failed payments)",
      hint: "More card declines/terminal resets.",
      bucketHint: "product",
      meaning: "Devices timing out at checkout.",
      why: "Failed transactions mean lost revenue.",
      pointsToward: "System",
    },
    {
      id: "price_change",
      title: "Price changed last week",
      hint: "New price tags rolled out on Tuesday.",
      bucketHint: "marketing",
      meaning: "Customers noticed a small price bump.",
      why: "Price perception shifts demand quickly.",
      pointsToward: "Pricing",
    },
    {
      id: "foot_traffic",
      title: "Foot traffic stable",
      hint: "People entering the store stayed the same.",
      bucketHint: "marketing",
      meaning: "No drop in visits across branches.",
      why: "Traffic is not the culprit. Look inside the store.",
      pointsToward: "System",
    },
    {
      id: "delivery_delay",
      title: "Inventory delivery delayed",
      hint: "Truck arrived late for Branch B.",
      bucketHint: "billing",
      meaning: "Best-selling items arrived half a day late.",
      why: "Late deliveries leave shelves empty during peak.",
      pointsToward: "Stock",
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
