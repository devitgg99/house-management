"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { CreditCard } from "lucide-react";

export default function PaymentsPage() {
  return (
    <FeaturePlaceholder
      title="Payments & Invoicing"
      description="Track monthly rent collection, generate payment receipts, and manage utility billing history."
      icon={CreditCard}
      backHref="/owner/dashboard"
    />
  );
}
