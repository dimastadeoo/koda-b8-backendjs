import * as ordersModel from "../models/ordersModels.js";
import * as orderItemsModel from "../models/ordersItemModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getOrders(req, res) {
  try {
    const userId = req.user.userId;
    const orders = await ordersModel.getOrdersByUserId(userId);
    Response.successResponse(res, 'Orders retrieved successfully', orders);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get orders', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getOrderDetail(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) {
      return Response.errorResponse(res, 'Order not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const items = await orderItemsModel.getOrderItems(orderId);

    const result = {
      ...order,
      items,
    };

    Response.successResponse(res, 'Order detail retrieved successfully', result);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get order detail', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}