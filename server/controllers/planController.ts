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

        res.status(201).json({ message: "Plan Created Successfully.", newPlan });
    } catch (error: unknown) {
        console.error("Error creating plan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update Plan
export const updatePlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;
        const { planName, noOfProjects, noOfSpecs, allowedDays } = req.body;

        const plan = await db.Plan.findOne({ where: { planId } });

        if (!plan) {
            res.status(404).json({ error: "Plan not found" });
            return;
        }

        await plan.update({
            planName,
            noOfProjects,
            noOfSpecs,
            allowedDays
        });

        res.status(200).json({ message: "Plan updated successfully", plan });
    } catch (error: unknown) {
        console.error("Error updating plan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Get Plan by PlanId
export const getPlanById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;

        const plan = await db.Plan.findOne({ where: { planId } });

        if (!plan) {
            res.status(404).json({ error: "Plan not found" });
            return;
        }

        res.status(200).json(plan);
    } catch (error: unknown) {
        console.error("Error fetching plan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Plan (Soft Delete)
export const deletePlan = async (req: Request, res: Response): Promise<void> => {
    try {
        const { planId } = req.params;

        const plan = await db.Plan.findOne({ where: { planId } });

        if (!plan) {
            res.status(404).json({ error: "Plan not found" });
            return;
        }

        await plan.update({ isDeleted: true });

        res.status(200).json({ message: "Plan deleted successfully" });
    } catch (error: unknown) {
        console.error("Error deleting plan:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
