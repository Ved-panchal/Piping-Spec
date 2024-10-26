"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = void 0;
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const models_1 = __importDefault(require("../models"));
const jwt_1 = require("../utils/jwt");
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            res.json({
                success: false,
                error: errors.array(),
                status: "400"
            });
            return;
        }
        const { email, password } = req.body;
        const user = yield models_1.default.User.findOne({ where: { email, isDeleted: false } });
        if (!user) {
            res.json({
                success: false,
                error: "Invalid credentials",
                status: "400"
            });
            return;
        }
        const isMatch = yield bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.json({
                success: false,
                error: "Invalid credentials",
                status: "400"
            });
            return;
        }
        const token = (0, jwt_1.generateJWT)({ id: user.id, email: user.email });
        res.cookie('token', token, { maxAge: 3600000, path: '/', sameSite: 'lax', secure: true });
        const _a = user.toJSON(), { password: _ } = _a, userWithoutPassword = __rest(_a, ["password"]);
        // Send success response
        res.json({
            success: true,
            message: "Login successful",
            user: userWithoutPassword,
            status: "200"
        });
    }
    catch (error) {
        console.error('Error logging in:', error.message);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
});
exports.loginUser = loginUser;
