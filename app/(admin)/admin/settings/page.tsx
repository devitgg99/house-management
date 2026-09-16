"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { UserCog } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <FeaturePlaceholder
      title="System Settings"
      description="Configure global application settings, API integrations, and system health controls."
      icon={UserCog}
      backHref="/admin/dashboard"
    />
  );
}
