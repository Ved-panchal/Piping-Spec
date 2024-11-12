import { Router } from "express";
import { getBranchesBySpecId, addOrUpdateBranch } from "../controllers/branchController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /branch_table/getall:
 *   post:
 *     summary: Retrieve all branches associated with a specific specId
 *     tags: [Branch]
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
 *                 type: string
 *                 description: The ID of the specification to retrieve branches for.
 *                 example: "123"
 *     responses:
 *       200:
 *         description: List of branches retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 brancheData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       branch_size:
 *                         type: string
 *                         example: "large"
 *                       run_size:
 *                         type: string
 *                         example: "100"
 *                       comp_name:
 *                         type: string
 *                         example: "Example Company"
 *                       specId:
 *                         type: string
 *                         example: "123"
 *       404:
 *         description: Spec not found
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getBranchesBySpecId);

/**
 * @swagger
 * /branch_table/add-or-update:
 *   post:
 *     summary: Add a new branch or update an existing branch based on specId and branch data
 *     tags: [Branch]
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
 *               - branchData
 *             properties:
 *               specId:
 *                 type: string
 *                 description: The ID of the specification.
 *                 example: "123"
 *               branchData:
 *                 type: object
 *                 required:
 *                   - branch_size
 *                   - run_size
 *                   - comp_name
 *                 properties:
 *                   branch_size:
 *                     type: string
 *                     description: Size of the branch.
 *                     example: "large"
 *                   run_size:
 *                     type: string
 *                     description: Run size of the branch.
 *                     example: "100"
 *                   comp_name:
 *                     type: string
 *                     description: Name of the company.
 *                     example: "Example Company"
 *     responses:
 *       200:
 *         description: Branch added or updated successfully
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
 *                   example: "Branch added successfully."
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateBranch);

export default router;
