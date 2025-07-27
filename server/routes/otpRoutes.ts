// routes/passwordResetRoutes.ts
import { Router } from 'express';
import { 
    sendPasswordResetOTP, 
    verifyPasswordResetOTP, 
    resetPassword 
} from '../controllers/passwordResetController';
import { 
    validateSendOTP, 
    validateVerifyOTP, 
    validateResetPassword 
} from '../middleware/validateRequest';

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     SendOTPRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *     
 *     VerifyOTPRequest:
 *       type: object
 *       required:
 *         - email
 *         - otp
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         otp:
 *           type: string
 *           minLength: 6
 *           maxLength: 6
 *           pattern: '^[0-9]{6}$'
 *           description: 6-digit OTP code
 *           example: "123456"
 *     
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *         - newPassword
 *         - otpToken
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address
 *           example: "user@example.com"
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           maxLength: 12
 *           description: New password (6-12 chars, must contain uppercase, lowercase, and number)
 *           example: "NewPass123"
 *         otpToken:
 *           type: string
 *           description: OTP token received from verify-otp endpoint
 *           example: "123"
 *     
 *     SuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Operation completed successfully"
 *         status:
 *           type: string
 *           example: "200"
 *     
 *     VerifyOTPSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "OTP verified successfully"
 *         otpToken:
 *           type: string
 *           description: Token to be used for password reset
 *           example: "123"
 *         status:
 *           type: string
 *           example: "200"
 *     
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           oneOf:
 *             - type: string
 *             - type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                   message:
 *                     type: string
 *           example: "Error message"
 *         status:
 *           type: string
 *           example: "400"
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP for password reset
 *     description: Sends a 6-digit OTP to the user's email address for password reset. The OTP is valid for 10 minutes.
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendOTPRequest'
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "OTP sent successfully to your email"
 *               status: "200"
 *       400:
 *         description: Bad request - Invalid email format or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   error: [{"field": "email", "message": "Please provide a valid email address"}]
 *                   status: "400"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "User with this email does not exist"
 *               status: "404"
 *       500:
 *         description: Internal server error - Failed to send email or database error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               email_error:
 *                 summary: Email sending failed
 *                 value:
 *                   success: false
 *                   error: "Failed to send OTP email"
 *                   status: "500"
 *               server_error:
 *                 summary: Internal server error
 *                 value:
 *                   success: false
 *                   error: "Internal server error"
 *                   status: "500"
 */
router.post('/send-otp', validateSendOTP, sendPasswordResetOTP);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP for password reset
 *     description: Verifies the 6-digit OTP sent to the user's email. Returns an OTP token that must be used for password reset.
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyOTPRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VerifyOTPSuccessResponse'
 *             example:
 *               success: true
 *               message: "OTP verified successfully"
 *               otpToken: "123"
 *               status: "200"
 *       400:
 *         description: Bad request - Invalid OTP, expired OTP, or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   error: [{"field": "otp", "message": "OTP must be exactly 6 digits"}]
 *                   status: "400"
 *               invalid_otp:
 *                 summary: Invalid OTP
 *                 value:
 *                   success: false
 *                   error: "Invalid OTP"
 *                   status: "400"
 *               expired_otp:
 *                 summary: Expired OTP
 *                 value:
 *                   success: false
 *                   error: "OTP has expired. Please request a new one."
 *                   status: "400"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Internal server error"
 *               status: "500"
 */
router.post('/verify-otp', validateVerifyOTP, verifyPasswordResetOTP);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: Resets the user's password using the OTP token received from the verify-otp endpoint. The new password must meet security requirements.
 *     tags:
 *       - Password Reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Password reset successfully"
 *               status: "200"
 *       400:
 *         description: Bad request - Invalid token, expired token, or validation errors
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               validation_error:
 *                 summary: Validation error
 *                 value:
 *                   success: false
 *                   error: [{"field": "newPassword", "message": "Password must contain at least one uppercase letter, one lowercase letter, and one number"}]
 *                   status: "400"
 *               invalid_token:
 *                 summary: Invalid OTP token
 *                 value:
 *                   success: false
 *                   error: "Invalid or expired reset token"
 *                   status: "400"
 *               expired_token:
 *                 summary: Expired reset token
 *                 value:
 *                   success: false
 *                   error: "Reset token has expired. Please start the process again."
 *                   status: "400"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "User not found"
 *               status: "404"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "Internal server error"
 *               status: "500"
 */
router.post('/reset-password', validateResetPassword, resetPassword);

export default router;