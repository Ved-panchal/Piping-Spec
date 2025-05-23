import { Router } from "express";
import {
  getConstructionDescs,
  addOrUpdateConstructionDesc
} from "../controllers/constructionDescController";
import { authenticateJWT } from "../middleware/authenticatejwt";

const router = Router();

/**
 * @swagger
 * /constructiondesc/c:
 *   post:
 *     summary: Get all Construction Descriptions (default and project-specific)
 *     tags: [ConstructionDescriptions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: Optional project ID to fetch project-specific records.
 *                 example: "project123"
 *     responses:
 *       200:
 *         description: Construction Descriptions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 constructionDescs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       construction_desc:
 *                         type: string
 *                         example: "Concrete Foundation"
 *                       code:
 *                         type: string
 *                         example: "CF"
 *                       c_code:
 *                         type: string
 *                         example: "CCF"
 *                       project_id:
 *                         type: string
 *                         example: "project123"
 *                       default:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getConstructionDescs);

/**
 * @swagger
 * /constructiondesc/add-or-update:
 *   post:
 *     summary: Add or update Construction Descriptions (project-specific)
 *     tags: [ConstructionDescriptions]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payload
 *             properties:
 *               payload:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - construction_desc
 *                     - code
 *                     - c_code
 *                     - projectidproject_id
 *                   properties:
 *                     construction_desc:
 *                       type: string
 *                       example: "Concrete Foundation"
 *                     code:
 *                       type: string
 *                       example: "CF"
 *                     c_code:
 *                       type: string
 *                       example: "CCF"
 *                     projectidproject_id:
 *                       type: string
 *                       example: "project123"
 *     responses:
 *       200:
 *         description: Construction Description(s) added or updated successfully
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
 *                   example: "Construction Description(s) added or updated successfully."
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateConstructionDesc);

export default router;