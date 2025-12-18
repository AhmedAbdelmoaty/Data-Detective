import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Intro from "./screens/Intro";
import HQ from "./screens/HQ";
import EvidenceRoom from "./screens/EvidenceRoom";
import SQLLab from "./screens/SQLLab";
import Interviews from "./screens/Interviews";
import AnalysisRoom from "./screens/AnalysisRoom";
import Reveal from "./screens/Reveal";
import { useGame } from "./store/game";

function LockedScreen({
  title,
  reason,
  goToLabel,
  goToPath,
}: {
  title: string;
  reason: string;
  goToLabel: string;
  goToPath: string;
}) {
  const nav = useNavigate();
  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 28, marginBottom: 8 }}>🔒 {title}</h2>
      <p style={{ opacity: 0.9, marginBottom: 16 }}>{reason}</p>

      <button
        type="button"
        onClick={() => nav(goToPath)}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
        }}
      >
        {goToLabel}
      </button>
    </div>
  );
}

function Guarded({
  allow,
  locked,
  children,
}: {
  allow: boolean;
  locked: React.ReactNode;
  children: React.ReactNode;
}) {
  return <>{allow ? children : locked}</>;
}

export default function App() {
  const game = useGame();
  const location = useLocation();

  // ملاحظة: هنا مفيش Redirect تلقائي لخطوة تانية.
  // لو صفحة مقفولة -> بنعرض LockedScreen في نفس الـ route.
  const path = location.pathname;

  // السماح الدائم:
  const alwaysAllowed = path === "/" || path === "/hq" || path === "/evidence";

  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/hq" element={<HQ />} />
      <Route path="/evidence" element={<EvidenceRoom />} />

      <Route
        path="/sql"
        element={
          <Guarded
            allow={alwaysAllowed ? true : game.canEnterSQL}
            locked={
              <LockedScreen
                title="SQL Lab مقفول"
                reason="لازم تحط 3 Clues على الأقل في Evidence Room علشان يتفتح SQL Lab."
                goToLabel="اذهب إلى Evidence Room"
                goToPath="/evidence"
              />
            }
          >
            <SQLLab />
          </Guarded>
        }
      />

      <Route
        path="/interviews"
        element={
          <Guarded
            allow={alwaysAllowed ? true : game.canEnterInterviews}
            locked={
              <LockedScreen
                title="Interviews مقفولة"
                reason="لازم تعمل Run Query في SQL Lab بعد ما تفتح SQL (3 clues)."
                goToLabel="اذهب إلى SQL Lab"
                goToPath="/sql"
              />
            }
          >
            <Interviews />
          </Guarded>
        }
      />

      <Route
        path="/analysis"
        element={
          <Guarded
            allow={alwaysAllowed ? true : game.canEnterAnalysis}
            locked={
              <LockedScreen
                title="Analysis Room مقفولة"
                reason="لازم تجاوب على الأقل سؤالين في Interviews علشان يتفتح Analysis."
                goToLabel="اذهب إلى Interviews"
                goToPath="/interviews"
              />
            }
          >
            <AnalysisRoom />
          </Guarded>
        }
      />

      <Route
        path="/reveal"
        element={
          <Guarded
            allow={alwaysAllowed ? true : game.canReveal}
            locked={
              <LockedScreen
                title="Reveal مقفول"
                reason="لازم تختار 2 Insights في Analysis Room علشان تفتح النهاية."
                goToLabel="اذهب إلى Analysis Room"
                goToPath="/analysis"
              />
            }
          >
            <Reveal />
          </Guarded>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
