"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  MapPin,
  Layers,
  DoorOpen,
  Plus,
  Loader2,
  User,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Droplets,
  DollarSign,
  Calendar,
  FileDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { GetHouseByIdAction } from "@/actions/property/PropertyAction";
import { GetRoomsByFloorAction } from "@/actions/room/RoomAction";
import { GetUtilitiesByHouseAction, UpdateUtilityPaymentAction } from "@/actions/utility/UtilityAction";
import { HouseDetailResponse, RoomResponse, UtilityResponse } from "@/types/property";
import { useLanguage } from "@/contexts/language-context";
import { AddFloorDialog } from "@/components/floors/add-floor-dialog";
import { AddRoomDialog } from "@/components/rooms/add-room-dialog";
import { EditRoomDialog } from "@/components/rooms/edit-room-dialog";
import { DeleteRoomDialog } from "@/components/rooms/delete-room-dialog";
import { RoomCard } from "@/components/rooms/room-card";

export default function PropertyDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const houseId = params.id as string;
  const { language, t } = useLanguage();

  const [house, setHouse] = useState<HouseDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  
  // Dialog states
  const [isAddFloorDialogOpen, setIsAddFloorDialogOpen] = useState(false);
  const [isAddRoomDialogOpen, setIsAddRoomDialogOpen] = useState(false);
  const [isEditRoomDialogOpen, setIsEditRoomDialogOpen] = useState(false);
  const [isDeleteRoomDialogOpen, setIsDeleteRoomDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<RoomResponse | null>(null);
  
  // Utility report states
  const [utilities, setUtilities] = useState<UtilityResponse[]>([]);
  const [isLoadingUtilities, setIsLoadingUtilities] = useState(false);
  const [selectedReportMonth, setSelectedReportMonth] = useState<string | null>(null);
  const [isTogglingPayment, setIsTogglingPayment] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [exportLang, setExportLang] = useState<"en" | "kh">(language);

  // Sync export language with global language when it changes
  useEffect(() => {
    setExportLang(language);
  }, [language]);

  const fetchHouseDetail = useCallback(async () => {
    if (!session?.user?.token || !houseId) return;

    setIsLoading(true);
    try {
      const result = await GetHouseByIdAction(houseId, session.user.token);

      if (result.success && result.data) {
        setHouse(result.data);
        // Set first floor as active if available
        if (result.data.floors?.length > 0 && !activeFloorId) {
          setActiveFloorId(result.data.floors[0].floorId);
        }
      } else {
        toast.error("Failed to load property", {
          description: result.error,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch property details",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token, houseId, activeFloorId]);

  const fetchRoomsByFloor = useCallback(async (floorId: string) => {
    if (!session?.user?.token) return;

    setIsLoadingRooms(true);
    try {
      const result = await GetRoomsByFloorAction(floorId, session.user.token);

      if (result.success) {
        setRooms(result.data || []);
      } else {
        toast.error("Failed to load rooms", {
          description: result.error,
        });
        setRooms([]);
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch rooms",
      });
      setRooms([]);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [session?.user?.token]);

  // Fetch all utilities first to get available months
  const fetchAvailableMonths = useCallback(async () => {
    if (!session?.user?.token || !houseId) return;

    try {
      const result = await GetUtilitiesByHouseAction(houseId, session.user.token);
      if (result.success) {
        const utilityData = result.data || [];
        const monthSet = new Set<string>(utilityData.map((u: UtilityResponse) => u.month));
        const months = [...monthSet].sort(
          (a, b) => new Date(b).getTime() - new Date(a).getTime()
        );
        setAvailableMonths(months);
        // Set first month as selected if not set
        if (months.length > 0 && !selectedReportMonth) {
          setSelectedReportMonth(months[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch available months:", error);
    }
  }, [session?.user?.token, houseId, selectedReportMonth]);

  const fetchUtilities = useCallback(async () => {
    if (!session?.user?.token || !houseId) return;

    setIsLoadingUtilities(true);
    try {
      // Call API with month filter if selected
      const result = await GetUtilitiesByHouseAction(
        houseId, 
        session.user.token,
        selectedReportMonth || undefined
      );

      if (result.success) {
        setUtilities(result.data || []);
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
  }, [session?.user?.token, houseId, selectedReportMonth]);

  const handleTogglePayment = async (utilityId: string, currentStatus: boolean) => {
    if (!session?.user?.token) return;
    
    setIsTogglingPayment(utilityId);
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
      setIsTogglingPayment(null);
    }
  };

  const handleExportPdf = async () => {
    if (!session?.user?.token || !selectedReportMonth) {
      toast.error("Please select a month to export");
      return;
    }
    
    setIsExportingPdf(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(
        `${apiUrl}/utility/house/${houseId}/pdf?month=${selectedReportMonth}&lang=${exportLang}`,
        {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${session.user.token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      // Get blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `utility-report-${house?.houseName || houseId}-${selectedReportMonth}-${exportLang}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      toast.error("Failed to export PDF", {
        description: "Please try again later",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  useEffect(() => {
    fetchHouseDetail();
  }, [fetchHouseDetail]);

  useEffect(() => {
    if (activeFloorId) {
      fetchRoomsByFloor(activeFloorId);
    }
  }, [activeFloorId, fetchRoomsByFloor]);

  useEffect(() => {
    if (house) {
      fetchAvailableMonths();
    }
  }, [house, fetchAvailableMonths]);

  useEffect(() => {
    if (house && selectedReportMonth) {
      fetchUtilities();
    }
  }, [house, selectedReportMonth, fetchUtilities]);

  const handleFloorAdded = () => {
    fetchHouseDetail();
  };

  const handleRoomAdded = () => {
    if (activeFloorId) {
      fetchRoomsByFloor(activeFloorId);
    }
    fetchHouseDetail();
  };

  const handleRoomUpdated = () => {
    if (activeFloorId) {
      fetchRoomsByFloor(activeFloorId);
    }
  };

  const handleRoomDeleted = () => {
    if (activeFloorId) {
      fetchRoomsByFloor(activeFloorId);
    }
    fetchHouseDetail();
  };

  const handleEditRoom = (room: RoomResponse) => {
    setSelectedRoom(room);
    setIsEditRoomDialogOpen(true);
  };

  const handleDeleteRoom = (room: RoomResponse) => {
    setSelectedRoom(room);
    setIsDeleteRoomDialogOpen(true);
  };

  const activeFloor = house?.floors?.find((f) => f.floorId === activeFloorId);

  // Utility report helpers
  const totalAmount = utilities.reduce((sum, u) => sum + u.totalCost, 0);
  const paidAmount = utilities.filter((u) => u.isPay).reduce((sum, u) => sum + u.totalCost, 0);
  const unpaidAmount = utilities.filter((u) => !u.isPay).reduce((sum, u) => sum + u.totalCost, 0);
  
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Building2 className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Property not found</h2>
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
          onClick={() => router.back()}
          className="shrink-0"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center gap-4"
          >
            {/* House Image */}
            {house.houseImage ? (
              <img
                src={house.houseImage}
                alt={house.houseName}
                className="w-20 h-20 rounded-xl object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center">
                <Building2 className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold">{house.houseName}</h1>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" />
                {house.houseAddress}
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{house.totalFloors}</p>
              <p className="text-xs text-muted-foreground">Total Floors</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
              <DoorOpen className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{house.totalRooms}</p>
              <p className="text-xs text-muted-foreground">Total Rooms</p>
            </div>
          </div>
        </div>
        <div className="p-4 bg-card rounded-xl border border-border col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {rooms.filter((r) => !r.isAvailable).length}
              </p>
              <p className="text-xs text-muted-foreground">Occupied Rooms</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Floor Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Floors</h2>
          <Button
            size="sm"
            onClick={() => setIsAddFloorDialogOpen(true)}
            className="gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Floor
          </Button>
        </div>

        {house.floors?.length > 0 ? (
          <>
            {/* Floor Tab Bar */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {house.floors.map((floor) => (
                <button
                  key={floor.floorId}
                  onClick={() => setActiveFloorId(floor.floorId)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    activeFloorId === floor.floorId
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:bg-muted"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    {floor.floorName}
                    <span className="px-1.5 py-0.5 rounded-md bg-black/10 text-xs">
                      {floor.totalRooms}
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {/* Rooms Section */}
            <div className="bg-card rounded-xl border border-border p-4 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{activeFloor?.floorName}</h3>
                  <p className="text-sm text-muted-foreground">
                    {activeFloor?.totalRooms || 0} rooms on this floor
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={() => setIsAddRoomDialogOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Room
                </Button>
              </div>

              {/* Rooms Grid */}
              {isLoadingRooms ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  <AnimatePresence mode="popLayout">
                    {rooms.map((room, index) => (
                      <RoomCard
                        key={room.roomId}
                        room={room}
                        index={index}
                        onEdit={handleEditRoom}
                        onDelete={handleDeleteRoom}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <DoorOpen className="w-12 h-12 text-muted-foreground mb-3" />
                  <h3 className="font-medium">No rooms yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add rooms to this floor to start managing
                  </p>
                  <Button
                    size="sm"
                    className="mt-4 gap-1"
                    onClick={() => setIsAddRoomDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add First Room
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border text-center">
            <Layers className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="font-medium">No floors yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add floors to this property to organize rooms
            </p>
            <Button
              size="sm"
              className="mt-4 gap-1"
              onClick={() => setIsAddFloorDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add First Floor
            </Button>
          </div>
        )}
      </motion.div>

      {/* Utility Report Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            Utility Report
          </h2>
          {selectedReportMonth && (
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={exportLang}
                onChange={(e) => setExportLang(e.target.value as "en" | "kh")}
                className="h-9 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="en">🇺🇸 English</option>
                <option value="kh">🇰🇭 ខ្មែរ</option>
              </select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
                className="gap-2"
              >
                {isExportingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                Export PDF
              </Button>
            </div>
          )}
        </div>

        {isLoadingUtilities ? (
          <div className="flex items-center justify-center py-12 bg-card rounded-xl border border-border">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : availableMonths.length > 0 ? (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Month Filter Tabs */}
            <div className="flex gap-2 p-4 border-b border-border overflow-x-auto">
              {availableMonths.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedReportMonth(month)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedReportMonth === month
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {formatMonth(month)}
                </button>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 p-4 border-b border-border bg-muted/30">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                <p className="text-xl font-bold text-foreground">${totalAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Paid</p>
                <p className="text-xl font-bold text-green-600">${paidAmount.toLocaleString()}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Unpaid</p>
                <p className="text-xl font-bold text-amber-600">${unpaidAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Room</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Month</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <span className="flex items-center justify-end gap-1">
                        <Droplets className="w-3 h-3" />
                        Usage
                      </span>
                    </th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Water Cost</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">Room Cost</th>
                    <th className="text-right px-4 py-3 font-medium text-muted-foreground">
                      <span className="flex items-center justify-end gap-1">
                        <DollarSign className="w-3 h-3" />
                        Total
                      </span>
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {utilities.map((utility) => (
                    <tr 
                      key={utility.utilityId} 
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{utility.roomName}</p>
                          <p className="text-xs text-muted-foreground">
                            {utility.oldWater} → {utility.newWater}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatMonth(utility.month)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        {utility.waterUsage}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        ${utility.waterCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">
                        ${utility.roomCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        ${utility.totalCost.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {utility.isPay ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                              <CheckCircle className="w-3 h-3" />
                              Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
                              <XCircle className="w-3 h-3" />
                              Unpaid
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          <Button
                            size="sm"
                            variant={utility.isPay ? "outline" : "default"}
                            onClick={() => handleTogglePayment(utility.utilityId, utility.isPay)}
                            disabled={isTogglingPayment === utility.utilityId}
                            className="h-7 text-xs"
                          >
                            {isTogglingPayment === utility.utilityId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : utility.isPay ? (
                              "Unpay"
                            ) : (
                              "Pay"
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {utilities.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-3" />
                <h3 className="font-medium">No records for this month</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Select a different month or add new utility readings
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-card rounded-xl border border-border text-center">
            <FileSpreadsheet className="w-12 h-12 text-muted-foreground mb-3" />
            <h3 className="font-medium">No utility records</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Utility records will appear here once you add them to rooms
            </p>
          </div>
        )}
      </motion.div>

      {/* Add Floor Dialog */}
      <AddFloorDialog
        isOpen={isAddFloorDialogOpen}
        onClose={() => setIsAddFloorDialogOpen(false)}
        onSuccess={handleFloorAdded}
        houseId={houseId}
      />

      {/* Add Room Dialog */}
      {activeFloor && (
        <AddRoomDialog
          isOpen={isAddRoomDialogOpen}
          onClose={() => setIsAddRoomDialogOpen(false)}
          onSuccess={handleRoomAdded}
          floorId={activeFloor.floorId}
          floorName={activeFloor.floorName}
        />
      )}

      {/* Edit Room Dialog */}
      <EditRoomDialog
        isOpen={isEditRoomDialogOpen}
        onClose={() => {
          setIsEditRoomDialogOpen(false);
          setSelectedRoom(null);
        }}
        onSuccess={handleRoomUpdated}
        room={selectedRoom}
      />

      {/* Delete Room Dialog */}
      <DeleteRoomDialog
        isOpen={isDeleteRoomDialogOpen}
        onClose={() => {
          setIsDeleteRoomDialogOpen(false);
          setSelectedRoom(null);
        }}
        onSuccess={handleRoomDeleted}
        room={selectedRoom}
      />
    </div>
  );
}
