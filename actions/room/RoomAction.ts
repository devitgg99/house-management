"use server";

import { 
  GetRoomByIdService,
  GetRoomsByFloorService, 
  AddRoomService, 
  UpdateRoomService,
  DeleteRoomService 
} from "@/services/room.service";
import { RoomRequest } from "@/types/property";

export const GetRoomByIdAction = async (roomId: string, token: string) => {
  const response = await GetRoomByIdService(roomId, token);
  return response;
};

export const GetRoomsByFloorAction = async (floorId: string, token: string) => {
  const response = await GetRoomsByFloorService(floorId, token);
  return response;
};

export const AddRoomAction = async (roomData: RoomRequest, token: string) => {
  const response = await AddRoomService(roomData, token);
  return response;
};

export const UpdateRoomAction = async (
  roomId: string,
  roomData: RoomRequest,
  token: string
) => {
  const response = await UpdateRoomService(roomId, roomData, token);
  return response;
};

export const DeleteRoomAction = async (roomId: string, token: string) => {
  const response = await DeleteRoomService(roomId, token);
  return response;
};
