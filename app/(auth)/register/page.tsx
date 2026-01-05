"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  // Password strength checks
  const checks = [
    { label: "At least 8 characters", valid: password.length >= 8 },
    { label: "Contains uppercase", valid: /[A-Z]/.test(password) },
    { label: "Contains number", valid: /[0-9]/.test(password) },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Create an account
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground text-sm sm:text-base"
        >
          Start managing your properties in minutes
        </motion.p>
      </div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Work email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password strength indicators */}
          {password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-x-4 gap-y-1 pt-2"
            >
              {checks.map((check, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                      check.valid ? "bg-green-500" : "bg-muted"
                    }`}
                  >
                    {check.valid && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={check.valid ? "text-green-500" : "text-muted-foreground"}>
                    {check.label}
                  </span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-border bg-muted text-accent-blue focus:ring-accent-blue focus:ring-offset-0"
            required
          />
          <label htmlFor="terms" className="text-sm text-muted-foreground">
            I agree to the{" "}
            <Link href="/terms" className="text-foreground hover:text-accent-blue transition-colors">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-foreground hover:text-accent-blue transition-colors">
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-xl font-medium text-base group"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
          ) : (
            <>
              Create account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </motion.form>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground"
      >
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground hover:text-accent-blue transition-colors font-medium"
        >
          Sign in
        </Link>
      </motion.p>
    </div>
  );
}
