// utils/jwt.ts
import jwt from 'jsonwebtoken';

export const generateJWT = (payload: { id: number; email: string }): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};

export const verifyJWT = (token: string): any => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET as string);
    } catch (error) {
        return null; // Token verification failed
    }
};
