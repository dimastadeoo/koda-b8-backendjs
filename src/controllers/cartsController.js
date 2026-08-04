import * as cartModel from "../models/cartsModels.js";
import * as Response from "../lib/response.js";
import { getProductById } from "../models/productsModels.js";
import { constants } from "node:http2";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getCart(req, res) {
  try {
    const userId = req.user.userId;
    const cart = await cartModel.getOrCreateCart(userId);
    const items = await cartModel.getCartItems(cart.id);

    Response.successResponse(res, 'Cart retrieved successfully', items);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get cart', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function addToCart(req, res) {
  try {
    const userId = req.user.userId;
    const { productId, qty = 1 } = req.body;
    

    if (!productId) {
      return Response.errorResponse(res, 'productId is required', constants.HTTP_STATUS_BAD_REQUEST);
    }
    if (qty < 1) {
      return Response.errorResponse(res, 'qty must be at least 1', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Sebelum menambahkan, cek stok produk
    const product = await getProductById(productId); 
    if (!product) {
      return Response.errorResponse(res, 'Product not found', constants.HTTP_STATUS_NOT_FOUND);
    }
    if (product.stock < qty) {
      return Response.errorResponse(res, 'Insufficient stock', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Get or create cart
    const cart = await cartModel.getOrCreateCart(userId);
    const item = await cartModel.addItemToCart(cart.id, productId, qty);

    Response.successResponse(
      res,
      'Product added to cart',
      item,
      constants.HTTP_STATUS_CREATED
    );
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to add to cart', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateCartItem(req, res) {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const qty = parseInt(req.body.qty, 10);

    if (qty === undefined || qty < 0) {
      return Response.errorResponse(res, 'qty must be provided and >= 0', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Saat update qty, cek stok yang tersedia
    const product = await getProductById(productId);
    if (!product) {
      return Response.errorResponse(res, 'Product not found', constants.HTTP_STATUS_NOT_FOUND);
    }
    // Jika qty baru > stok, tolak
    if (qty > product.stock) {
      return Response.errorResponse(res, 'Quantity exceeds available stock', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const cart = await cartModel.getOrCreateCart(userId);
    const updated = await cartModel.updateItemQty(cart.id, productId, qty);

    if (!updated) {
      return Response.errorResponse(res, 'Item not found in cart', constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, 'Cart updated successfully', updated);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update cart', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function removeFromCart(req, res) {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const cart = await cartModel.getOrCreateCart(userId);
    const removed = await cartModel.removeItemFromCart(cart.id, productId);

    if (!removed) {
      return Response.errorResponse(res, 'Item not found in cart', constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, 'Product removed from cart', removed);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to remove from cart', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateItemStatus(req, res) {
  try {
    const userId = req.user.userId;
    const productId = parseInt(req.params.productId, 10);
    if (isNaN(productId)) {
      return Response.errorResponse(res, 'Invalid product ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const { status } = req.body;
    if (!status) {
      return Response.errorResponse(res, 'status is required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const cart = await cartModel.getOrCreateCart(userId);
    const updated = await cartModel.updateItemStatus(cart.id, productId, status);

    if (!updated) {
      return Response.errorResponse(res, 'Item not found in cart', constants.HTTP_STATUS_NOT_FOUND);
    }

    Response.successResponse(res, 'Item status updated', updated);
  } catch (error) {
    if (error.message === 'Invalid status') {
      return Response.errorResponse(
        res,
        'Invalid status value',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }
    console.error(error);
    Response.errorResponse(res, 'Failed to update item status', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}