import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/adminMiddleware.js";
import { uploadProductImages } from "../lib/uploads.js";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRoles,
} from "../controllers/usersController.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
} from "../controllers/productsController.js";

import {
  updateOrderStatus,
  getOrdersAdmin
} from "../controllers/ordersControllers.js"

const router = Router();

// Semua route admin membutuhkan authentication + admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get all users
 *     description: Retrieve a list of all users with their roles and creator info. Admin only.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                   example: Users retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       hp_number:
 *                         type: string
 *                         nullable: true
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       role_id:
 *                         type: integer
 *                       role_name:
 *                         type: string
 *                       created_by_email:
 *                         type: string
 *                       created_by_id:
 *                         type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       500:
 *         description: Internal server error
 */
router.get("/users", getUsers);

/**
 * @openapi
 * /admin/users/{id}:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get user by ID
 *     description: Retrieve detailed information of a specific user. Admin only.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *         example: 5
 *     responses:
 *       200:
 *         description: User retrieved successfully
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
 *                   example: User retrieved successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     hp_number:
 *                       type: string
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     role_id:
 *                       type: integer
 *                     role_name:
 *                       type: string
 *                     created_by_email:
 *                       type: string
 *                     created_by_id:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get("/users/:id", getUserById);

/**
 * @openapi
 * /admin/users:
 *   post:
 *     tags:
 *       - Admin - Users
 *     summary: Create a new user
 *     description: Create a user with specific role. Admin only. Password, email, name, and roleName are required.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - roleName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email
 *                 example: staff@belimudah.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Password (min 6 chars)
 *                 example: 12345678
 *               name:
 *                 type: string
 *                 description: Full name
 *                 example: Staff Toko
 *               hp_number:
 *                 type: string
 *                 description: Phone number (optional, unique)
 *                 example: 081234567891
 *               roleName:
 *                 type: string
 *                 enum: [admin, customer, staff]
 *                 description: Role to assign
 *                 example: staff
 *     responses:
 *       201:
 *         description: User created successfully
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
 *                   example: User created successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     hp_number:
 *                       type: string
 *                     role:
 *                       type: string
 *                     created_by:
 *                       type: integer
 *       400:
 *         description: Missing required fields or invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       409:
 *         description: Email already exists
 *       500:
 *         description: Internal server error
 */
