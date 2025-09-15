import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AdminGuard from "./components/AdminGuard";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import UsersPage from "./pages/UsersPage";
import MenuPage from "./pages/MenuPage";
import SpecialOffersPage from "./pages/SpecialOffersPage";

// -------- App Entrypoint (router inside) --------
export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Shell>
        <Routes>
          <Route path="dashboard/overview" element={<Overview />} />
          <Route path="dashboard/users" element={<UsersPage />} />
          <Route path="dashboard/menu" element={<MenuPage />} />
          <Route path="dashboard/special-offers" element={<SpecialOffersPage />} />
          <Route index element={<Navigate to="dashboard/overview" replace />} />
          <Route path="*" element={<Navigate to="dashboard/overview" replace />} />
        </Routes>
      </Shell>
    </AdminGuard>
  );
}
