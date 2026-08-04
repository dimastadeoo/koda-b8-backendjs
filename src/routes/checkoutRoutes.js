import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getPaymentMethods,
  getShippingMethods,
  createOrder,
} from "../controllers/checkoutController.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /checkout/payment-methods:
 *   get:
 *     tags:
 *       - Checkout
 *     summary: Get active payment methods
 *     description: Retrieve list of all active payment methods (BANK, EWALLET, RETAIL, etc.) available for checkout.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
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
 *                   example: Payment methods retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: BCA Transfer
 *                       payment_type:
 *                         type: string
 *                         enum: [BANK, EWALLET, RETAIL]
 *                         example: BANK
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/payment-methods", getPaymentMethods);

/**
 * @openapi
 * /checkout/shipping-methods:
 *   get:
 *     tags:
 *       - Checkout
 *     summary: Get active shipping methods
 *     description: Retrieve list of all active shipping methods with their prices for checkout.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Shipping methods retrieved successfully
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
 *                   example: Shipping methods retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: JNE Reguler
 *                       price:
 *                         type: integer
 *                         example: 20000
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/shipping-methods", getShippingMethods);

/**
 * @openapi
 * /checkout:
 *   post:
 *     tags:
 *       - Checkout
 *     summary: Create an order from cart
 *     description: Checkout the user's active cart and create an order. Cart items will be moved to order_items and cart items status changed to 'checkout'. Product stock will be reduced.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - shippingId
 *               - paymentId
 *               - address
 *             properties:
 *               shippingId:
 *                 type: integer
 *                 description: ID of shipping method
 *                 example: 1
 *               paymentId:
 *                 type: integer
 *                 description: ID of payment method
 *                 example: 2
 *               voucherId:
 *                 type: integer
 *                 description: ID of voucher to apply (optional)
 *                 example: 1
 *               address:
 *                 type: string
 *                 description: Complete shipping address
 *                 example: Jl. Kebon Jeruk No. 12, RT 05 RW 03, Jakarta Selatan, 12190
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     id_cart:
 *                       type: integer
 *                       example: 5
 *                     id_shipping:
 *                       type: integer
 *                       example: 1
 *                     id_payment:
 *                       type: integer
 *                       example: 2
 *                     id_voucher:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     address:
 *                       type: string
 *                       example: Jl. Kebon Jeruk No. 12, Jakarta Selatan
 *                     subtotal:
 *                       type: integer
 *                       example: 500000
 *                     discount:
 *                       type: integer
 *                       example: 0
 *                     shipping_cost:
 *                       type: integer
 *                       example: 20000
 *                     total_payment:
 *                       type: integer
 *                       example: 520000
 *                     status:
 *                       type: string
 *                       enum: [pending, paid, shipping, delivered, canceled, refunded]
 *                       example: pending
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields, cart is empty, or voucher invalid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found, shipping method not found, or payment method not found
 *       500:
 *         description: Internal server error
 */
router.post("/", createOrder);

export default router;