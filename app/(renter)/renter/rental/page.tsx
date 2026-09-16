"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Home } from "lucide-react";

export default function RenterRentalPage() {
  return (
    <FeaturePlaceholder
      title="My Rental Details"
      description="View your room details, lease terms, and property amenities."
      icon={Home}
      backHref="/renter/dashboard"
    />
  );
}
