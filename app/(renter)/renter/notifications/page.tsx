"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Bell } from "lucide-react";

export default function RenterNotificationsPage() {
  return (
    <FeaturePlaceholder
      title="Notifications"
      description="Stay updated with announcements, due dates, and alerts."
      icon={Bell}
      backHref="/renter/dashboard"
    />
  );
}
