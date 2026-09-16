"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { FileText } from "lucide-react";

export default function RenterDocumentsPage() {
  return (
    <FeaturePlaceholder
      title="Renter Documents"
      description="Access your lease agreements, house rules, and receipts."
      icon={FileText}
      backHref="/renter/dashboard"
    />
  );
}
