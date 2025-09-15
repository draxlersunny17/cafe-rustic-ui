import StaffGuard from "./components/StaffGuard";
import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import StaffOrdersManagement from "./components/StaffOrdersManagement";
import StaffShell from "./components/StaffShell";

export default function StaffDashboard() {
  return (
    <StaffGuard>
      <StaffShell>
        <Routes>
          <Route path="orders" element={<StaffOrdersManagement />} />
          <Route index element={<Navigate to="orders" replace />} />
          <Route path="*" element={<Navigate to="orders" replace />} />
        </Routes>
      </StaffShell>
    </StaffGuard>
  );
}
