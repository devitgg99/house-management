"use client";

import { motion } from "framer-motion";
import { Building2, DoorOpen, Home, DollarSign } from "lucide-react";

type PropertyStatsProps = {
  totalProperties: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalRevenue: number;
};

export function PropertyStats({
  totalProperties,
  totalRooms,
  occupiedRooms,
  vacantRooms,
  totalRevenue,
}: PropertyStatsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="grid grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div className="p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold">{totalProperties}</p>
            <p className="text-xs text-muted-foreground">Properties</p>
          </div>
        </div>
      </div>
      <div className="p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {occupiedRooms}
              <span className="text-sm text-muted-foreground font-normal">
                /{totalRooms}
              </span>
            </p>
            <p className="text-xs text-muted-foreground">Rooms Occupied</p>
          </div>
        </div>
      </div>
      <div className="p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Home className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">{vacantRooms}</p>
            <p className="text-xs text-muted-foreground">Rooms Vacant</p>
          </div>
        </div>
      </div>
      <div className="p-4 bg-card rounded-xl border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

