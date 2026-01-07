"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Building2, Eye, Edit, MoreVertical, Trash2 } from "lucide-react";
import { PropertyResponse } from "@/types/property";

type PropertyListItemProps = {
  property: PropertyResponse;
  index: number;
  onEdit?: (property: PropertyResponse) => void;
  onDelete?: (property: PropertyResponse) => void;
};

export function PropertyListItem({ property, index, onEdit, onDelete }: PropertyListItemProps) {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const imageUrl = property.houseImage || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60";

  const handleViewRooms = () => {
    router.push(`/owner/properties/${property.houseId}`);
  };

  const handleEdit = () => {
    setShowMenu(false);
    onEdit?.(property);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.(property);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      className="bg-card rounded-xl border border-border p-4 hover:border-primary/50 transition-all"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Image */}
        <div className="w-full sm:w-40 h-32 sm:h-28 rounded-lg overflow-hidden flex-shrink-0 relative">
          <img
            src={imageUrl}
            alt={property.houseName}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=60";
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg">{property.houseName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" />
                {property.houseAddress}
              </p>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-10">
                  <button 
                  onClick={handleViewRooms}
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
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Building2 className="w-4 h-4" />
              <span>{property.totalRooms} {property.totalRooms === 1 ? 'Room' : 'Rooms'}</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Rental Property
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <button 
              onClick={handleViewRooms}
              className="py-1.5 px-3 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              View Rooms
            </button>
            <button 
              onClick={handleEdit}
              className="py-1.5 px-3 text-sm font-medium rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
