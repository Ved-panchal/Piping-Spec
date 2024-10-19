import { Request, Response } from "express";
import db from "../models";

// Create Plan
export const createPlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planName, noOfProjects, noOfSpecs, allowedDays } = req.body;

        const newPlan = await db.Plan.create({
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
    } catch (error: unknown) {
        console.error("Error creating plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Update Plan
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;
        const { planName, noOfProjects, noOfSpecs, allowedDays } = req.body;

        const plan = await db.Plan.findOne({ where: { planId } });

        if (!plan) {
            res.json({
                success: false,
                error: "Plan not found",
                status: "404"
            });
            return;
        }

        await plan.update({
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
    } catch (error: unknown) {
        console.error("Error updating plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Get Plan by PlanId
export const getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;

        const plan = await db.Plan.findOne({ where: { planId } });

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
    } catch (error: unknown) {
        console.error("Error fetching plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};

// Delete Plan (Soft Delete)
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;

        const plan = await db.Plan.findOne({ where: { planId } });

        if (!plan) {
            res.json({
                success: false,
                error: "Plan not found",
                status: "404"
            });
            return;
        }

        await plan.update({ isDeleted: true });

        res.json({
            success: true,
            message: "Plan deleted successfully",
            status: "200"
        });
    } catch (error: unknown) {
        console.error("Error deleting plan:", error);
        res.json({
            success: false,
            error: "Internal server error",
            status: "500"
        });
    }
};
