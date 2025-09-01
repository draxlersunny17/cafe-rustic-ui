// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CafeRustic from "./customer/CafeRustic";
import FeedbackForm from "./customer/components/FeedbackForm";
import AdminDashboardApp from "./admin/AdminDashboard"; // 👈 added

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CafeRustic />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/dashboard/*" element={<AdminDashboardApp />} /> {/* 👈 added */}
      </Routes>
    </Router>
  );
}
