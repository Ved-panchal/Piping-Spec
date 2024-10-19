import { Request, Response } from "express";
import db from "../models";
import { hashPassword } from "../utils/auth";
import { generateJWT } from "../utils/jwt";

// Create User
export const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, companyName, email, industry, country, phoneNumber, password, plan } = req.body;

        const hashedPassword = await hashPassword(password);
        const user = await db.User.findOne({ where: { email } }) || null;

        if (user && user.isDeleted === true) {
            const updatedData: any = {
                name,
                companyName,
                industry,
                country,
                phoneNumber,
                isDeleted: false
            };

            if (password) {
                updatedData.password = await hashPassword(password);
            }

            await user.update(updatedData);
            const token = generateJWT({ id: user.id, email: user.email });
            res.cookie('token', token, { httpOnly: true, maxAge: 3600000 });

            res.json({
                success: true,
                message: "User updated successfully",
                user,
                status: "200"
            });
            return;
        }

        if (user && user.isDeleted === false) {
            res.json({
                success: false,
                error: "User is already registered",
                status: "409"
            });
            return;
        }

        // Fetch the selected plan details
        const selectedPlan = await db.Plan.findOne({ where: { planId: plan } });
        if (!selectedPlan) {
            res.json({
                success: false,
                error: "Selected plan not found",
                status: "404"
            });
            return;
        }

        // Create a new user
        const newUser = await db.User.create({
            name,
            companyName,
            email,
            industry,
            country,
            phoneNumber,
            password: hashedPassword
        });

        // Create a subscription for the user
        await db.Subscription.create({
            userId: newUser.id,
            planId: selectedPlan.planId,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + selectedPlan.allowedDays)),
            NoofProjects: selectedPlan.noOfProjects,
            NoofSpecs: selectedPlan.noOfSpecs,
            status: 'active'
        });

        const token = generateJWT({ id: newUser.id, email: newUser.email });
        res.cookie('token', token, { httpOnly: true });

        res.json({
            success: true,
            message: "User created successfully",
            user: newUser,
            status: "201"
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error creating user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        } else {
            console.error("Unexpected error while creating user:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
};

// Update User
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, name, companyName, industry, country, phoneNumber, password } = req.body;

        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
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
        res.json({
            success: true,
            message: "User updated successfully",
            user,
            status: "200"
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error updating user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        } else {
            console.error("Unexpected error while updating user:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
};

// Get User by Email
export const getUserByEmail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;

        const user = await db.User.findOne({ where: { email, isDeleted: false } });

        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }

        res.json({
            success: true,
            message: "User fetched successfully",
            user,
            status: "200"
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error fetching user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        } else {
            console.error("Unexpected error while fetching user:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
};

// Delete User
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const email = (req as any).user.email;

        const user = await db.User.findOne({ where: { email } });

        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }

        // Soft delete by setting isDeleted to true
        await user.update({ isDeleted: true });
        res.json({
            success: true,
            message: "User deleted successfully",
            status: "200"
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error("Error deleting user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        } else {
            console.error("Unexpected error:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
};
