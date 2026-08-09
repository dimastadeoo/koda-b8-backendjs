import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import * as userModel from "../models/usersModels.js";

export async function isAdmin(req, res, next) {
  try {
    const userId = req.user.userId;
    const user = await userModel.findUserByIdWithRole(userId);
    
    if (!user) {
      return Response.errorResponse(res, 'User not found', constants.HTTP_STATUS_NOT_FOUND);
    }
    
    if (user.role_name !== 'admin') {
      return Response.errorResponse(res, 'Access denied. Admin only.', constants.HTTP_STATUS_FORBIDDEN);
    }
    
    // Simpan data user admin di req untuk digunakan controller
    req.admin = user.id;
    next();
  } catch (error) {
    console.error(error);
    return Response.errorResponse(res, 'Failed to verify admin role', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}