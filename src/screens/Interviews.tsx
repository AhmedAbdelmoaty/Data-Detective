import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";

type Q = {
  id: string;
  question: string;
  options: { id: string; text: string; correct?: boolean }[];
};

export default function Interviews() {
  const nav = useNavigate();
  const game = useGame();

  const questions: Q[] = useMemo(
    () => [
      {
        id: "q1",
        question: "Customer Support: أكتر سبب للـRefunds في آخر شهر كان إيه؟",
        options: [
          { id: "a", text: "Late delivery" },
          { id: "b", text: "Unexpected charge / Billing confusion", correct: true },
          { id: "c", text: "Feature missing" },
        ],
      },
      {
        id: "q2",
        question: "Engineering: إيه اللي حصل في Checkout وقت الانخفاض؟",
        options: [
          { id: "a", text: "504 errors on payment step", correct: true },
          { id: "b", text: "New landing page copy only" },
          { id: "c", text: "Email campaign issue" },
        ],
      },
      {
        id: "q3",
        question: "Growth: ليه الـCPC زاد والـConversion قل؟",
        options: [
          { id: "a", text: "Targeting broadened + tracking degraded", correct: true },
          { id: "b", text: "Support tickets decreased" },
          { id: "c", text: "Pricing got cheaper" },
        ],
      },
    ],
    []
  );

  const [idx, setIdx] = useState<number>(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const current = questions[idx];
  const isLocked = !game.interviewsUnlocked;

  const submit = () => {
    if (!selected) return;

    const opt = current.options.find((o) => o.id === selected);
    if (opt?.correct) {
      setFeedback("✅ إجابة صحيحة. خدت clue.");
      // move next after a short UI step
      setTimeout(() => {
        setFeedback("");
        setSelected(null);

        if (idx === questions.length - 1) {
          game.completeInterviews();
          nav("/analysis");
        } else {
          setIdx((x) => x + 1);
        }
      }, 600);
    } else {
      setFeedback("❌ مش أدق إجابة. جرّب تاني.");
    }
  };

  return (
    <div className="page">
      <div className="topbar">
        <h1 className="title">Interviews</h1>
        <button className="btn ghost" onClick={() => nav("/hq")}>Back to HQ</button>
      </div>

      <div className="card wide">
        {isLocked ? (
          <>
            <p className="muted">
              Interviews لسه مقفولة. لازم تعمل Run Query في SQL Lab الأول.
            </p>
            <button className="btn" onClick={() => nav("/sql")}>Go to SQL Lab</button>
          </>
        ) : (
          <>
            <div className="row space">
              <div className="muted">
                سؤال {idx + 1} / {questions.length}
              </div>
              <div className="pill">هدفنا: clue واحد يفتح Analysis</div>
            </div>

            <h2 className="h2">{current.question}</h2>

            <div className="col gap">
              {current.options.map((o) => (
                <label key={o.id} className={`option ${selected === o.id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="opt"
                    value={o.id}
                    checked={selected === o.id}
                    onChange={() => setSelected(o.id)}
                  />
                  <span>{o.text}</span>
                </label>
              ))}
            </div>

            {feedback && <div className="feedback">{feedback}</div>}

            <div className="row gap">
              <button className="btn" disabled={!selected} onClick={submit}>
                Submit
              </button>
              <button className="btn ghost" onClick={() => nav("/sql")}>
                Back to SQL
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
