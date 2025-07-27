// controllers/passwordResetController.ts
import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import db from '../models';
import { sendOTPEmail, sendPasswordResetSuccessEmail } from "../services/nodemailer";
import { Op } from 'sequelize';

// Generate 6-digit OTP
const generateOTP = (): string => {
    return crypto.randomInt(100000, 999999).toString();
};

// Function 1: Send OTP to email
export const sendPasswordResetOTP = async (req: Request, res: Response): Promise<void> => {
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

        const { email } = req.body;

        // Check if user exists
        const user = await db.User.findOne({ 
            where: { email, isDeleted: false } 
        });
        
        if (!user) {
            res.json({
                success: false,
                error: "User with this email does not exist",
                status: "404"
            });
            return;
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Delete any existing OTPs for this email (cleanup)
        await db.OTP.destroy({
            where: { 
                email, 
                purpose: 'password_reset' 
            }
        });

        // Save OTP to database
        await db.OTP.create({
            email,
            otp,
            expiresAt,
            purpose: 'password_reset'
        });

        // Send OTP via email
        const emailSent = await sendOTPEmail(email, otp);
        
        if (!emailSent) {
            res.json({
                success: false,
                error: "Failed to send OTP email",
                status: "500"
            });
            return;
        }

        res.json({
            success: true,
            message: "OTP sent successfully to your email",
            status: "200"
        });

    } catch (error: any) {
        console.error('Error sending OTP:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Function 2: Verify OTP
export const verifyPasswordResetOTP = async (req: Request, res: Response): Promise<void> => {
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

        const { email, otp } = req.body;

        // Find the OTP record
        const otpRecord = await db.OTP.findOne({
            where: {
                email,
                otp,
                purpose: 'password_reset',
                isUsed: false
            }
        });

        if (!otpRecord) {
            res.json({
                success: false,
                error: "Invalid OTP",
                status: "400"
            });
            return;
        }

        // Check if OTP has expired
        if (new Date() > otpRecord.expiresAt) {
            // Clean up expired OTP
            await db.OTP.destroy({
                where: { id: otpRecord.id }
            });
            
            res.json({
                success: false,
                error: "OTP has expired. Please request a new one.",
                status: "400"
            });
            return;
        }

        // Mark OTP as used (but don't delete it yet, we'll need it for password reset)
        await db.OTP.update(
            { isUsed: true },
            { where: { id: otpRecord.id } }
        );

        res.json({
            success: true,
            message: "OTP verified successfully",
            otpToken: otpRecord.id, // Send OTP ID as token for password reset
            status: "200"
        });

    } catch (error: any) {
        console.error('Error verifying OTP:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Function 3: Reset Password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
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

        const { email, newPassword, otpToken } = req.body;

        // Verify the OTP token is valid and used
        const otpRecord = await db.OTP.findOne({
            where: {
                id: otpToken,
                email,
                purpose: 'password_reset',
                isUsed: true
            }
        });

        if (!otpRecord) {
            res.json({
                success: false,
                error: "Invalid or expired reset token",
                status: "400"
            });
            return;
        }

        // Check if OTP token has expired (even after being used)
        if (new Date() > otpRecord.expiresAt) {
            // Clean up expired OTP
            await db.OTP.destroy({
                where: { id: otpRecord.id }
            });
            
            res.json({
                success: false,
                error: "Reset token has expired. Please start the process again.",
                status: "400"
            });
            return;
        }

        // Find the user
        const user = await db.User.findOne({ 
            where: { email, isDeleted: false } 
        });
        
        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }

        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update user password
        await db.User.update(
            { password: hashedPassword },
            { where: { id: user.id } }
        );

        // Clean up the used OTP
        await db.OTP.destroy({
            where: { id: otpRecord.id }
        });

        // Send confirmation email (optional)
        await sendPasswordResetSuccessEmail(email);

        res.json({
            success: true,
            message: "Password reset successfully",
            status: "200"
        });

    } catch (error: any) {
        console.error('Error resetting password:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Utility function to clean up expired OTPs (you can run this periodically)
export const cleanupExpiredOTPs = async (): Promise<void> => {
    try {
        await db.OTP.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date()
                }
            }
        });
        console.log('Expired OTPs cleaned up');
    } catch (error) {
        console.error('Error cleaning up expired OTPs:', error);
    }
};