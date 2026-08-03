import * as userModel from "../models/usersModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import bcrypt from "bcrypt";

const saltRounds = 10;

/**
 * Update email user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateEmail(req, res) {
  try {
    const userId = req.user.userId; // dari middleware authenticate
    const { email, password } = req.body;

    if (!email || !password) {
      return Response.errorResponse(res, 'Email and password are required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Ambil user dari database
    const user = await userModel.findById(userId);
    if (!user) {
      return Response.errorResponse(res, 'User not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // Verifikasi password lama
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return Response.errorResponse(res, 'Invalid password', constants.HTTP_STATUS_UNAUTHORIZED);
    }

    // Cek apakah email baru sudah digunakan oleh user lain
    const existingUser = await userModel.findByEmail(email);
    if (existingUser && existingUser.id !== userId) {
      return Response.errorResponse(res, 'Email already used by another user', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Update email
    const updatedUser = await userModel.updateUserEmail(userId, email);

    Response.successResponse(res, 'Email updated successfully', {
      id: updatedUser.id,
      email: updatedUser.email,
      no_hp: updatedUser.no_hp
    });

  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update email', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Update password user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updatePassword(req, res) {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return Response.errorResponse(res, 'Old password and new password are required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    if (newPassword.length < 6) {
      return Response.errorResponse(res, 'New password must be at least 6 characters', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Ambil user
    const user = await userModel.findById(userId);
    if (!user) {
      return Response.errorResponse(res, 'User not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // Verifikasi password lama
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!passwordMatch) {
      return Response.errorResponse(res, 'Invalid old password', constants.HTTP_STATUS_UNAUTHORIZED);
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await userModel.updateUserPassword(userId, hashedPassword);

    Response.successResponse(res, 'Password updated successfully');

  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update password', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}