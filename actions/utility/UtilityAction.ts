"use server";

import { 
  GetUtilitiesByHouseService,
  GetUtilitiesByRoomService, 
  AddUtilityService,
  UpdateUtilityPaymentService,
  ExportUtilityPdfService,
} from "@/services/utility.service";
import { UtilityRequest } from "@/types/property";

export const GetUtilitiesByHouseAction = async (
  houseId: string, 
  token: string,
  month?: string
) => {
  const response = await GetUtilitiesByHouseService(houseId, token, month);
  return response;
};

export const GetUtilitiesByRoomAction = async (roomId: string, token: string) => {
  const response = await GetUtilitiesByRoomService(roomId, token);
  return response;
};

export const AddUtilityAction = async (utilityData: UtilityRequest, token: string) => {
  const response = await AddUtilityService(utilityData, token);
  return response;
};

export const UpdateUtilityPaymentAction = async (
  utilityId: string, 
  isPay: boolean, 
  token: string
) => {
  const response = await UpdateUtilityPaymentService(utilityId, isPay, token);
  return response;
};

export const ExportUtilityPdfAction = async (
  houseId: string,
  month: string,
  token: string,
  lang: "en" | "kh" = "en"
) => {
  const response = await ExportUtilityPdfService(houseId, month, token, lang);
  return response;
};
