import { Request, Response } from "express";
import db from "../models";
import { hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";

// Create User
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, companyName, email, industry, country, phoneNumber, password } = req.body;

        const hashedPassword = await hashPassword(password);
        const user = await db.User.findOne({ where: { email } }) || null;

        if (user && user.isDeleted === true) {
            const updatedData: any = {
                name,
                companyName,
                industry,
                country,
                phoneNumber,
                isDeleted: 'false'
            };

            if (password) {
                updatedData.password = await hashPassword(password);
            }

            await user.update(updatedData);
            const token = generateJWT({ id: user.id, email: user.email }); // Generate a token for the existing user
            res.cookie('token', token, { httpOnly: true,maxAge: 3600000 }); // Set token in a cookie
            res.status(200).json(user);
            return;
        }

        if (user && user.isDeleted === false) {
            res.status(200).json({ msg: "User is already registered" });
            return;
        }

        const newUser = await db.User.create({
            name,
            companyName,
            email,
            industry,
            country,
            phoneNumber,
            password: hashedPassword
        });

        const token = generateJWT({ id: newUser.id, email: newUser.email }); // Generate a token for the new user
        res.cookie('token', token, { httpOnly: true }); // Set token in a cookie
        res.status(201).json(newUser);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error creating user:", error.message);
            res.status(400).json({ error: error.message });
            return;
        }
        console.error("Unexpected error while creating user:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
}

// Update User
export const updateUser = async (req: Request, res: Response):Promise<void> => {
    try {
        const {email, name, companyName, industry, country, phoneNumber, password } = req.body;

        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Update the password only if it's provided and hash it
        const updatedData: any = {
            name,
            companyName,
            industry,
            country,
            phoneNumber,
        };

        if (password) {
            updatedData.password = await hashPassword(password);
        }

        await user.update(updatedData);
        res.status(200).json(user);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error updating user:", error.message);
            res.status(400).json({ error: error.message });
            return;
        }
        console.error("Unexpected error while updating user:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
    }
}

// Get User by Email
export const getUserByEmail = async (req: Request, res: Response):Promise<void> => {
    try {
        const { email } = req.body;

        const user = await db.User.findOne({ where: { email, isDeleted: false } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.status(200).json(user);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching user:", error.message);
            res.status(400).json({ error: error.message });
            return;
        }
        console.error("Unexpected error while fetching user:", error);
        res.status(500).json({ error: "An unexpected error occurred." });
        return;
    }
}


export const deleteUser = async (req:Request, res:Response):Promise<void> => {
    try {
        // const { email } = req.body;
        const email = (req as any).user.email;

        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Soft delete by setting isDeleted to true
        await user.update({ isDeleted: true });
        res.status(200).json({msg:"User Deleted Successfully."}); 
    } catch (error:unknown) {
        if (error instanceof Error) {
            console.error("Error deleting user:", error.message);
            res.status(400).json({ error: error.message });
        } else {
            console.error("Unexpected error:", error);
            res.status(500).json({ error: "An unexpected error occurred." });
        }
    }
}
