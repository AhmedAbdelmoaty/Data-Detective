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
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }} dir="rtl">
      <h2 style={{ fontSize: 28, marginBottom: 8, textAlign: "right" }}>🔒 {title}</h2>
      <p style={{ opacity: 0.9, marginBottom: 16, textAlign: "right" }}>{reason}</p>

      <button
        type="button"
        onClick={() => nav(goToPath)}
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          textAlign: "right",
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

  // Always allow the opening rooms
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
                title="مختبر البيانات مقفول"
                reason="ضع ٣ أدلة في غرفة الأدلة لفتح مختبر البيانات."
                goToLabel="اذهب إلى غرفة الأدلة"
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
                title="الشهود مقفولون"
                reason="شغّل الاستعلام في مختبر البيانات (بعد ٣ أدلة) لفتح أسئلة الشهود."
                goToLabel="اذهب إلى مختبر البيانات"
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
                title="غرفة التحليل مقفولة"
                reason="أجب على سؤالين من الشهود على الأقل لفتح غرفة التحليل."
                goToLabel="اذهب إلى الشهود"
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
                title="كشف الحقيقة مقفول"
                reason="اختر نتيجتين في غرفة التحليل لفتح النهاية."
                goToLabel="اذهب إلى غرفة التحليل"
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
