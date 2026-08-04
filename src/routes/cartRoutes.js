import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  updateItemStatus,
} from "../controllers/cartsController.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get user's cart
 *     description: Retrieve the current user's cart with all cart items and product details.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Cart retrieved successfully
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
 *                   example: Cart retrieved successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id_product:
 *                             type: integer
 *                           qty:
 *                             type: integer
 *                           status:
 *                             type: string
 *                             enum: [active, not checked, checkout, sold out, not found]
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               price:
 *                                 type: integer
 *                               stock:
 *                                 type: integer
 *                               primary_image:
 *                                 type: string
 *                                 nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart not found
 */
router.get("/", getCart);

/**
 * @openapi
 * /cart:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add product to cart
 *     description: Add a product to the user's cart. If cart doesn't exist, it will be created automatically. If product already in cart, quantity will be increased.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - qty
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product to add
 *                 example: 1
 *               qty:
 *                 type: integer
 *                 description: Quantity to add (must be > 0)
 *                 example: 2
 *     responses:
 *       200:
 *         description: Product added to cart successfully
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
 *                   example: Product added to cart
 *                 results:
 *                   type: object
 *                   properties:
 *                     id_product:
 *                       type: integer
 *                     qty:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: active
 *       400:
 *         description: Missing productId or qty, or qty invalid
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post("/", addToCart);

/**
 * @openapi
 * /cart/{productId}:
 *   patch:
 *     tags:
 *       - Cart
 *     summary: Update cart item quantity
 *     description: Update the quantity of a specific product in the user's cart.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - qty
 *             properties:
 *               qty:
 *                 type: integer
 *                 description: New quantity (must be > 0)
 *                 example: 3
 *     responses:
 *       200:
 *         description: Cart item updated successfully
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
 *                   example: Cart item updated
 *                 results:
 *                   type: object
 *                   properties:
 *                     id_product:
 *                       type: integer
 *                     qty:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: active
 *       400:
 *         description: Missing qty or invalid quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.patch("/:productId", updateCartItem);

/**
 * @openapi
 * /cart/{productId}:
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Remove product from cart
 *     description: Remove a specific product from the user's cart.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to remove
 *     responses:
 *       200:
 *         description: Product removed from cart
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
 *                   example: Product removed from cart
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.delete("/:productId", removeFromCart);

/**
 * @openapi
 * /cart/{productId}/status:
 *   patch:
 *     tags:
 *       - Cart
 *     summary: Update cart item status
 *     description: Update the status of a specific cart item (e.g., active, checkout, not checked, sold out, not found).
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to update status
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, not checked, checkout, sold out, not found]
 *                 description: New status for the cart item
 *                 example: checkout
 *     responses:
 *       200:
 *         description: Cart item status updated successfully
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
 *                   example: Cart item status updated
 *                 results:
 *                   type: object
 *                   properties:
 *                     id_product:
 *                       type: integer
 *                     qty:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       example: checkout
 *       400:
 *         description: Missing status or invalid status value
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found in cart
 *       500:
 *         description: Internal server error
 */
router.patch("/:productId/status", updateItemStatus);

export default router;