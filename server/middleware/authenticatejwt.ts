import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';
import db from '../models';
import { Op } from 'sequelize';

export const authenticateJWT = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.json({ status: "401", message: 'Access denied, no token provided' });
            return;
        }

        const { valid, expired, decoded } = verifyJWT(token);

        if (!valid) {
            if (expired) {
                res.json({ status: "401", error: 'Token expired' });
            } else {
                res.json({ status: "401", error: 'Invalid token' });
            }
            return;
        }

        // Safety check: decoded payload must include user id
        if (!decoded || !(decoded as any).id) {
            res.json({ status: "401", error: 'Invalid token payload' });
            return;
        }

        // Check if session is still active in database
        // const session = await db.Session.findOne({
        //     where: {
        //         token: token,
        //         is_active: true,
        //         user_id: (decoded as any).id,
        //         expiresAt: { [Op.gt]: new Date() }
        //     }
        // });

        // if (!session) {
        //     res.json({ 
        //         status: "401", 
        //         error: 'Session invalid or expired. Please login again.',
        //         sessionExpired: true 
        //     });
        //     return;
        // }

        (req as any).user = decoded;
        next();
    } catch (error) {
        res.json({ error: 'Internal Server error' });
    }
};
