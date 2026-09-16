"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <FeaturePlaceholder
      title="Messages & Communication"
      description="Direct messaging and announcements with your tenants and property managers."
      icon={MessageSquare}
      backHref="/owner/dashboard"
    />
  );
}
