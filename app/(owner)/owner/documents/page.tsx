"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { FileText } from "lucide-react";

export default function DocumentsPage() {
  return (
    <FeaturePlaceholder
      title="Documents & Leases"
      description="Store, view, and share lease agreements, tenant contracts, and legal documents securely."
      icon={FileText}
      backHref="/owner/dashboard"
    />
  );
}
