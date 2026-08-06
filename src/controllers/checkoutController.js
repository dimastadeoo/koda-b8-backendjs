import * as methodPaymentsModel from "../models/paymentMethodsModels.js";
import * as methodShippingsModel from "../models/shippingMethodsModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getPaymentMethods(req, res) {
  try {
    const methods = await methodPaymentsModel.getActivePaymentMethods();
    Response.successResponse(res, 'Payment methods retrieved successfully', methods);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get payment methods', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function getShippingMethods(req, res) {
  try {
    const methods = await methodShippingsModel.getActiveShippingMethods();
    Response.successResponse(res, 'Shipping methods retrieved successfully', methods);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get shipping methods', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}