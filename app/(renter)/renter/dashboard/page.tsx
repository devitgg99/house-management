"use client";

import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Home, CreditCard, Wrench, FileText, Calendar, Bell } from "lucide-react";

const quickActions = [
  { label: "Pay Rent", icon: CreditCard, color: "bg-green-500/10 text-green-500" },
  { label: "Request Repair", icon: Wrench, color: "bg-orange-500/10 text-orange-500" },
  { label: "View Lease", icon: FileText, color: "bg-blue-500/10 text-blue-500" },
  { label: "Contact Owner", icon: Bell, color: "bg-purple-500/10 text-purple-500" },
];

export default function RenterDashboard() {
  const { data: session } = useSession();

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold">Renter Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name || "Renter"}
        </p>
      </motion.div>

      {/* Rental Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 bg-card rounded-xl border border-border"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
            <Home className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">Your Rental</h2>
            <p className="text-muted-foreground text-sm mt-1">
              123 Main Street, Apt 4B
            </p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>Lease ends: Dec 31, 2026</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-muted-foreground" />
                <span>$1,200/mo</span>
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
            Active
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="font-medium text-sm">{action.label}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Payment Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 bg-card rounded-xl border border-border"
      >
        <h2 className="text-lg font-semibold mb-4">Payment Status</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">$1,200</p>
            <p className="text-sm text-muted-foreground">Next payment due: Jan 1, 2026</p>
          </div>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
            Pay Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

