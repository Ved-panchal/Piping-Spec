import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
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

        (req as any).user = decoded;
        next();
    } catch (error) {
        res.json({ error: 'Internal Server error' });
    }
};
