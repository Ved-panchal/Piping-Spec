import { Router } from "express";
import {
  addOrUpdateSizes,
  getSizesByProjectId,
} from "../controllers/sizeController"; // Adjust the path as necessary
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication
import { addOrUpdateBoltSizes, getBoltSizesByProjectId } from "../controllers/boltSizeController";

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
 *               - code
 *               - c_code
 *               - size_inch
 *               - size_mm
 *               - od
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The ID of the project to associate sizes with.
 *                 example: "1"
 *               size1_size2:
 *                 type: number
 *                 description: The identifier for the size.
 *                 example: 100
 *               code:
 *                 type: string
 *                 description: Code for the size.
 *                 example: "S1"
 *               c_code:
 *                 type: string
 *                 description: Additional code for the size.
 *                 example: "C1"
 *               size_inch:
 *                 type: string
 *                 description: Size in inches.
 *                 example: "5.5"
 *               size_mm:
 *                 type: number
 *                 description: Size in millimeters.
 *                 example: 140
 *               od:
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
router.post("/add-or-update", authenticateJWT, addOrUpdateBoltSizes);

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
 *                 type: string
 *                 description: The ID of the project.
 *                 example: "1"
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
 *                       code:
 *                         type: string
 *                         example: "S1"
 *                       c_code:
 *                         type: string
 *                         example: "C1"
 *                       size_inch:
 *                         type: string
 *                         example: "5.5"
 *                       size_mm:
 *                         type: number
 *                         example: 140
 *                       od:
 *                         type: number
 *                         example: 200
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getBoltSizesByProjectId);

export default router;
