import { RoomRequest, RoomResponse } from "@/types/property";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Get room by ID
export const GetRoomByIdService = async (roomId: string, token: string) => {
  try {
    console.log("📤 Getting room by ID:", roomId);
    
    const res = await fetch(`${API_BASE_URL}/room/${roomId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Get room response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get room",
      };
    }

    return { success: true, data: data.data as RoomResponse };
  } catch (e) {
    console.error("❌ Get room error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Get rooms by floor ID
export const GetRoomsByFloorService = async (floorId: string, token: string) => {
  try {
    console.log("📤 Getting rooms for floor:", floorId);
    
    const res = await fetch(`${API_BASE_URL}/room/floor/${floorId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Get rooms response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get rooms",
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Get rooms error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Add room to a floor
export const AddRoomService = async (roomRequest: RoomRequest, token: string) => {
  try {
    console.log("📤 Adding room:", roomRequest);
    
    const res = await fetch(`${API_BASE_URL}/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(roomRequest),
    });

    const data = await res.json();
    console.log("📥 Add room response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to add room",
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Add room error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Update room
export const UpdateRoomService = async (
  roomId: string,
  roomRequest: RoomRequest,
  token: string
) => {
  try {
    console.log("📤 Updating room:", roomId, roomRequest);
    
    const res = await fetch(`${API_BASE_URL}/room/${roomId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(roomRequest),
    });

    const data = await res.json();
    console.log("📥 Update room response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to update room",
        details: data,
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Update room error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Delete room
export const DeleteRoomService = async (roomId: string, token: string) => {
  try {
    console.log("📤 Deleting room:", roomId);
    
    const res = await fetch(`${API_BASE_URL}/room/${roomId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (res.status === 204) {
      return { success: true, message: "Room deleted successfully" };
    }

    const data = await res.json();
    console.log("📥 Delete room response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to delete room",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Delete room error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};
