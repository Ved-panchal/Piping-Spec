import { Router } from "express";
import {
  addOrUpdateRatings,
  getRatingsByProjectId,
} from "../controllers/ratingController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /ratings/add-or-update:
 *   post:
 *     summary: Add or update ratings for a specific project
 *     tags: [Ratings]
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
 *               - ratings
 *             properties:
 *               projectId:
 *                 type: integer
 *                 description: The ID of the project to associate ratings with.
 *                 example: 1
 *               ratings:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - ratingCode
 *                     - ratingValue
 *                   properties:
 *                     ratingCode:
 *                       type: string
 *                       description: Code for the rating.
 *                       example: "3000#"
 *                     ratingValue:
 *                       type: string
 *                       description: Value for the rating.
 *                       example: "C"
 *     responses:
 *       200:
 *         description: Ratings added or updated successfully
 *       400:
 *         description: Validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateRatings);

/**
 * @swagger
 * /ratings/getall:
 *   post:
 *     summary: Get all ratings for a specific project or default ratings if none exist
 *     tags: [Ratings]
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
 *                 type: integer
 *                 description: The ID of the project.
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of ratings retrieved successfully or default ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ratings:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ratingCode:
 *                         type: string
 *                         example: "3000#"
 *                       ratingValue:
 *                         type: string
 *                         example: "C"
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getRatingsByProjectId);


export default router;
