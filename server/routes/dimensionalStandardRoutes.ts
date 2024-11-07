import { Router } from "express";
import {
    createDimensionalStandard,
    updateDimensionalStandard,
    getAllDimensionalStandards,
    getDimensionalStandardsByComponentId,
    deleteDimensionalStandard
} from "../controllers/dimensionalStandardController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /dimensional-standards/create:
 *   post:
 *     summary: Create a new dimensional standard
 *     tags: [Dimensional Standards]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - component_id
 *               - dimensional_standard
 *             properties:
 *               component_id:
 *                 type: integer
 *                 description: ID of the associated component.
 *                 example: 1
 *               dimensional_standard:
 *                 type: string
 *                 description: Dimensional standard details.
 *                 example: "Standard size A"
 *     responses:
 *       201:
 *         description: Dimensional Standard created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 component_id:
 *                   type: integer
 *                 dimensional_standard:
 *                   type: string
 *       404:
 *         description: Component not found
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createDimensionalStandard);

/**
 * @swagger
 * /dimensional-standards/update:
 *   put:
 *     summary: Update a dimensional standard
 *     tags: [Dimensional Standards]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - dimensional_standard
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the dimensional standard to update.
 *                 example: 1
 *               dimensional_standard:
 *                 type: string
 *                 description: Updated dimensional standard details.
 *                 example: "Updated standard size B"
 *     responses:
 *       200:
 *         description: Dimensional Standard updated successfully
 *       404:
 *         description: Dimensional Standard not found
 *       500:
 *         description: Internal server error
 */
router.put("/update", authenticateJWT, updateDimensionalStandard);

/**
 * @swagger
 * /dimensional-standards/getall:
 *   get:
 *     summary: Get all dimensional standards
 *     tags: [Dimensional Standards]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of dimensional standards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   component_id:
 *                     type: integer
 *                   dimensional_standard:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get("/getall", authenticateJWT, getAllDimensionalStandards);

/**
 * @swagger
 * /dimensional-standards/by-component:
 *   post:
 *     summary: Get dimensional standards by component ID
 *     tags: [Dimensional Standards]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - component_id
 *             properties:
 *               component_id:
 *                 type: integer
 *                 description: The ID of the component to fetch dimensional standards for.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Dimensional Standards fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   component_id:
 *                     type: integer
 *                   dimensional_standard:
 *                     type: string
 *       404:
 *         description: Component not found
 *       500:
 *         description: Internal server error
 */
router.post("/by-component", authenticateJWT, getDimensionalStandardsByComponentId);

/**
 * @swagger
 * /dimensional-standards/delete:
 *   delete:
 *     summary: Delete a dimensional standard
 *     tags: [Dimensional Standards]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 description: The ID of the dimensional standard to be deleted.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Dimensional Standard deleted successfully
 *       404:
 *         description: Dimensional Standard not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete", authenticateJWT, deleteDimensionalStandard);

export default router;
