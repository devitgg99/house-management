"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { Shield } from "lucide-react";

export default function AdminRolesPage() {
  return (
    <FeaturePlaceholder
      title="Roles & Permissions"
      description="Configure role access levels, RBAC security policies, and administrative rights."
      icon={Shield}
      backHref="/admin/dashboard"
    />
  );
}
