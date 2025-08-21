import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { addFeedback } from "../supabaseApi";
import { useNavigate } from "react-router-dom";

export default function FeedbackForm({ isModal = false, userProfile = null, theme = "light" }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [issue, setIssue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();


  const isFeedbackPage = window.location.pathname === "/feedback";
  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || !feedback.trim()) {
      alert("Please provide a rating and feedback.");
      return;
    }

    const data = {
      rating,
      issue: issue || null,
      feedback,
      name: userProfile?.name || name || "Anonymous",
    };

    try {
      setLoading(true);
      const saved = await addFeedback(data);
      if (!saved) throw new Error("Failed to save feedback");

      setSubmitted(true);
      setRating(0);
      setIssue("");
      setFeedback("");
      setName("");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ⏳ After submit: redirect or reload
  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        if (isFeedbackPage) {
          navigate("/"); // go home
        } else {
          window.location.reload(); // just reload modal parent
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitted, isFeedbackPage, navigate]);

  if (submitted) {
    return (
      <div
        className={`max-w-lg mx-auto mt-12 shadow-lg rounded-2xl p-8 text-center ${
          isFeedbackPage
            ? "bg-white text-gray-800"
            : isDark
            ? "bg-gray-900 text-white"
            : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-2xl font-semibold">
          🎉 Thank you for your feedback!
        </h2>
        {isFeedbackPage && (
          <p className="mt-2 text-gray-600">
            Redirecting you back to home...
          </p>
        )}
      </div>
    );
  }

  return (
    <div
      className={`${
        isModal
          ? `max-w-5xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6 ${
              isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
            }`
          : "max-w-lg mx-auto mt-12 bg-white shadow-lg rounded-2xl p-8"
      } space-y-6`}
    >
      <h2 className="text-2xl font-semibold text-center">
        We value your feedback ❤️
      </h2>

      {/* Star Rating */}
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 ${
                (hover || rating) >= star
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* Conditional: Issue if rating is low */}
      {rating > 0 && rating <= 3 && (
  <div>
    <label className="block text-sm font-medium mb-1">
      What could we improve?
    </label>
    <select
      className={`w-full rounded-xl px-3 py-2 shadow-inner border-0 focus:ring-2 focus:ring-yellow-400 
        ${isDark 
          ? "bg-gray-800 text-gray-200 placeholder-gray-400 focus:bg-gray-700" 
          : "bg-gray-100 text-gray-700 placeholder-gray-400 focus:bg-white"}`}
      value={issue}
      onChange={(e) => setIssue(e.target.value)}
    >
      <option value="" disabled>
        Select an issue
      </option>
      <option value="Service">Service</option>
      <option value="Food Quality">Food Quality</option>
      <option value="Ambience">Ambience</option>
      <option value="Pricing">Pricing</option>
      <option value="Other">Other</option>
    </select>
  </div>
)}

{/* Feedback Box */}
<div>
  <label className="block text-sm font-medium mb-1">
    Share your thoughts
  </label>
  <textarea
    className={`w-full h-32 resize-none rounded-xl px-3 py-2 shadow-inner border-0 focus:ring-2 focus:ring-yellow-400
      ${isDark 
        ? "bg-gray-800 text-gray-200 placeholder-gray-400 focus:bg-gray-700" 
        : "bg-gray-100 text-gray-700 placeholder-gray-400 focus:bg-white"}`}
    placeholder="Write your feedback here..."
    value={feedback}
    onChange={(e) => setFeedback(e.target.value)}
  />
</div>

      {/* Name Input (hide if userProfile and not feedback page) */}
      {!userProfile &&(
        <div>
          <label className="block text-sm font-medium mb-1">
            Your name
          </label>
          <input
            type="text"
            className="w-full rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-yellow-400 px-3 py-2 placeholder-gray-400 text-gray-700 shadow-inner border-0"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="px-6 py-2 bg-yellow-400 text-gray-900 rounded-xl font-semibold shadow hover:bg-yellow-500 transition disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>
    </div>
  );
}
