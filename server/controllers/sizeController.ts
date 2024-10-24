import { validateProjectAndUser } from "../helpers/validateProjectUser";
import db from "../models";
import { Request, Response } from "express";

interface SizeType {
    size1_size2: number;
  code: string;
  size_inch: string;
  size_mm: number;
  od: number;
  projectId?: string;
}


// Get Sizes by ProjectId
export const getSizesByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    const userId =  (req as any).user.id;

    // Validate project and user
    const isProjectValid = await validateProjectAndUser(projectId, userId);

    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    // Fetch project-specific sizes
    const projectSizes = await db.Size.findAll({
      where: { projectId },
    });

    // Fetch default sizes
    const defaultSizes = await db.D_Size.findAll();

    // Merge default sizes with project-specific sizes
    const sizeMap: Record<string, any> = {};

    // Add default sizes to the map
    defaultSizes.forEach((defaultSize: SizeType) => {
      sizeMap[defaultSize.size1_size2] = defaultSize;
    });

    // Override defaults with project-specific sizes
    projectSizes.forEach((size: SizeType) => {
      sizeMap[size.size1_size2] = size;
    });

    // Convert the map back to an array
    const mergedSizes = Object.values(sizeMap);

    res.json({ success: true, sizes: mergedSizes });
  } catch (error: unknown) {
    console.error("Error fetching sizes:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or Update Sizes
export const addOrUpdateSizes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, size1_size2, code, size_inch, size_mm, od } = req.body;
    const userId =  (req as any).user.id;// Assuming you pass userId in cookies or headers

    // Validate project and user
    const isProjectValid = await validateProjectAndUser(projectId, userId);

    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    // Check if a size already exists for the given SIZE1 and projectId
    const existingSize = await db.Size.findOne({
      where: { size1_size2, projectId },
    });

    if (existingSize) {
      // If the CODE or any other field is different, update the size
      if (
        existingSize.code !== code || 
        existingSize.size_inch !== size_inch || 
        existingSize.size_mm !== size_mm || 
        existingSize.od !== od
      ) {
        existingSize.code = code;
        existingSize.size_inch = size_inch;
        existingSize.size_mm = size_mm;
        existingSize.od = od;
        await existingSize.save();
        res.json({ success: true, message: "Size updated successfully." });
      } else {
        // No update if everything is the same
        res.json({ success: false, message: "No changes detected, no update needed." });
      }
    } else {
      // Create new size record
      await db.Size.create({
        size1_size2,
        code,
        size_inch,
        size_mm,
        od,
        projectId,
      });
      res.json({ success: true, message: "Size added successfully." });
    }
  } catch (error: unknown) {
    console.error("Error adding or updating size:", error);
    res.json({ success: false, error: "Failed to add or update size. Internal server error.", status: 500 });
  }
};