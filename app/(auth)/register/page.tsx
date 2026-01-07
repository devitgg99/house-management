"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check, Home, Key } from "lucide-react";
import { registerAction } from "@/actions/auth/registerAction";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate role is selected
    if (!formData.role) {
      toast.error("Please select a role", {
        description: "Choose whether you are a Renter or House Owner",
      });
      setIsLoading(false);
      return;
    }

    try {
      // Prepend +855 to phone number
      const requestData = {
        ...formData,
        phoneNumber: `+855${formData.phoneNumber.replace(/^0+/, "")}`,
      };

      const res = await registerAction(requestData);

      if (res.success) {
        toast.success("Account created successfully!", {
          description: "Redirecting to login...",
        });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        // Show appropriate error message
        toast.error(res.error || "Registration failed", {
          description: getErrorDescription(res.error),
        });
      }
    } catch {
      toast.error("Something went wrong", {
        description: "Please check your connection and try again",
      });
    }
    setIsLoading(false);
  };

  // Get user-friendly error description
  const getErrorDescription = (error?: string): string => {
    if (!error) return "Please try again";
    const lowerError = error.toLowerCase();
    if (lowerError.includes("email already exists")) {
      return "This email is already registered. Try logging in instead.";
    }
    if (lowerError.includes("phone")) {
      return "This phone number is already in use.";
    }
    if (lowerError.includes("password")) {
      return "Please use a stronger password.";
    }
    return "Please check your information and try again.";
  };

  // Password strength checks
  const checks = [
    { label: "At least 8 characters", valid: formData.password.length >= 8 },
    { label: "Contains uppercase", valid: /[A-Z]/.test(formData.password) },
    { label: "Contains number", valid: /[0-9]/.test(formData.password) },
  ];

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
            {/* Cambodia prefix */}
            <div className="flex items-center gap-1.5 h-12 px-3 rounded-l-xl bg-muted border border-r-0 border-border text-muted-foreground">
              <span className="text-base">🇰🇭</span>
              <span className="text-sm font-medium">+855</span>
            </div>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="12 345 678"
              className="flex-1 h-12 px-4 rounded-r-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
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
          <label htmlFor="role" className="text-sm font-medium">
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