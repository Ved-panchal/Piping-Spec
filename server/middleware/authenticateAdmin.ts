import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';

export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            res.json({ 
                success: false,
                status: "401", 
                error: 'Access denied, no token provided' 
            });
            return;
        }

        const { valid, expired, decoded } = verifyJWT(token);

        if (!valid) {
            if (expired) {
                res.json({ 
                    success: false,
                    status: "401", 
                    error: 'Token expired' 
                });
            } else {
                res.json({ 
                    success: false,
                    status: "401", 
                    error: 'Invalid token' 
                });
            }
            return;
        }

        // Check if user has admin role
        if (!decoded || (decoded as any).role !== 'admin') {
            res.json({ 
                success: false,
                status: "403", 
                error: 'Access denied, admin privileges required' 
            });
            return;
        }

        (req as any).user = decoded;
        next();
    } catch (error) {
        res.json({ 
            success: false,
            error: 'Internal Server error' 
        });
    }
};
