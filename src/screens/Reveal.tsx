import { useNavigate } from "react-router-dom";
import { useGame } from "../store/game";

export default function Reveal() {
  const nav = useNavigate();
  const game = useGame();

  const locked = !game.revealUnlocked;

  return (
    <div className="page">
      <div className="topbar">
        <h1 className="title">Reveal</h1>
        <button className="btn ghost" onClick={() => nav("/hq")}>Back to HQ</button>
      </div>

      <div className="card wide">
        {locked ? (
          <>
            <p className="muted">
              Reveal مقفولة. لازم تجمع <b>6 clues</b>.
              <br />
              دلوقتي عندك: <b>{game.cluesFound}/6</b>
            </p>
            <button className="btn" onClick={() => nav("/hq")}>Go to HQ</button>
          </>
        ) : (
          <>
            <h2 className="h2">✅ The True Cause</h2>
            <p className="muted">
              (Prototype) السبب الحقيقي: خلل في Checkout + لخبطة Billing بعد تغيير Pricing،
              مع ضعف تتبع حملات التسويق—ده عمل drop في Revenue.
            </p>

            <div className="row gap">
              <button className="btn" onClick={() => nav("/")}>Play Again</button>
              <button className="btn ghost" onClick={game.resetGame}>Reset State</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
