"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateJWT = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            res.json({ status: "401", message: 'Access denied, no token provided' });
            return;
        }
        const { valid, expired, decoded } = (0, jwt_1.verifyJWT)(token);
        if (!valid) {
            if (expired) {
                res.json({ status: "401", error: 'Token expired' });
            }
            else {
                res.json({ status: "401", error: 'Invalid token' });
            }
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.json({ error: 'Internal Server error' });
    }
};
exports.authenticateJWT = authenticateJWT;
