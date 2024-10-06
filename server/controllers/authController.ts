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
            res.status(400).json({ errors: errors.array() });
            return;
        }

        const { email, password } = req.body;

        const user = await db.User.findOne({ where: { email, isDeleted: false } });
        if (!user) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        // Check if the password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const token = generateJWT({ id: user.id, email: user.email });

        // Set the token in cookies
        res.cookie('token', token, {
            httpOnly: true, // Helps mitigate the risk of client-side script accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            maxAge: 3600000, // Set cookie expiration (1 hour in milliseconds)
        });

        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.status(200).json({ user: userWithoutPassword });
    } catch (error: any) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
