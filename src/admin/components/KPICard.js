import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../../ui/card";

export default function KPICard({ title, value, icon, color = "emerald", onClick }) {
    const gradientClasses = {
      blue: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700",
      purple: "bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700",
      green: "bg-gradient-to-br from-green-50 to-green-100 text-green-700",
      orange: "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-700",
      pink: "bg-gradient-to-br from-pink-50 to-pink-100 text-pink-700",
      indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-700",
    };
  
    return (
      <motion.button
        whileHover={{ scale: onClick ? 1.02 : 1 }}
        whileTap={{ scale: onClick ? 0.98 : 1 }}
        onClick={onClick}
        className="text-left w-full"
      >
        <Card
          className={`h-full rounded-2xl shadow-md hover:shadow-lg transition ${gradientClasses[color]}`}
        >
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <div className="text-sm opacity-80">{title}</div>
              <div className="text-3xl font-bold mt-1">{value}</div>
            </div>
            {icon && (
              <div className="p-3 rounded-full bg-white/70 shadow">{icon}</div>
            )}
          </CardContent>
        </Card>
      </motion.button>
    );
  }