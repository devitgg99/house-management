import { Building2 } from "lucide-react";

export function PropertyEmpty() {
  return (
    <div className="text-center py-12">
      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium">No properties found</h3>
      <p className="text-muted-foreground mt-1">
        Try adjusting your search or add a new property
      </p>
    </div>
  );
}

