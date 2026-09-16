"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { CreditCard } from "lucide-react";

export default function RenterPaymentsPage() {
  return (
    <FeaturePlaceholder
      title="Renter Payments"
      description="View utility bills, make rent payments, and check payment history."
      icon={CreditCard}
      backHref="/renter/dashboard"
    />
  );
}
