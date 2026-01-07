"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeletePropertyAction } from "@/actions/property/PropertyAction";
import { PropertyResponse } from "@/types/property";

type DeletePropertyDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  property: PropertyResponse | null;
};

export function DeletePropertyDialog({
  isOpen,
  onClose,
  onSuccess,
  property,
}: DeletePropertyDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!session?.user?.token) {
      toast.error("Authentication required", {
        description: "Please login to delete property",
      });
      return;
    }

    if (!property?.houseId) {
      toast.error("Error", {
        description: "Property ID not found",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await DeletePropertyAction(property.houseId, session.user.token);

      if (result.success) {
        toast.success("Property deleted!", {
          description: `${property.houseName} has been deleted`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Failed to delete property", {
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

  return (
    <AnimatePresence>
      {isOpen && property && (
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
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Delete Property</h2>
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-muted-foreground">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  {property.houseName}
                </span>
                ? All rooms and data associated with this property will be
                permanently removed.
              </p>

              {/* Property Preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                {property.houseImage && (
                  <img
                    src={property.houseImage}
                    alt={property.houseName}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{property.houseName}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {property.houseAddress} • {property.totalRooms} {property.totalRooms === 1 ? 'room' : 'rooms'}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 p-6 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
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
                  "Delete Property"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

