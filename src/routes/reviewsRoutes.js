import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
  createReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /reviews:
 *   post:
 *     tags:
 *       - Reviews
 *     summary: Create a new review
 *     description: Add a review for a product. User can only review once per product.
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
 *               - stars
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product to review
 *                 example: 1
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Rating stars (1-5)
 *                 example: 5
 *               review:
 *                 type: string
 *                 description: Review text (optional)
 *                 example: "This product is amazing!"
 *     responses:
 *       201:
 *         description: Review created successfully
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
 *                   example: Review created successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     id_product:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     stars:
 *                       type: integer
 *                     review:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Missing required fields, invalid stars, or already reviewed
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post("/", createReview);

/**
 * @openapi
 * /reviews/{id}:
 *   patch:
 *     tags:
 *       - Reviews
 *     summary: Update a review
 *     description: Update stars and/or review text. User can only update their own review.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the review to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: New rating stars (1-5)
 *                 example: 4
 *               review:
 *                 type: string
 *                 description: New review text (or empty to clear)
 *                 example: "Updated: still good but battery life could be better."
 *     responses:
 *       200:
 *         description: Review updated successfully
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
 *                   example: Review updated successfully
 *                 results:
 *                   $ref: '#/components/schemas/Review'
 *       400:
 *         description: No fields provided or invalid stars
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You are not authorized to update this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", updateReview);

/**
 * @openapi
 * /reviews/{id}:
 *   delete:
 *     tags:
 *       - Reviews
 *     summary: Delete a review
 *     description: Delete a review by ID. User can only delete their own review.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
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
 *                   example: Review deleted successfully
 *                 results:
 *                   type: null
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: You are not authorized to delete this review
 *       404:
 *         description: Review not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteReview);

export default router;