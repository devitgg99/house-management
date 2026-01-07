"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  MapPin,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Building2,
} from "lucide-react";
import { PropertyResponse } from "@/types/property";

type PropertyCardProps = {
  property: PropertyResponse;
  index: number;
  onEdit?: (property: PropertyResponse) => void;
  onDelete?: (property: PropertyResponse) => void;
};

export function PropertyCard({ property, index, onEdit, onDelete }: PropertyCardProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const imageUrl = property.houseImage || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60";

  const handleViewRooms = () => {
    router.push(`/owner/properties/${property.houseId}`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on menu or buttons
    if ((e.target as HTMLElement).closest('[data-no-navigate]')) {
      return;
    }
    handleViewRooms();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onEdit?.(property);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onDelete?.(property);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
      onClick={handleCardClick}
      className="group bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-all hover:shadow-lg cursor-pointer"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={property.houseName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Menu */}
        <div className="absolute top-3 right-3" data-no-navigate>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      handleViewRooms();
                    }}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                  >
                    <Eye className="w-4 h-4" /> View Rooms
                  </button>
                  <button 
                    onClick={handleEdit}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted transition-colors"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button 
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted text-destructive transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Title overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white font-semibold text-lg">{property.houseName}</h3>
          <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            {property.houseAddress}
          </p>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-4">
        {/* Property Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{property.totalRooms} {property.totalRooms === 1 ? 'Room' : 'Rooms'}</p>
            <p className="text-xs text-muted-foreground">
              Rental Property
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-border" data-no-navigate>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleViewRooms();
            }}
            className="flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            View Rooms
          </button>
          <button 
            onClick={handleEdit}
            className="flex-1 py-2 px-3 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            Edit
          </button>
        </div>
      </div>
    </motion.div>
  );
}
