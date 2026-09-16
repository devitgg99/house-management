"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Settings } from "lucide-react";

export default function RenterSettingsPage() {
  return (
    <FeaturePlaceholder
      title="Renter Settings"
      description="Update your personal profile, notification settings, and password."
      icon={Settings}
      backHref="/renter/dashboard"
    />
  );
}
