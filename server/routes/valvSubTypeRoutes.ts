import { Router } from "express";
import {
  getValvSubTypes,
  addOrUpdateValvSubType
} from "../controllers/valvSubTypeController";
import { authenticateJWT } from "../middleware/authenticatejwt";

const router = Router();

/**
 * @swagger
 * /valvsubtype/getall:
 *   post:
 *     summary: Get all Valv Sub Types (default and project-specific)
 *     tags: [ValvSubTypes]
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
 *         description: Valv Sub Types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 valvSubTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       valv_sub_type:
 *                         type: string
 *                         example: "FB"
 *                       code:
 *                         type: string
 *                         example: "FB"
 *                       c_code:
 *                         type: string
 *                         example: "CFB"
 *                       project_id:
 *                         type: string
 *                         example: "project123"
 *                       default:
 *                         type: boolean
 *                         example: true
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticateJWT, getValvSubTypes);

/**
 * @swagger
 * /valvsubtype/add-or-update:
 *   post:
 *     summary: Add or update Valv Sub Types (project-specific)
 *     tags: [ValvSubTypes]
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
 *                     - valv_sub_type
 *                     - code
 *                     - c_code
 *                     - project_id
 *                   properties:
 *                     valv_sub_type:
 *                       type: string
 *                       example: "FB"
 *                     code:
 *                       type: string
 *                       example: "FB"
 *                     c_code:
 *                       type: string
 *                       example: "CFB"
 *                     project_id:
 *                       type: string
 *                       example: "project123"
 *     responses:
 *       200:
 *         description: Valv Sub Type(s) added or updated successfully
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
 *                   example: "Valv Sub Type(s) added or updated successfully."
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticateJWT, addOrUpdateValvSubType);

export default router;
