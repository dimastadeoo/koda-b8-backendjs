// src/controllers/orderController.js
import * as ordersModel from "../models/ordersModels.js";
import * as orderItemsModel from "../models/ordersItemModels.js";
import * as cartsModel from "../models/cartsModels.js";
import * as vouchersModel from "../models/vouchersModels.js";
import * as methodPaymentsModel from "../models/paymentMethodsModels.js";
import * as paymentTransactionsModel from "../models/paymentTransactionModels.js";
import * as methodShippingsModel from "../models/shippingMethodsModels.js";
import * as productModel from "../models/productsModels.js";
import * as Response from "../lib/response.js";
import { constants } from "node:http2";
import pool from "../lib/conn.js";

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
      return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    }

    const items = await orderItemsModel.getOrderItems(orderId);
    const result = { ...order, items };
    Response.successResponse(res, 'Order detail retrieved successfully', result);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to get order detail', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function cancelOrder(req, res) {
  const client = await pool.connect();
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) {
      return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Cek order milik user dan status pending
    console.log(orderId)
    console.log(userId)
    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) {
      return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    }
    if (!(order.status === 'pending' || order.status === 'in_progress')) {
      return Response.errorResponse(res, 'Only pending orders can be canceled', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Ambil product IDs dari order items untuk restore stok
    const orderItems = await orderItemsModel.getOrderItems(orderId);
    const productIds = orderItems.map(item => item.id_product);

    await client.query('BEGIN');

    // 1. Update order status to 'canceled'
    await ordersModel.updateOrderStatus(orderId, 'canceled');

    // 2. Kembalikan stok produk
    for (const item of orderItems) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.qty, item.id_product]
      );
    }

    // 3. Kembalikan status cart items ke 'active'
    if (order.id_cart) {
      await cartsModel.restoreCartItems(order.id_cart, productIds);
    }

    await client.query('COMMIT');

    Response.successResponse(res, 'Order canceled successfully', { orderId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    Response.errorResponse(res, error.message || 'Failed to cancel order');
  } finally {
    client.release();
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

    // 1. Cari cart user
    const cart = await cartsModel.getOrCreateCart(userId);
    if (!cart) {
      return Response.errorResponse(res, 'Cart not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    // 2. Cek item active di cart
    const cartItems = await cartsModel.getCartItems(cart.id);
    if (cartItems.length === 0) {
      return Response.errorResponse(res, 'Cart is empty', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Hitung subtotal
    let subtotal = 0;
    for (const item of cartItems) {
      subtotal += item.price * item.qty;
    }

    // 3. Buat order dengan status in_progress
    const orderData = {
      id_cart: cart.id,
      status: 'in_progress',
      checkout_step: 'init',
      subtotal: subtotal
    };
    const order = await ordersModel.createOrder(orderData);

    // 4. Buat order items (snapshot produk)
    const orderItemsData = cartItems.map(item => ({
      id_product: item.id_product,
      product_name_snapshot: item.product_name,
      price_snapshot: item.price,
      qty: item.qty,
    }));
    await orderItemsModel.createOrderItems(order.id, orderItemsData);

    // Ambil order items
    const orderItems = await orderItemsModel.getOrderItems(order.id);
    if (!orderItems || orderItems.length === 0) {
      return Response.errorResponse(res, 'No items in order', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Update status cart items menjadi 'checkout'
    const productIds = orderItems.map(item => item.id_product);
    if (order.id_cart) {
      await cartsModel.updateItemStatus(order.id_cart, productIds, 'checkout');
    }

    Response.successResponse(
      res,
      'Order created successfully. Please complete checkout steps.',
      order,
      constants.HTTP_STATUS_CREATED
    );
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to create order', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

export async function updateAddress(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);

    const { address } = req.body;
    if (!address) {
      return Response.errorResponse(res, 'Address is required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Verifikasi order milik user dan status in_progress
    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    if (order.status !== 'in_progress') {
      return Response.errorResponse(res, 'Order cannot be updated', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const updated = await ordersModel.updateOrderAddress(orderId, address);
    Response.successResponse(res, 'Address updated successfully', updated);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update address', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updateShipping(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);

    const { shippingId } = req.body;
    if (!shippingId) {
      return Response.errorResponse(res, 'shippingId is required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Validasi shipping method
    const shipping = await methodShippingsModel.getShippingMethodById(shippingId);
    if (!shipping) {
      return Response.errorResponse(res, 'Shipping method not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    if (order.status !== 'in_progress') {
      return Response.errorResponse(res, 'Order cannot be updated', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const updated = await ordersModel.updateOrderShipping(orderId, shippingId);
    Response.successResponse(res, 'Shipping method updated successfully', updated);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update shipping', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function updatePayment(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);

    const { paymentId } = req.body;
    if (!paymentId) {
      return Response.errorResponse(res, 'paymentId is required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const payment = await methodPaymentsModel.getPaymentMethodById(paymentId);
    if (!payment) {
      return Response.errorResponse(res, 'Payment method not found', constants.HTTP_STATUS_NOT_FOUND);
    }

    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    if (order.status !== 'in_progress') {
      return Response.errorResponse(res, 'Order cannot be updated', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const updated = await ordersModel.updateOrderPayment(orderId, paymentId);
    Response.successResponse(res, 'Payment method updated successfully', updated);
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to update payment', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function applyVoucher(req, res) {
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);

    const { voucherCode } = req.body;
    if (!voucherCode) {
      return Response.errorResponse(res, 'voucherCode is required', constants.HTTP_STATUS_BAD_REQUEST);
    }

    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    if (order.status !== 'in_progress') {
      return Response.errorResponse(res, 'Order cannot be updated', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Validasi voucher
    const voucher = await vouchersModel.getValidVoucherByCode(voucherCode);
    if (!voucher) {
      return Response.errorResponse(res, 'Voucher invalid or expired', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // Simpan voucher ke order
    const updated = await ordersModel.updateOrderVoucher(orderId, voucher.id);
    Response.successResponse(res, 'Voucher applied successfully', {
      ...updated,
      voucher_applied: voucher,
    });
  } catch (error) {
    console.error(error);
    Response.errorResponse(res, 'Failed to apply voucher', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  }
}

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 */
export async function completeOrder(req, res) {
  const client = await pool.connect();
  try {
    const userId = req.user.userId;
    const orderId = parseInt(req.params.orderId, 10);
    if (isNaN(orderId)) return Response.errorResponse(res, 'Invalid order ID', constants.HTTP_STATUS_BAD_REQUEST);

    // 1. Ambil order dengan user
    const order = await ordersModel.getOrderById(orderId, userId);
    if (!order) return Response.errorResponse(res, 'Unauthorized', constants.HTTP_STATUS_FORBIDDEN);
    if (order.status !== 'in_progress') {
      return Response.errorResponse(res, 'Order is not in progress', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // 2. Validasi semua field harus terisi
    if (!order.address || !order.id_shipping || !order.id_payment) {
      return Response.errorResponse(
        res,
        'Please complete address, shipping, and payment first',
        constants.HTTP_STATUS_BAD_REQUEST
      );
    }

    // 3. Ambil order items
    const orderItems = await orderItemsModel.getOrderItems(orderId);
    if (!orderItems || orderItems.length === 0) {
      return Response.errorResponse(res, 'No items in order', constants.HTTP_STATUS_BAD_REQUEST);
    }

    // 4. Hitung subtotal
    let subtotal = 0;
    for (const item of orderItems) {
      subtotal += item.price_snapshot * item.qty;
    }

    // 5. Cek voucher jika ada
    let discount = 0;
    if (order.id_voucher) {
      const voucher = await vouchersModel.getVoucherById(order.id_voucher);
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
        // Kurangi kuota voucher
        await vouchersModel.decrementVoucherQuota(voucher.id);
      }
    }

    // 6. Dapatkan shipping cost
    const shipping = await methodShippingsModel.getShippingMethodById(order.id_shipping);
    if (!shipping) {
      return Response.errorResponse(res, 'Shipping method not found', constants.HTTP_STATUS_NOT_FOUND);
    }
    const shippingCost = shipping.price;
    const totalPayment = subtotal - discount + shippingCost;

    // 7. Mulai transaksi
    await client.query('BEGIN');

    // 8. Kurangi stok produk
    for (const item of orderItems) {
      const product = await productModel.getProductById(item.id_product);
      if (!product || product.stock < item.qty) {
        throw new Error(`Insufficient stock for product ${item.id_product}`);
      }
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.qty, item.id_product]
      );
    }

    // 9. Update status cart items menjadi 'checkout'
    const productIds = orderItems.map(item => item.id_product);
    if (order.id_cart) {
      await cartsModel.updateItemStatus(order.id_cart, productIds, 'checkout');
    }
    console.log(orderId)

    // 10. Buat payment transaction
    const transactionData = {
      id_order: orderId,
      id_method_payment: order.id_payment,
      reference_number: `TRX${Date.now()}${Math.floor(Math.random() * 1000)}`,
      amount: totalPayment,
    };
    await paymentTransactionsModel.createPaymentTransaction(transactionData);

    // 11. Complete order
    const completeData = {
      orderId,
      subtotal,
      discount,
      shipping_cost: shippingCost,
      total_payment: totalPayment,
    };
    const updatedOrder = await ordersModel.confirmOrder(completeData);

    await client.query('COMMIT');

    Response.successResponse(res, 'Checkout completed successfully!', updatedOrder);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    Response.errorResponse(res, error.message || 'Failed to complete checkout', constants.HTTP_STATUS_INTERNAL_SERVER_ERROR);
  } finally {
    client.release();
  }
}