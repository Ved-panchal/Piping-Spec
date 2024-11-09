import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

export const getAllMaterials = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, projectId, isAll } = req.body;

    // Determine `comp_matching_id` based on `componentId`
    let compMatchingId;
    if (componentId === 1) {
      compMatchingId = 1;
    } else if (componentId === 14) {
      compMatchingId = 2;
    } else if ([4, 5].includes(componentId)) {
      compMatchingId = 3;
    } else if (componentId === 18){
        compMatchingId = 5
    } else {
      compMatchingId = 4;
    }

    // Fetch default materials based on conditions
    const defaultMaterials = isAll
      ? await db.D_Material.findAll()
      : await db.D_Material.findAll({
          where: { comp_matching_id: compMatchingId },
        });

    // Fetch user materials by `projectId`
    const userMaterials = await db.Material.findAll({
      where: { project_id:projectId,comp_matching_id:compMatchingId },
    });

    // Merge default and user materials, overriding defaults with user materials
    const materialMap: Record<string, any> = {};
    defaultMaterials.forEach((defaultMat: any) => {
      materialMap[defaultMat.code] = defaultMat;
    });
    userMaterials.forEach((userMat: any) => {
      materialMap[userMat.code] = userMat;
    });

    const mergedMaterials = Object.values(materialMap);

    res.json({ success: true, materials: mergedMaterials });
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update materials
export const addOrUpdateMaterial = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, projectId, materials } = req.body;
    const userId = (req as any).user.id;

    // Determine `comp_matching_id` based on `componentId`
    let compMatchingId;
    if (componentId === 1) {
      compMatchingId = 1;
    } else if (componentId === 14) {
      compMatchingId = 2;
    } else if ([4, 5].includes(componentId)) {
      compMatchingId = 3;
    } else if (componentId === 18) {
        compMatchingId = 5;
    } else {
      compMatchingId = 4;
    }

    // Validate the project for the user
    const validProject = await validateProjectAndUser(projectId, userId);
    if (!validProject) {
      res.json({ success: false, error: "Invalid project.", status: 403 });
      return;
    }

    for (const material of materials) {
      const { code, c_code, material_description,base_material } = material;

      const existingMaterial = await db.Material.findOne({
        where: { comp_matching_id:compMatchingId,code, projectId },
      });

      if (existingMaterial) {
        // Update existing material
        existingMaterial.c_code = c_code;
        existingMaterial.material_description = material_description;
        existingMaterial.base_material = base_material;
        await existingMaterial.save();
      } else {
        // Create new material entry
        await db.Material.create({
          code,
          c_code,
          material_description,
          base_material,
          comp_matching_id: compMatchingId,
          projectId,
        });
      }
    }

    res.json({ success: true, message: "Materials added or updated successfully." });
  } catch (error) {
    console.error("Error adding or updating materials:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
