import { Router } from "express";
import { createPlan, updatePlan, getPlanById, deletePlan } from "../controllers/planController";
import { authenticateJWT } from "../middleware/authenticatejwt";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Plans
 *   description: API for managing subscription plans
 */

/**
 * @swagger
 * /plans/create:
 *   post:
 *     summary: Create a new plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planName
 *               - allowedDays
 *             properties:
 *               planName:
 *                 type: string
 *                 description: Name of the plan
 *               noOfProjects:
 *                 type: integer
 *                 description: Number of projects allowed in this plan
 *               noOfSpecs:
 *                 type: integer
 *                 description: Number of specs allowed in this plan
 *               allowedDays:
 *                 type: integer
 *                 description: Number of allowed days for the plan
 *     responses:
 *       201:
 *         description: Plan created successfully
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createPlan);

/**
 * @swagger
 * /plans/update:
 *   put:
 *     summary: Update an existing plan
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planId
 *               - planName
 *             properties:
 *               planId:
 *                 type: integer
 *                 description: ID of the plan
 *               planName:
 *                 type: string
 *                 description: Updated name of the plan
 *               noOfProjects:
 *                 type: integer
 *                 description: Updated number of projects allowed
 *               noOfSpecs:
 *                 type: integer
 *                 description: Updated number of specs allowed
 *               allowedDays:
 *                 type: integer
 *                 description: Updated number of allowed days for the plan
 *     responses:
 *       200:
 *         description: Plan updated successfully
 *       400:
 *         description: Invalid request body
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */
router.put("/update", authenticateJWT, updatePlan);

/**
 * @swagger
 * /plans/{planId}:
 *   get:
 *     summary: Get plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the plan to retrieve
 *     responses:
 *       200:
 *         description: Plan retrieved successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */
router.get("/:planId", authenticateJWT, getPlanById);

/**
 * @swagger
 * /plans/{planId}:
 *   delete:
 *     summary: Delete a plan by ID
 *     tags: [Plans]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the plan to delete
 *     responses:
 *       200:
 *         description: Plan deleted successfully
 *       404:
 *         description: Plan not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:planId", authenticateJWT, deletePlan);

export default router;
