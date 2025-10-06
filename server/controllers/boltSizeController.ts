import { validateProjectAndUser } from "../helpers/validateProjectUser";
import db from "../models";
import { Request, Response } from "express";

interface BoltSizeType {
  size1_size2: number;
  code: string;
  c_code: string;
  size_inch: string;
  size_mm: number;
  od: number;
  projectId?: string;
}

// Get Bolt Sizes by ProjectId
export const getBoltSizesByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    const userId = (req as any).user.id;

    // Validate project and user
    const isProjectValid = await validateProjectAndUser(projectId, userId);

    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    // Fetch project-specific bolt sizes
    const projectBoltSizes = await db.BSize.findAll({
      where: { projectId },
    });

    // Fetch default bolt sizes
    const defaultBoltSizes = await db.D_B_Size.findAll();

    // Merge default bolt sizes with project-specific bolt sizes
    const boltSizeMap: Record<string, any> = {};

    // Add default bolt sizes to the map
    defaultBoltSizes.forEach((defaultBoltSize: BoltSizeType) => {
      boltSizeMap[defaultBoltSize.code] = defaultBoltSize;
    });

    // Override defaults with project-specific bolt sizes
    projectBoltSizes.forEach((boltSize: BoltSizeType) => {
      boltSizeMap[boltSize.code] = boltSize;
    });

    // Convert the map back to an array
    const mergedBoltSizes = Object.values(boltSizeMap);

    res.json({ success: true, boltSizes: mergedBoltSizes });
  } catch (error: unknown) {
    console.error("Error fetching bolt sizes:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or Update Bolt Sizes
export const addOrUpdateBoltSizes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, size1_size2, code, c_code, size_inch, size_mm, od } = req.body;
    const userId = (req as any).user.id;

    // Validate project and user
    const isProjectValid = await validateProjectAndUser(projectId, userId);

    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    const existingBoltSize = await db.BSize.findOne({
      where: { size1_size2, projectId },
    });

    if (existingBoltSize) {
      if (
        existingBoltSize.c_code !== c_code || 
        existingBoltSize.size_inch !== size_inch || 
        existingBoltSize.size_mm !== size_mm || 
        existingBoltSize.od !== od
      ) {
        existingBoltSize.c_code = c_code;
        existingBoltSize.size_inch = size_inch;
        existingBoltSize.size_mm = size_mm;
        existingBoltSize.od = od;
        await existingBoltSize.save();
        res.json({ success: true, message: "Bolt size updated successfully." });
      } else {
        res.json({ success: false, message: "No changes detected, no update needed." });
      }
    } else {
      // Create new bolt size record
      await db.BSize.create({
        size1_size2,
        code,
        c_code,
        size_inch,
        size_mm,
        od,
        projectId,
      });
      res.json({ success: true, message: "Bolt size added successfully." });
    }
  } catch (error: unknown) {
    console.error("Error adding or updating bolt size:", error);
    res.json({ success: false, error: "Failed to add or update bolt size. Internal server error.", status: 500 });
  }
};