"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const authenticatejwt_1 = require("../middleware/authenticatejwt"); // Middleware for JWT authentication
const router = (0, express_1.Router)();
/**
 * @swagger
 * /projects/create:
 *   post:
 *     summary: Create a new project
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectCode
 *               - projectDescription
 *               - companyName
 *             properties:
 *               projectCode:
 *                 type: string
 *                 description: Unique code for the project (3-digit alphanumeric, uppercase).
 *                 example: AB3
 *               projectDescription:
 *                 type: string
 *                 description: Description of the project.
 *                 example: A project for managing company sales.
 *               companyName:
 *                 type: string
 *                 description: Name of the company.
 *                 example: TechCorp
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectCode:
 *                   type: string
 *                 projectDescription:
 *                   type: string
 *                 companyName:
 *                   type: string
 *       400:
 *         description: Project with the same code already exists or other validation errors
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticatejwt_1.authenticateJWT, projectController_1.createProject); // Protected route
/**
 * @swagger
 * /projects/update:
 *   put:
 *     summary: Update a project
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectCode
 *               - projectDescription
 *               - companyName
 *             properties:
 *               projectCode:
 *                 type: string
 *                 description: The code of the project to be updated.
 *                 example: AB3
 *               projectDescription:
 *                 type: string
 *                 description: New description of the project.
 *                 example: Updated project description.
 *               companyName:
 *                 type: string
 *                 description: New company name.
 *                 example: UpdatedTechCorp
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectCode:
 *                   type: string
 *                 projectDescription:
 *                   type: string
 *                 companyName:
 *                   type: string
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.put("/update", authenticatejwt_1.authenticateJWT, projectController_1.updateProject); // Protected route
/**
 * @swagger
 * /projects/{projectCode}:
 *   get:
 *     summary: Get project by code
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: projectCode
 *         in: path
 *         required: true
 *         description: The unique project code.
 *         schema:
 *           type: string
 *           example: AB3
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 projectCode:
 *                   type: string
 *                 projectDescription:
 *                   type: string
 *                 companyName:
 *                   type: string
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.get("/:projectCode", authenticatejwt_1.authenticateJWT, projectController_1.getProjectByCode); // Protected route
/**
 * @swagger
 * /projects/delete:
 *   delete:
 *     summary: Delete a project (soft delete)
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - projectCode
 *             properties:
 *               projectCode:
 *                 type: string
 *                 description: The code of the project to be deleted.
 *                 example: AB3
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found or access denied
 *       500:
 *         description: Internal server error
 */
router.delete("/delete", authenticatejwt_1.authenticateJWT, projectController_1.deleteProject); // Protected route
/**
 * @swagger
 * /projects/GetAll/ByUser:
 *   get:
 *     summary: Get all projects for the authenticated user
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   projectCode:
 *                     type: string
 *                   projectDescription:
 *                     type: string
 *                   companyName:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
router.get("/GetAll/ByUser", authenticatejwt_1.authenticateJWT, projectController_1.getAllProjectsByUserId); // Protected route
exports.default = router;
