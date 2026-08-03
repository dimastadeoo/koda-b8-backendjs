import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();
/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *      - Auth
 *     description: Register New User!
 *     requestBody:
 *       description: Input Form to add New User
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             required:
 *              - name
 *              - email
 *              - password
 *             type: object
 *             properties:
 *              name:
 *               type: string
 *              email:
 *               type: string
 *               format: email
 *              password:
 *               type: string
 *               format: password
 *       required: true
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/register', register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *      - Auth
 *     description: Login User!
 *     requestBody:
 *       description: Input form for login
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             required:
 *              - email
 *              - password
 *             type: object
 *             properties:
 *              email:
 *               type: string
 *               format: email
 *              password:
 *               type: string
 *               format: password
 *       required: true
 *     responses:
 *       200:
 *         description: Returns a mysterious string.
 */
router.post('/login', login);

export default router;