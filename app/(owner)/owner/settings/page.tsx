"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <FeaturePlaceholder
      title="Owner Settings"
      description="Manage your account profile, notification preferences, billing information, and security."
      icon={Settings}
      backHref="/owner/dashboard"
    />
  );
}
