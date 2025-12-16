import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";

export default function AnalysisRoom() {
  const nav = useNavigate();
  const game = useGame();

  const locked = !game.analysisUnlocked;

  return (
    <div className="page">
      <div className="topbar">
        <h1 className="title">Analysis Room</h1>
        <button className="btn ghost" onClick={() => nav("/hq")}>Back to HQ</button>
      </div>

      <div className="card wide">
        {locked ? (
          <>
            <p className="muted">
              Analysis Room لسه مقفولة. لازم تخلص Interviews الأول.
            </p>
            <button className="btn" onClick={() => nav("/interviews")}>Go to Interviews</button>
          </>
        ) : (
          <>
            <p className="muted">
              Prototype: اضغط “Generate Insight” عشان تاخد clue وتفتح Reveal.
            </p>

            <div className="row gap">
              <button
                className="btn"
                onClick={() => {
                  game.completeAnalysis();
                  nav("/reveal");
                }}
              >
                Generate Insight → Continue to Reveal
              </button>
              <button className="btn ghost" onClick={() => nav("/hq")}>Back to HQ</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
