"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { LucideIcon, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeaturePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  backHref?: string;
  backLabel?: string;
  badge?: string;
}

export function FeaturePlaceholder({
  title,
  description,
  icon: Icon,
  backHref = "/owner/dashboard",
  backLabel = "Back to Dashboard",
  badge = "Coming Soon",
}: FeaturePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full p-8 rounded-2xl bg-card border border-border/80 shadow-lg relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 text-primary shadow-inner">
          <Icon className="w-8 h-8" />
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {badge}
        </div>

        {/* Title & Description */}
        <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          {description}
        </p>

        {/* Action Button */}
        <Link href={backHref} className="inline-block w-full">
          <Button variant="outline" className="w-full gap-2 rounded-xl h-11">
            <ArrowLeft className="w-4 h-4" />
            {backLabel}
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
