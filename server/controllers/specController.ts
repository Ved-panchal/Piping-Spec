import { Request, Response } from "express";
import db from "../models";

// Create Spec
export const createSpec = async (req: Request, res: Response): Promise<void> => {
  try {
      const { specName, rating, baseMaterial, projectId, existing_specId } = req.body;
      const userId = (req as any).user.id;
      console.log(req.body);
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
      const { Op } = require("sequelize");

      const existingSpec = await db.Spec.findOne({
        where: {
          specName,
          rating,
          baseMaterial,
          projectId,
          isDeleted: false,
          deleted_at: null
        }
      });

      if (existingSpec) {
          res.json({ success: false, error: "Spec already exists", status: 400 });
          return;
      }

      // Check for a soft-deleted spec
      const softDeletedSpec = await db.Spec.findOne({
          where: { specName, rating, baseMaterial, isDeleted: true }
      });
      if (softDeletedSpec) {
          await softDeletedSpec.update({ isDeleted: false });
          res.json({ success: true, message: "Spec Created successfully.", status: 200, softDeletedSpec });
          return;
      }

      // Create the new spec
      const newSpec = await db.Spec.create({
          specName,
          rating,
          baseMaterial,
          projectId,
      });
      // If existing_specId is provided, copy related data
      if (existing_specId) {
          // Get data from existing spec
          const [branches, pmsCreations, sizeRanges] = await Promise.all([
              db.Branch.findAll({ where: { spec_id: existing_specId } }),
              db.PmsCreation.findAll({ where: { spec_id: existing_specId } }),
              db.SizeRange.findAll({ where: { spec_id: existing_specId } })
          ]);
          // Copy branches
          const branchPromises = branches.map((branch:any) => {
              const branchData = branch.get({ plain: true });
              delete branchData.id;
              return db.Branch.create({
                  ...branchData,
                  specId: newSpec.id // Set the new spec ID
              });
          });

          // Copy PMS Creations
          const pmsPromises = pmsCreations.map((pms:any) => {
              const pmsData = pms.get({ plain: true });
              delete pmsData.id;
              return db.PmsCreation.create({
                  ...pmsData,
                  spec_id: newSpec.id
              });
          });

          // Copy Size Ranges
          const sizeRangePromises = sizeRanges.map((size:any) => {
              const sizeData = size.get({ plain: true });
              delete sizeData.id;
              return db.SizeRange.create({
                  ...sizeData,
                  specId: newSpec.id
              });
          });

          // Wait for all copies to complete
          await Promise.all([
              ...branchPromises,
              ...pmsPromises,
              ...sizeRangePromises
          ]);
      }

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
    const { specId, specName, rating, baseMaterial, projectId } = req.body;
    const userId = (req as any).user.id;

    // Find the spec, ensuring it belongs to a project owned by the user and is not deleted
    const spec = await db.Spec.findOne({
      where: {
        id:specId,
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

    const existingSpec = await db.Spec.findOne({
      where:{
        specName,rating,baseMaterial,projectId
      }
    })

    if(existingSpec){
      res.json({ success: false, error: "Spec already existed", status: 404})
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

    const subscription = await db.Subscription.findOne({ where: { userId, status: 'active' } });

    // Increase NoofSpecs if it's not null
    if (subscription && subscription.NoofSpecs !== null) {
      await subscription.update({ NoofSpecs: subscription.NoofSpecs + 1 });
    }

    // Soft delete the spec
    await spec.destroy();

    res.json({ success: true, message: "Spec deleted successfully.", status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting spec:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
