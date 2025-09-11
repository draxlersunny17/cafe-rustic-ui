

import StaffGuard from "./components/StaffGuard";
import OrdersManagementDashboard from "./components/OrdersManagementDashboard";

export default function StaffDashboard() {
  return (
    <StaffGuard>
      <OrdersManagementDashboard />
    </StaffGuard>
  );
}
