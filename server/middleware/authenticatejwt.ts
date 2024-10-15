import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Try to get the token from cookies first
        let token = req.cookies.token;
        if (!token) {
            token = req.headers.authorization?.split(' ')[1];
        }
        
        if (!token) {
            res.status(401).json({ message: 'Access denied, no token provided' });
            return;
        }
        
        const decoded = verifyJWT(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }

        (req as any).user = decoded; 
        next(); 
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
