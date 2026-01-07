// API Response types
export type PropertyResponse = {
  houseId: string;
  houseName: string;
  houseAddress: string;
  houseImage: string | null;
  totalRooms: number;
};

export type GetPropertiesResponse = {
  success: boolean;
  message: string;
  data: PropertyResponse[];
  createdAt: string;
};

// Floor types
export type FloorResponse = {
  floorId: string;
  floorNumber: number;
  floorName: string;
  totalRooms: number;
};

export type FloorRequest = {
  floorNumber: number;
  floorName: string;
  houseId: string;
};

// Room types
export type RoomResponse = {
  roomId: string;
  roomName: string;
  floorId: string;
  floorNumber: number;
  floorName: string;
  houseId: string;
  houseName: string;
  renterId: string | null;
  renterName: string | null;
  isAvailable: boolean;
  images: string[];
  price: number;
};

export type RoomRequest = {
  roomName: string;
  floorId: string;
  images: string[];
  price: number;
};

// House Detail (with floors)
export type HouseDetailResponse = {
  houseId: string;
  houseName: string;
  houseAddress: string;
  houseImage: string | null;
  totalFloors: number;
  totalRooms: number;
  floors: FloorResponse[];
};

// For display (extended with computed fields)
export type Property = PropertyResponse & {
  type?: string;
  occupiedRooms?: number;
  vacantRooms?: number;
  maintenanceRooms?: number;
  monthlyRevenue?: number;
  amenities?: string[];
};

export type ViewMode = "grid" | "list";

// Utility types
export type UtilityResponse = {
  utilityId: string;
  roomId: string;
  roomName: string;
  houseName: string;
  isPay: boolean;
  oldWater: number;
  newWater: number;
  waterUsage: number;
  roomCost: number;
  waterCost: number;
  totalCost: number;
  month: string;
};

export type UtilityRequest = {
  roomId: string;
  newWater: number;
  month: string;
  oldWater: number;
};

// User types
export type UserResponse = {
  userId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage: string | null;
  role: "RENTER" | "HOUSEOWNER" | "ADMIN";
  isFollowing: boolean;
};
