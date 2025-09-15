// src/App.js

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CafeRustic from "./customer/CafeRustic";
import FeedbackForm from "./customer/components/FeedbackForm";
import AdminDashboardApp from "./admin/AdminDashboard";
import StaffDashboard from "./staff/StaffDashboard";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CafeRustic />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/admin/*" element={<AdminDashboardApp />} /> {/* 👈 added */}
        <Route path="/staff" element={<StaffDashboard />} />
      </Routes>
    </Router>
  );
}
