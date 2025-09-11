

import StaffGuard from "./components/StaffGuard";
import StaffOrdersManagement from "./components/StaffOrdersManagement";

export default function StaffDashboard() {
  return (
    <StaffGuard>
      <StaffOrdersManagement />
    </StaffGuard>
  );
}
