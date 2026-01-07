const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Get all users (with optional role filter)
export const GetAllUsersService = async (token: string, role?: "RENTER" | "HOUSEOWNER") => {
  try {
    const params = role ? `?role=${role}` : "";
    console.log("📤 Getting users", role ? `with role: ${role}` : "(all)");
    
    const res = await fetch(`${API_BASE_URL}/user${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Get users response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get users",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Get users error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Follow user
export const FollowUserService = async (userId: string, token: string) => {
  try {
    console.log("📤 Following user:", userId);
    
    const res = await fetch(`${API_BASE_URL}/follow/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Follow user response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to follow user",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Follow user error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Unfollow user
export const UnfollowUserService = async (userId: string, token: string) => {
  try {
    console.log("📤 Unfollowing user:", userId);
    
    const res = await fetch(`${API_BASE_URL}/follow/${userId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Unfollow user response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to unfollow user",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Unfollow user error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Get all renters
export const GetAllRentersService = async (token: string) => {
  try {
    console.log("📤 Getting all renters");
    
    const res = await fetch(`${API_BASE_URL}/user/renters`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Get renters response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to get renters",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Get renters error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

// Assign renter to room
export const AssignRenterToRoomService = async (
  roomId: string,
  renterId: string,
  token: string
) => {
  try {
    console.log("📤 Assigning renter to room:", { roomId, renterId });
    
    const res = await fetch(`${API_BASE_URL}/room/${roomId}/assign-renter/${renterId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("📥 Assign renter response:", res.status, data);

    if (!res.ok) {
      return {
        success: false,
        error: data.message || data.error || "Failed to assign renter",
      };
    }

    return { success: true, ...data };
  } catch (e) {
    console.error("❌ Assign renter error:", e);
    return {
      success: false,
      error: e instanceof Error ? e.message : "Network error or server is unreachable",
    };
  }
};

