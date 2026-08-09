import * as userModel from "../models/usersModels.js";
import * as roleModel from "../models/rolesModels.js";
import * as profileModel from "../models/profileModels.js"
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
      hp_number: updatedUser.hp_number
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

/**
 * Update get user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getUsers(req, res) {
  try {
    const users = await userModel.getAllUsersWithRole();
    Response.successResponse(res, 'Users retrieved successfully', users);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get users', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Update get user by id
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getUserById(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return Response.errorResponse(res, 'Invalid user ID', constants.HTTP_STATUS_BAD_REQUEST);
    }
    
    const user = await userModel.findUserByIdWithRole(userId);
    if (!user) {
      return Response.errorResponse(res, 'User not found', constants.HTTP_STATUS_NOT_FOUND);
    }
    
    Response.successResponse(res, 'User retrieved successfully', user);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get user', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Update create user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function createUser(req, res) {
  try {
    const { email, password, name, hp_number, roleName } = req.body;
    const adminId = req.admin; // dari middleware isAdmin

    if (!email || !password || !name || !roleName) {
      return Response.errorResponse(res, 'email, password, name, and roleName required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Cek apakah email sudah ada
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return Response.errorResponse(res, 'Email already exists', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Dapatkan role berdasarkan name
    const role = await roleModel.getRoleByName(roleName);
    if (!role) {
      return Response.errorResponse(res, 'Invalid role name', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const user = await userModel.createUserWithRole(
      email, 
      hashedPassword,  
      hp_number || null, 
      role.id, 
      adminId
    );

    // Buat profile
    const profile = await profileModel.createProfile(user.id, name);

    const results = {
      id: user.id,
      email: user.email,
      name: profile.name,
      hp_number: user.hp_number,
      role: roleName,
      created_by: adminId
    };

    Response.successResponse(res, 'User created successfully', results, constants.HTTP_STATUS_CREATED);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to create user', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Update update user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    if (isNaN(userId)) {
      return Response.errorResponse(res, 'Invalid user ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const { email, hp_number, roleName } = req.body;
    if (!email && !hp_number && !roleName) {
      return Response.errorResponse(res, 'At least one field to update', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return Response.errorResponse(res, 'User not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    let id_role = user.id_role;
    if (roleName) {
      const role = await roleModel.getRoleByName(roleName);
      if (!role) {
        return Response.errorResponse(res, 'Invalid role name', constants.HTTP_STATUS_BAD_REQUEST);
      }
      id_role = role.id;
    }

    const updateData = {
      email: email || user.email,
      hp_number: hp_number !== undefined ? hp_number : user.hp_number,
      id_role: id_role
    };

    const updated = await userModel.updateUser(userId, updateData);
    const result = await userModel.findUserByIdWithRole(updated.id);

    Response.successResponse(res, 'User updated successfully', result);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update user', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Update delete user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id, 10);
    const adminId = req.admin;

    if (isNaN(userId)) {
      return Response.errorResponse(res, 'Invalid user ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    if (userId === adminId) {
      return Response.errorResponse(res, 'Cannot delete yourself', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const deleted = await userModel.deleteUserById(userId);
    if (!deleted) {
      return Response.errorResponse(res, 'User not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, 'User deleted successfully', { id: userId });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to delete user', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * Update getRoles user
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getRoles(req, res) {
  try {
    const roles = await roleModel.getAllRoles();
    Response.successResponse(res, 'Roles retrieved successfully', roles);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get roles', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}