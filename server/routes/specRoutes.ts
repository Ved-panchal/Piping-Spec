import { Router } from "express";
import {
  createSpec,
  updateSpec,
  getAllSpecsByProjectId,
  getSpecById,
  deleteSpec,
} from "../controllers/specController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /specs/create:
 *   post:
 *     summary: Create a new spec
 *     tags: [Specs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specName
 *               - rating
 *               - baseMaterial
 *               - projectId
 *             properties:
 *               specName:
 *                 type: string
 *                 description: Unique name for the spec.
 *                 example: SPEC123
 *               rating:
 *                 type: string
 *                 description: Rating of the spec.
 *                 example: 12345#
 *               baseMaterial:
 *                 type: string
 *                 description: Base material of the spec.
 *                 example: Aluminum
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project this spec belongs to.
 *                 example: 1
 *     responses:
 *       201:
 *         description: Spec created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 specName:
 *                   type: string
 *                 rating:
 *                   type: string
 *                 baseMaterial:
 *                   type: string
 *       400:
 *         description: Spec limit reached or validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createSpec);

/**
 * @swagger
 * /specs/update:
 *   put:
 *     summary: Update an existing spec
 *     tags: [Specs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specId
 *               - specName
 *               - rating
 *               - baseMaterial
 *             properties:
 *               specId:
 *                 type: integer
 *                 description: The ID of the spec to be updated.
 *                 example: 1
 *               specName:
 *                 type: string
 *                 description: New name for the spec.
 *                 example: SPEC456
 *               rating:
 *                 type: string
 *                 description: New rating for the spec.
 *                 example: 67890#
 *               baseMaterial:
 *                 type: string
 *                 description: New base material for the spec.
 *                 example: Steel
 *     responses:
 *       200:
 *         description: Spec updated successfully
 *       404:
 *         description: Spec not found or access denied
 *       500:
 *         description: Internal server error
 */
router.put("/update", authenticateJWT, updateSpec);

/**
 * @swagger
 * /specs/{specId}:
 *   get:
 *     summary: Get a spec by ID
 *     tags: [Specs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: specId
 *         in: path
 *         required: true
 *         description: The ID of the spec.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Spec retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 specId:
 *                   type: integer
 *                 specName:
 *                   type: string
 *                 rating:
 *                   type: string
 *                 baseMaterial:
 *                   type: string
 *       404:
 *         description: Spec not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get("/:specId", authenticateJWT, getSpecById);

/**
 * @swagger
 * /specs/project/{projectId}:
 *   get:
 *     summary: Get all specs for a specific project
 *     tags: [Specs]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         description: The ID of the project.
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: List of specs retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   specId:
 *                     type: integer
 *                   specName:
 *                     type: string
 *                   rating:
 *                     type: string
 *                   baseMaterial:
 *                     type: string
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get("/project/:projectId", authenticateJWT, getAllSpecsByProjectId);

/**
 * @swagger
 * /specs/delete:
 *   delete:
 *     summary: Soft delete a spec
 *     tags: [Specs]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - specId
 *             properties:
 *               specId:
 *                 type: integer
 *                 description: The ID of the spec to be deleted.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Spec deleted successfully
 *       404:
 *         description: Spec not found or access denied
 *       500:
 *         description: Internal server error
 */
router.delete("/delete", authenticateJWT, deleteSpec);

export default router;
