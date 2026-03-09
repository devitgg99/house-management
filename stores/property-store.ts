"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { 
  PropertyResponse, 
  HouseDetailResponse, 
  RoomResponse, 
  UtilityResponse 
} from "@/types/property";

interface CachedData<T> {
  data: T;
  timestamp: number;
}

interface PropertyStore {
  // Properties list cache
  properties: CachedData<PropertyResponse[]> | null;
  propertiesLoading: boolean;
  
  // House details cache (keyed by houseId)
  houseDetails: Record<string, CachedData<HouseDetailResponse>>;
  houseDetailsLoading: Record<string, boolean>;
  
  // Rooms cache (keyed by floorId)
  roomsByFloor: Record<string, CachedData<RoomResponse[]>>;
  roomsLoading: Record<string, boolean>;
  
  // Active floor per house (persisted)
  activeFloorByHouse: Record<string, string>;
  
  // Utilities cache (keyed by houseId or roomId)
  utilitiesByHouse: Record<string, CachedData<UtilityResponse[]>>;
  utilitiesByRoom: Record<string, CachedData<UtilityResponse[]>>;
  
  // Cache TTL in milliseconds (5 minutes)
  cacheTTL: number;
  
  // Actions - Properties
  setProperties: (properties: PropertyResponse[]) => void;
  setPropertiesLoading: (loading: boolean) => void;
  getProperties: () => PropertyResponse[] | null;
  invalidateProperties: () => void;
  
  // Actions - House Details
  setHouseDetails: (houseId: string, house: HouseDetailResponse) => void;
  setHouseDetailsLoading: (houseId: string, loading: boolean) => void;
  getHouseDetails: (houseId: string) => HouseDetailResponse | null;
  invalidateHouseDetails: (houseId: string) => void;
  
  // Actions - Rooms
  setRoomsByFloor: (floorId: string, rooms: RoomResponse[]) => void;
  setRoomsLoading: (floorId: string, loading: boolean) => void;
  getRoomsByFloor: (floorId: string) => RoomResponse[] | null;
  invalidateRoomsByFloor: (floorId: string) => void;
  invalidateAllRoomsForHouse: (houseId: string) => void;
  
  // Actions - Active Floor
  setActiveFloor: (houseId: string, floorId: string) => void;
  getActiveFloor: (houseId: string) => string | null;
  
  // Actions - Utilities
  setUtilitiesByHouse: (houseId: string, utilities: UtilityResponse[]) => void;
  getUtilitiesByHouse: (houseId: string) => UtilityResponse[] | null;
  setUtilitiesByRoom: (roomId: string, utilities: UtilityResponse[]) => void;
  getUtilitiesByRoom: (roomId: string) => UtilityResponse[] | null;
  invalidateUtilitiesByHouse: (houseId: string) => void;
  invalidateUtilitiesByRoom: (roomId: string) => void;
  
  // Global actions
  clearAllCache: () => void;
  isCacheValid: (timestamp: number) => boolean;
}

