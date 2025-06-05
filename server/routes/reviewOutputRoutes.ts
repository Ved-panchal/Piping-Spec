import { Router } from "express";
import { getFilteredData, loadData, updateUnitWeight } from "../controllers/reviewOutputController"; // Assuming you have the dataController imported
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /data/load:
 *   post:
 *     summary: Load processed data and store it in the ReviewOutput table
 *     tags: [Data]
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
 *               - projectId
 *             properties:
 *               specId:
 *                 type: string
 *                 description: The ID of the specification.
 *                 example: "1"
 *               projectId:
 *                 type: string
 *                 description: The ID of the project.
 *                 example: "10"
 *     responses:
 *       200:
 *         description: Data loaded and saved successfully in the ReviewOutput table.
 *       400:
 *         description: Failed to load data or no data found.
 *       500:
 *         description: Internal server error.
 */
router.post("/load", authenticateJWT, loadData);

/**
 * @swagger
 * /data/update-unit-weight:
 *   put:
 *     summary: Update unit weight for a specific item based on itemCode
 *     tags: [Data]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemCode
 *               - unitWeight
 *             properties:
 *               itemCode:
 *                 type: string
 *                 description: The item code of the record to update.
 *                 example: "ITEM123"
 *               unitWeight:
 *                 type: string
 *                 description: The new unit weight to set.
 *                 example: "50.5"
 *     responses:
 *       200:
 *         description: Unit weight updated successfully.
 *       404:
 *         description: Item not found with the specified itemCode.
 *       500:
 *         description: Internal server error.
 */
router.post("/update-unit-weight", authenticateJWT, updateUnitWeight);

/**
 * @swagger
 * /data/filter:
 *   get:
 *     summary: Get filtered data from the ReviewOutput table based on optional filters
 *     tags: [Data]
 *     parameters:
 *       - in: query
 *         name: compType
 *         schema:
 *           type: string
 *         description: The component type to filter by (optional)
 *         example: "VALV"
 *       - in: query
 *         name: size1
 *         schema:
 *           type: string
 *         description: The size1 to filter by (optional)
 *         example: "1.5"
 *       - in: query
 *         name: size2
 *         schema:
 *           type: string
 *         description: The size2 to filter by (optional)
 *         example: "2.0"
 *       - in: query
 *         name: rating
 *         schema:
 *           type: string
 *         description: The rating to filter by (optional)
 *         example: "3000#"
 *     responses:
 *       200:
 *         description: Filtered data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       item_code:
 *                         type: string
 *                         example: "ITEM123"
 *                       unit_weight:
 *                         type: string
 *                         example: "50.5"
 *                       ...
 *       404:
 *         description: No data found matching the filters
 *       500:
 *         description: Internal server error
 */
router.get("/filter", authenticateJWT, getFilteredData);

export default router;
