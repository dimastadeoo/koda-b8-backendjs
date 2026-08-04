import * as wishlistModel from "../models/whislistModels.js";
import * as Response from "../lib/response.js";
import { findProfileByUserId } from "../models/profileModels.js";
import { constants } from "node:http2";


// Get profile id
async function getProfileIdByUserId(userId) {
    const profile = await findProfileByUserId(userId);
    if (!profile) {
        throw new Error("Profile not found");
    }
    return profile.id;
}

/**
 * get whishlist
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getWishlist(req, res) {
  try {
    const userId = req.user.userId;
    const profileId = await getProfileIdByUserId(userId);
    if (!profileId) {
      return Response.errorResponse(res, 'Profile not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const items = await wishlistModel.getWishlistByProfile(profileId);
    Response.successResponse(res, 'Wishlist retrieved successfully', items);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get wishlist', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * add whishlist
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function addWishlist(req, res) {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;

    if (!productId) {
      return Response.errorResponse(res, 'productId is required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const profileId = await getProfileIdByUserId(userId);
    if (!profileId) {
      return Response.errorResponse(res, 'Profile not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const added = await wishlistModel.addWishlist(profileId, productId);
    if (!added) {
      return Response.errorResponse(res, 'Product already in wishlist', constants.HTTP_STATUS_CONFLICT);
    }

    Response.successResponse(res, 'Product added to wishlist', added, constants.HTTP_STATUS_CREATED);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to add to wishlist', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * remove whishlist
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function removeWishlist(req, res) {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const profileId = await getProfileIdByUserId(userId);
    if (!profileId) {
      return Response.errorResponse(res, 'Profile not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const removed = await wishlistModel.removeWishlist(profileId, productId);
    if (!removed) {
      return Response.errorResponse(res, 'Product not in wishlist', constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, 'Product removed from wishlist', removed);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to remove from wishlist', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}