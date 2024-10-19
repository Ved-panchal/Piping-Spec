import { Request, Response } from "express";
import db from "../models";

// Create Spec
export const createSpec = async (req: Request, res: Response): Promise<void> => {
    try {
      const { specName, rating, baseMaterial, projectId } = req.body;
      const userId = (req as any).user.id;
  
      // Check for active subscription
      const subscription = await db.Subscription.findOne({ where: { userId, status: 'active' } });
      
      if (subscription && subscription.NoofSpecs !== null && subscription.NoofSpecs <= 0) {
        res.json({ success: false, error: "Spec limit reached. Cannot create more specs.", status: 400 });
        return;
      }
  
      // Find the project the spec should belong to
      const project = await db.Project.findOne({ where: { id: projectId, userId, isDeleted: false } });
      
      if (!project) {
        res.json({ success: false, error: "Project not found or access denied.", status: 404 });
        return;
      }
  
      // Check if a spec with the same details already exists
      const existingSpec = await db.Spec.findOne({
        where: { specName, rating, baseMaterial, isDeleted: false } // Check only non-deleted specs
      });
  
      if (existingSpec) {
        // If the spec exists and is not deleted, throw an error
        res.json({ success: false, error: "Spec already exists", status: 400 });
        return;
      }
  
      // Check for a soft-deleted spec
      const softDeletedSpec = await db.Spec.findOne({
        where: { specName, rating, baseMaterial, isDeleted: true }
      });
  
      if (softDeletedSpec) {
        // If a soft-deleted spec is found, update it to restore
        await softDeletedSpec.update({ isDeleted: false });
        res.json({ success: true, message: "Spec Created successfully.", status: 200, softDeletedSpec });
        return;
      }
  
      // Create the new spec if no existing spec was found
      const newSpec = await db.Spec.create({
        specName,
        rating,
        baseMaterial,
        projectId,
      });
  
      // Decrease NoofSpecs if it's not null
      if (subscription && subscription.NoofSpecs !== null) {
        await subscription.update({ NoofSpecs: subscription.NoofSpecs - 1 });
      }
  
      res.json({ success: true, message: "Spec created successfully.", status: 201, newSpec });
    } catch (error: unknown) {
      console.error("Error creating spec:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
    }
  };
  

// Update Spec
export const updateSpec = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specId, specName, rating, baseMaterial } = req.body;
    const userId = (req as any).user.id;

    // Find the spec, ensuring it belongs to a project owned by the user and is not deleted
    const spec = await db.Spec.findOne({
      where: {
        specId,
        isDeleted: false,
      },
      include: {
        model: db.Project,
        as: 'project',
        where: { userId }
      }
    });

    if (!spec) {
      res.json({ success: false, error: "Spec not found or access denied.", status: 404 });
      return;
    }

    // Update spec details
    await spec.update({ specName, rating, baseMaterial });

    res.json({ success: true, message: "Spec updated successfully.", status: 200, spec });
  } catch (error: unknown) {
    console.error("Error updating spec:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Get All Specs by Project ID
export const getAllSpecsByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;
    const userId = (req as any).user.id;

    // Fetch all specs associated with the project that belongs to the user
    const project = await db.Project.findOne({ where: { id: projectId, userId, isDeleted: false } });

    if (!project) {
      res.json({ success: false, error: "Project not found or access denied.", status: 404 });
      return;
    }

    const specs = await db.Spec.findAll({ where: { projectId, isDeleted: false } });

    res.json({ success: true, message: "Specs fetched successfully.", status: 200, specs });
  } catch (error: unknown) {
    console.error("Error fetching specs:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Get Spec by ID
// Get Spec by ID
export const getSpecById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { specId } = req.params;
      const userId = (req as any).user.id;

      const spec = await db.Spec.findOne({
        where: { id:specId, isDeleted: false },
        include: {
          model: db.Project, 
          as: 'project',
          where: { userId }
        }
      });
  
      if (!spec) {
        res.json({ success: false, error: "Spec not found or access denied.", status: 404 });
        return;
      }
  
      res.json({ success: true, message: "Spec fetched successfully.", status: 200, spec });
    } catch (error: unknown) {
      console.error("Error fetching spec:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
    }
  };
  

// Delete Spec (Soft Delete)
export const deleteSpec = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specId } = req.body;
    const userId = (req as any).user.id;

    // Find the spec, ensuring it belongs to a project owned by the user and is not deleted
    const spec = await db.Spec.findOne({
      where: { specId, isDeleted: false },
      include: {
        model: db.Project,
        as: 'project',
        where: { userId }
      }
    });

    if (!spec) {
      res.json({ success: false, error: "Spec not found or access denied.", status: 404 });
      return;
    }

    const subscription = await db.Subscription.findOne({ where: { userId, status: 'active' } });

    // Increase NoofSpecs if it's not null
    if (subscription && subscription.NoofSpecs !== null) {
      await subscription.update({ NoofSpecs: subscription.NoofSpecs + 1 });
    }

    // Soft delete the spec
    await spec.update({ isDeleted: true });

    res.json({ success: true, message: "Spec deleted successfully.", status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting spec:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
