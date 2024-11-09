import { Request, Response } from "express";
import db from "../models";

// Create Dimensional Standard
export const createDimensionalStandard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { component_id, dimensional_standard } = req.body;

        // Check if component exists
        const component = await db.Component.findByPk(component_id);
        if (!component) {
            res.json({ success: false, error: "Component not found.", status: 404 });
            return;
        }

        const newDimensionalStandard = await db.DimensionalStandard.create({
            component_id,
            dimensional_standard
        });

        res.json({ success: true, message: "Dimensional Standard created successfully.", status: 201, newDimensionalStandard });
    } catch (error: unknown) {
        console.error("Error creating Dimensional Standard:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

// Update Dimensional Standard
export const updateDimensionalStandard = async (req: Request, res: Response): Promise<void> => {
    try {
        const {id, dimensional_standard } = req.body;

        const dimensionalStandard = await db.DimensionalStandard.findByPk(id);

        if (!dimensionalStandard) {
            res.json({ success: false, error: "Dimensional Standard not found.", status: 404 });
            return;
        }

        await dimensionalStandard.update({ dimensional_standard });

        res.json({ success: true, message: "Dimensional Standard updated successfully.", status: 200, dimensionalStandard });
    } catch (error: unknown) {
        console.error("Error updating Dimensional Standard:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

// Get All Dimensional Standards
export const getAllDimensionalStandards = async (req: Request, res: Response): Promise<void> => {
    try {
        const dimensionalStandards = await db.DimensionalStandard.findAll({
            include: [{ model: db.Component, as: "components" }]
        });

        res.json({ success: true, message: "Dimensional Standards fetched successfully.", status: 200, dimensionalStandards });
    } catch (error: unknown) {
        console.error("Error fetching Dimensional Standards:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

// Get Dimensional Standards by Component ID
export const getDimensionalStandardsByComponentId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { component_id } = req.body;

        // Check if the component exists
        const component = await db.Component.findByPk(component_id);
        if (!component) {
            res.json({ success: false, error: "Component not found.", status: 404 });
            return;
        }

        // Fetch all dimensional standards associated with the given component_id
        const dimensionalStandards = await db.DimensionalStandard.findAll({
            where: { component_id },
        });

        res.json({
            success: true,
            message: "Dimensional Standards fetched successfully.",
            status: 200,
            dimensionalStandards
        });
    } catch (error: unknown) {
        console.error("Error fetching Dimensional Standards by component ID:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};


// Delete Dimensional Standard
export const deleteDimensionalStandard = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        const dimensionalStandard = await db.DimensionalStandard.findByPk(id);

        if (!dimensionalStandard) {
            res.json({ success: false, error: "Dimensional Standard not found.", status: 404 });
            return;
        }

        await dimensionalStandard.destroy();

        res.json({ success: true, message: "Dimensional Standard deleted successfully.", status: 200 });
    } catch (error: unknown) {
        console.error("Error deleting Dimensional Standard:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};
