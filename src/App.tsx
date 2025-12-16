import { Routes, Route, Navigate } from "react-router-dom";

import Intro from "./screens/Intro";
import HQ from "./screens/HQ";
import EvidenceRoom from "./screens/EvidenceRoom";
import SQLLab from "./screens/SQLLab";
import Interviews from "./screens/Interviews";
import AnalysisRoom from "./screens/AnalysisRoom";
import Reveal from "./screens/Reveal";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/hq" element={<HQ />} />
      <Route path="/evidence" element={<EvidenceRoom />} />
      <Route path="/sql" element={<SQLLab />} />
      <Route path="/interviews" element={<Interviews />} />
      <Route path="/analysis" element={<AnalysisRoom />} />
      <Route path="/reveal" element={<Reveal />} />

      {/* أي مسار غلط يرجّع للـ Intro */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
