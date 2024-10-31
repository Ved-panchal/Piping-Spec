import { Router } from "express";
import {
  createSizeRange,
  updateSizeRange,
  deleteSizeRange,
  getSizeRangesBySpecId,
} from "../controllers/sizeRangeController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

/**
 * @swagger
 * /sizeranges/create:
 *   post:
 *     summary: Create a new SizeRange
 *     tags: [SizeRange]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sizeId
 *               - scheduleId
 *               - specId
 *             properties:
 *               sizeId:
 *                 type: integer
 *                 description: ID of the size.
 *                 example: 1
 *               scheduleId:
 *                 type: integer
 *                 description: ID of the schedule.
 *                 example: 1
 *               specId:
 *                 type: integer
 *                 description: ID of the spec.
 *                 example: 1
 *     responses:
 *       201:
 *         description: SizeRange created successfully
 *       404:
 *         description: Spec not found
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createSizeRange);

/**
 * @swagger
 * /sizeranges/update:
 *   put:
 *     summary: Update an existing SizeRange
 *     tags: [SizeRange]
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
 *               - sizeId
 *               - scheduleId
 *               - specId
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the SizeRange to be updated.
 *                 example: 1
 *               sizeId:
 *                 type: integer
 *                 description: New ID of the size.
 *                 example: 2
 *               scheduleId:
 *                 type: integer
 *                 description: New ID of the schedule.
 *                 example: 2
 *               specId:
 *                 type: integer
 *                 description: New ID of the spec.
 *                 example: 2
 *     responses:
 *       200:
 *         description: SizeRange updated successfully
 *       404:
 *         description: Spec or SizeRange not found
 *       500:
 *         description: Internal server error
 */
router.put("/update", authenticateJWT, updateSizeRange);

/**
 * @swagger
 * /sizeranges/delete:
 *   delete:
 *     summary: Soft delete a SizeRange
 *     tags: [SizeRange]
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
 *                 description: ID of the SizeRange to be deleted.
 *                 example: 1
 *     responses:
 *       200:
 *         description: SizeRange deleted successfully
 *       404:
 *         description: SizeRange not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete", authenticateJWT, deleteSizeRange);

/**
 * @swagger
 * /sizeranges/getbySpecId:
 *   post:
 *     summary: Get SizeRanges by Spec ID
 *     tags: [SizeRange]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               specId:
 *                 type: integer
 *                 description: The ID of the spec to filter SizeRanges by.
 *                 example: 1
 *     responses:
 *       200:
 *         description: List of SizeRanges retrieved successfully based on Spec ID
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The ID of the SizeRange entry.
 *                   specId:
 *                     type: integer
 *                     description: The ID of the associated Spec.
 *                   sizeId:
 *                     type: integer
 *                     description: The ID of the associated Size.
 *                   sizeValue:
 *                     type: string
 *                     description: The size value related to SizeRange.
 *                   scheduleId:
 *                     type: integer
 *                     description: The ID of the associated Schedule.
 *                   scheduleValue:
 *                     type: string
 *                     description: The schedule value related to SizeRange.
 *       400:
 *         description: SpecId is required
 *       500:
 *         description: Internal server error
 */
router.post("/getbySpecId", authenticateJWT, getSizeRangesBySpecId);

export default router;
