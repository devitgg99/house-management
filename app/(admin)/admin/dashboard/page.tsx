"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Users, Building2, CreditCard, BarChart3, TrendingUp, TrendingDown } from "lucide-react";

const stats = [
  { label: "Total Users", value: "2,847", change: "+12.5%", trend: "up", icon: Users },
  { label: "Properties", value: "1,234", change: "+8.2%", trend: "up", icon: Building2 },
  { label: "Revenue", value: "$847K", change: "+23.1%", trend: "up", icon: CreditCard },
  { label: "Active Rentals", value: "956", change: "-2.4%", trend: "down", icon: BarChart3 },
];

export default function AdminDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name || "Admin"}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-card rounded-xl border border-border"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.trend === "up" ? "text-green-500" : "text-red-500"
                }`}>
                  {stat.trend === "up" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {stat.change}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-6 bg-card rounded-xl border border-border"
      >
        <h2 className="text-lg font-semibold mb-4">System Overview</h2>
        <p className="text-muted-foreground">
          Manage users, properties, and system settings from the admin panel.
        </p>
      </motion.div>
    </div>
  );
}

