"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.generateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h',
    });
};
exports.generateJWT = generateJWT;
// Enhance verifyJWT to handle expiration
const verifyJWT = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        return { valid: true, expired: false, decoded };
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return { valid: false, expired: true };
        }
        return { valid: false, expired: false };
    }
};
exports.verifyJWT = verifyJWT;
