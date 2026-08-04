import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setPrimaryAddress
} from "../controllers/addressController.js";

const router = Router();

// Semua route memerlukan autentikasi
router.use(authenticate);

/**
 * @openapi
 * /addresses:
 *   get:
 *     tags:
 *       - Address
 *     summary: Get all addresses for authenticated user
 *     description: Retrieve all addresses belonging to the authenticated user.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
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
 *                   example: Addresses retrieved successfully
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       id_profile:
 *                         type: integer
 *                       label:
 *                         type: string
 *                         nullable: true
 *                       receiver_name:
 *                         type: string
 *                       detail_address:
 *                         type: string
 *                       province:
 *                         type: string
 *                       city:
 *                         type: string
 *                       district:
 *                         type: string
 *                       village:
 *                         type: string
 *                       is_primary:
 *                         type: boolean
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       updated_at:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get("/", getAddresses);

/**
 * @openapi
 * /addresses:
 *   post:
 *     tags:
 *       - Address
 *     summary: Create a new address
 *     description: Add a new address for the authenticated user. If no primary address exists, this address will be set as primary.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_name
 *               - detail_address
 *               - province
 *               - city
 *               - district
 *               - village
 *             properties:
 *               label:
 *                 type: string
 *                 description: Label for the address (e.g., "Rumah", "Kantor")
 *                 example: Rumah
 *               receiver_name:
 *                 type: string
 *                 description: Full name of the receiver
 *                 example: Dimas Pratama
 *               detail_address:
 *                 type: string
 *                 description: Complete address detail (street, RT/RW, etc.)
 *                 example: Jl. Kebon Jeruk No. 12, RT 05 RW 03
 *               province:
 *                 type: string
 *                 description: Province name
 *                 example: DKI Jakarta
 *               city:
 *                 type: string
 *                 description: City or regency name
 *                 example: Jakarta Selatan
 *               district:
 *                 type: string
 *                 description: District name (Kecamatan)
 *                 example: Kebayoran Baru
 *               village:
 *                 type: string
 *                 description: Village or sub-district name (Kelurahan)
 *                 example: Cipete Utara
 *     responses:
 *       201:
 *         description: Address created successfully
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
 *                   example: Address created successfully
 *                 results:
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 */
router.post("/", createAddress);

/**
 * @openapi
 * /addresses/{id}:
 *   patch:
 *     tags:
 *       - Address
 *     summary: Update an address
 *     description: Update an existing address. All fields are optional, but at least one field must be provided.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *                 description: Label for the address
 *                 example: Kantor
 *               receiver_name:
 *                 type: string
 *                 description: Full name of the receiver
 *                 example: Dimas Pratama
 *               detail_address:
 *                 type: string
 *                 description: Complete address detail
 *                 example: Jl. Sudirman No. 45, RT 10 RW 05
 *               province:
 *                 type: string
 *                 description: Province name
 *                 example: DKI Jakarta
 *               city:
 *                 type: string
 *                 description: City or regency name
 *                 example: Jakarta Pusat
 *               district:
 *                 type: string
 *                 description: District name
 *                 example: Tanah Abang
 *               village:
 *                 type: string
 *                 description: Village or sub-district name
 *                 example: Kebon Melati
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
 *                   $ref: '#/components/schemas/Address'
 *       400:
 *         description: No fields provided or invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.patch("/:id", updateAddress);

/**
 * @openapi
 * /addresses/{id}:
 *   delete:
 *     tags:
 *       - Address
 *     summary: Delete an address
 *     description: Delete an address by ID. Address must belong to the authenticated user.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID
 *     responses:
 *       200:
 *         description: Address deleted successfully
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
 *                   example: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.delete("/:id", deleteAddress);

/**
 * @openapi
 * /addresses/{id}/primary:
 *   patch:
 *     tags:
 *       - Address
 *     summary: Set address as primary
 *     description: Set a specific address as primary. All other addresses for this user will be set to non-primary.
 *     security:
 *       - token: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Address ID to set as primary
 *     responses:
 *       200:
 *         description: Address set as primary successfully
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
 *                   example: Address set as primary successfully
 *                 results:
 *                   $ref: '#/components/schemas/Address'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.patch("/:id/primary", setPrimaryAddress);

export default router;