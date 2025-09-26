import { Router } from 'express';
import { authenticateJWT } from '../middleware/authenticatejwt';
import { getCurrentUserSubscriptions, getPublicPlans } from '../controllers/subscriptionController';

const router = Router();

// Get current user's subscriptions and usage
router.get('/user', authenticateJWT, getCurrentUserSubscriptions);

// Public: get available plans
router.get('/plans', getPublicPlans);

export default router;
