import { UtilityRequest } from "@/types/property";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Get utilities by house ID (with optional month filter)
export const GetUtilitiesByHouseService = async (
  houseId: string, 
  token: string,
  month?: string
) => {
  try {
    const params = month ? `?month=${month}` : "";
    console.log("📤 Getting utilities for house:", houseId, month ? `month: ${month}` : "all months");
    
    const res = await fetch(`${API_BASE_URL}/utility/house/${houseId}${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Get house utilities response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get utilities",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Get house utilities error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Export utility report to PDF
export const ExportUtilityPdfService = async (
  houseId: string,
  month: string,
  token: string
) => {
  try {
    console.log("📤 Exporting utility PDF for house:", houseId, "month:", month);
    
    const res = await fetch(`${API_BASE_URL}/utility/house/${houseId}/pdf?month=${month}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.error || "Failed to export PDF",
      };
    }

    // Get the blob data for PDF download
    const blob = await res.blob();
    return { success: true, blob };
  } catch (e) {
    console.error("❌ Export PDF error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Get utilities by room ID
export const GetUtilitiesByRoomService = async (roomId: string, token: string) => {
  try {
    console.log("📤 Getting utilities for room:", roomId);
    
    const res = await fetch(`${API_BASE_URL}/utility/room/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Get utilities response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get utilities",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Get utilities error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Add utility record
export const AddUtilityService = async (utilityRequest: UtilityRequest, token: string) => {
  try {
    console.log("📤 Adding utility:", utilityRequest);
    
    const res = await fetch(`${API_BASE_URL}/utility`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(utilityRequest),
    });

    const data = await res.json();
    console.log("📥 Add utility response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to add utility",
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Add utility error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Update utility payment status (mark as paid/unpaid)
export const UpdateUtilityPaymentService = async (
  utilityId: string, 
  isPay: boolean, 
  token: string
) => {
  try {
    console.log("📤 Updating payment status for utility:", utilityId, "isPay:", isPay);
    
    const res = await fetch(`${API_BASE_URL}/utility/${utilityId}/pay`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ isPay }),
    });

    const data = await res.json();
    console.log("📥 Update payment response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to update payment status",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Update payment error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

