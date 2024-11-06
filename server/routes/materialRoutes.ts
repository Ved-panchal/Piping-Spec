import { Router } from "express";
import { getAllMaterials, addOrUpdateMaterial } from "../controllers/materialController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /materials/getall:
 *   post:
 *     summary: Retrieve materials based on componentId, isAll, and projectId
 *     tags: [Materials]
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
 *                 type: integer
 *                 description: The ID of the component to determine `comp_matching_id`.
 *                 example: 1
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project associated with the materials.
 *                 example: 101
 *               isAll:
 *                 type: boolean
 *                 description: Whether to retrieve all materials, bypassing component matching logic.
 *                 example: true
 *     responses:
 *       200:
 *         description: List of materials based on conditions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 materials:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: "MAT01"
 *                       c_code:
 *                         type: string
 *                         example: "CMAT01"
 *                       material_description:
 *                         type: string
 *                         example: "Steel Pipe"
 *                       comp_matching_id:
 *                         type: integer
 *                         example: 1
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getAllMaterials);

/**
 * @swagger
 * /materials/add-or-update:
 *   post:
 *     summary: Add or update materials for a specific project based on componentId
 *     tags: [Materials]
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
 *               - materials
 *             properties:
 *               componentId:
 *                 type: integer
 *                 description: The ID of the component to determine `comp_matching_id`.
 *                 example: 1
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project associated with the materials.
 *                 example: 101
 *               materials:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - code
 *                     - c_code
 *                     - material_description
 *                   properties:
 *                     code:
 *                       type: string
 *                       description: Code for the material.
 *                       example: "MAT01"
 *                     c_code:
 *                       type: string
 *                       description: Modified material code.
 *                       example: "CMAT01"
 *                     material_description:
 *                       type: string
 *                       description: Description of the material.
 *                       example: "Steel Pipe"
 *     responses:
 *       200:
 *         description: Materials added or updated successfully
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
 *                   example: "Materials added or updated successfully."
 *       403:
 *         description: Invalid project access
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateMaterial);

export default router;
