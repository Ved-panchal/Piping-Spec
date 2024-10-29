import { Router } from "express";
import {
  createComponent,
  updateComponent,
  getAllComponents,
  deleteComponent,
} from "../controllers/componentController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /components/create:
 *   post:
 *     summary: Create a new component
 *     tags: [Components]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - componentname
 *               - ratingrequired
 *             properties:
 *               componentname:
 *                 type: string
 *                 description: Unique name for the component.
 *                 example: COMP123
 *               ratingrequired:
 *                 type: boolean
 *                 description: Whether the rating is required for this component.
 *                 example: true
 *     responses:
 *       201:
 *         description: Component created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 componentname:
 *                   type: string
 *                 ratingrequired:
 *                   type: boolean
 *       400:
 *         description: Validation errors or component already exists
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createComponent);

/**
 * @swagger
 * /components/update:
 *   put:
 *     summary: Update an existing component
 *     tags: [Components]
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
 *               - componentname
 *               - ratingrequired
 *             properties:
 *               componentId:
 *                 type: integer
 *                 description: The ID of the component to be updated.
 *                 example: 1
 *               componentname:
 *                 type: string
 *                 description: New name for the component.
 *                 example: COMP456
 *               ratingrequired:
 *                 type: boolean
 *                 description: Updated status for rating required.
 *                 example: false
 *     responses:
 *       200:
 *         description: Component updated successfully
 *       404:
 *         description: Component not found
 *       500:
 *         description: Internal server error
 */
router.put("/update", authenticateJWT, updateComponent);

/**
 * @swagger
 * /components/getall:
 *   get:
 *     summary: Get all components
 *     tags: [Components]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of components retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   componentId:
 *                     type: integer
 *                   componentname:
 *                     type: string
 *                   ratingrequired:
 *                     type: boolean
 *       500:
 *         description: Internal server error
 */
router.get("/getall", authenticateJWT, getAllComponents);

/**
 * @swagger
 * /components/delete:
 *   delete:
 *     summary: Soft delete a component
 *     tags: [Components]
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
 *             properties:
 *               componentId:
 *                 type: integer
 *                 description: The ID of the component to be deleted.
 *                 example: 1
 *     responses:
 *       200:
 *         description: Component deleted successfully
 *       404:
 *         description: Component not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete", authenticateJWT, deleteComponent);

export default router;
