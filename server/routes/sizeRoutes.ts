import { Router } from "express";
import {
  addOrUpdateSizes,
  getSizesByProjectId,
} from "../controllers/sizeController"; // Adjust the path as necessary
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /sizes/add-or-update:
 *   post:
 *     summary: Add or update sizes for a specific project
 *     tags: [Sizes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *               - size1_size2
 *               - CODE
 *               - sizeInch
 *               - sizeMM
 *               - OD
 *             properties:
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project to associate sizes with.
 *                 example: 1
 *               size1_size2:
 *                 type: number
 *                 description: The identifier for the size.
 *                 example: 100
 *               CODE:
 *                 type: string
 *                 description: Code for the size.
 *                 example: "S1"
 *               sizeInch:
 *                 type: string
 *                 description: Size in inches.
 *                 example: "5.5"
 *               sizeMM:
 *                 type: number
 *                 description: Size in millimeters.
 *                 example: 140
 *               OD:
 *                 type: number
 *                 description: Outer diameter.
 *                 example: 200
 *     responses:
 *       200:
 *         description: Size added or updated successfully
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateSizes);

/**
 * @swagger
 * /sizes/getall:
 *   post:
 *     summary: Get all sizes for a specific project or default sizes if none exist
 *     tags: [Sizes]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectId
 *             properties:
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project.
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of sizes retrieved successfully or default sizes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sizes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       size1_size2:
 *                         type: number
 *                         example: 100
 *                       CODE:
 *                         type: string
 *                         example: "S1"
 *                       sizeInch:
 *                         type: string
 *                         example: "5.5"
 *                       sizeMM:
 *                         type: number
 *                         example: 140
 *                       OD:
 *                         type: number
 *                         example: 200
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getSizesByProjectId);

export default router;
