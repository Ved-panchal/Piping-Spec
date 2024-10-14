import { Router } from "express";
import {
  createProject,
  updateProject,
  getProjectByCode,
  deleteProject,
  getAllProjectsByUserId, // Import your new function here
} from "../controllers/projectController";
import { authenticateJWT } from "../middleware/authenticatejwt"; // Middleware for JWT authentication

const router = Router();

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
router.post("/create", authenticateJWT, createProject); // Protected route

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
router.put("/update", authenticateJWT, updateProject); // Protected route

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
router.get("/:projectCode", authenticateJWT, getProjectByCode); // Protected route

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
router.delete("/delete", authenticateJWT, deleteProject); // Protected route

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
router.get("/GetAll/ByUser", authenticateJWT, getAllProjectsByUserId); // Protected route

export default router;
