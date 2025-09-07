import { Request, Response } from 'express';
import db from '../models';

// Simplified analytics that should work without complex queries
export const getSimpleAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('Starting simple analytics fetch...');
        
        // Basic counts that should always work
        const totalUsers = await db.User.count({
            where: { isDeleted: false, role: 'user' }
        });
        
        const activeSubscriptions = await db.Subscription.count({
            where: { status: 'active' }
        }).catch(() => 0);
        
        const inactiveSubscriptions = await db.Subscription.count({
            where: { status: 'inactive' }
        }).catch(() => 0);
        
        const cancelledSubscriptions = await db.Subscription.count({
            where: { status: 'cancelled' }
        }).catch(() => 0);
        
        // Get users by industry using simple query
        const usersByIndustry = await db.User.findAll({
            where: { isDeleted: false, role: 'user' },
            attributes: [
                'industry',
                [db.sequelize.fn('COUNT', db.sequelize.col('industry')), 'count']
            ],
            group: ['industry'],
            raw: true
        }).catch(() => []);
        
        // Calculate recent users (simple approach)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentUsers = await db.User.count({
            where: {
                isDeleted: false,
                role: 'user',
                createdAt: {
                    [db.sequelize.Op.gte]: thirtyDaysAgo
                }
            }
        }).catch(() => 0);
        
        console.log('Simple analytics completed successfully');
        
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
                usersByPlan: [], // Will be empty for now
                registrationTrends: [], // Will be empty for now
                subscriptionTrends: [], // Will be empty for now
                subscriptionStatus: {
                    active: activeSubscriptions,
                    inactive: inactiveSubscriptions,
                    cancelled: cancelledSubscriptions
                }
            },
            status: "200"
        });
    } catch (error: any) {
        console.error('Error in simple analytics:', error);
        res.json({
            success: false,
            error: "Error fetching analytics: " + error.message,
            status: "500"
        });
    }
};
