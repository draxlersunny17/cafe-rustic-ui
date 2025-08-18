import React, { useState, useEffect } from "react";
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
  const [otpTimer, setOtpTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const { user, exists, validPassword, error } = await fetchUserByEmail(
      email,
      password
    );
    if (error) {
      toast.error(error);
      return;
    }
    if (!exists) {
      toast.error("No account found with this email. Please sign up.");
      onClose();
      onSwitchToSignUp();
    } else if (!validPassword) {
      toast.error("Incorrect password. Please try again.");
    } else {
      onSignIn(user);
      onClose();
    }
  };

  if (!isOpen) return null;
  const isDark = theme === "dark";

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error("Enter a valid 10-digit phone number.");
      return;
    }
    const { user, error } = await fetchUserByPhone(phone);
    if (!user || error) {
      toast.error("Phone number not registered. Please sign up.");
      onClose();
      onSwitchToSignUp();
      return;
    }

    // Generate random 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000);
    setOtpRecieved(generatedOtp.toString());
    setOtp("");
    setOtpSent(true);
    setOtpTimer(15); // disable button for 15 sec
    toast.success(`Dummy OTP: ${generatedOtp}`);
  };

  // Verify OTP and log in
  const handlePhoneLogin = async (e) => {
    e.preventDefault();

    if (otpTimer === 0) {
      toast.error("OTP expired. Please resend.");
      setOtp(""); // show Resend again
      return;
    }

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
      const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
      setOtpRecieved(newOtp);

      setOtp("");
      setOtpTimer(15);
      toast.success(`Dummy OTP: ${newOtp}`);
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
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                setPhone(value);
              }}
              required
              pattern="[6-9][0-9]{9}"
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

            {otpSent && (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={4}
                  required
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-gray-100 border-gray-300"
                  }`}
                />

                {/* If exactly 4 digits AND not expired -> show Verify; else show Resend */}
                {otp.length === 4 && otpTimer > 0 ? (
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
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpTimer > 0}
                    className={`w-full px-4 py-2 rounded-lg font-semibold text-gray-900 ${
                      otpTimer > 0
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-amber-400 hover:bg-amber-500"
                    }`}
                  >
                    {otpTimer > 0 ? `Resend OTP (${otpTimer})` : "Resend OTP"}
                  </button>
                )}
              </form>
            )}

            {/* Initial Send OTP button (before OTP is sent) */}
            {!otpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                className="w-full px-4 py-2 rounded-lg font-semibold text-gray-900 bg-amber-400 hover:bg-amber-500"
              >
                Send OTP
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
