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
exports.deletePlan = exports.getPlanById = exports.updatePlan = exports.createPlan = void 0;
const models_1 = __importDefault(require("../models"));
// Create Plan
const createPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { planName, noOfProjects, noOfSpecs, allowedDays } = req.body;
        const newPlan = yield models_1.default.Plan.create({
            planName,
            noOfProjects,
            noOfSpecs,
            allowedDays
        });
        res.json({
            success: true,
            message: "Plan created successfully.",
            plan: newPlan,
            status: "201"
        });
    }
    catch (error) {
        console.error("Error creating plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
});
exports.createPlan = createPlan;
// Update Plan
const updatePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { planId } = req.params;
        const { planName, noOfProjects, noOfSpecs, allowedDays } = req.body;
        const plan = yield models_1.default.Plan.findOne({ where: { planId } });
        if (!plan) {
            res.json({
                success: false,
                error: "Plan not found",
                status: "404"
            });
            return;
        }
        yield plan.update({
            planName,
            noOfProjects,
            noOfSpecs,
            allowedDays
        });
        res.json({
            success: true,
            message: "Plan updated successfully",
            plan,
            status: "200"
        });
    }
    catch (error) {
        console.error("Error updating plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
});
exports.updatePlan = updatePlan;
// Get Plan by PlanId
const getPlanById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { planId } = req.params;
        const plan = yield models_1.default.Plan.findOne({ where: { planId } });
        if (!plan) {
            res.json({
                success: false,
                error: "Plan not found",
                status: "404"
            });
            return;
        }
        res.json({
            success: true,
            message: "Plan fetched successfully",
            plan,
            status: "200"
        });
    }
    catch (error) {
        console.error("Error fetching plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
});
exports.getPlanById = getPlanById;
// Delete Plan (Soft Delete)
const deletePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { planId } = req.params;
        const plan = yield models_1.default.Plan.findOne({ where: { planId } });
        if (!plan) {
            res.json({
                success: false,
                error: "Plan not found",
                status: "404"
            });
            return;
        }
        yield plan.update({ isDeleted: true });
        res.json({
            success: true,
            message: "Plan deleted successfully",
            status: "200"
        });
    }
    catch (error) {
        console.error("Error deleting plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
});
exports.deletePlan = deletePlan;
