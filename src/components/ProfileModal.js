// components/ProfilePanel.jsx
import React from "react";

export default function ProfilePanel({
  open,
  onClose,
  theme,
  userProfile,
  loyaltyPoints,
  onLogout,
  onContact,
  onShareReferral,
}) {
  // Define loyalty tiers
  const loyaltyTiers = [
    { name: "Bronze", minPoints: 0, color: "bg-orange-500" },
    { name: "Silver", minPoints: 500, color: "bg-teal-400" },
    { name: "Gold", minPoints: 2000, color: "bg-yellow-400" },
    { name: "Diamond", minPoints: 5000, color: "bg-cyan-400" },
    { name: "Platinum", minPoints: 10000, color: "bg-purple-600" },
  ];

  // Determine current tier
  const currentTier =
    loyaltyTiers
      .slice()
      .reverse()
      .find((tier) => loyaltyPoints >= tier.minPoints) || loyaltyTiers[0];

  // Determine next tier
  const nextTier = loyaltyTiers.find(
    (tier) => tier.minPoints > currentTier.minPoints
  );

  // Progress to next tier
  const progressToNextTier = nextTier
    ? Math.min(
        ((loyaltyPoints - currentTier.minPoints) /
          (nextTier.minPoints - currentTier.minPoints)) *
          100,
        100
      )
    : 100; // Maxed out

  return (
    <div
      className={`fixed top-0 right-0 h-full z-50 shadow-xl border-l transition-transform duration-300 ease-in-out ${
        theme === "dark"
          ? "bg-gray-900 border-gray-700 text-white"
          : "bg-white border-gray-200 text-gray-800"
      } ${
        open ? "translate-x-0 w-80" : "translate-x-full w-0 overflow-hidden"
      }`}
    >
      {open && (
        <div className="flex flex-col h-full">
          {/* Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              theme === "dark"
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <h2 className="font-bold text-lg">Profile</h2>
            <button
              onClick={onClose}
              className={`${
                theme === "dark"
                  ? "text-gray-400 hover:text-gray-200"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              ❯
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {userProfile ? (
              <>
                {/* Profile Info with Tier Badge */}
                <div
                  className={`p-4 rounded-lg shadow-md ${
                    theme === "dark" ? "bg-gray-800" : "bg-gray-50"
                  } space-y-3`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-amber-500 text-xl">👤</span>
                    <p className="font-semibold text-lg flex items-center">
                      {userProfile.name}
                      <span
                        className={`ml-2 px-2 py-1 rounded text-white text-xs ${currentTier.color}`}
                      >
                        {currentTier.name}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-blue-500 text-lg">📧</span>
                    <p className="text-sm text-gray-400">
                      {userProfile.email}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-green-500 text-lg">📞</span>
                    <p className="text-sm text-gray-400">{userProfile.phone}</p>
                  </div>
                </div>

                {/* Loyalty Progress */}

                <div
                  className={`p-4 rounded-lg ${
                    theme === "dark"
                      ? "bg-amber-900 text-amber-300"
                      : "bg-amber-100 text-amber-800"
                  } space-y-2`}
                >
                  <div className="flex justify-between font-semibold">
                    <span>Loyalty Points: {loyaltyPoints} pts</span>
                    <span>{Math.floor(progressToNextTier)}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                    <div
                      className={`h-full ${currentTier.color}`}
                      style={{ width: `${progressToNextTier}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-200 dark:text-gray-400">
                    {loyaltyPoints} /{" "}
                    {nextTier ? nextTier.minPoints : loyaltyPoints} pts to{" "}
                    {nextTier ? nextTier.name : "Max Tier"}
                  </p>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      document
                        .getElementById("order-history")
                        .scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold"
                  >
                    View Orders
                  </button>

                  <button
                    onClick={() => {
                      document
                        .getElementById("contact")
                        .scrollIntoView({ behavior: "smooth" });
                      onContact && onContact();
                    }}
                    className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold"
                  >
                    Book Table
                  </button>
                </div>

                {/* Referral */}
                <div
                  className={`p-3 rounded-lg font-semibold ${
                    theme === "dark"
                      ? "bg-purple-900 text-purple-300"
                      : "bg-purple-100 text-purple-800"
                  } flex justify-between items-center`}
                >
                  <span>Referral Code: A4531D4</span>
                  <button
                    onClick={onShareReferral}
                    className="bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700 text-xs"
                  >
                    Share
                  </button>
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <p className="text-center text-gray-500">
                No profile info found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
