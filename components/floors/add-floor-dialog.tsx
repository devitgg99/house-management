"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AddFloorAction } from "@/actions/floor/FloorAction";

type AddFloorDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  houseId: string;
};

export function AddFloorDialog({
  isOpen,
  onClose,
  onSuccess,
  houseId,
}: AddFloorDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    floorNumber: 1,
    floorName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user?.token) {
      toast.error("Authentication required", {
        description: "Please login to add a floor",
      });
      return;
    }

    if (!formData.floorName.trim()) {
      toast.error("Validation error", {
        description: "Please enter a floor name",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await AddFloorAction(
        {
          floorNumber: formData.floorNumber,
          floorName: formData.floorName.trim(),
          houseId,
        },
        session.user.token
      );

      if (result.success) {
        toast.success("Floor added!", {
          description: `${formData.floorName} has been added`,
        });
        setFormData({ floorNumber: 1, floorName: "" });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Failed to add floor", {
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
      setFormData({ floorNumber: 1, floorName: "" });
      onClose();
    }
  };

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
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Add Floor</h2>
                  <p className="text-sm text-muted-foreground">
                    Add a new floor to this property
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="floorNumber">Floor Number *</Label>
                <Input
                  id="floorNumber"
                  type="number"
                  min="1"
                  value={formData.floorNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, floorNumber: parseInt(e.target.value) || 1 })
                  }
                  placeholder="1"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorName">Floor Name *</Label>
                <Input
                  id="floorName"
                  type="text"
                  value={formData.floorName}
                  onChange={(e) =>
                    setFormData({ ...formData, floorName: e.target.value })
                  }
                  placeholder="e.g. Ground Floor, 1st Floor"
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4">
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
                      Adding...
                    </>
                  ) : (
                    "Add Floor"
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

