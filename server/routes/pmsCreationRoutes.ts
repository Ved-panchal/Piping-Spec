import { Router } from "express";
import {
  createPMSCCreation,
  getPMSCCreationBySpecId,
  deletePMSCCreation,
  updatePMSCCreation,
  updatePMSCOrder
} from "../controllers/pmsCreationController";
import { authenticateJWT } from "../middleware/authenticatejwt";

const router = Router();

/**
 * @swagger
 * /pmsc/create:
 *   post:
 *     summary: Create multiple PMSC Creation items
 *     tags: [PMSC]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - specId
 *                     - componentCode
 *                   properties:
 *                     specId:
 *                       type: integer
 *                       description: ID of the associated Spec
 *                     componentCode:
 *                       type: string
 *                       description: Code for the component
 *                     componentDesc:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         code:
 *                           type: string
 *                         clientCode:
 *                           type: string
 *                         gType:
 *                           type: string
 *                         sType:
 *                           type: string
 *                     size1:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         code:
 *                           type: string
 *                         clientCode:
 *                           type: string
 *                     size2:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         code:
 *                           type: string
 *                         clientCode:
 *                           type: string
 *                     schedule:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         code:
 *                           type: string
 *                         clientCode:
 *                           type: string
 *                     rating:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         code:
 *                           type: string
 *                         clientCode:
 *                           type: string
 *                     material:
 *                       type: object
 *                       properties:
 *                         value:
 *                           type: string
 *                         code:
 *                           type: string
 *                         clientCode:
 *                           type: string
 *                     dimensionalStandard:
 *                       type: object
 *                       properties:
 *                         Value:
 *                           type: string
 *                         id:
 *                           type: integer
 *     responses:
 *       201:
 *         description: PMSC Creation items created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *                 createdItems:
 *                   type: array
 *                   items:
 *                     type: object
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Invalid input or validation error
 *       500:
 *         description: Internal server error
 */
router.post("/create", authenticateJWT, createPMSCCreation);


/**
 * @swagger
 * /pmsc/update:
 *   post:
 *     summary: Update a PMSC Creation item
 *     tags: [PMSC]
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
 *               - specId
 *               - editingCell
 *             properties:
 *               id:
 *                 type: integer
 *                 description: ID of the PMSC Creation item to update
 *               specId:
 *                 type: integer
 *                 description: ID of the associated Spec
 *               editingCell:
 *                 type: string
 *                 description: The field being updated
 *                 enum: [schedule, componentDesc, size1, size2, rating, material, dimensionalStandard]
 *               componentDesc:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                   code:
 *                     type: string
 *                   clientCode:
 *                     type: string
 *                   gType:
 *                     type: string
 *                   sType:
 *                     type: string
 *               size1:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                   code:
 *                     type: string
 *                   clientCode:
 *                     type: string
 *               size2:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                   code:
 *                     type: string
 *                   clientCode:
 *                     type: string
 *               schedule:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                   code:
 *                     type: string
 *                   clientCode:
 *                     type: string
 *               rating:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                   code:
 *                     type: string
 *                   clientCode:
 *                     type: string
 *               material:
 *                 type: object
 *                 properties:
 *                   value:
 *                     type: string
 *                   code:
 *                     type: string
 *                   clientCode:
 *                     type: string
 *               dimensionalStandard:
 *                 type: object
 *                 properties:
 *                   Value:
 *                     type: string
 *                   id:
 *                     type: integer
 *     responses:
 *       200:
 *         description: PMSC Creation item updated successfully
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
 *                   example: PMSC Creation item updated successfully
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 updatedItem:
 *                   type: object
 *                   description: The updated PMSC Creation item
 *       400:
 *         description: Invalid input, missing required fields, or invalid editingCell value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Missing required fields
 *                 status:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: PMSC Creation item not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: PMSC Creation item not found
 *                 status:
 *                   type: integer
 *                   example: 404
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Internal server error
 *                 status:
 *                   type: integer
 *                   example: 500
 */
router.post("/update", authenticateJWT, updatePMSCCreation);

/**
 * @swagger
 * /pmsc/getbySpecId:
 *   post:
 *     summary: Get PMSC Creation items by Spec ID
 *     tags: [PMSC]
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
 *                 description: The ID of the spec to filter PMSC Creation items by
 *                 example: 1
 *     responses:
 *       200:
 *         description: PMSC Creation items retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *                 items:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: SpecId is required
 *       500:
 *         description: Internal server error
 */
router.post("/getbySpecId", authenticateJWT, getPMSCCreationBySpecId);

/**
 * @swagger
 * /pmsc/delete:
 *   post:
 *     summary: Delete a PMSC Creation item by ID
 *     tags: [PMSC]
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
 *                 description: The ID of the PMSC Creation item to delete
 *                 example: 1
 *     responses:
 *       200:
 *         description: PMSC Creation item deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 status:
 *                   type: integer
 *       400:
 *         description: ID is required
 *       404:
 *         description: PMSC Creation item not found
 *       500:
 *         description: Internal server error
 */
router.post("/delete", authenticateJWT, deletePMSCCreation);

/**
 * @swagger
 * /pmsc/updateOrder:
 *   post:
 *     summary: Update the order of multiple PMSC Creation items (sorting)
 *     tags: [PMSC]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - isValv
 *             properties:
 *               items:
 *                 type: array
 *                 description: List of items with their new order
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - sort_order
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: Item ID
 *                     sort_order:
 *                       type: integer
 *                       description: The new sort order (0-based)
 *               isValv:
 *                 type: boolean
 *                 description: If true, sorts Valv items, else sorts regular PMS Creation items
 *                 example: false
 *     responses:
 *       200:
 *         description: Order updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Invalid data
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */
router.post("/updateOrder", authenticateJWT, updatePMSCOrder);


export default router;