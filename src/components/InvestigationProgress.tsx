import React from "react";
import { useNavigate } from "react-router-dom";

type StepId = "hq" | "evidence" | "sql" | "interviews" | "analysis" | "reveal";

type Step = {
  id: StepId;
  label: string;
  path: string;
};

const steps: Step[] = [
  { id: "hq", label: "HQ", path: "/hq" },
  { id: "evidence", label: "Evidence", path: "/evidence" },
  { id: "sql", label: "Data Lab", path: "/sql" },
  { id: "interviews", label: "Witnesses", path: "/interviews" },
  { id: "analysis", label: "Analysis", path: "/analysis" },
  { id: "reveal", label: "Reveal", path: "/reveal" },
];

export function InvestigationProgress({ current }: { current: StepId }) {
  const nav = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
      {steps.map((step, index) => {
        const active = current === step.id;
        const done =
          steps.findIndex((s) => s.id === current) > index || active;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => nav(step.path)}
              className={`rounded-xl px-3 py-1 transition ${
                active
                  ? "bg-white text-black font-semibold"
                  : done
                    ? "bg-emerald-500/15 text-emerald-100"
                    : "bg-white/5 text-white/70 hover:bg-white/10"
              }`}
            >
              {index + 1}. {step.label}
            </button>
            {index < steps.length - 1 && (
              <span className="text-white/40">→</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
