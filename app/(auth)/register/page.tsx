"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Home, Key, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "RENTER" as "RENTER" | "HOUSEOWNER",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Prepare request body matching API structure
    const requestBody = {
      fullName: formData.fullName,
      phoneNumber: `+855${formData.phoneNumber.replace(/\s/g, '')}`,
      password: formData.password,
      email: formData.email,
      role: formData.role,
    };

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle API error response
        throw new Error(data.message || "Registration failed. Please try again.");
      }

      // Success
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Password strength checks
  const checks = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "Contains uppercase", valid: /[A-Z]/.test(formData.password) },
    { label: "Contains number", valid: /[0-9]/.test(formData.password) },
  ];

  // Success state
  if (success) {
    return (
      <div className="space-y-6 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-16 h-16 mx-auto rounded-full bg-green-500/10 flex items-center justify-center"
        >
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-2"
        >
          <h2 className="text-2xl font-bold">Account created!</h2>
          <p className="text-muted-foreground">
            Redirecting you to login...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-4"
      >
        {/* Full Name */}
        <div className="space-y-2">
          <label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="fullName"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone number
          </label>
          <div className="flex">
            <div className="flex items-center gap-1.5 px-3 h-12 rounded-l-xl bg-muted/80 border border-r-0 border-border text-muted-foreground text-sm font-medium">
              <span className="text-base">🇰🇭</span>
              <span>+855</span>
            </div>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="12 345 678"
              className="flex-1 h-12 pl-3 pr-4 rounded-r-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
              disabled={isLoading}
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
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Password strength indicators */}
          {formData.password && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex flex-wrap gap-x-4 gap-y-1 pt-2"
            >
              {checks.map((check, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center transition-colors ${
                      check.valid ? "bg-green-500" : "bg-muted-foreground/30"
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

        {/* Role */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: "RENTER" }))}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl border transition-all ${
                formData.role === "RENTER"
                  ? "bg-accent-blue/10 border-accent-blue text-accent-blue"
                  : "bg-muted border-border text-muted-foreground hover:border-foreground/30"
              }`}
              disabled={isLoading}
            >
              <Key className="w-4 h-4" />
              <span className="font-medium">Renter</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, role: "HOUSEOWNER" }))}
              className={`flex items-center justify-center gap-2 h-12 rounded-xl border transition-all ${
                formData.role === "HOUSEOWNER"
                  ? "bg-accent-blue/10 border-accent-blue text-accent-blue"
                  : "bg-muted border-border text-muted-foreground hover:border-foreground/30"
              }`}
              disabled={isLoading}
            >
              <Home className="w-4 h-4" />
              <span className="font-medium">House Owner</span>
            </button>
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <input
            id="terms"
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border-border bg-muted text-accent-blue focus:ring-accent-blue focus:ring-offset-0"
            required
            disabled={isLoading}
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
        transition={{ delay: 0.3 }}
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
