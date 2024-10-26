"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWT = exports.generateJWT = void 0;
// utils/jwt.ts
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateJWT = (payload) => {
    return jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h', // Token expires in 1 hour
    });
};
exports.generateJWT = generateJWT;
const verifyJWT = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
    }
    catch (error) {
        return null; // Token verification failed
    }
};
exports.verifyJWT = verifyJWT;
