"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  DoorOpen,
  Building2,
  Layers,
  User,
  Loader2,
  Edit,
  Trash2,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Droplets,
  Plus,
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GetRoomByIdAction } from "@/actions/room/RoomAction";
import { GetUtilitiesByRoomAction, UpdateUtilityPaymentAction } from "@/actions/utility/UtilityAction";
import { RoomResponse, UtilityResponse } from "@/types/property";
import { EditRoomDialog } from "@/components/rooms/edit-room-dialog";
import { DeleteRoomDialog } from "@/components/rooms/delete-room-dialog";
import { AddUtilityDialog } from "@/components/utilities/add-utility-dialog";
import { AssignRenterDialog } from "@/components/rooms/assign-renter-dialog";

export default function RoomDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const houseId = params.id as string;
  const roomId = params.roomId as string;

  const [room, setRoom] = useState<RoomResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddUtilityDialogOpen, setIsAddUtilityDialogOpen] = useState(false);
  const [isAssignRenterDialogOpen, setIsAssignRenterDialogOpen] = useState(false);
  
  // Utilities state
  const [utilities, setUtilities] = useState<UtilityResponse[]>([]);
  const [isLoadingUtilities, setIsLoadingUtilities] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [isTogglingPayment, setIsTogglingPayment] = useState(false);

  const fetchRoomDetail = useCallback(async () => {
    if (!session?.user?.token || !roomId) return;

    setIsLoading(true);
    try {
      const result = await GetRoomByIdAction(roomId, session.user.token);

      if (result.success && result.data) {
        setRoom(result.data);
      } else {
        toast.error("Failed to load room", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch room details",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, roomId]);

  const fetchUtilities = useCallback(async () => {
    if (!session?.user?.token || !roomId) return;

    setIsLoadingUtilities(true);
    try {
      const result = await GetUtilitiesByRoomAction(roomId, session.user.token);

      if (result.success) {
        const utilityData = result.data || [];
        setUtilities(utilityData);
        // Select the most recent month by default
        if (utilityData.length > 0 && !selectedMonth) {
          setSelectedMonth(utilityData[0].month);
        }
      } else {
        toast.error("Failed to load utilities", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch utilities",
      });
    } finally {
      setIsLoadingUtilities(false);
    }
  }, [session?.user?.token, roomId, selectedMonth]);

  useEffect(() => {
    fetchRoomDetail();
  }, [fetchRoomDetail]);

  useEffect(() => {
    if (room) {
      fetchUtilities();
    }
  }, [room, fetchUtilities]);

  const handleRoomUpdated = () => {
    fetchRoomDetail();
  };

  const handleRoomDeleted = () => {
    router.push(`/owner/properties/${houseId}`);
  };

  const handleUtilityAdded = () => {
    fetchUtilities();
  };

  const handleTogglePayment = async (utilityId: string, currentStatus: boolean) => {
    if (!session?.user?.token) return;
    
    setIsTogglingPayment(true);
    try {
      const result = await UpdateUtilityPaymentAction(utilityId, !currentStatus, session.user.token);
      
      if (result.success) {
        toast.success(currentStatus ? "Marked as unpaid" : "Marked as paid");
        fetchUtilities();
      } else {
        toast.error("Failed to update", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to update payment status",
      });
    } finally {
      setIsTogglingPayment(false);
    }
  };

  const validImages = room?.images?.filter((img) => img && img !== "string") || [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? validImages.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === validImages.length - 1 ? 0 : prev + 1
    );
  };

  // Get unique months from utilities
  const uniqueMonths = [...new Set(utilities.map((u) => u.month))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  // Get selected utility
  const selectedUtility = utilities.find((u) => u.month === selectedMonth);

  // Get last water reading for new utility form
  const lastWaterReading = utilities.length > 0 ? utilities[0].newWater : 0;

  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading room details...</p>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <DoorOpen className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Room not found</h2>
        <Button onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/owner/properties/${houseId}`)}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">{room.roomName}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {room.houseName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Layers className="w-4 h-4" />
                  {room.floorName}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Main Image */}
            <div className="relative aspect-video bg-muted">
              {validImages.length > 0 ? (
                <>
                  <img
                    src={validImages[currentImageIndex]}
                    alt={`${room.roomName} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {validImages.length > 1 && (
                    <>
                      <button
                        onClick={handlePrevImage}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/50 text-white text-sm">
                        {currentImageIndex + 1} / {validImages.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
                  <p className="text-muted-foreground mt-2">No images</p>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {validImages.length > 1 && (
              <div className="p-3 border-t border-border">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {validImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        index === currentImageIndex
                          ? "border-primary"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Room Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Price Card */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  ${room.price?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-muted-foreground">per month</p>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div
            className={`p-4 rounded-xl border ${
              room.isAvailable
                ? "bg-green-500/10 border-green-500/20"
                : "bg-amber-500/10 border-amber-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  room.isAvailable ? "bg-green-500/20" : "bg-amber-500/20"
                }`}
              >
                <DoorOpen
                  className={`w-6 h-6 ${
                    room.isAvailable ? "text-green-600" : "text-amber-600"
                  }`}
                />
              </div>
              <div className="flex-1">
                <p
                  className={`font-semibold ${
                    room.isAvailable ? "text-green-600" : "text-amber-600"
                  }`}
                >
                  {room.isAvailable ? "Available" : "Occupied"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {room.isAvailable
                    ? "Ready for new tenant"
                    : "Currently rented"}
                </p>
              </div>
            </div>
            {/* Assign Renter Button - only show when available */}
            {room.isAvailable && (
              <Button
                className="w-full mt-4 gap-2"
                onClick={() => setIsAssignRenterDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Assign Renter
              </Button>
            )}
          </div>

          {/* Tenant Info (if occupied) */}
          {!room.isAvailable && room.renterName && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <h3 className="font-semibold mb-3">Current Tenant</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{room.renterName}</p>
                  <p className="text-sm text-muted-foreground">Renter</p>
                </div>
              </div>
            </div>
          )}

          {/* Room Details */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-3">Room Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Room ID</span>
                <span className="font-mono text-sm">
                  {room.roomId.slice(0, 8)}...
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Floor</span>
                <span>{room.floorName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Floor Number</span>
                <span>{room.floorNumber}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-muted-foreground">Images</span>
                <span>{validImages.length}</span>
              </div>
            </div>
          </div>

          {/* Property Info */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <h3 className="font-semibold mb-3">Property</h3>
            <button
              onClick={() => router.push(`/owner/properties/${houseId}`)}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium">{room.houseName}</p>
                <p className="text-sm text-muted-foreground">View property</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Utilities Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            Utility Bills
          </h2>
          <Button
            size="sm"
            onClick={() => setIsAddUtilityDialogOpen(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Reading
          </Button>
        </div>

        {isLoadingUtilities ? (
          <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : utilities.length > 0 ? (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Month Tabs */}
            <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
              {uniqueMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedMonth === month
                      ? "bg-blue-500 text-white"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {formatMonth(month)}
                </button>
              ))}
            </div>

            {/* Selected Month Details */}
            {selectedUtility && (
              <div className="p-4 lg:p-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {/* Water Usage */}
                  <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-muted-foreground">Water Usage</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedUtility.waterUsage}
                    </p>
                    <p className="text-xs text-muted-foreground">units</p>
                  </div>

                  {/* Water Cost */}
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-cyan-500" />
                      <span className="text-sm text-muted-foreground">Water Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-cyan-600">
                      ${selectedUtility.waterCost.toLocaleString()}
                    </p>
                  </div>

                  {/* Room Cost */}
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DoorOpen className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-muted-foreground">Room Cost</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      ${selectedUtility.roomCost.toLocaleString()}
                    </p>
                  </div>

                  {/* Total Cost */}
                  <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Total</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedUtility.totalCost.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Details Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Previous Reading</span>
                    <span className="font-medium">{selectedUtility.oldWater}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Current Reading</span>
                    <span className="font-medium">{selectedUtility.newWater}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-muted-foreground">Month</span>
                    <span className="font-medium">{formatMonth(selectedUtility.month)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Payment Status</span>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          selectedUtility.isPay ? "text-green-600" : "text-amber-600"
                        }`}
                      >
                        {selectedUtility.isPay ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Paid
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            Unpaid
                          </>
                        )}
                      </span>
                      <Button
                        size="sm"
                        variant={selectedUtility.isPay ? "outline" : "default"}
                        onClick={() => handleTogglePayment(selectedUtility.utilityId, selectedUtility.isPay)}
                        disabled={isTogglingPayment}
                        className="h-8 text-xs"
                      >
                        {isTogglingPayment ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : selectedUtility.isPay ? (
                          "Mark Unpaid"
                        ) : (
                          "Mark Paid"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border text-center">
            <Droplets className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="font-medium">No utility records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add water meter readings to track utility bills
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1"
              onClick={() => setIsAddUtilityDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add First Reading
            </Button>
          </div>
        )}
      </motion.div>

      {/* Edit Room Dialog */}
      <EditRoomDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={handleRoomUpdated}
        room={room}
      />

      {/* Delete Room Dialog */}
      <DeleteRoomDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onSuccess={handleRoomDeleted}
        room={room}
      />

      {/* Add Utility Dialog */}
      <AddUtilityDialog
        isOpen={isAddUtilityDialogOpen}
        onClose={() => setIsAddUtilityDialogOpen(false)}
        onSuccess={handleUtilityAdded}
        roomId={roomId}
        roomName={room.roomName}
        lastReading={lastWaterReading}
      />

      {/* Assign Renter Dialog */}
      <AssignRenterDialog
        isOpen={isAssignRenterDialogOpen}
        onClose={() => setIsAssignRenterDialogOpen(false)}
        onSuccess={handleRoomUpdated}
        roomId={roomId}
        roomName={room.roomName}
      />
    </div>
  );
}
