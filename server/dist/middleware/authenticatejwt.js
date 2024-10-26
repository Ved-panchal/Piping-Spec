"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jwt_1 = require("../utils/jwt");
const authenticateJWT = (req, res, next) => {
    var _a;
    try {
        // Try to get the token from cookies first
        let token = req.cookies.token;
        if (!token) {
            token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        }
        if (!token) {
            res.status(401).json({ message: 'Access denied, no token provided' });
            return;
        }
        const decoded = (0, jwt_1.verifyJWT)(token);
        if (!decoded) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};
exports.authenticateJWT = authenticateJWT;
