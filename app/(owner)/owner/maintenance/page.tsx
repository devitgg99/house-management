"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <FeaturePlaceholder
      title="Maintenance Requests"
      description="Manage maintenance tickets, repair requests from tenants, and schedule work with service providers."
      icon={Wrench}
      backHref="/owner/dashboard"
    />
  );
}
