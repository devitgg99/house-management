"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { DeleteRoomAction } from "@/actions/room/RoomAction";
import { RoomResponse } from "@/types/property";

type DeleteRoomDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  room: RoomResponse | null;
};

export function DeleteRoomDialog({
  isOpen,
  onClose,
  onSuccess,
  room,
}: DeleteRoomDialogProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!session?.user?.token) {
      toast.error("Authentication required", {
        description: "Please login to delete room",
      });
      return;
    }

    if (!room?.roomId) {
      toast.error("Error", {
        description: "Room ID not found",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await DeleteRoomAction(room.roomId, session.user.token);

      if (result.success) {
        toast.success("Room deleted!", {
          description: `${room.roomName} has been deleted`,
        });
        onSuccess?.();
        onClose();
      } else {
        toast.error("Failed to delete room", {
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
      {isOpen && room && (
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
                  <h2 className="text-lg font-semibold">Delete Room</h2>
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
                  {room.roomName}
                </span>
                ? This will permanently remove the room and all associated data.
              </p>

              {/* Room Preview */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                {room.images?.[0] && room.images[0] !== "string" ? (
                  <img
                    src={room.images[0]}
                    alt={room.roomName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                    <span className="text-lg">🚪</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{room.roomName}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {room.floorName} • {room.isAvailable ? "Available" : "Occupied"}
                  </p>
                </div>
              </div>

              {!room.isAvailable && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-600">
                    ⚠️ This room is currently occupied by {room.renterName}. 
                    Deleting it may affect existing rental agreements.
                  </p>
                </div>
              )}
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
                  "Delete Room"
                )}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

