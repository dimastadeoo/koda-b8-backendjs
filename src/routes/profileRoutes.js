import { Router } from "express";
import { authenticate } from "../middlewares/authMiddleware.js";
import { updateEmail, updatePassword } from '../controllers/usersController.js';
import { getProfile, updateProfile, uploadPicture } from "../controllers/profileController.js";
import { uploadProfilePicture } from "../lib/uploads.js";

const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /profile:
 *   get:
 *     tags:
 *       - Profile
 *     summary: Get user profile
 *     description: Retrieve the profile of the authenticated user.
 *     security:
 *       - token: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     id_user:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     gender:
 *                       type: string
 *                       nullable: true
 *                     picture:
 *                       type: string
 *                       nullable: true
 *                     place_birth:
 *                       type: string
 *                       nullable: true
 *                     date_birth:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     updated_at:
 *                       type: string
 *                       format: date-time
 *                     email:
 *                       type: string
 *                     no_hp:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Profile not found
 */
router.get("/", getProfile);

/**
 * @openapi
 * /profile:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user profile (except picture)
 *     description: Update name, gender, place of birth, date of birth, and phone number. Phone number must be unique if provided.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Full name
 *                 example: Dimas Pratama
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: Gender (optional)
 *                 example: male
 *               place_birth:
 *                 type: string
 *                 description: Place of birth (optional)
 *                 example: Jakarta
 *               date_birth:
 *                 type: string
 *                 format: date
 *                 description: Date of birth in YYYY-MM-DD format (optional)
 *                 example: 1990-01-01
 *               no_hp:
 *                 type: string
 *                 description: Phone number (optional, must be unique)
 *                 example: 08123456789
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       201:
 *         description: Profile created successfully
 *       400:
 *         description: Bad request - missing name or duplicate phone number
 *       401:
 *         description: Unauthorized
 */
router.patch("/", updateProfile);

/**
 * @openapi
 * /profile/email:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user email
 *     description: Change the email address. New email must be unique.
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
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: newemail@mail.com
 *     responses:
 *       200:
 *         description: Email updated successfully
 *       400:
 *         description: Email is required or email already exists
 *       401:
 *         description: Unauthorized
 */
router.patch('/email', updateEmail);

/**
 * @openapi
 * /profile/password:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Update user password
 *     description: Change password. Requires current password and new password (min 6 characters).
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 description: Current password
 *                 example: oldPass123
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: New password (min 6 characters)
 *                 example: newPass456
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid request
 *       401:
 *         description: Current password is incorrect or unauthorized
 */
router.patch('/password', updatePassword);

/**
 * @openapi
 * /profile/picture:
 *   patch:
 *     tags:
 *       - Profile
 *     summary: Upload profile picture
 *     description: >
 *       Upload a new profile picture. The old picture will be automatically deleted.
 *       Supported formats: jpg, jpeg, png, gif, webp. Max file size: 5MB.
 *     security:
 *       - token: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - picture
 *             properties:
 *               picture:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Picture uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       401:
 *         description: Unauthorized
 *       413:
 *         description: File too large (max 5MB)
 */
router.patch('/picture', uploadProfilePicture, uploadPicture);

export default router;