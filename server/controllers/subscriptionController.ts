import { Request, Response } from 'express';
import db from '../models';

// GET /subscriptions/user
// Returns current user's subscriptions and current usage (projects/specs)
export const getCurrentUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    if (!user?.id) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    // Fetch subscriptions for the current user with plan details
    const subscriptions = await db.Subscription.findAll({
      where: { userId: user.id },
      include: [
        {
          model: db.Plan,
          as: 'plan',
          attributes: ['planId', 'planName', 'noOfProjects', 'noOfSpecs', 'allowedDays']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Current usage counts
    const projectsCount = await db.Project.count({ where: { userId: user.id, isDeleted: false } });

    // Count specs that belong to this user's projects
    const specsCount = await db.Spec.count({
      include: [{
        model: db.Project,
        as: 'project',
        where: { userId: user.id },
        attributes: []
      }]
    });

    res.json({
      success: true,
      subscriptions,
      currentUsage: {
        projects: projectsCount,
        specs: specsCount
      }
    });
    return;
  } catch (error) {
    console.error('Error in getCurrentUserSubscriptions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
};

// GET /subscriptions/plans
// Public list of plans for selection on client
export const getPublicPlans = async (_req: Request, res: Response): Promise<void> => {
  try {
    const plans = await db.Plan.findAll({
      attributes: ['planId', 'planName', 'noOfProjects', 'noOfSpecs', 'allowedDays'],
      order: [['allowedDays', 'ASC']]
    });
    res.json({ success: true, plans });
    return;
  } catch (error) {
    console.error('Error in getPublicPlans:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
    return;
  }
};
