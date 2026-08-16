import * as addressModel from "../models/address.models.js";
// import * as profileModel from "../models/profile.models.js";
import db from '../models/index.cjs'
import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import { where } from "sequelize";

const {Users, Profiles, sequelize, Addresses} = db

// Get profile id
async function getProfileIdByUserId(userId) {
    const profile = await Profiles.findOne({
      where: {
        id_user: userId,
        },
    });
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
        console.log(userId)
        const address = await Addresses.findAll({where: {id_profile:profileId}})
        Response.successResponse(res, "Addresses retrieved successfully", address);
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
            const existing = await Addresses.findAll({where: {id_profile:profileId}})
            primary = existing.length === 0; // jika belum ada address, jadi primary
        }

        // Jika ingin set primary, unset primary lainnya
        if (primary) {
            await Addresses.update({
                is_primary: false,
            },{
                where: {
                id_profile: profileId,
                is_primary: true,
                },
            });
        }

        const newAddress = await Addresses.create({
            id_profile: profileId,
            label: label || 'Rumah',
            receiver_name: receiver_name,
            detail_address: detail_address,
            province: province,
            city: city,
            district: district,
            village: village,
            is_primary: primary
        });

        const result = await Addresses.findByPk(newAddress.id, {
            attributes:{
                exclude: ["id_profile"],
            }
        })

        Response.successResponse(res, "Address created successfully", result, constants.HTTP_STATUS_CREATED);
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
        const existing = await Addresses.findByPk(addressId);
        if (!existing) {
            return Response.errorResponse(res, "Address not found", constants.HTTP_STATUS_NOT_FOUND);
        }
        if (existing.id_profile !== profileId) {
            return Response.errorResponse(res, "Forbidden", constants.HTTP_STATUS_FORBIDDEN);
        }

        // Jika is_primary true, unset primary lainnya dulu
        if (is_primary) {
            await Addresses.update({
                is_primary: false,
            },{
                where: {
                id_profile: profileId,
                is_primary: true,
                },
            });
        }

        await Addresses.update({
            label: label,
            receiver_name: receiver_name,
            detail_address: detail_address,
            province: province,
            city: city,
            district: district,
            village: village,
            is_primary: is_primary
        }, {
            where:{
                id: addressId,
                id_profile: profileId
            }
        });

        const result = await Addresses.findByPk(addressId, {
            attributes:{
                exclude: ["id_profile"],
            }
        })

        Response.successResponse(res, "Address updated successfully", result);
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

        const existing = await Addresses.findByPk(addressId);
        if (!existing) {
            return Response.errorResponse(res, "Address not found", constants.HTTP_STATUS_NOT_FOUND);
        }
        if (existing.id_profile !== profileId) {
            return Response.errorResponse(res, "Forbidden", constants.HTTP_STATUS_FORBIDDEN);
        }

        const deleted = await Addresses.destroy({where: {id: addressId}});

        // Jika yang dihapus adalah primary, set address lain menjadi primary (ambil yang terbaru)
        if (existing.is_primary) {
            const remaining = await Addresses.findAll({where: {id_profile: profileId}});
            if (remaining.length > 0) {
                // Set address pertama menjadi primary
                await Addresses.update({ is_primary: true }, {where: {id: remaining[0].id, id_profile: profileId}});
            }
        }

        Response.successResponse(res, "Address deleted successfully");
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

        const existing = await Addresses.findByPk(addressId);
        if (!existing) {
            return Response.errorResponse(res, "Address not found", constants.HTTP_STATUS_NOT_FOUND);
        }
        if (existing.id_profile !== profileId) {
            return Response.errorResponse(res, "Forbidden", constants.HTTP_STATUS_FORBIDDEN);
        }

        // Unset semua primary
         await Addresses.update({
            is_primary: false,
        },{
            where: {
            id_profile: profileId,
            is_primary: true,
            },
        });

        // Set address ini menjadi primary
        await Addresses.update({ is_primary: true }, {where: {id: addressId, id_profile: profileId}});

        Response.successResponse(res, "Primary address updated successfully");
    } catch (error) {
        console.error(error);
        Response.errorResponse(res, "Failed to set primary address", constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
    }
}