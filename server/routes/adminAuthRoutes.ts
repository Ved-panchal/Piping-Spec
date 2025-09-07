import { Router } from 'express';
import { loginAdmin } from '../controllers/adminAuthController';
import { loginValidationRules } from '../middleware/validateRequest';

const router = Router();

/**
 * @swagger
 * /admin/auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Admin logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                 token:
 *                   type: string
 *       401:
 *         description: Admin user not found or access denied
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post('/login', loginValidationRules, loginAdmin);

export default router;
