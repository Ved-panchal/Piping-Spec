import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser"; // Import your validation helper

// Get component description by component ID
export const getComponentDescByComponentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, projectId } = req.body;
    // const userId = (req as any).user.id;

    const defaultComponentDescs = await db.D_Component.findAll({
      where: { component_id:componentId },
    });

    const userComponentDescs = await db.ComponentDesc.findAll({
      where: { component_id:componentId,project_id:projectId },
    });

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

    const {project_id} = componentDescs[0];
    const validProject = await validateProjectAndUser(project_id, userId);

    for (const desc of componentDescs) {
      const { code, c_code, itemDescription,g_type,s_type,short_code,project_id } = desc;


      if(!validProject){
        res.json({ success: false, error: "Invalid project.", status: 403 });
        return;
      }

      const existingComponentDesc = await db.ComponentDesc.findOne({
        where: { code, component_id:componentId }
      });

      if (existingComponentDesc) {
        existingComponentDesc.c_code = c_code;
        existingComponentDesc.itemDescription = itemDescription;
        existingComponentDesc.g_type = g_type;
        existingComponentDesc.s_type = s_type;
        existingComponentDesc.short_code = short_code;
        await existingComponentDesc.save();
      } else {
        await db.ComponentDesc.create({
          component_id:componentId,
          code,
          c_code,
          itemDescription,
          ratingrequired:false,
          g_type,
          s_type,
          short_code,
          project_id,
        });
      }
    }

    res.json({ success: true, message: "Component descriptions added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating component descriptions:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
