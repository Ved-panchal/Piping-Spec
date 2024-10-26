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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.getUserByEmail = exports.updateUser = exports.createUser = void 0;
const models_1 = __importDefault(require("../models"));
const auth_1 = require("../utils/auth");
const jwt_1 = require("../utils/jwt");
// Create User
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, companyName, email, industry, country, phoneNumber, password, plan } = req.body;
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        const user = (yield models_1.default.User.findOne({ where: { email } })) || null;
        if (user && user.isDeleted === true) {
            const updatedData = {
                name,
                companyName,
                industry,
                country,
                phoneNumber,
                isDeleted: false
            };
            if (password) {
                updatedData.password = yield (0, auth_1.hashPassword)(password);
            }
            yield user.update(updatedData);
            const token = (0, jwt_1.generateJWT)({ id: user.id, email: user.email });
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
        const selectedPlan = yield models_1.default.Plan.findOne({ where: { planId: plan } });
        if (!selectedPlan) {
            res.json({
                success: false,
                error: "Selected plan not found",
                status: "404"
            });
            return;
        }
        // Create a new user
        const newUser = yield models_1.default.User.create({
            name,
            companyName,
            email,
            industry,
            country,
            phoneNumber,
            password: hashedPassword
        });
        // Create a subscription for the user
        yield models_1.default.Subscription.create({
            userId: newUser.id,
            planId: selectedPlan.planId,
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + selectedPlan.allowedDays)),
            NoofProjects: selectedPlan.noOfProjects,
            NoofSpecs: selectedPlan.noOfSpecs,
            status: 'active'
        });
        const token = (0, jwt_1.generateJWT)({ id: newUser.id, email: newUser.email });
        res.cookie('token', token, { httpOnly: true });
        res.json({
            success: true,
            message: "User created successfully",
            user: newUser,
            status: "201"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error creating user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        }
        else {
            console.error("Unexpected error while creating user:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
});
exports.createUser = createUser;
// Update User
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, companyName, industry, country, phoneNumber, password } = req.body;
        const user = yield models_1.default.User.findOne({ where: { email } });
        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }
        // Update the password only if it's provided and hash it
        const updatedData = {
            name,
            companyName,
            industry,
            country,
            phoneNumber,
        };
        if (password) {
            updatedData.password = yield (0, auth_1.hashPassword)(password);
        }
        yield user.update(updatedData);
        res.json({
            success: true,
            message: "User updated successfully",
            user,
            status: "200"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error updating user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        }
        else {
            console.error("Unexpected error while updating user:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
});
exports.updateUser = updateUser;
// Get User by Email
const getUserByEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield models_1.default.User.findOne({ where: { email, isDeleted: false } });
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
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error fetching user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        }
        else {
            console.error("Unexpected error while fetching user:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
});
exports.getUserByEmail = getUserByEmail;
// Delete User
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.user.email;
        const user = yield models_1.default.User.findOne({ where: { email } });
        if (!user) {
            res.json({
                success: false,
                error: "User not found",
                status: "404"
            });
            return;
        }
        // Soft delete by setting isDeleted to true
        yield user.update({ isDeleted: true });
        res.json({
            success: true,
            message: "User deleted successfully",
            status: "200"
        });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error("Error deleting user:", error.message);
            res.json({
                success: false,
                error: error.message,
                status: "400"
            });
        }
        else {
            console.error("Unexpected error:", error);
            res.json({
                success: false,
                error: "An unexpected error occurred.",
                status: "500"
            });
        }
    }
});
exports.deleteUser = deleteUser;
