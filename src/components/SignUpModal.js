import React, { useState } from "react";
import { toast } from "react-toastify";
import mockUsers from "../jsons/mockUsers.json"; // Import mock data array

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
    occupation: "",
  });

  if (!isOpen) return null;
  const isDark = theme === "dark";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if user already exists
    const exists = mockUsers.some(
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

    // Create new user object
    const newUser = {
      id: mockUsers.length + 1,
      fullName: `${form.firstName} ${form.lastName}`,
      occupation: form.occupation ,
      email: form.email,
      phone: form.phone,
      password: form.password,
      loyaltyPoints: 0,
    };

    // Simulate saving to "database"
    mockUsers.push(newUser);

    // Sign in immediately
    onSignUp(newUser);
    toast.success("Account created successfully! 🎉");
    onClose();
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
            onChange={handleChange}
            required
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
            name="occupation"
            placeholder="Occupation"
            value={form.occupation}
            onChange={handleChange}
            className={`w-full px-4 py-2 rounded-lg border ${
              isDark
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-300"
            }`}
          />
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
