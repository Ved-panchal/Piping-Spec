"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidationRules = void 0;
const express_validator_1 = require("express-validator");
exports.loginValidationRules = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Please provide a valid email address'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
