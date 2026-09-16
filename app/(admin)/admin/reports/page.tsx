"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { BarChart3 } from "lucide-react";

export default function AdminReportsPage() {
  return (
    <FeaturePlaceholder
      title="Analytics & Reports"
      description="System-wide revenue metrics, occupancy rates, and platform usage analytics."
      icon={BarChart3}
      backHref="/admin/dashboard"
    />
  );
}
