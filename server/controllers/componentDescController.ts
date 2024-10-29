import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser"; // Import your validation helper

// Get component description by component ID
export const getComponentDescByComponentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId } = req.params;
    const userId = (req as any).user.id;

    // Fetch all default component descriptions
    const defaultComponentDescs = await db.D_Component.findAll({
      where: { component_id:componentId },
    });

    // Fetch user-updated or added component descriptions
    const userComponentDescs = await db.ComponentDesc.findAll({
      where: { component_id:componentId },
    });

    // Merge default descriptions with user-updated/added ones
    const componentDescMap: Record<string, any> = {};

    defaultComponentDescs.forEach((defaultDesc: any) => {
      componentDescMap[defaultDesc.code] = defaultDesc;
    });

    userComponentDescs.forEach((userDesc: any) => {
      componentDescMap[userDesc.code] = userDesc;
    });

    const mergedComponentDescs = Object.values(componentDescMap);
    res.json({ success: true, componentDescs: mergedComponentDescs });
  } catch (error: unknown) {
    console.error("Error fetching component descriptions:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update component descriptions
export const addOrUpdateComponentDesc = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, componentDescs } = req.body;
    const userId = (req as any).user.id;

    // Validate project and user access
    const isProjectValid = await validateProjectAndUser(componentId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid component or unauthorized user.", status: 403 });
      return;
    }

    // Iterate through the component descriptions
    for (const desc of componentDescs) {
      const { code, c_code, itemDescription, dimensionalStandards, ratingrequired } = desc;

      // Check if the description already exists for this component
      const existingComponentDesc = await db.ComponentDesc.findOne({
        where: { code, componentId }
      });

      if (existingComponentDesc) {
        existingComponentDesc.c_code = c_code;
        existingComponentDesc.itemDescription = itemDescription;
        existingComponentDesc.dimensionalStandards = dimensionalStandards;
        existingComponentDesc.ratingrequired = ratingrequired;
        await existingComponentDesc.save();
      } else {
        await db.ComponentDesc.create({
          componentId,
          code,
          c_code,
          itemDescription,
          dimensionalStandards,
          ratingrequired
        });
      }
    }

    res.json({ success: true, message: "Component descriptions added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating component descriptions:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
