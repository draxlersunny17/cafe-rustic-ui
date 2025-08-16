import React, { useState } from "react";
import { toast } from "react-toastify";
import { fetchUserByEmail, fetchUserByPhone } from "../supabaseApi";

export default function SignInModal({
  isOpen,
  onClose,
  onSignIn,
  onSwitchToSignUp,
  theme,
}) {
  const [loginMethod, setLoginMethod] = useState("email"); // email | phone
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpRecieved, setOtpRecieved] = useState("");

  if (!isOpen) return null;
  const isDark = theme === "dark";

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { user, error } = await fetchUserByEmail(email, password);

    if (error) {
      toast.error(error);
      onClose();
      onSwitchToSignUp();
    } else {
      onSignIn(user);
      onClose();
    }
  };

  const handleSendOtp = async () => {
    const { user, error } = await fetchUserByPhone(phone);

    if (!user || error) {
      toast.error("Phone number not registered. Please sign up.");
      onClose();
      onSwitchToSignUp();
      return;
    }

    // Generate random 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000); // 1000–9999
    setOtpRecieved(generatedOtp.toString()); // store as string for comparison
    setOtpSent(true);

    toast.success(`Dummy OTP: ${generatedOtp}`);
  };

  // Verify OTP and log in
  const handlePhoneLogin = async (e) => {
    e.preventDefault();

    const { user, error } = await fetchUserByPhone(phone);

    if (error) {
      toast.error(error);
      return;
    }

    if (otp === otpRecieved) {
      onSignIn(user); // store user in local state & localStorage
      onClose();
    } else {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-md rounded-xl p-6 ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Sign In</h2>

        {/* Switch login method */}
        <div className="flex gap-2 mb-4">
          <button
            className={`flex-1 px-4 py-2 rounded-lg ${
              loginMethod === "email"
                ? "bg-amber-400 text-gray-900 font-semibold"
                : isDark
                ? "bg-gray-800"
                : "bg-gray-200"
            }`}
            onClick={() => setLoginMethod("email")}
          >
            Email Login
          </button>
          <button
            className={`flex-1 px-4 py-2 rounded-lg ${
              loginMethod === "phone"
                ? "bg-amber-400 text-gray-900 font-semibold"
                : isDark
                ? "bg-gray-800"
                : "bg-gray-200"
            }`}
            onClick={() => setLoginMethod("phone")}
          >
            Phone Login
          </button>
        </div>

        {/* Email login form */}
        {loginMethod === "email" && (
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email ID"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center">
              <span
                className="text-sm text-blue-500 hover:underline cursor-pointer"
                onClick={() => {
                  onClose();
                  onSwitchToSignUp();
                }}
              >
                Don’t have an account? Sign Up
              </span>
            </div>
            <div className="flex justify-end gap-3 mt-3">
              <button
                type="button"
                onClick={onClose}
                className={
                  isDark
                    ? "bg-gray-700 px-4 py-2 rounded-lg"
                    : "bg-gray-200 px-4 py-2 rounded-lg"
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold text-gray-900"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Phone login form */}
        {loginMethod === "phone" && (
          <div className="space-y-4">
            <input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className={`w-full px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            />
            <div className="flex justify-between items-center">
              <span
                className="text-sm text-blue-500 hover:underline cursor-pointer"
                onClick={() => {
                  onClose();
                  onSwitchToSignUp();
                }}
              >
                Don’t have an account? Sign Up
              </span>
            </div>

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold text-gray-900 w-full"
              >
                Send OTP
              </button>
            ) : (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-100 border-gray-300"
                  }`}
                />
                <div className="flex justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className={
                      isDark
                        ? "bg-gray-700 px-4 py-2 rounded-lg"
                        : "bg-gray-200 px-4 py-2 rounded-lg"
                    }
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-lg font-semibold text-gray-900"
                  >
                    Verify & Sign In
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
