import { PropertyRequest } from "@/types/property/PropertyRequest";
import { GetPropertiesResponse, HouseDetailResponse } from "@/types/property";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all properties
export const GetPropertiesService = async (token: string): Promise<GetPropertiesResponse> => {
  try {
    console.log("📤 Fetching properties...");
    
    const res = await fetch(`${API_BASE_URL}/house`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Properties response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        message: data.message || data.error || "Failed to fetch properties",
        data: [],
        createdAt: new Date().toISOString(),
      };
    }

    return data;
  } catch (e) {
    console.error("❌ Get properties error:", e);
    return {
      success: false,
      message: e instanceof Error ? e.message : "Network error or server is unreachable",
      data: [],
      createdAt: new Date().toISOString(),
    };
  }
};

// Get house by ID (with floors)
export const GetHouseByIdService = async (houseId: string, token: string) => {
  try {
    console.log("📤 Fetching house detail:", houseId);
    
    const res = await fetch(`${API_BASE_URL}/house/${houseId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 House detail response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to fetch house details",
      };
    }

    return { success: true, data: data.data as HouseDetailResponse };
  } catch (e) {
    console.error("❌ Get house detail error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Add new property
export const AddPropertyService = async (propertyRequest: PropertyRequest, token: string) => {
  try {
    console.log("📤 Adding property:", propertyRequest);
    
    const res = await fetch(`${API_BASE_URL}/house`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(propertyRequest),
    });

    const data = await res.json();
    console.log("📥 Property response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error,
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Add property error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Update property
export const UpdatePropertyService = async (
  houseId: string,
  propertyRequest: PropertyRequest,
  token: string
) => {
  try {
    console.log("📤 Updating property:", houseId, propertyRequest);
    
    const res = await fetch(`${API_BASE_URL}/house/${houseId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(propertyRequest),
    });

    const data = await res.json();
    console.log("📥 Update response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error,
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Update property error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Delete property
export const DeletePropertyService = async (houseId: string, token: string) => {
  try {
    console.log("📤 Deleting property:", houseId);
    
    const res = await fetch(`${API_BASE_URL}/house/${houseId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    // Handle empty response (204 No Content)
    if (res.status === 204) {
      return { success: true, message: "Property deleted successfully" };
    }

    const data = await res.json();
    console.log("📥 Delete response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to delete property",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Delete property error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};
