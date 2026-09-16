"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Users } from "lucide-react";

export default function AdminUsersPage() {
  return (
    <FeaturePlaceholder
      title="User Management"
      description="Manage all system users, owners, and renters, assign permissions, and verify accounts."
      icon={Users}
      backHref="/admin/dashboard"
    />
  );
}