export const usePropertyStore = create<PropertyStore>()(
  persist(
    (set, get) => ({
      // Initial state
      properties: null,
      propertiesLoading: false,
      houseDetails: {},
      houseDetailsLoading: {},
      roomsByFloor: {},
      roomsLoading: {},
      activeFloorByHouse: {},
      utilitiesByHouse: {},
      utilitiesByRoom: {},
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      
      // Helper to check cache validity
      isCacheValid: (timestamp: number) => {
        return Date.now() - timestamp < get().cacheTTL;
      },
      
      // Properties actions
      setProperties: (properties) => {
        set({
          properties: {
            data: properties,
            timestamp: Date.now(),
          },
        });
      },
      
      setPropertiesLoading: (loading) => {
        set({ propertiesLoading: loading });
      },
      
      getProperties: () => {
        const cached = get().properties;
        if (cached && get().isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        return null;
      },
      
      invalidateProperties: () => {
        set({ properties: null });
      },
      
      // House Details actions
      setHouseDetails: (houseId, house) => {
        set((state) => ({
          houseDetails: {
            ...state.houseDetails,
            [houseId]: {
              data: house,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      setHouseDetailsLoading: (houseId, loading) => {
        set((state) => ({
          houseDetailsLoading: {
            ...state.houseDetailsLoading,
            [houseId]: loading,
          },
        }));
      },
      
      getHouseDetails: (houseId) => {
        const cached = get().houseDetails[houseId];
        if (cached && get().isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        return null;
      },
      
      invalidateHouseDetails: (houseId) => {
        set((state) => {
          const { [houseId]: _, ...rest } = state.houseDetails;
          return { houseDetails: rest };
        });
      },
      
      // Rooms actions
      setRoomsByFloor: (floorId, rooms) => {
        set((state) => ({
          roomsByFloor: {
            ...state.roomsByFloor,
            [floorId]: {
              data: rooms,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      setRoomsLoading: (floorId, loading) => {
        set((state) => ({
          roomsLoading: {
            ...state.roomsLoading,
            [floorId]: loading,
          },
        }));
      },
      
      getRoomsByFloor: (floorId) => {
        const cached = get().roomsByFloor[floorId];
        if (cached && get().isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        return null;
      },
      
      invalidateRoomsByFloor: (floorId) => {
        set((state) => {
          const { [floorId]: _, ...rest } = state.roomsByFloor;
          return { roomsByFloor: rest };
        });
      },
      
      invalidateAllRoomsForHouse: (houseId) => {
        const houseDetails = get().houseDetails[houseId]?.data;
        if (houseDetails?.floors) {
          const floorIds = houseDetails.floors.map((f) => f.floorId);
          set((state) => {
            const newRoomsByFloor = { ...state.roomsByFloor };
            floorIds.forEach((floorId) => {
              delete newRoomsByFloor[floorId];
            });
            return { roomsByFloor: newRoomsByFloor };
          });
        }
      },
      
      // Active Floor actions
      setActiveFloor: (houseId, floorId) => {
        set((state) => ({
          activeFloorByHouse: {
            ...state.activeFloorByHouse,
            [houseId]: floorId,
          },
        }));
      },
      
      getActiveFloor: (houseId) => {
        return get().activeFloorByHouse[houseId] || null;
      },
      
      // Utilities actions
      setUtilitiesByHouse: (houseId, utilities) => {
        set((state) => ({
          utilitiesByHouse: {
            ...state.utilitiesByHouse,
            [houseId]: {
              data: utilities,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      getUtilitiesByHouse: (houseId) => {
        const cached = get().utilitiesByHouse[houseId];
        if (cached && get().isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        return null;
      },
      
      setUtilitiesByRoom: (roomId, utilities) => {
        set((state) => ({
          utilitiesByRoom: {
            ...state.utilitiesByRoom,
            [roomId]: {
              data: utilities,
              timestamp: Date.now(),
            },
          },
        }));
      },
      
      getUtilitiesByRoom: (roomId) => {
        const cached = get().utilitiesByRoom[roomId];
        if (cached && get().isCacheValid(cached.timestamp)) {
          return cached.data;
        }
        return null;
      },
      
      invalidateUtilitiesByHouse: (houseId) => {
        set((state) => {
          const { [houseId]: _, ...rest } = state.utilitiesByHouse;
          return { utilitiesByHouse: rest };
        });
      },
      
      invalidateUtilitiesByRoom: (roomId) => {
        set((state) => {
          const { [roomId]: _, ...rest } = state.utilitiesByRoom;
          return { utilitiesByRoom: rest };
        });
      },
      
      // Global actions
      clearAllCache: () => {
        set({
          properties: null,
          houseDetails: {},
          roomsByFloor: {},
          utilitiesByHouse: {},
          utilitiesByRoom: {},
        });
      },
    }),
    {
      name: "property-store",
      // Only persist the active floor state, not the cached data
      partialize: (state) => ({
        activeFloorByHouse: state.activeFloorByHouse,
      }),
    }
  )
);
