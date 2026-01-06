"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/router";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard"); // redirect after login
    }
    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-2xl sm:text-3xl font-bold tracking-tight"
        >
          Welcome back
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-muted-foreground text-sm sm:text-base"
        >
          Enter your credentials to access your account
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
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="w-full h-12 pl-12 pr-4 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
              value={email}
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-accent-blue hover:text-accent-blue/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full h-12 pl-12 pr-12 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-accent-blue focus:ring-1 focus:ring-accent-blue transition-all"
              required
              value={password}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center gap-2">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded border-border bg-muted text-accent-blue focus:ring-accent-blue focus:ring-offset-0"
          />
          <label htmlFor="remember" className="text-sm text-muted-foreground">
            Remember me for 30 days
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
              Sign in
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
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-foreground hover:text-accent-blue transition-colors font-medium"
        >
          Sign up for free
        </Link>
      </motion.p>
    </div>
  );
}
