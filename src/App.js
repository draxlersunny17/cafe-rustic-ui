// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CafeRustic from "./CafeRustic";
import FeedbackForm from "./components/FeedbackForm";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CafeRustic />} />
        <Route path="/feedback" element={<FeedbackForm />} />
      </Routes>
    </Router>
  );
}
