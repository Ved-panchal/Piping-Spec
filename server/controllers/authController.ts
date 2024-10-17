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

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ error: 'Invalid credentials' });
            return;
        }

        const token = generateJWT({ id: user.id, email: user.email });
        // console.log(token);
        res.cookie('token', token, {maxAge: 3600000,path: '/',}); 
        const { password: _, ...userWithoutPassword } = user.toJSON();

        res.status(200).json({ user: userWithoutPassword });
    } catch (error: any) {
        console.error('Error logging in:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};
