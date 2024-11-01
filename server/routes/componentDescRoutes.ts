import { Router } from "express";
import {
  getComponentDescByComponentId,
  addOrUpdateComponentDesc,
} from "../controllers/componentDescController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /componentdescs/add-or-update:
 *   post:
 *     summary: Add or update component descriptions for a specific component
 *     tags: [ComponentsDesc]
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
 *               - componentDescs
 *             properties:
 *               componentId:
 *                 type: string
 *                 description: The ID of the component to associate descriptions with.
 *                 example: "1"
 *               componentDescs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - code
 *                     - c_code
 *                     - itemDescription
 *                     - dimensionalStandards
 *                     - ratingrequired
 *                   properties:
 *                     code:
 *                       type: string
 *                       description: Code for the component description.
 *                       example: "COMP01"
 *                     c_code:
 *                       type: string
 *                       description: Modified component code.
 *                       example: "CCOMP01"
 *                     itemDescription:
 *                       type: string
 *                       description: Description of the component item.
 *                       example: "Pipe Fitting"
 *                     dimensionalStandards:
 *                       type: string
 *                       description: Dimensional standards for the component.
 *                       example: "ASME B16.9"
 *                     ratingrequired:
 *                       type: boolean
 *                       description: Whether a rating is required.
 *                       example: true
 *     responses:
 *       200:
 *         description: Component descriptions added or updated successfully
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateComponentDesc);

/**
 * @swagger
 * /componentdescs/getall/{componentId}:
 *   get:
 *     summary: Get all component descriptions for a specific component or default descriptions if none exist
 *     tags: [ComponentsDesc]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: componentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the component.
 *         example: "1"
 *     responses:
 *       200:
 *         description: List of component descriptions retrieved successfully or default descriptions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 componentDescs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       code:
 *                         type: string
 *                         example: "COMP01"
 *                       c_code:
 *                         type: string
 *                         example: "CCOMP01"
 *                       itemDescription:
 *                         type: string
 *                         example: "Pipe Fitting"
 *                       dimensionalStandards:
 *                         type: string
 *                         example: "ASME B16.9"
 *                       ratingrequired:
 *                         type: boolean
 *                         example: true
 *       404:
 *         description: Component not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getComponentDescByComponentId);

export default router;
