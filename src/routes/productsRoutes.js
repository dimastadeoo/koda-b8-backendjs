import { Router } from "express";
import {
    getProducts,
    getProductById,
    getMerks,
    getCategories,
} from "../controllers/productsController.js";
import { getProductReviews } from "../controllers/reviewsController.js";

const router = Router();

/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products with filters, search, and pagination
 *     description: |
 *       Retrieve a list of products. Supports filtering by category, merk, price range,
 *       and search by product name, merk name, or category name using bracket notation.
 *       Sorting is also available via bracket notation.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID
 *       - in: query
 *         name: merk
 *         schema:
 *           type: integer
 *         description: Filter by merk (brand) ID
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: integer
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: integer
 *         description: Maximum price filter
 *       - in: query
 *         name: search[name]
 *         schema:
 *           type: string
 *         description: Search by product name (case-insensitive, partial match)
 *         style: form
 *         explode: false
 *         example: "laptop"
 *       - in: query
 *         name: search[merk]
 *         schema:
 *           type: string
 *         description: Search by merk name (case-insensitive, partial match)
 *         style: form
 *         explode: false
 *         example: "samsung"
 *       - in: query
 *         name: search[categorie]
 *         schema:
 *           type: string
 *         description: Search by category name (case-insensitive, partial match)
 *         style: form
 *         explode: false
 *         example: "smartphone"
 *       - in: query
 *         name: sort[price]
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort by price (ascending/descending)
 *         style: form
 *         explode: false
 *       - in: query
 *         name: sort[name]
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort by product name (ascending/descending)
 *         style: form
 *         explode: false
 *       - in: query
 *         name: sort[created_at]
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort by created date (ascending/descending)
 *         style: form
 *         explode: false
 *     responses:
 *       200:
 *         description: Products retrieved successfully
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
 *                   example: Products retrieved successfully
 *                 results:
 *                   $ref: '#/components/schemas/Product'
 *       500:
 *         description: Internal server error
 */
router.get("", getProducts);



/**
 * @openapi
 * /products/merks:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all merks (brands)
 *     description: Retrieve a list of all available merks/brands.
 *     responses:
 *       200:
 *         description: Merks retrieved successfully
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
 *                   example: Merks retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       info:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get("/merks", getMerks);

/**
 * @openapi
 * /products/categories:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all categories
 *     description: Retrieve a list of all available categories with their images.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                   example: Categories retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       url_img:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get("/categories", getCategories);

/**
 * @openapi
 * /products/{id}/reviews:
 *   get:
 *     tags:
 *       - Products
 *       - Reviews
 *     summary: Get reviews for a product
 *     description: Retrieve all reviews for a specific product with pagination and rating statistics. Public endpoint.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
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
 *                   example: Reviews retrieved successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     reviews:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           stars:
 *                             type: integer
 *                           review:
 *                             type: string
 *                             nullable: true
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           updated_at:
 *                             type: string
 *                             format: date-time
 *                           user_id:
 *                             type: integer
 *                           user_email:
 *                             type: string
 *                           user_name:
 *                             type: string
 *                     stats:
 *                       type: object
 *                       properties:
 *                         avg_rating:
 *                           type: number
 *                           format: float
 *                         total_reviews:
 *                           type: integer
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id/reviews", getProductReviews);

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get product by ID
 *     description: Retrieve detailed information about a specific product including specifications.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Product retrieved successfully
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
 *                   example: Product retrieved successfully
 *                 results:
 *                   $ref: '#/components/schemas/ProductDetail'
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getProductById);

export default router;