import { Router } from 'express';
import { 
    getAllUsers, 
    getUserAnalytics, 
    getUserById, 
    createUser, 
    updateUser, 
    deleteUser,
    updateUserSubscription,
    getAvailablePlans
} from '../controllers/adminUserController';
import { getSimpleAnalytics } from '../controllers/adminUserControllerSimple';
import { authenticateAdmin } from '../middleware/authenticateAdmin';
import { body } from 'express-validator';

const router = Router();

// Apply admin authentication to all routes
router.use(authenticateAdmin);

// Validation rules for user creation
const createUserValidationRules = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6, max: 12 }).withMessage('Password must be 6-12 characters'),
    body('companyName').notEmpty().withMessage('Company name is required'),
    body('industry').isIn(['Oil & Gas', 'Chemical', 'Pharma', 'Sugar', 'Solar', 'Wind']).withMessage('Valid industry is required'),
    body('country').notEmpty().withMessage('Country is required'),
];

// Validation rules for user update
const updateUserValidationRules = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('companyName').optional().notEmpty().withMessage('Company name cannot be empty'),
    body('industry').optional().isIn(['Oil & Gas', 'Chemical', 'Pharma', 'Sugar', 'Solar', 'Wind']).withMessage('Valid industry is required'),
    body('country').optional().notEmpty().withMessage('Country cannot be empty'),
];

// Validation rules for subscription update
const updateSubscriptionValidationRules = [
    body('planId').optional().isInt().withMessage('Plan ID must be an integer'),
    body('startDate').optional().isISO8601().withMessage('Start date must be a valid date'),
    body('endDate').optional().isISO8601().withMessage('End date must be a valid date'),
    body('status').optional().isIn(['active', 'inactive', 'cancelled']).withMessage('Status must be active, inactive, or cancelled'),
    body('NoofProjects').optional().isInt({ min: 0 }).withMessage('Number of projects must be a non-negative integer'),
    body('NoofSpecs').optional().isInt({ min: 0 }).withMessage('Number of specs must be a non-negative integer')
];

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users with pagination and search
 *     tags: [Admin Users]
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
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email, or company
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin privileges required
 */
router.get('/', getAllUsers);

/**
 * @swagger
 * /admin/users/analytics:
 *   get:
 *     summary: Get user analytics and insights
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 */
router.get('/analytics', getUserAnalytics);
router.get('/simple-analytics', getSimpleAnalytics);

/**
 * @swagger
 * /admin/users/plans:
 *   get:
 *     summary: Get available plans for subscription selection
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Plans retrieved successfully
 */
router.get('/plans', getAvailablePlans);

/**
 * @swagger
 * /admin/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get('/:userId', getUserById);

/**
 * @swagger
 * /admin/users:
 *   post:
 *     summary: Create new user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/', createUserValidationRules, createUser);

/**
 * @swagger
 * /admin/users/{userId}:
 *   put:
 *     summary: Update user
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               companyName:
 *                 type: string
 *               industry:
 *                 type: string
 *               country:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 */
router.put('/:userId', updateUserValidationRules, updateUser);

/**
 * @swagger
 * /admin/users/{userId}:
 *   delete:
 *     summary: Delete user (soft delete)
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete('/:userId', deleteUser);

/**
 * @swagger
 * /admin/users/{userId}/subscription:
 *   put:
 *     summary: Update user subscription
 *     tags: [Admin Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
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
 *                 type: integer
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
 *         description: User or plan not found
 */
router.put('/:userId/subscription', updateSubscriptionValidationRules, updateUserSubscription);

export default router;
