"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const authenticatejwt_1 = require("../middleware/authenticatejwt"); // Import the middleware
const router = (0, express_1.Router)();
/**
 * @swagger
 * /users/registeruser:
 *   post:
 *     summary: Create a new user and subscribe to a plan
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
 *                 description: The name of the user
 *               companyName:
 *                 type: string
 *                 description: The company name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user
 *               industry:
 *                 type: string
 *                 description: The industry in which the user operates
 *               country:
 *                 type: string
 *                 description: The country of the user
 *               phoneNumber:
 *                 type: string
 *                 description: The phone number of the user
 *               password:
 *                 type: string
 *                 format: password
 *                 description: The password for the user's account
 *               plan:
 *                 type: integer
 *                 description: The ID of the selected subscription plan
 *     responses:
 *       201:
 *         description: User created successfully and subscribed to the selected plan
 *       400:
 *         description: Bad request (e.g., invalid input data)
 *       404:
 *         description: Selected plan not found
 *       500:
 *         description: Server error
 */
router.post('/registeruser', userController_1.createUser);
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
router.post('/getUser', authenticatejwt_1.authenticateJWT, userController_1.getUserByEmail);
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
router.put('/updateUser', authenticatejwt_1.authenticateJWT, userController_1.updateUser); // Protected route
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
router.delete('/deleteUser', authenticatejwt_1.authenticateJWT, userController_1.deleteUser); // Protected route
exports.default = router;
