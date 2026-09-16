"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Wrench } from "lucide-react";

export default function RenterMaintenancePage() {
  return (
    <FeaturePlaceholder
      title="Maintenance Requests"
      description="Submit repair requests to your landlord and track their status."
      icon={Wrench}
      backHref="/renter/dashboard"
    />
  );
}
