import React, { useState } from "react";
import { toast } from "react-toastify";
import { addUser, fetchAllUsers } from "../supabaseApi";

export default function SignUpModal({
  isOpen,
  onClose,
  onSignUp,
  onSwitchToSignIn,
  theme,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    dob: "",
    avatar: "",
  });

  const avatars = [
    "avatar1.png",
    "avatar2.png",
    "avatar3.png",
    "avatar4.png",
    "avatar5.png",
    "avatar6.png",
  ];


  if (!isOpen) return null;
  const isDark = theme === "dark";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // First fetch all users
      const existingUsers = await fetchAllUsers();

      const exists = existingUsers.some(
        (u) =>
          (u.email &&
            form.email &&
            u.email.toLowerCase() === form.email.toLowerCase()) ||
          (u.phone && form.phone && u.phone === form.phone)
      );

      if (exists) {
        toast.error("User already exists! Please sign in.");
        onClose();
        onSwitchToSignIn();
        return;
      }

      // New user
      const newUser = {
        email: form.email,
        phone: form.phone,
        password_hash: form.password, // should hash in real apps
        name: `${form.firstName} ${form.lastName}`,
        dob: form.dob,
        theme: theme || "light",
        avatar: form.avatar,
        loyalty_points: 0,
        favorites: [],
      };

      // Save to Supabase
      const result = await addUser(newUser);

      if (!result || result.length === 0) {
        toast.error("Failed to create account. Please try again.");
        return;
      }

      // Auto sign in
      onSignUp(result[0]);
      toast.success("Account created successfully! 🎉");
      onClose();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className={`w-full max-w-lg rounded-xl p-6 ${
          isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
        }`}
      >
        <h2 className="text-xl font-bold mb-4">Sign Up</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              name="firstName"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              required
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            />
            <input
              name="lastName"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              required
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-300"
              }`}
            />
          </div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={(e) => {
              // allow only digits and max 10 characters
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setForm({ ...form, phone: value });
            }}
            required
            pattern="[6-9][0-9]{9}" // regex for Indian numbers
            title="Enter a valid 10-digit phone number"
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
          <input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            required
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
           {/* Avatar Picker */}
           <div>
            <p className="mb-2 font-medium">Choose an Avatar</p>
            <div className="grid grid-cols-3 gap-3 justify-items-center">
              {avatars.map((avatar, idx) => (
                <img
                  key={idx}
                  src={`/images/avatars/${avatar}`}
                  alt={`Avatar ${idx + 1}`}
                  onClick={() => setForm({ ...form, avatar })}
                  className={`w-20 h-20 rounded-full cursor-pointer border-4 transition ${
                    form.avatar === avatar
                      ? "border-green-500 scale-105"
                      : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <span
              className="text-sm text-blue-500 hover:underline cursor-pointer"
              onClick={() => {
                onClose();
                onSwitchToSignIn();
              }}
            >
              Already have an account? Sign In
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
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg text-white font-semibold"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
