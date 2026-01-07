"use client";

import { motion } from "framer-motion";
import { Search, Filter, Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ViewMode } from "@/types/property";

type PropertyFiltersProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

export function PropertyFilters({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
}: PropertyFiltersProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-9 pr-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="icon" className="h-10 w-10">
          <Filter className="w-4 h-4" />
        </Button>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => onViewModeChange("grid")}
            className={`px-3 h-10 flex items-center justify-center transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange("list")}
            className={`px-3 h-10 flex items-center justify-center transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

