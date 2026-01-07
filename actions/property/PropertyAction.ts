"use server";

import { 
  AddPropertyService, 
  GetPropertiesService, 
  GetHouseByIdService,
  UpdatePropertyService,
  DeletePropertyService,
} from "@/services/property.service";
import { PropertyRequest } from "@/types/property/PropertyRequest";

export const GetPropertiesAction = async (token: string) => {
  const response = await GetPropertiesService(token);
  return response;
};

export const GetHouseByIdAction = async (houseId: string, token: string) => {
  const response = await GetHouseByIdService(houseId, token);
  return response;
};

export const AddPropertyAction = async (propertyData: PropertyRequest, token: string) => {
  const response = await AddPropertyService(propertyData, token);
  return response;
};

export const UpdatePropertyAction = async (
  houseId: string,
  propertyData: PropertyRequest,
  token: string
) => {
  const response = await UpdatePropertyService(houseId, propertyData, token);
  return response;
};

export const DeletePropertyAction = async (houseId: string, token: string) => {
  const response = await DeletePropertyService(houseId, token);
  return response;
};
