import { Router } from "express";
import {
  getDimStdByGType,
  addOrUpdateDimStd
} from "../controllers/dimStdController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /dimstd/getbygtype:
 *   post:
 *     summary: Get DimStds by g_type for a specific project
 *     tags: [DimStds]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - gType
 *               - projectId
 *             properties:
 *               gType:
 *                 type: string
 *                 description: The g_type to retrieve DimStds for.
 *                 example: "LENGTH"
 *               projectId:
 *                 type: string
 *                 description: The ID of the project.
 *                 example: "project123"
 *     responses:
 *       200:
 *         description: DimStds retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 dimStds:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "dimstd123"
 *                       g_type:
 *                         type: string
 *                         example: "LENGTH"
 *                       dim_std:
 *                         type: string
 *                         example: "mm"
 *                       project_id:
 *                         type: string
 *                         example: "project123"
 *       500:
 *         description: Internal server error
 */
router.post("/getbygtype", authenticateJWT, getDimStdByGType);

/**
 * @swagger
 * /dimstd/add-or-update:
 *   post:
 *     summary: Add or update DimStds
 *     tags: [DimStds]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dimStds
 *             properties:
 *               dimStds:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - g_type
 *                     - dim_std
 *                   properties:
 *                     project_id:
 *                       type: string
 *                       description: Optional project ID for project-specific DimStds.
 *                       example: "project123"
 *                     g_type:
 *                       type: string
 *                       description: Type of dimension standard.
 *                       example: "LENGTH"
 *                     dim_std:
 *                       type: string
 *                       description: Dimension standard value.
 *                       example: "mm"
 *     responses:
 *       200:
 *         description: DimStds added or updated successfully
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
 *                   example: "DimStds added or updated successfully."
 *       403:
 *         description: Invalid project access
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateDimStd);

export default router;