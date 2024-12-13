import { Router } from "express";
import {
  getCatRefByComponentId,
  addOrUpdateCatRef,
} from "../controllers/catrefController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /catref/get:
 *   post:
 *     summary: Get CatRefs by component ID for a specific project
 *     tags: [CatRefs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - componentId
 *               - projectId
 *             properties:
 *               componentId:
 *                 type: string
 *                 description: The ID of the component to retrieve CatRefs for.
 *                 example: "1"
 *               projectId:
 *                 type: string
 *                 description: The ID of the project.
 *                 example: "project123"
 *     responses:
 *       200:
 *         description: CatRefs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 catRefs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "catref123"
 *                       component_id:
 *                         type: string
 *                         example: "1"
 *                       item_short_desc:
 *                         type: string
 *                         example: "Sample Item"
 *                       rating:
 *                         type: number
 *                         example: 4.5
 *                       concatenate:
 *                         type: string
 *                         example: "SAMPLE-001"
 *                       catalog:
 *                         type: string
 *                         example: "General Catalog"
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getCatRefByComponentId)

/**
 * @swagger
 * /catref/add-or-update:
 *   post:
 *     summary: Add or update CatRefs for a specific component
 *     tags: [CatRefs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - componentId
 *               - catRefs
 *             properties:
 *               componentId:
 *                 type: string
 *                 description: The ID of the component to associate CatRefs with.
 *                 example: "1"
 *               catRefs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_short_desc
 *                     - rating
 *                     - concatenate
 *                     - catalog
 *                   properties:
 *                     project_id:
 *                       type: string
 *                       description: Optional project ID for project-specific CatRefs.
 *                       example: "project123"
 *                     item_short_desc:
 *                       type: string
 *                       description: Short description of the item.
 *                       example: "Sample Item"
 *                     rating:
 *                       type: number
 *                       description: Rating for the item.
 *                       example: 4.5
 *                     concatenate:
 *                       type: string
 *                       description: Concatenated identifier.
 *                       example: "SAMPLE-001"
 *                     catalog:
 *                       type: string
 *                       description: Catalog information.
 *                       example: "General Catalog"
 *     responses:
 *       200:
 *         description: CatRefs added or updated successfully
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
 *                   example: "CatRefs added or updated successfully."
 *       403:
 *         description: Invalid project access
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateCatRef);

export default router;