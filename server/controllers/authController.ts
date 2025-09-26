import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import db from '../models';
import { generateJWT } from '../utils/jwt';

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    try {
        // Validate the request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.json({
                success: false,
                error: errors.array(),
                status: "400"
            });
            return;
        }

        const { email, password } = req.body;

        const user = await db.User.findOne({ where: { email, isDeleted: false } });
        if (!user) {
            res.json({
                success: false,
                error: "User is not exist",
                status: "400"
            });
            return;
        }

        const plan = await db.Subscription.findOne({ where: {userId:user.id}});

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.json({
                success: false,
                error: "Invalid credentials",
                status: "400"
            });
            return;
        }

        // Invalidate all existing sessions for this user
        await db.Session.update(
            { isActive: false },
            { where: { userId: user.id, isActive: true } }
        );

        const token = generateJWT({ id: user.id, email: user.email });
        
        // Get device info and IP address
        const userAgent = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown IP';
        
        // Create new session record
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
        
        await db.Session.create({
            userId: user.id,
            token: token,
            isActive: true,
            deviceInfo: userAgent,
            ipAddress: ipAddress,
            expiresAt: expiresAt
        });
        
        const { password: _, ...userWithoutPassword } = user.toJSON();

        // Send success response
        res.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
            token :token,
            plan: plan,
            status: "200"
        });
    } catch (error: any) {
        console.error('Error logging in:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.json({ success: false, status: "401", error: 'Access denied, no token provided' });
            return;
        }
        // Deactivate this session
        await db.Session.update({ isActive: false }, { where: { token } });
        res.json({ success: true, status: "200", message: 'Logged out successfully' });
    } catch (error:any) {
        res.json({ success: false, status: "500", error: 'Internal server error' });
    }
};
