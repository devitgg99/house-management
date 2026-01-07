"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Search,
  Loader2,
  UserPlus,
  UserMinus,
  Phone,
  Mail,
  Check,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  GetAllRentersAction,
  FollowUserAction,
  UnfollowUserAction,
  AssignRenterToRoomAction,
} from "@/actions/user/UserAction";
import { UserResponse } from "@/types/property";

type AssignRenterDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  roomId: string;
  roomName: string;
};

export function AssignRenterDialog({
  isOpen,
  onClose,
  onSuccess,
  roomId,
  roomName,
}: AssignRenterDialogProps) {
  const { data: session } = useSession();
  const [renters, setRenters] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRenter, setSelectedRenter] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  const fetchRenters = useCallback(async () => {
    if (!session?.user?.token) return;

    setIsLoading(true);
    try {
      const result = await GetAllRentersAction(session.user.token);

      if (result.success) {
        setRenters(result.data || []);
      } else {
        toast.error("Failed to load renters", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch renters",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token]);

  useEffect(() => {
    if (isOpen) {
      fetchRenters();
      setSelectedRenter(null);
      setSearchQuery("");
    }
  }, [isOpen, fetchRenters]);

  const handleFollow = async (userId: string, currentlyFollowing: boolean) => {
    if (!session?.user?.token) return;

    setLoadingFollow(userId);
    try {
      const result = currentlyFollowing
        ? await UnfollowUserAction(userId, session.user.token)
        : await FollowUserAction(userId, session.user.token);

      if (result.success) {
        toast.success(currentlyFollowing ? "Unfollowed" : "Following");
        fetchRenters();
      } else {
        toast.error("Action failed", { description: result.error });
      }
    } catch (error) {
      toast.error("Error", { description: "Failed to update follow status" });
    } finally {
      setLoadingFollow(null);
    }
  };

  const handleAssign = async () => {
    if (!session?.user?.token || !selectedRenter) return;

    setIsAssigning(true);
    try {
      const result = await AssignRenterToRoomAction(
        roomId,
        selectedRenter,
        session.user.token
      );

      if (result.success) {
        toast.success("Renter assigned successfully");
        onSuccess();
        onClose();
      } else {
        toast.error("Failed to assign renter", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to assign renter",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  // Filter renters by search
  const filteredRenters = renters.filter((renter) => {
    return (
      renter.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renter.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      renter.phoneNumber.includes(searchQuery)
    );
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (userId: string) => {
    const gradients = [
      "from-pink-500 to-rose-500",
      "from-violet-500 to-purple-500",
      "from-blue-500 to-cyan-500",
      "from-emerald-500 to-teal-500",
      "from-orange-500 to-amber-500",
      "from-indigo-500 to-blue-500",
    ];
    const index = userId.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl max-h-[85vh] bg-card rounded-2xl shadow-2xl border border-border overflow-hidden mx-4"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold">Assign Renter</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select a renter for <span className="font-medium">{roomName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Renters List */}
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRenters.length > 0 ? (
            <div className="space-y-2">
              <AnimatePresence>
                {filteredRenters.map((renter, index) => (
                  <motion.div
                    key={renter.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={() => setSelectedRenter(renter.userId)}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedRenter === renter.userId
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30 hover:bg-muted/50"
                    }`}
                  >
                    {/* Selected Checkmark */}
                    {selectedRenter === renter.userId && (
                      <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      {/* Avatar */}
                      {renter.profileImage ? (
                        <img
                          src={renter.profileImage}
                          alt={renter.fullName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${getAvatarGradient(
                            renter.userId
                          )} flex items-center justify-center`}
                        >
                          <span className="text-sm font-bold text-white">
                            {getInitials(renter.fullName)}
                          </span>
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{renter.fullName}</h3>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            {renter.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5" />
                            {renter.phoneNumber}
                          </span>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <Button
                        size="sm"
                        variant={renter.isFollowing ? "outline" : "secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(renter.userId, renter.isFollowing);
                        }}
                        disabled={loadingFollow === renter.userId}
                        className="shrink-0 gap-1"
                      >
                        {loadingFollow === renter.userId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : renter.isFollowing ? (
                          <>
                            <UserMinus className="w-3 h-3" />
                            <span className="hidden sm:inline">Unfollow</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3 h-3" />
                            <span className="hidden sm:inline">Follow</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium">No renters found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {searchQuery
                  ? "Try adjusting your search"
                  : "No renters available to assign"}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/30">
          <p className="text-sm text-muted-foreground">
            {selectedRenter ? (
              <>
                Selected:{" "}
                <span className="font-medium text-foreground">
                  {renters.find((r) => r.userId === selectedRenter)?.fullName}
                </span>
              </>
            ) : (
              "Select a renter to assign"
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={!selectedRenter || isAssigning}
              className="gap-2"
            >
              {isAssigning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              Assign Renter
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

