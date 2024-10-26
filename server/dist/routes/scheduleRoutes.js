"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const scheduleController_1 = require("../controllers/scheduleController");
const authenticatejwt_1 = require("../middleware/authenticatejwt"); // Middleware for JWT authentication
const router = (0, express_1.Router)();
/**
 * @swagger
 * /schedules/add-or-update:
 *   post:
 *     summary: Add or update schedules for a specific project
 *     tags: [Schedule]
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
 *               - schedules
 *             properties:
 *               projectId:
 *                 type: string
 *                 description: The ID of the project to associate schedules with.
 *                 example: "1"
 *               schedules:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - d_id
 *                     - sch1_sch2
 *                     - code
 *                     - schDesc
 *                     - c_code
 *                   properties:
 *                     sch1_sch2:
 *                       type: string
 *                       description: The immutable SCH1/SCH2 code.
 *                       example: "10"
 *                     code:
 *                       type: string
 *                       description: Code for the schedule.
 *                       example: "S1"
 *                     c_code:
 *                       type: string
 *                       description: Additional code related to the schedule.
 *                       example: "C1"
 *                     schDesc:
 *                       type: string
 *                       description: Description for the schedule.
 *                       example: "Schedule 10"
 *     responses:
 *       200:
 *         description: Schedules added or updated successfully
 *       400:
 *         description: Validation errors (duplicate code or description)
 *       500:
 *         description: Internal server error
 */
router.post("/add-or-update", authenticatejwt_1.authenticateJWT, scheduleController_1.addOrUpdateSchedules);
/**
 * @swagger
 * /schedules/getall:
 *   post:
 *     summary: Get all schedules for a specific project or default schedules if none exist
 *     tags: [Schedule]
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
 *                 type: string
 *                 description: The ID of the project.
 *                 example: "1"
 *     responses:
 *       200:
 *         description: List of schedules retrieved successfully or default schedules
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 schedules:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sch1_sch2:
 *                         type: string
 *                         example: "10"
 *                       code:
 *                         type: string
 *                         example: "S1"
 *                       c_code:
 *                         type: string
 *                         example: "C1"
 *                       schDesc:
 *                         type: string
 *                         example: "Schedule 10"
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.post("/getall", authenticatejwt_1.authenticateJWT, scheduleController_1.getSchedulesByProjectId);
exports.default = router;
