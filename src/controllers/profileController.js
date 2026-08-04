import * as profileModel from "../models/profileModels.js";
import * as userModel from "../models/usersModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import pool from "../lib/conn.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getProfile(req, res) {
  try {
    const userId = req.user.userId;
    const profile = await profileModel.findProfileByUserId(userId);

    if (!profile) {
      return Response.errorResponse(res, "Profile not found", constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, "Profile retrieved successfully", profile);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, "Failed to get profile", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateProfile(req, res) {
  try {
    const userId = req.user.userId;
    const { name, gender, place_birth, date_birth, hp_number } = req.body;

    // Validasi: name wajib
    if (!name) {
      return Response.errorResponse(res, "Name is required", constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Cek apakah profile sudah ada (untuk menentukan create/update)
    const existingProfile = await profileModel.findProfileByUserId(userId);

    // Mulai transaksi
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Update hp_number di users jika diberikan
      let updatedUser = null;
      if (hp_number !== undefined) {
        // Cek duplikat hp_number (kecuali milik sendiri)
        const existingUser = await userModel.findByNoHp(hp_number, client);
        if (existingUser && existingUser.id !== userId) {
          await client.query('ROLLBACK');
          return Response.errorResponse(res, "No HP already used by another user", constants.HTTP_STATUS_BAD_REQUEST);
        }
        // Update hp_number
        updatedUser = await userModel.updateUserPhone(userId, hp_number, client);
      }

      // 2. Update atau create profile
      let profile;
      if (existingProfile) {
        profile = await profileModel.updateProfile(userId, { name, gender, place_birth, date_birth }, client);
      }

      await client.query('COMMIT');

      // Ambil data terakhir (join dengan users) untuk response
      const finalProfile = await profileModel.findProfileByUserId(userId);

      Response.successResponse(
        res,
        existingProfile ? "Profile updated successfully" : "Profile created successfully",
        finalProfile,
        existingProfile ? constants.HTTP_STATUS_OK : constants.HTTP_STATUS_CREATED
      );

    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error(error);
    Response.errorResponse(res, "Failed to save profile", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function uploadPicture(req, res) {
  try {
    const userId = req.user.userId;

    // Cek apakah file ada
    if (!req.file) {
      return Response.errorResponse(res, 'No picture file uploaded', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Ambil profile user
    const profile = await profileModel.findProfileByUserId(userId);
    if (!profile) {
      return Response.errorResponse(res, 'Profile not found, please update profile first', constants.HTTP_STATUS_NOT_FOUND);
    }

    // Jika ada gambar lama, hapus
    if (profile.picture) {
      const oldPath = path.join(__dirname, '../../uploads/profiles', profile.picture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update kolom picture dengan nama file baru
    await profileModel.updateProfilePicture(userId, req.file.filename)

    // Ambil data terbaru
    const finalProfile = await profileModel.findProfileByUserId(userId);

    Response.successResponse(res, 'Profile picture updated successfully', finalProfile);
  } catch (error) {
    console.error(error);
    // Hapus file yang sudah terupload jika terjadi error
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/profiles', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    Response.errorResponse(res, 'Failed to upload picture', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}
