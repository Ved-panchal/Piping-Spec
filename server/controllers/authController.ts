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
                error: "Invalid credentials",
                status: "400"
            });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.json({
                success: false,
                error: "Invalid credentials",
                status: "400"
            });
            return;
        }

        const token = generateJWT({ id: user.id, email: user.email });
        res.cookie('token', token, { maxAge: 3600000, path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'none' });
        
        const { password: _, ...userWithoutPassword } = user.toJSON();

        // Send success response
        res.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
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
