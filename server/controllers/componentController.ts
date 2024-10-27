import { Request, Response } from "express";
import db from "../models";

// Create Component
export const createComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentname, ratingrequired } = req.body;

    // Check if the component already exists
    const existingComponent = await db.Component.findOne({ where: { componentname, isDeleted: false } });

    if (existingComponent) {
      res.json({ success: false, error: "Component already exists", status: 400 });
      return;
    }

    // Create the new component
    const newComponent = await db.Component.create({
      componentname,
      ratingrequired,
    });

    res.json({ success: true, message: "Component created successfully.", status: 201, newComponent });
  } catch (error: unknown) {
    console.error("Error creating component:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Update Component
export const updateComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, componentname, ratingrequired } = req.body;

    // Find the component, ensuring it is not deleted
    const component = await db.Component.findOne({
      where: { id: componentId, isDeleted: false },
    });

    if (!component) {
      res.json({ success: false, error: "Component not found", status: 404 });
      return;
    }

    // Update component details
    await component.update({ componentname, ratingrequired });

    res.json({ success: true, message: "Component updated successfully.", status: 200, component });
  } catch (error: unknown) {
    console.error("Error updating component:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Get All Components
export const getAllComponents = async (req: Request, res: Response): Promise<void> => {
  try {
    // Fetch all components that are not deleted
    const components = await db.Component.findAll({
      where: { isDeleted: false },
    });

    res.json({ success: true, message: "Components fetched successfully.", status: 200, components });
  } catch (error: unknown) {
    console.error("Error fetching components:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Delete Component (Soft Delete)
export const deleteComponent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.body;

    // Find the component, ensuring it is not deleted
    const component = await db.Component.findOne({
      where: { id: componentId, isDeleted: false },
    });

    if (!component) {
      res.json({ success: false, error: "Component not found", status: 404 });
      return;
    }

    // Soft delete the component
    await component.update({ isDeleted: true });

    res.json({ success: true, message: "Component deleted successfully.", status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting component:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
