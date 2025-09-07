import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from '../models';
import { Op, QueryTypes } from 'sequelize';

// Type definitions for query results
interface UserByPlan {
    planName: string;
    count: number;
}

interface Trend {
    date: string;
    count: number;
}

interface UserByPlan {
  planName: string;
  count: number;
}

interface Trend {
  date: string;
  count: number;
}

// Get all users with pagination and search
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const search = req.query.search as string || '';
        const offset = (page - 1) * limit;

        const whereClause: any = {
            isDeleted: false,
            role: 'user' // Only show regular users, not admins
        };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { email: { [Op.iLike]: `%${search}%` } },
                { companyName: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const { count, rows: users } = await db.User.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['createdAt', 'DESC']],
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Subscription,
                    as: 'subscriptions',
                    required: false,
                    include: [
                        {
                            model: db.Plan,
                            as: 'plan',
                            required: false
                        }
                    ]
                }
            ]
        });

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(count / limit),
                    totalUsers: count,
                    hasNext: page < Math.ceil(count / limit),
                    hasPrev: page > 1
                }
            },
            status: "200"
        });
    } catch (error: any) {
        console.error('Error fetching users:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Get user analytics/insights
export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Starting to fetch user analytics...');
        
        // Get total users count
        const totalUsers = await db.User.count({
            where: { isDeleted: false, role: 'user' }
        });
        console.log('Total users:', totalUsers);

        // Get subscription statistics
        const activeSubscriptions = await db.Subscription.count({
            where: { status: 'active' }
        });
        console.log('Active subscriptions:', activeSubscriptions);

        const inactiveSubscriptions = await db.Subscription.count({
            where: { status: 'inactive' }
        });
        console.log('Inactive subscriptions:', inactiveSubscriptions);

        const cancelledSubscriptions = await db.Subscription.count({
            where: { status: 'cancelled' }
        });
        console.log('Cancelled subscriptions:', cancelledSubscriptions);

        // Get users by industry
        const usersByIndustry = await db.User.findAll({
            where: { isDeleted: false, role: 'user' },
            attributes: [
                'industry',
                [db.sequelize.fn('COUNT', db.sequelize.col('industry')), 'count']
            ],
            group: ['industry'],
            raw: true
        });

        // Get users by plan with proper associations
        let usersByPlan: UserByPlan[] = [];
        try {
            usersByPlan = await db.sequelize.query(
                `SELECT p."planName", COUNT(s.id)::integer as count 
                 FROM subscriptions s 
                 JOIN plans p ON s."planId" = p."planId" 
                 GROUP BY p."planId", p."planName"
                 ORDER BY count DESC`,
                { type: QueryTypes.SELECT }
            );
            console.log('Users by plan:', usersByPlan);
        } catch (planError) {
            console.error('Error fetching users by plan:', planError);
            usersByPlan = [];
        }

        // Get user registration trends (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        let registrationTrends: Trend[] = [];
        try {
            registrationTrends = await db.sequelize.query(
                `SELECT DATE("created_at") as date, COUNT(id)::integer as count 
                 FROM users 
                 WHERE "is_deleted" = false 
                 AND role = 'user' 
                 AND "created_at" >= :thirtyDaysAgo 
                 GROUP BY DATE("created_at") 
                 ORDER BY DATE("created_at") ASC`,
                {
                    replacements: { thirtyDaysAgo },
                    type: QueryTypes.SELECT
                }
            );
            console.log('Registration trends:', registrationTrends);
        } catch (trendsError) {
            console.error('Error fetching registration trends:', trendsError);
            registrationTrends = [];
        }

        // Get subscription trends (last 30 days)
        let subscriptionTrends: Trend[] = [];
        try {
            subscriptionTrends = await db.sequelize.query(
                `SELECT DATE("createdAt") as date, COUNT(id)::integer as count 
                 FROM subscriptions 
                 WHERE "createdAt" >= :thirtyDaysAgo 
                 GROUP BY DATE("createdAt") 
                 ORDER BY DATE("createdAt") ASC`,
                {
                    replacements: { thirtyDaysAgo },
                    type: QueryTypes.SELECT
                }
            );
            console.log('Subscription trends:', subscriptionTrends);
        } catch (subTrendsError) {
            console.error('Error fetching subscription trends:', subTrendsError);
            subscriptionTrends = [];
        }

        // Recent users count
        const recentUsers = await db.User.count({
            where: {
                isDeleted: false,
                role: 'user',
                createdAt: {
                    [Op.gte]: thirtyDaysAgo
                }
            }
        });

        // Calculate additional metrics for insights
        const totalSubscriptions = activeSubscriptions + inactiveSubscriptions + cancelledSubscriptions;

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    activeSubscriptions,
                    inactiveSubscriptions,
                    cancelledSubscriptions,
                    recentUsers
                },
                usersByIndustry,
                usersByPlan,
                registrationTrends,
                subscriptionTrends,
                subscriptionStatus: {
                    active: activeSubscriptions,
                    inactive: inactiveSubscriptions,
                    cancelled: cancelledSubscriptions
                }
            },
            status: "200"
        });
    } catch (error: any) {
        console.error('Error fetching user analytics:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Get single user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

        const user = await db.User.findOne({
            where: { id: userId, isDeleted: false },
            attributes: { exclude: ['password'] },
            include: [
                {
                    model: db.Subscription,
                    as: 'subscriptions',
                    required: false,
                    include: [
                        {
                            model: db.Plan,
                            as: 'plan',
                            required: false
                        }
                    ]
                },
                {
                    model: db.Project,
                    required: false,
                    where: { isDeleted: false }
                }
            ]
        });

        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }

        res.json({
            success: true,
            data: user,
            status: "200"
        });
    } catch (error: any) {
        console.error('Error fetching user:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Create new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
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

        const { name, email, password, companyName, industry, country, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await db.User.findOne({
            where: { email, isDeleted: false }
        });

        if (existingUser) {
            res.json({
                success: false,
                error: "User with this email already exists",
                status: "400"
            });
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await db.User.create({
            name,
            email,
            password: hashedPassword,
            companyName,
            industry,
            country,
            phoneNumber: phoneNumber || null,
            role: 'user'
        });

        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.json({
            success: true,
            message: "User created successfully",
            data: userWithoutPassword,
            status: "201"
        });
    } catch (error: any) {
        console.error('Error creating user:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Update user
export const updateUser = async (req: Request, res: Response): Promise<void> => {
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

        const { userId } = req.params;
        const { name, email, companyName, industry, country, phoneNumber } = req.body;

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

        // Check if email is being changed and if it already exists
        if (email && email !== user.email) {
            const existingUser = await db.User.findOne({
                where: { email, isDeleted: false, id: { [Op.ne]: userId } }
            });

            if (existingUser) {
                res.json({
                    success: false,
                    error: "User with this email already exists",
                    status: "400"
                });
                return;
            }
        }

        // Update user
        await user.update({
            name: name || user.name,
            email: email || user.email,
            companyName: companyName || user.companyName,
            industry: industry || user.industry,
            country: country || user.country,
            phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber
        });

        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.json({
            success: true,
            message: "User updated successfully",
            data: userWithoutPassword,
            status: "200"
        });
    } catch (error: any) {
        console.error('Error updating user:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Delete user (soft delete)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { userId } = req.params;

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

        // Soft delete user
        await user.update({ isDeleted: true });

        res.json({
            success: true,
            message: "User deleted successfully",
            status: "200"
        });
    } catch (error: any) {
        console.error('Error deleting user:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};
