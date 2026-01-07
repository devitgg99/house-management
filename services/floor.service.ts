import { FloorRequest } from "@/types/property";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Add floor to a house
export const AddFloorService = async (floorRequest: FloorRequest, token: string) => {
  try {
    console.log("📤 Adding floor:", floorRequest);
    
    const res = await fetch(`${API_BASE_URL}/floor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(floorRequest),
    });

    const data = await res.json();
    console.log("📥 Add floor response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to add floor",
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Add floor error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Delete floor
export const DeleteFloorService = async (floorId: string, token: string) => {
  try {
    console.log("📤 Deleting floor:", floorId);
    
    const res = await fetch(`${API_BASE_URL}/floor/${floorId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (res.status === 204) {
      return { success: true, message: "Floor deleted successfully" };
    }

    const data = await res.json();
    console.log("📥 Delete floor response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to delete floor",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Delete floor error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

