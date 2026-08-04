import * as addressModel from "../models/addressModels.js";
import * as profileModel from "../models/profileModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";

// Get profile id
async function getProfileIdByUserId(userId) {
    const profile = await profileModel.findProfileByUserId(userId);
    if (!profile) {
        throw new Error("Profile not found");
    }
    return profile.id;
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getAddresses(req, res) {
    try {
        const userId = req.user.userId;
        const profileId = await getProfileIdByUserId(userId);

        const addresses = await addressModel.findAddressesByProfileId(profileId);
        Response.successResponse(res, "Addresses retrieved successfully", addresses);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, "Failed to get addresses", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function createAddress(req, res) {
    try {
        const userId = req.user.userId;
        const profileId = await getProfileIdByUserId(userId);

        const { label, receiver_name, detail_address, province, city, district, village, is_primary } = req.body;

        // Validasi required fields
        if (!receiver_name || !detail_address || !province || !city || !district || !village) {
            return Response.errorResponse(
                res,
                "Missing required fields: receiver_name, detail_address, province, city, district, village",
                constants.HTTP_STATUS_BAD_REQUEST
            );
        }

        // Jika is_primary tidak diberikan, cek apakah ini address pertama user
        let primary = is_primary;
        if (primary === undefined) {
            const existing = await addressModel.findAddressesByProfileId(profileId);
            primary = existing.length === 0; // jika belum ada address, jadi primary
        }

        // Jika ingin set primary, unset primary lainnya
        if (primary) {
            await addressModel.unsetPrimaryAddress(profileId);
        }

        const newAddress = await addressModel.createAddress(profileId, {
            label: label || 'Rumah',
            receiver_name,
            detail_address,
            province,
            city,
            district,
            village,
            is_primary: primary
        });

        Response.successResponse(res, "Address created successfully", newAddress, constants.HTTP_STATUS_CREATED);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, "Failed to create address", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateAddress(req, res) {
    try {
        const userId = req.user.userId;
        const profileId = await getProfileIdByUserId(userId);

        const addressId = parseInt(req.params.id);
        const { label, receiver_name, detail_address, province, city, district, village, is_primary } = req.body;

        // Pastikan address milik user ini
        const existing = await addressModel.findAddressById(addressId);
        if (!existing) {
            return Response.errorResponse(res, "Address not found", constants.HTTP_STATUS_NOT_FOUND);
        }
        if (existing.id_profile !== profileId) {
            return Response.errorResponse(res, "Forbidden", constants.HTTP_STATUS_FORBIDDEN);
        }

        // Jika is_primary true, unset primary lainnya dulu
        if (is_primary) {
            await addressModel.unsetPrimaryAddress(profileId);
        }

        const updated = await addressModel.updateAddress(addressId, {
            label,
            receiver_name,
            detail_address,
            province,
            city,
            district,
            village,
            is_primary
        });

        Response.successResponse(res, "Address updated successfully", updated);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, "Failed to update address", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function deleteAddress(req, res) {
    try {
        const userId = req.user.userId;
        const profileId = await getProfileIdByUserId(userId);

        const addressId = parseInt(req.params.id);

        const existing = await addressModel.findAddressById(addressId);
        if (!existing) {
            return Response.errorResponse(res, "Address not found", constants.HTTP_STATUS_NOT_FOUND);
        }
        if (existing.id_profile !== profileId) {
            return Response.errorResponse(res, "Forbidden", constants.HTTP_STATUS_FORBIDDEN);
        }

        const deleted = await addressModel.deleteAddress(addressId);

        // Jika yang dihapus adalah primary, set address lain menjadi primary (ambil yang terbaru)
        if (existing.is_primary) {
            const remaining = await addressModel.findAddressesByProfileId(profileId);
            if (remaining.length > 0) {
                // Set address pertama menjadi primary
                await addressModel.updateAddress(remaining[0].id, { is_primary: true });
            }
        }

        Response.successResponse(res, "Address deleted successfully", deleted);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, "Failed to delete address", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function setPrimaryAddress(req, res) {
    try {
        const userId = req.user.userId;
        const profileId = await getProfileIdByUserId(userId);

        const addressId = parseInt(req.params.id);

        const existing = await addressModel.findAddressById(addressId);
        if (!existing) {
            return Response.errorResponse(res, "Address not found", constants.HTTP_STATUS_NOT_FOUND);
        }
        if (existing.id_profile !== profileId) {
            return Response.errorResponse(res, "Forbidden", constants.HTTP_STATUS_FORBIDDEN);
        }

        // Unset semua primary
        await addressModel.unsetPrimaryAddress(profileId);

        // Set address ini menjadi primary
        const updated = await addressModel.updateAddress(addressId, { is_primary: true });

        Response.successResponse(res, "Primary address updated successfully", updated);
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, "Failed to set primary address", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}