import { body } from 'express-validator';

export const loginValidationRules = [
    body('email').isEmail().withMessage('Please provide a valid email address'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Validator for sending OTP
export const validateSendOTP = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .trim()
];

// Validator for verifying OTP
export const validateVerifyOTP = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .trim(),
    body('otp')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits')
        .isNumeric()
        .withMessage('OTP must contain only numbers')
];

// Validator for resetting password
export const validateResetPassword = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .trim(),
    body('newPassword')
        .isLength({ min: 6, max: 12 })
        .withMessage('Password must be between 6 and 12 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('otpToken')
        .notEmpty()
        .withMessage('OTP token is required')
        .isNumeric()
        .withMessage('Invalid OTP token format')
];