"use server";

import {
  GetAllUsersService,
  FollowUserService,
  UnfollowUserService,
  GetAllRentersService,
  AssignRenterToRoomService,
} from "@/services/user.service";

export const GetAllUsersAction = async (token: string, role?: "RENTER" | "HOUSEOWNER") => {
  const response = await GetAllUsersService(token, role);
  return response;
};

export const FollowUserAction = async (userId: string, token: string) => {
  const response = await FollowUserService(userId, token);
  return response;
};

export const UnfollowUserAction = async (userId: string, token: string) => {
  const response = await UnfollowUserService(userId, token);
  return response;
};

export const GetAllRentersAction = async (token: string) => {
  const response = await GetAllRentersService(token);
  return response;
};

export const AssignRenterToRoomAction = async (
  roomId: string,
  renterId: string,
  token: string
) => {
  const response = await AssignRenterToRoomService(roomId, renterId, token);
  return response;
};
