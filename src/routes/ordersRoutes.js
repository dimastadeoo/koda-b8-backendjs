import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getOrders,
  getOrderDetail,
  cancelOrder,
  updateAddress,
  updateShipping,
  updatePayment,
  createOrder,
  completeOrder,
  applyVoucher,
} from "../controllers/ordersControllers.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Create a new order from active cart
 *     description: |
 *       Create a new order from the user's active cart (items with status 'active').
 *       - Order status will be set to 'in_progress'
 *       - checkout_step will be 'init'
 *       - Subtotal will be calculated from cart items
 *       - Cart items will be moved to order_items and status changed to 'checkout'
 *       - Product stock will be reduced
 *     security:
 *       - token: []
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order created successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Cart is empty or no active items
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 *       500:
 *         description: Internal server error
 */
router.post("/", createOrder);

/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders for authenticated user
 *     description: Retrieve all orders belonging to the authenticated user, sorted by created date descending.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Orders retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderDetail'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", getOrders);

/**
 * @openapi
 * /orders/{orderId}:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get order detail by ID
 *     description: Retrieve detailed information about a specific order including order items, voucher, and checkout progress.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Order detail retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order detail retrieved successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.get("/:orderId", getOrderDetail);

/**
 * @openapi
 * /orders/{orderId}/cancel:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Cancel an order
 *     description: |
 *       Cancel an order. Only orders with status 'in_progress' or 'pending' can be canceled.
 *       - Product stock will be restored.
 *       - Cart items will be reactivated (status set to 'active').
 *       - Order status will be updated to 'canceled'.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID to cancel
 *         example: 1
 *     responses:
 *       200:
 *         description: Order canceled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order canceled successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     orderId:
 *                       type: integer
 *       400:
 *         description: Invalid order ID or order cannot be canceled (status not in_progress/pending)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/cancel", cancelOrder);

/**
 * @openapi
 * /orders/{orderId}/address:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update order address
 *     description: |
 *       Update shipping address for an order. Order must have status 'in_progress'.
 *       - checkout_step will be updated to 'address'
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: Complete shipping address
 *                 example: Jl. Kebon Jeruk No. 12, RT 05 RW 03, Jakarta Selatan
 *     responses:
 *       200:
 *         description: Address updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Address updated successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Missing address or order not in progress
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/address", updateAddress);

/**
 * @openapi
 * /orders/{orderId}/shipping:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update shipping method
 *     description: |
 *       Update shipping method for an order. Order must have status 'in_progress'.
 *       - checkout_step will be updated to 'shipping'
 *       - shipping_cost will be applied to total calculation
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - shippingId
 *             properties:
 *               shippingId:
 *                 type: integer
 *                 description: ID of shipping method
 *                 example: 1
 *     responses:
 *       200:
 *         description: Shipping method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Shipping method updated successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Missing shippingId or order not in progress
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order or shipping method not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/shipping", updateShipping);

/**
 * @openapi
 * /orders/{orderId}/payment:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Update payment method
 *     description: |
 *       Update payment method for an order. Order must have status 'in_progress'.
 *       - checkout_step will be updated to 'payment'
 *       - A payment transaction with status 'pending' will be created
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *             properties:
 *               paymentId:
 *                 type: integer
 *                 description: ID of payment method
 *                 example: 2
 *     responses:
 *       200:
 *         description: Payment method updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment method updated successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Missing paymentId or order not in progress
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order or payment method not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/payment", updatePayment);

/**
 * @openapi
 * /orders/{orderId}/voucher:
 *   patch:
 *     tags:
 *       - Orders
 *     summary: Apply voucher to order
 *     description: |
 *       Apply a voucher code to the order. Order must have status 'in_progress'.
 *       - Voucher must be valid (not expired, quota > 0, meet min_purchase)
 *       - Discount will be calculated and total_payment will be updated
 *       - If voucher already applied, it will be replaced with the new one
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - voucherCode
 *             properties:
 *               voucherCode:
 *                 type: string
 *                 description: Voucher code to apply (e.g., 'HEMAT10')
 *                 example: HEMAT10
 *     responses:
 *       200:
 *         description: Voucher applied successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Voucher applied successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Missing voucherCode, invalid voucher, or order not in progress
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order not found or voucher not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:orderId/voucher", applyVoucher);

/**
 * @openapi
 * /orders/{orderId}/complete:
 *   post:
 *     tags:
 *       - Orders
 *     summary: Complete checkout and finalize order
 *     description: |
 *       Finalize the checkout process. Order must have status 'in_progress' and checkout_step = 'payment'.
 *       - Order status will be updated to 'pending'
 *       - checkout_step will be updated to 'done'
 *       - Payment transaction status will be updated to 'success' (or remain 'pending' depending on payment method)
 *       - All order details must be completed (address, shipping, payment)
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID to complete
 *         example: 1
 *     responses:
 *       200:
 *         description: Order completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Order completed successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Order not in progress or checkout incomplete (missing address/shipping/payment)
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – order does not belong to user
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.post("/:orderId/complete", completeOrder);

export default router;