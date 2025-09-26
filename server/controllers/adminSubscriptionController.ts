import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import db from '../models';
import { Op } from 'sequelize';

// Get all plans
export const getAllPlans = async (req: Request, res: Response): Promise<void> => {
    try {
        const plans = await db.Plan.findAll({
            where: { isDeleted: false },
            order: [['planName', 'ASC']]
        });

        res.json({
            success: true,
            data: plans,
            status: "200"
        });
    } catch (error: any) {
        console.error('Error fetching plans:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Create subscription for user
export const createSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({
                success: false,
                error: errors.array(),
                status: "400"
            });
            return;
        }

        const { userId, planId, startDate, endDate, status, NoofProjects, NoofSpecs } = req.body;

        // Check if user exists
        const user = await db.User.findOne({
            where: { id: userId, isDeleted: false }
        });

        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }

        // Check if plan exists
        const plan = await db.Plan.findOne({
            where: { planId, isDeleted: false }
        });

        if (!plan) {
            res.json({
                success: false,
                error: "Plan not found",
                status: "404"
            });
            return;
        }

        // Create subscription
        const subscription = await db.Subscription.create({
            userId,
            planId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            status: status || 'active',
            NoofProjects: NoofProjects || plan.noOfProjects,
            NoofSpecs: NoofSpecs || plan.noOfSpecs
        });

        // Fetch the created subscription with plan details
        const createdSubscription = await db.Subscription.findOne({
            where: { id: subscription.id },
            include: [{
                model: db.Plan,
                as: 'plan'
            }]
        });

        res.json({
            success: true,
            message: "Subscription created successfully",
            data: createdSubscription,
            status: "201"
        });
    } catch (error: any) {
        console.error('Error creating subscription:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};
export const updateSubscription = async (req: Request, res: Response): Promise<void> => {
        try {

            const { subscriptionId } = req.params;
            const { planId, startDate, endDate, status, NoofProjects, NoofSpecs } = req.body;
            
            const subscription = await db.Subscription.findOne({
                where: { id: subscriptionId }
            });

            if (!subscription) {
                res.json({
                    success: false,
                    error: "Subscription not found",
                    status: "404"
                });
            return;
        }
        
        // If planId is being changed, verify the new plan exists and use its limits by default
        let targetPlan: any = null;
        if (planId) {
            targetPlan = await db.Plan.findOne({
                where: { planId, isDeleted: false }
            });
            
            if (!targetPlan) {
                res.json({
                    success: false,
                    error: "Plan not found",
                    status: "404"
                });
                return;
            }
        }
        
        // Derive limits: if body explicitly provides limits, use them; otherwise, when plan changes, inherit plan limits
        const derivedNoofProjects = (NoofProjects !== undefined)
        ? NoofProjects
        : (targetPlan ? targetPlan.noOfProjects : subscription.NoofProjects);
        const derivedNoofSpecs = (NoofSpecs !== undefined)
            ? NoofSpecs
            : (targetPlan ? targetPlan.noOfSpecs : subscription.NoofSpecs);

            // Update subscription
            await subscription.update({
                planId: planId || subscription.planId,
            startDate: startDate ? new Date(startDate) : subscription.startDate,
            endDate: endDate ? new Date(endDate) : subscription.endDate,
            status: status || subscription.status,
            NoofProjects: derivedNoofProjects,
            NoofSpecs: derivedNoofSpecs
        });
        
        // Fetch updated subscription with plan details
        const updatedSubscription = await db.Subscription.findOne({
            where: { id: subscription.id },
            include: [{
                model: db.Plan,
                as: 'plan'
            }]
        });
        
        res.json({
            success: true,
            message: "Subscription updated successfully",
            data: updatedSubscription,
            status: "200"
        });
    } catch (error: any) {
        console.error('Error updating subscription:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Delete subscription
export const deleteSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await db.Subscription.findOne({
            where: { id: subscriptionId }
        });

        if (!subscription) {
            res.json({
                success: false,
                error: "Subscription not found",
                status: "404"
            });
            return;
        }

        // Delete subscription
        await subscription.destroy();

        res.json({
            success: true,
            message: "Subscription deleted successfully",
            status: "200"
        });
    } catch (error: any) {
        console.error('Error deleting subscription:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Get subscription details
export const getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { subscriptionId } = req.params;

        const subscription = await db.Subscription.findOne({
            where: { id: subscriptionId },
            include: [
                {
                    model: db.Plan,
                    as: 'plan'
                },
                {
                    model: db.User,
                    as: 'user',
                    attributes: { exclude: ['password'] }
                }
            ]
        });

        if (!subscription) {
            res.json({
                success: false,
                error: "Subscription not found",
                status: "404"
            });
            return;
        }

        res.json({
            success: true,
            data: subscription,
            status: "200"
        });
    } catch (error: any) {
        console.error('Error fetching subscription:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Get all subscriptions with pagination and filtering
export const getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const status = req.query.status as string;
        const search = req.query.search as string || '';
        const offset = (page - 1) * limit;

        const whereClause: any = {};

        if (status && ['active', 'inactive', 'cancelled'].includes(status)) {
            whereClause.status = status;
        }

        const userWhereClause: any = {
            isDeleted: false,
            role: 'user'
        };

        if (search) {
            userWhereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { companyName: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: subscriptions } = await db.Subscription.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: db.Plan,
                    as: 'plan',
                    required: true
                },
                {
                    model: db.User,
                    as: 'user',
                    attributes: { exclude: ['password'] },
                    where: userWhereClause,
                    required: true
                }
            ]
        });

        res.json({
            success: true,
            data: {
                subscriptions,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalSubscriptions: count,
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1
                }
            },
            status: "200"
        });
    } catch (error: any) {
        console.error('Error fetching subscriptions:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};
