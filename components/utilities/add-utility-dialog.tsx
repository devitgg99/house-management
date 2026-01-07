"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Droplets, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AddUtilityAction } from "@/actions/utility/UtilityAction";

type AddUtilityDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  roomId: string;
  roomName: string;
  lastReading?: number;
};

export function AddUtilityDialog({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  roomName,
  lastReading = 0,
}: AddUtilityDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    oldWater: lastReading.toString(),
    newWater: "",
    month: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.token) {
      toast.error("Authentication required", {
        description: "Please login to add utility reading",
      });
      return;
    }

    const oldWater = parseFloat(formData.oldWater) || 0;
    const newWater = parseFloat(formData.newWater) || 0;

    if (newWater < oldWater) {
      toast.error("Validation error", {
        description: "New water reading cannot be less than old reading",
      });
      return;
    }

    if (!formData.month) {
      toast.error("Validation error", {
        description: "Please select a month",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await AddUtilityAction(
        {
          roomId,
          oldWater,
          newWater,
          month: formData.month,
        },
        session.user.token
      );

      if (result.success) {
        toast.success("Utility recorded!", {
          description: `Water usage: ${newWater - oldWater} units`,
        });
        setFormData({
          oldWater: newWater.toString(),
          newWater: "",
          month: new Date().toISOString().split("T")[0],
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Failed to add utility", {
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
      setFormData({
        oldWater: lastReading.toString(),
        newWater: "",
        month: new Date().toISOString().split("T")[0],
      });
      onClose();
    }
  };

  const waterUsage = Math.max(0, (parseFloat(formData.newWater) || 0) - (parseFloat(formData.oldWater) || 0));

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
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Add Utility Reading</h2>
                  <p className="text-sm text-muted-foreground">{roomName}</p>
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Month */}
              <div className="space-y-2">
                <Label htmlFor="month">Month *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="month"
                    type="date"
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {/* Old Water Reading */}
              <div className="space-y-2">
                <Label htmlFor="oldWater">Previous Reading *</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="oldWater"
                    type="number"
                    value={formData.oldWater}
                    onChange={(e) =>
                      setFormData({ ...formData, oldWater: e.target.value })
                    }
                    placeholder="0"
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {/* New Water Reading */}
              <div className="space-y-2">
                <Label htmlFor="newWater">Current Reading *</Label>
                <div className="relative">
                  <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                  <Input
                    id="newWater"
                    type="number"
                    value={formData.newWater}
                    onChange={(e) =>
                      setFormData({ ...formData, newWater: e.target.value })
                    }
                    placeholder="0"
                    disabled={isLoading}
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              {/* Water Usage Preview */}
              {formData.newWater && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Water Usage</span>
                    <span className="text-lg font-bold text-blue-600">
                      {waterUsage} units
                    </span>
                  </div>
                </div>
              )}

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
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 h-11 rounded-xl"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Reading"
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

