import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  getWishlist,
  addWishlist,
  removeWishlist,
} from "../controllers/whislistController.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get user wishlist
 *     description: Retrieve all products in the authenticated user's wishlist with product details and primary image.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Wishlist retrieved successfully
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
 *                   example: Wishlist retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_product:
 *                         type: integer
 *                       added_at:
 *                         type: string
 *                         format: date-time
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       price:
 *                         type: integer
 *                       stock:
 *                         type: integer
 *                       description:
 *                         type: string
 *                         nullable: true
 *                       merk_id:
 *                         type: integer
 *                         nullable: true
 *                       merk_name:
 *                         type: string
 *                         nullable: true
 *                       primary_image:
 *                         type: string
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       500:
 *         description: Internal server error
 */
router.get("/", getWishlist);

/**
 * @openapi
 * /wishlist:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add product to wishlist
 *     description: Add a product to the authenticated user's wishlist. If the product is already in the wishlist, returns a 409 conflict.
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
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product to add
 *                 example: 1
 *     responses:
 *       201:
 *         description: Product added to wishlist
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
 *                   example: Product added to wishlist
 *                 results:
 *                   type: object
 *                   properties:
 *                     id_profile:
 *                       type: integer
 *                     id_product:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: productId is required
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 *       409:
 *         description: Product already in wishlist
 *       500:
 *         description: Internal server error
 */
router.post("/", addWishlist);

/**
 * @openapi
 * /wishlist/{productId}:
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove product from wishlist
 *     description: Remove a specific product from the authenticated user's wishlist by product ID.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product to remove from wishlist
 *     responses:
 *       200:
 *         description: Product removed from wishlist
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
 *                   example: Product removed from wishlist
 *                 results:
 *                   type: object
 *                   properties:
 *                     id_profile:
 *                       type: integer
 *                     id_product:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid product ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not in wishlist or profile not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:productId", removeWishlist);

export default router;