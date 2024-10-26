import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        let token = req.headers.authorization?.split(' ')[1];
        console.log(token);
        
        if (!token) {
             res.json({status:"401", message: 'Access denied, no token provided' });
             return;
        }
        
        const decoded = verifyJWT(token);
        if (!decoded) {
            res.json({status:"401", error: 'Invalid token' });
            return;
        }

        (req as any).user = decoded; 
        next(); 
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
