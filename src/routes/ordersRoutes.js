import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getOrders,
  getOrderDetail,
} from "../controllers/ordersControllers.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /orders:
 *   get:
 *     tags:
 *       - Orders
 *     summary: Get all orders for authenticated user
 *     description: Retrieve all orders belonging to the authenticated user with shipping and payment details. Sorted by creation date descending.
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       id_cart:
 *                         type: integer
 *                       id_shipping:
 *                         type: integer
 *                       id_payment:
 *                         type: integer
 *                       id_voucher:
 *                         type: integer
 *                         nullable: true
 *                       address:
 *                         type: string
 *                       subtotal:
 *                         type: integer
 *                       discount:
 *                         type: integer
 *                       shipping_cost:
 *                         type: integer
 *                       total_payment:
 *                         type: integer
 *                       status:
 *                         type: string
 *                         enum: [pending, paid, shipping, delivered, canceled, refunded]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       shipping_name:
 *                         type: string
 *                       shipping_price:
 *                         type: integer
 *                       payment_name:
 *                         type: string
 *                       payment_type:
 *                         type: string
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
 *     description: Retrieve detailed information about a specific order including order items, shipping, payment, and voucher information (if applied).
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     id_cart:
 *                       type: integer
 *                     id_shipping:
 *                       type: integer
 *                     id_payment:
 *                       type: integer
 *                     id_voucher:
 *                       type: integer
 *                       nullable: true
 *                     address:
 *                       type: string
 *                     subtotal:
 *                       type: integer
 *                     discount:
 *                       type: integer
 *                     shipping_cost:
 *                       type: integer
 *                     total_payment:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [pending, paid, shipping, delivered, canceled, refunded]
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     shipping_name:
 *                       type: string
 *                     shipping_price:
 *                       type: integer
 *                     payment_name:
 *                       type: string
 *                     payment_type:
 *                       type: string
 *                     voucher_code:
 *                       type: string
 *                       nullable: true
 *                     voucher_type:
 *                       type: string
 *                       enum: [percentage, fixed]
 *                       nullable: true
 *                     voucher_value:
 *                       type: integer
 *                       nullable: true
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_product:
 *                             type: integer
 *                           product_name_snapshot:
 *                             type: string
 *                           price_snapshot:
 *                             type: integer
 *                           qty:
 *                             type: integer
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid order ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found or does not belong to user
 *       500:
 *         description: Internal server error
 */
router.get("/:orderId", getOrderDetail);

export default router;