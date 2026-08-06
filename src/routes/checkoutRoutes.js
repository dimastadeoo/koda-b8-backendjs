import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getPaymentMethods,
  getShippingMethods,
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
 *     description: Retrieve list of active payment methods (BANK, EWALLET, RETAIL).
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
 *                       name:
 *                         type: string
 *                       payment_type:
 *                         type: string
 *                         enum: [BANK, EWALLET, RETAIL]
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
 *     description: Retrieve list of active shipping methods with prices.
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
 *                       name:
 *                         type: string
 *                       price:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/shipping-methods", getShippingMethods);


export default router;