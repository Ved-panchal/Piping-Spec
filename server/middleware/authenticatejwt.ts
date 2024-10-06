import { Request, Response, NextFunction } from 'express';
import { verifyJWT } from '../utils/jwt';

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Try to get the token from cookies first
        let token = req.cookies.token;

        // If token is not in cookies, check the Authorization header
        if (!token) {
            token = req.headers.authorization?.split(' ')[1];
        }

        // If there's still no token, deny access
        if (!token) {
            res.status(401).json({ error: 'Access denied, no token provided' });
            return; // End the function after sending the response
        }

        const decoded = verifyJWT(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid token' });
            return; // End the function after sending the response
        }

        (req as any).user = decoded; // Attach decoded user info to the request
        next(); // Call next() to pass control to the next middleware or route handler
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
