"use client";

import { FeaturePlaceholder } from "@/components/common/feature-placeholder";
import { MessageSquare } from "lucide-react";

export default function RenterMessagesPage() {
  return (
    <FeaturePlaceholder
      title="Messages"
      description="Chat with your landlord or building management."
      icon={MessageSquare}
      backHref="/renter/dashboard"
    />
  );
}
