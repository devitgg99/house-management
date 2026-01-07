"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MoreVertical, Edit, Trash2, User, ImageIcon, DollarSign } from "lucide-react";
import { RoomResponse } from "@/types/property";

type RoomCardProps = {
  room: RoomResponse;
  index: number;
  onEdit?: (room: RoomResponse) => void;
  onDelete?: (room: RoomResponse) => void;
};

export function RoomCard({ room, index, onEdit, onDelete }: RoomCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const handleViewRoom = () => {
    router.push(`/owner/properties/${room.houseId}/rooms/${room.roomId}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on menu
    if ((e.target as HTMLElement).closest('[data-no-navigate]')) {
      return;
    }
    handleViewRoom();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(room);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(room);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.05 }}
      onClick={handleCardClick}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer ${
        room.isAvailable
          ? "bg-green-500/5 border-green-500/20 hover:border-green-500/40"
          : "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40"
      }`}
    >
      {/* Room Image or Placeholder */}
      <div className="relative w-full h-24 rounded-lg overflow-hidden mb-3 bg-muted">
        {room.images?.[0] && room.images[0] !== "string" ? (
          <img
            src={room.images[0]}
            alt={room.roomName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium">{room.roomName}</h4>
          <p className="text-sm font-semibold text-primary mt-1">
            ${room.price?.toLocaleString() || 0}/mo
          </p>
          <p
            className={`text-xs font-medium mt-1 ${
              room.isAvailable ? "text-green-600" : "text-amber-600"
            }`}
          >
            {room.isAvailable ? "Available" : "Occupied"}
          </p>
          {room.renterName && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <User className="w-3 h-3" />
              {room.renterName}
            </p>
          )}
        </div>

        {/* Menu */}
        <div className="relative" data-no-navigate>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>

          {showMenu && (
            <>
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              {/* Menu dropdown */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                <button
                  onClick={handleEdit}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
