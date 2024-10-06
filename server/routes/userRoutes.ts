import { Router } from 'express';
import { createUser, getUserByEmail, updateUser, deleteUser } from '../controllers/userController';
import { authenticateJWT } from '../middleware/authenticatejwt'; // Import the middleware

const router = Router();

/**
 * @swagger
 * /users/registeruser:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               companyName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post('/registeruser', createUser);

/**
 * @swagger
 * /users/getUser:
 *   post:
 *     summary: Retrieve a user by email
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []  # Indicate that the token will be in cookies
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
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
    router.post('/getUser', authenticateJWT, getUserByEmail);

/**
 * @swagger
 * /users/updateUser:
 *   put:
 *     summary: Update user information
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []  # Indicate that the token will be in cookies
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
 *               name:
 *                 type: string
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.put('/updateUser', authenticateJWT, updateUser);      // Protected route

/**
 * @swagger
 * /users/deleteUser:
 *   delete:
 *     summary: Delete a user by email
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []  # Indicate that the token will be in cookies
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
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/deleteUser', authenticateJWT, deleteUser);   // Protected route

export default router;
