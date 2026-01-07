"use server";

import { AddFloorService, DeleteFloorService } from "@/services/floor.service";
import { FloorRequest } from "@/types/property";

export const AddFloorAction = async (floorData: FloorRequest, token: string) => {
  const response = await AddFloorService(floorData, token);
  return response;
};

export const DeleteFloorAction = async (floorId: string, token: string) => {
  const response = await DeleteFloorService(floorId, token);
  return response;
};

