"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Building2 } from "lucide-react";

export default function AdminPropertiesPage() {
  return (
    <FeaturePlaceholder
      title="Global Properties"
      description="View and moderate all registered houses, buildings, and rooms across the platform."
      icon={Building2}
      backHref="/admin/dashboard"
    />
  );
}
