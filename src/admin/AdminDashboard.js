import { Routes, Route } from "react-router-dom";
import { Navigate } from "react-router-dom";
import AdminGuard from "./components/AdminGuard";
import Shell from "./components/Shell";
import Overview from "./pages/Overview";
import UsersPage from "./pages/UsersPage";
import MenuPage from "./pages/MenuPage";

// -------- App Entrypoint (router inside) --------
export default function AdminDashboard() {
  return (
    <AdminGuard>
      <Shell>
        <Routes>
          <Route path="overview" element={<Overview />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="*" element={<Navigate to="overview" replace />} />
        </Routes>
      </Shell>
    </AdminGuard>
  );
}
