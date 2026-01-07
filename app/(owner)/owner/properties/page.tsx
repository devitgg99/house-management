"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PropertyCard,
  PropertyListItem,
  PropertyStats,
  PropertyFilters,
  PropertyEmpty,
  AddPropertyDialog,
  EditPropertyDialog,
  DeletePropertyDialog,
} from "@/components/properties";
import { GetPropertiesAction } from "@/actions/property/PropertyAction";
import { PropertyResponse, ViewMode } from "@/types/property";
import { toast } from "sonner";

export default function PropertiesPage() {
  const { data: session } = useSession();
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = useCallback(async () => {
    if (!session?.user?.token) return;

    setIsLoading(true);
    try {
      const result = await GetPropertiesAction(session.user.token);
      
      if (result.success) {
        setProperties(result.data);
      } else {
        toast.error("Failed to load properties", {
          description: result.message,
        });
      }
    } catch (error) {
      toast.error("Error", {
        description: "Failed to fetch properties",
      });
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.token]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const filteredProperties = properties.filter(
    (p) =>
      p.houseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.houseAddress.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate total rooms from all properties
  const totalRooms = properties.reduce((sum, p) => sum + (p.totalRooms || 0), 0);

  const handlePropertyAdded = () => {
    fetchProperties();
  };

  const handlePropertyUpdated = () => {
    fetchProperties();
  };

  const handlePropertyDeleted = () => {
    fetchProperties();
  };

  const handleEditProperty = (property: PropertyResponse) => {
    setSelectedProperty(property);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProperty = (property: PropertyResponse) => {
    setSelectedProperty(property);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold">My Properties</h1>
          <p className="text-muted-foreground mt-1">
            Manage your rental properties and rooms
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Button className="gap-2" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4" />
            Add Property
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <PropertyStats
        totalProperties={properties.length}
        totalRooms={totalRooms}
        occupiedRooms={0}
        vacantRooms={0}
        totalRevenue={0}
      />

      {/* Filters */}
      <PropertyFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Properties Grid/List */}
      {filteredProperties.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
            {filteredProperties.map((property, index) => (
              <PropertyCard
                key={property.houseId}
                property={property}
                index={index}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProperties.map((property, index) => (
              <PropertyListItem
                key={property.houseId}
                property={property}
                index={index}
                onEdit={handleEditProperty}
                onDelete={handleDeleteProperty}
              />
            ))}
          </div>
        )
      ) : (
        <PropertyEmpty />
      )}

      {/* Add Property Dialog */}
      <AddPropertyDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={handlePropertyAdded}
      />

      {/* Edit Property Dialog */}
      <EditPropertyDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedProperty(null);
        }}
        onSuccess={handlePropertyUpdated}
        property={selectedProperty}
      />

      {/* Delete Property Dialog */}
      <DeletePropertyDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedProperty(null);
        }}
        onSuccess={handlePropertyDeleted}
        property={selectedProperty}
      />
    </div>
  );
}
