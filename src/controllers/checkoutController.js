import * as cartsModel from "../models/cartsModels.js";
import * as ordersModel from "../models/ordersModels.js";
import * as orderItemsModel from "../models/ordersItemModels.js";
import * as methodPaymentsModel from "../models/paymentMethodsModels.js";
import * as methodShippingsModel from "../models/shippingMethodsModels.js";
import * as vouchersModel from "../models/vouchersModels.js";
import * as paymentTransactionsModel from "../models/paymentTransactionModels.js";
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

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function createOrder(req, res) {
  try {
    const userId = req.user.userId;
    const { shippingId, paymentId, voucherId, address } = req.body;

    // Validasi required fields
    if (!shippingId || !paymentId || !address) {
      return Response.errorResponse(
        res,
        'shippingId, paymentId, and address are required',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }

    // 1. Ambil keranjang user
    const cart = await cartsModel.getOrCreateCart(userId);
    if (!cart) {
      return Response.errorResponse(res, 'Cart not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // 2. Ambil item di keranjang yang statusnya active
    const cartItems = await cartsModel.getCartItems(cart.id);
    const activeItems = cartItems.filter(item => item.status === 'active');
    if (activeItems.length === 0) {
      return Response.errorResponse(res, 'Cart is empty', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // 3. Validasi shipping method
    const shipping = await methodShippingsModel.getShippingMethodById(shippingId);
    if (!shipping) {
      return Response.errorResponse(res, 'Shipping method not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // 4. Validasi payment method
    const payment = await methodPaymentsModel.getPaymentMethodById(paymentId);
    if (!payment) {
      return Response.errorResponse(res, 'Payment method not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // 5. Validasi voucher (jika ada)
    let voucher = null;
    let discount = 0;
    if (voucherId) {
      voucher = await vouchersModel.getVoucherById(voucherId);
      if (!voucher) {
        return Response.errorResponse(res, 'Voucher not found', constants.HTTP_STATUS_NOT_FOUND);
      }
      // Periksa valid date dan kuota
      const now = new Date();
      if (now < voucher.valid_from || now > voucher.valid_until || voucher.quota <= 0) {
        return Response.errorResponse(res, 'Voucher is invalid or expired', constants.HTTP_STATUS_BAD_REQUEST);
      }
    }

    // 6. Hitung subtotal
    let subtotal = 0;
    const orderItems = activeItems.map(item => {
      const price = parseInt(item.price, 10);
      const qty = parseInt(item.qty, 10);
      subtotal += price * qty;
      return {
        id_product: item.id_product,
        product_name_snapshot: item.product_name,
        price_snapshot: price,
        qty: qty,
      };
    });

    // 7. Hitung diskon
    if (voucher) {
      if (voucher.min_purchase > 0 && subtotal < voucher.min_purchase) {
        return Response.errorResponse(
          res,
          `Subtotal must be at least ${voucher.min_purchase} to use this voucher`,
          constants.HTTP_STATUS_BAD_REQUEST
        );
      }
      if (voucher.type === 'percentage') {
        discount = Math.round((subtotal * voucher.value) / 100);
        if (discount > subtotal) discount = subtotal;
      } else {
        discount = voucher.value;
        if (discount > subtotal) discount = subtotal;
      }
    }

    // 8. Hitung total
    const shippingCost = shipping.price;
    const totalPayment = subtotal - discount + shippingCost;

    // 9. Buat order
    const orderData = {
      id_cart: cart.id,
      id_shipping: shippingId,
      id_payment: paymentId,
      id_voucher: voucher ? voucher.id : null,
      address,
      subtotal,
      discount,
      shipping_cost: shippingCost,
      total_payment: totalPayment,
    };
    const order = await ordersModel.createOrder(orderData);

    // 10. Buat order items
    await orderItemsModel.createOrderItems(order.id, orderItems);

    // 11. Update cart items status menjadi 'checkout'
    const productIds = activeItems.map(item => item.id_product);
    await cartsModel.updateItemStatus(cart.id, parseInt(productIds), 'checkout');

    // 12. Kurangi stok produk
    // (Tidak diimplementasikan di sini, bisa dipisah ke model product)

    // 13. Buat payment transaction
    const transactionData = {
      id_order: order.id,
      id_method_payment: paymentId,
      reference_number: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
      amount: totalPayment,
    };
    await paymentTransactionsModel.createPaymentTransaction(transactionData);

    Response.successResponse(
      res,
      'Order created successfully',
      order,
      constants.HTTP_STATUS_CREATED
    );
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to create order', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}