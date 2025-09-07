import jwt, { JwtPayload } from 'jsonwebtoken';

export const generateJWT = (payload: { id: number; email: string; role?: string }): string => {
    return jwt.sign(payload, process.env.JWT_SECRET as string, {
        expiresIn: '1h',
    });
};

// Enhance verifyJWT to handle expiration
export const verifyJWT = (token: string): { valid: boolean; expired: boolean; decoded?: JwtPayload } => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        return { valid: true, expired: false, decoded };
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, expired: true };
        }
        return { valid: false, expired: false };
    }
};
