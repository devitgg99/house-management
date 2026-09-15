"use client";

import { useEffect } from "react";
import { browserLogger } from "@/lib/logger";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    browserLogger.error("AppErrorBoundary", error.message || "An unexpected error occurred in the application", {
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-destructive" />
      </div>
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-md">
          {error.message || "An unexpected error occurred. Details have been logged to the browser console."}
        </p>
      </div>
      <Button onClick={reset} variant="outline" className="gap-2">
        <RotateCcw className="w-4 h-4" />
        Try Again
      </Button>
    </div>
  );
}
