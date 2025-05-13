import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

// Get DimStd by g_type
export const getDimStdByGType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gType, projectId } = req.body;

    const defaultDimStds = await db.D_DimStd.findAll({
      where: { g_type: gType },
    });

    const userDimStds = await db.DimStd.findAll({
      where: { g_type: gType, project_id: projectId },
    });

    const dimStdMap: Record<string, any> = {};

    defaultDimStds.forEach((defaultDimStd: any) => {
      dimStdMap[defaultDimStd.g_type] = defaultDimStd;
    });

    userDimStds.forEach((userDimStd: any) => {
      dimStdMap[userDimStd.g_type] = userDimStd;
    });

    const mergedDimStds = Object.values(dimStdMap);
    res.json({ success: true, dimStds: mergedDimStds });
  } catch (error: unknown) {
    console.error("Error fetching DimStds:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update DimStd
export const addOrUpdateDimStd = async (req: Request, res: Response): Promise<void> => {
  try {
    const { payload } = req.body;
    const userId = (req as any).user.id;
    const { project_id } = payload[0];
    const validProject = await validateProjectAndUser(project_id, userId);

    if (!validProject) {
      res.json({ success: false, error: "Invalid project.", status: 403 });
      return;
    }

    for (const dimStd of payload) {
      const { 
        g_type, 
        dim_std,
        project_id 
      } = payload;

      const existingUserDimStd = await db.DimStd.findOne({
        where: { 
          g_type,
          dim_std,
          project_id 
        }
      });

      if (existingUserDimStd && project_id) {

        existingUserDimStd.g_type = g_type;
        existingUserDimStd.dim_std = dim_std;
        await existingUserDimStd.save();
      } else {

        await db.DimStd.create({
        g_type,
        dim_std,
        project_id
        });
      }
    }

    res.json({ success: true, message: "DimStds added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating DimStds:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Delete DimStd
// export const deleteDimStd = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id, isDefault } = req.body;
//     const userId = (req as any).user.id;

//     let dimStd;
//     if (isDefault) {
//       dimStd = await db.D_DimStd.findByPk(id);
//     } else {
//       dimStd = await db.DimStd.findByPk(id);
      
//       // Validate project ownership if it's a project-specific DimStd
//       if (dimStd) {
//         const validProject = await validateProjectAndUser(dimStd.project_id, userId);
//         if (!validProject) {
//           res.json({ success: false, error: "Invalid project.", status: 403 });
//           return;
//         }
//       }
//     }

//     if (!dimStd) {
//       res.json({ success: false, message: "DimStd not found.", status: 404 });
//       return;
//     }

//     await dimStd.destroy();
//     res.json({ success: true, message: "DimStd deleted successfully." });
//   } catch (error: unknown) {
//     console.error("Error deleting DimStd:", error);
//     res.json({ success: false, error: "Internal server error", status: 500 });
//   }
// };

export default {
  getDimStdByGType,
  addOrUpdateDimStd,
//   deleteDimStd,
};