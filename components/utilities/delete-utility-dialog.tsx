"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Loader2, AlertTriangle, Droplets, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeleteUtilityAction } from "@/actions/utility/UtilityAction";
import { UtilityResponse } from "@/types/property";

type DeleteUtilityDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  utility: UtilityResponse | null;
};

export function DeleteUtilityDialog({
  isOpen,
  onClose,
  onSuccess,
  utility,
}: DeleteUtilityDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!session?.user?.token || !utility) {
      toast.error("Authentication required");
      return;
    }

    setIsLoading(true);

    try {
      const result = await DeleteUtilityAction(utility.utilityId, session.user.token);

      if (result.success) {
        toast.success("Utility deleted!", {
          description: `Utility record for ${utility.roomName} has been removed`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Failed to delete utility", {
          description: result.error || "Something went wrong",
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to connect to server",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  if (!utility) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="w-full max-w-md bg-card rounded-2xl border border-border shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Delete Utility Record</h2>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-600">Are you sure?</p>
                  <p className="text-muted-foreground mt-1">
                    You are about to delete the utility record for{" "}
                    <span className="font-medium text-foreground">{utility.roomName}</span>.
                    This will permanently remove all associated data.
                  </p>
                </div>
              </div>

              {/* Utility Summary */}
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Month
                  </span>
                  <span className="font-medium">{formatMonth(utility.month)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Droplets className="w-4 h-4" />
                    Water Usage
                  </span>
                  <span className="font-medium">{utility.waterUsage} units</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Total Cost
                  </span>
                  <span className="font-medium">${utility.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Payment Status</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      utility.isPay
                        ? "bg-green-500/10 text-green-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {utility.isPay ? "Paid" : "Unpaid"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
