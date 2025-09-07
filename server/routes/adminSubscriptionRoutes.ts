import { Router } from 'express';
import { 
    getAllPlans,
    createSubscription,
    updateSubscription,
    deleteSubscription,
    getSubscriptionById,
    getAllSubscriptions
} from '../controllers/adminSubscriptionController';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { body } from 'express-validator';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Validation rules for subscription creation
const createSubscriptionValidationRules = [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('planId').notEmpty().withMessage('Plan ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').isISO8601().withMessage('Valid end date is required'),
    body('status').optional().isIn(['active', 'inactive', 'cancelled']).withMessage('Valid status is required'),
    body('NoofProjects').optional().isInt({ min: 0 }).withMessage('Number of projects must be a positive integer'),
    body('NoofSpecs').optional().isInt({ min: 0 }).withMessage('Number of specs must be a positive integer'),
];

// Validation rules for subscription update
const updateSubscriptionValidationRules = [
    body('planId').optional().notEmpty().withMessage('Plan ID cannot be empty'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('Valid end date is required'),
    body('status').optional().isIn(['active', 'inactive', 'cancelled']).withMessage('Valid status is required'),
    body('NoofProjects').optional().isInt({ min: 0 }).withMessage('Number of projects must be a positive integer'),
    body('NoofSpecs').optional().isInt({ min: 0 }).withMessage('Number of specs must be a positive integer'),
];

/**
 * @swagger
 * /admin/subscriptions/plans:
 *   get:
 *     summary: Get all available plans
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 */
router.get('/plans', getAllPlans);

/**
 * @swagger
 * /admin/subscriptions:
 *   get:
 *     summary: Get all subscriptions with pagination and filtering
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of subscriptions per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, cancelled]
 *         description: Filter by subscription status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for user name, email, or company
 *     responses:
 *       200:
 *         description: Subscriptions retrieved successfully
 */
router.get('/', getAllSubscriptions);

/**
 * @swagger
 * /admin/subscriptions/{subscriptionId}:
 *   get:
 *     summary: Get subscription by ID
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription retrieved successfully
 *       404:
 *         description: Subscription not found
 */
router.get('/:subscriptionId', getSubscriptionById);

/**
 * @swagger
 * /admin/subscriptions:
 *   post:
 *     summary: Create new subscription
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               planId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, inactive, cancelled]
 *               NoofProjects:
 *                 type: integer
 *               NoofSpecs:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User or plan not found
 */
router.post('/', createSubscriptionValidationRules, createSubscription);

/**
 * @swagger
 * /admin/subscriptions/{subscriptionId}:
 *   put:
 *     summary: Update subscription
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               planId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum: [active, inactive, cancelled]
 *               NoofProjects:
 *                 type: integer
 *               NoofSpecs:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Subscription or plan not found
 */
router.put('/:subscriptionId', updateSubscriptionValidationRules, updateSubscription);

/**
 * @swagger
 * /admin/subscriptions/{subscriptionId}:
 *   delete:
 *     summary: Delete subscription
 *     tags: [Admin Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: subscriptionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscription deleted successfully
 *       404:
 *         description: Subscription not found
 */
router.delete('/:subscriptionId', deleteSubscription);

export default router;
