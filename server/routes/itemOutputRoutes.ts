import { Router } from "express";
import {
  createItem,
  getItemsBySpecId
} from "../controllers/itemOutputController";
import { authenticateJWT } from "../middleware/authenticatejwt";

const router = Router();

/**
 * @swagger
 * /items/create:
 *   post:
 *     summary: Create multiple Items
 *     tags: [Item]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               required:
 *                 - specId
 *                 - itemCode
 *               properties:
 *                 specId:
 *                   type: integer
 *                   description: ID of the associated Spec
 *                 component:
 *                   type: object
 *                   properties:
 *                     Code:
 *                       type: string
 *                     Value:
 *                       type: string
 *                 componentDesc:
 *                   type: object
 *                   properties:
 *                     Code:
 *                       type: string
 *                     CCode:
 *                       type: string
 *                     Value:
 *                       type: string
 *                 itemCode:
 *                   type: string
 *                   description: Unique code for the item
 *                 itemLongDesc:
 *                   type: string
 *                   description: Long description of the item
 *     responses:
 *       201:
 *         description: Items created successfully
 *       400:
 *         description: Invalid input or spec not found
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createItem);

/**
 * @swagger
 * /items/getbySpecId:
 *   post:
 *     summary: Get Items by Spec ID
 *     tags: [Item]
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
 *                 description: The ID of the spec to filter Items by
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of Items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   spec_id:
 *                     type: integer
 *                   item_code:
 *                     type: string
 *                   item_long_desc:
 *                     type: string
 *       400:
 *         description: SpecId is required
 *       500:
 *         description: Internal server error
 */
router.post("/getbySpecId", authenticateJWT, getItemsBySpecId);

export default router;