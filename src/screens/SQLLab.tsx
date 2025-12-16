import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";

export default function SQLLab() {
  const nav = useNavigate();
  const game = useGame();
  const [query, setQuery] = useState<string>("");

  const canRun = game.sqlUnlocked && query.trim().length > 0;

  const hint = useMemo(() => {
    return `مثال Query (Prototype):
SELECT reason, count(*) 
FROM refunds 
WHERE date >= 'last_30_days'
GROUP BY reason;`;
  }, []);

  return (
    <div className="page">
      <div className="topbar">
        <h1 className="title">SQL Lab</h1>
        <button className="btn ghost" onClick={() => nav("/hq")}>Back to HQ</button>
      </div>

      <div className="card wide">
        {!game.sqlUnlocked ? (
          <>
            <p className="muted">
              SQL Lab لسه مقفول. ارجع Evidence Room وحط 3 أدلة على البورد عشان يفتح.
            </p>
            <button className="btn" onClick={() => nav("/evidence")}>Go to Evidence Room</button>
          </>
        ) : (
          <>
            <p className="muted">
              اكتب أي Query (Prototype) وبعدين اضغط <b>Run Query</b> عشان تجمع clue وتفتح Interviews.
            </p>

            <textarea
              className="textarea"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={hint}
              rows={8}
            />

            <div className="row gap">
              <button
                className="btn"
                disabled={!canRun}
                onClick={() => {
                  game.runSql();
                  nav("/interviews");
                }}
              >
                Run Query → Continue to Interviews
              </button>

              <button
                className="btn ghost"
                onClick={() => {
                  setQuery(hint);
                }}
              >
                Paste Example
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