router.post("/users", createUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     tags:
 *       - Admin - Users
 *     summary: Update user
 *     description: Update user's email, phone, or role. Admin only. At least one field is required.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to update
 *         example: 5
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: New email
 *                 example: newstaff@belimudah.com
 *               hp_number:
 *                 type: string
 *                 description: New phone number
 *                 example: 081234567892
 *               roleName:
 *                 type: string
 *                 enum: [admin, customer, staff]
 *                 description: New role
 *                 example: customer
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *                   example: User updated successfully
 *                 results:
 *                   $ref: '#/components/schemas/UserWithRole'
 *       400:
 *         description: No fields to update or invalid role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.patch("/users/:id", updateUser);

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin - Users
 *     summary: Delete user
 *     description: Delete a user. Admin cannot delete themselves.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID to delete
 *         example: 6
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *                   example: User deleted successfully
 *                 results:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Cannot delete yourself
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.delete("/users/:id", deleteUser);

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     tags:
 *       - Admin - Users
 *     summary: Get all roles
 *     description: Retrieve list of available roles. Admin only.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
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
 *                   example: Roles retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       500:
 *         description: Internal server error
 */
router.get("/roles", getRoles);

// ==================== PRODUCT MANAGEMENT ====================

/**
 * @openapi
 * /admin/products:
 *   post:
 *     tags:
 *       - Admin - Products
 *     summary: Create a new product (with images)
 *     description: Create a product with multiple images. Admin only.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - id_merk
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *                 example: Samsung Galaxy S25 Ultra
 *               price:
 *                 type: integer
 *                 description: Product price
 *                 example: 19000000
 *               stock:
 *                 type: integer
 *                 description: Stock quantity
 *                 example: 50
 *               id_merk:
 *                 type: integer
 *                 description: Merk ID
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: Product description
 *                 example: Smartphone flagship dengan kamera 200MP
 *               categories:
 *                 type: string
 *                 description: Comma-separated category IDs
 *                 example: 1,3,5
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Product images (multiple files, max 5MB each)
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       500:
 *         description: Internal server error
 */
router.post("/products", uploadProductImages, createProduct);

/**
 * @openapi
 * /admin/products/{id}:
 *   patch:
 *     tags:
 *       - Admin - Products
 *     summary: Update product details
 *     description: Update product information (name, price, stock, merk, description, categories). Admin only.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: integer
 *               stock:
 *                 type: integer
 *               id_merk:
 *                 type: integer
 *               description:
 *                 type: string
 *               categories:
 *                 type: string
 *                 description: Comma-separated category IDs to replace existing
 *                 example: 2,4
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.patch("/products/:id", updateProduct);

/**
 * @openapi
 * /admin/products/{id}:
 *   delete:
 *     tags:
 *       - Admin - Products
 *     summary: Delete a product
 *     description: Delete product and all its images (files removed). Admin only.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 10
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete("/products/:id", deleteProduct);

/**
 * @openapi
 * /admin/products/{id}/images:
 *   post:
 *     tags:
 *       - Admin - Products
 *     summary: Add images to existing product
 *     description: Upload one or more images for a product. Admin only.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *         example: 10
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Image files (max 5MB each)
 *     responses:
 *       200:
 *         description: Images added successfully
 *       400:
 *         description: No images uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.post("/products/:id/images", uploadProductImages, addProductImages);

/**
 * @openapi
 * /admin/products/images/{imageId}:
 *   delete:
 *     tags:
 *       - Admin - Products
 *     summary: Delete a product image
 *     description: Remove a specific image from a product. The file will be deleted from server.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Image ID
 *         example: 42
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Image not found
 *       500:
 *         description: Internal server error
 */
router.delete("/products/images/:imageId", deleteProductImage);

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     tags:
 *       - Admin - Orders
 *     summary: Get all orders (admin)
 *     description: Retrieve all orders with user details. Admin only.
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
 *                 message:
 *                   type: string
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
 *                         enum: [in_progress, pending, paid, shipping, delivered, canceled, refunded]
 *                       checkout_step:
 *                         type: string
 *                         enum: [init, address, shipping, payment, done]
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *                       user_email:
 *                         type: string
 *                       user_phone:
 *                         type: string
 *                         nullable: true
 *                       shipping_name:
 *                         type: string
 *                       shipping_price:
 *                         type: integer
 *                       payment_name:
 *                         type: string
 *                       payment_type:
 *                         type: string
 *                       voucher_code:
 *                         type: string
 *                         nullable: true
 *                       voucher_type:
 *                         type: string
 *                         nullable: true
 *                       voucher_value:
 *                         type: integer
 *                         nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       500:
 *         description: Internal server error
 */
router.get("/orders", getOrdersAdmin);

/**
 * @openapi
 * /admin/orders/{orderId}/status:
 *   patch:
 *     tags:
 *       - Admin - Orders
 *     summary: Update order status
 *     description: Update the status of an order. Admin only.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *         example: 5
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
 *                 enum: [in_progress, pending, paid, shipping, delivered, canceled, refunded]
 *                 description: New order status
 *                 example: shipping
 *     responses:
 *       200:
 *         description: Order status updated successfully
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
 *                   example: Order status updated successfully
 *                 results:
 *                   $ref: '#/components/schemas/OrderDetail'
 *       400:
 *         description: Invalid status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden – admin only
 *       404:
 *         description: Order not found
 *       500:
 *         description: Internal server error
 */
router.patch("/orders/:orderId/status", updateOrderStatus);

export default router;