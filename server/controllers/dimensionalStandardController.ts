import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

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

// Get DimStd by g_type
export const getDimStdByGType = async (req: Request, res: Response): Promise<void> => {
  try {
    const { gType, projectId } = req.body;

    const defaultDimStds = await db.D_DimStd.findAll({
      where: { g_type: gType },
    });
    // console.log("defaultDimStds",defaultDimStds);

    const userDimStds = await db.DimStd.findAll({
      where: { g_type: gType, project_id: projectId },
    });

    const dimStdMap: Record<string, any> = {};

    defaultDimStds.forEach((defaultDimStd: any) => {
      dimStdMap[defaultDimStd.indexing] = defaultDimStd;
    });

    userDimStds.forEach((userDimStd: any) => {
      dimStdMap[userDimStd.indexing] = userDimStd;
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
        indexing, 
        g_type, 
        dim_std,
        project_id 
      } = dimStd;

      const existingUserDimStd = await db.DimStd.findOne({
        where: {
          indexing, 
          g_type,
          dim_std,
          project_id 
        }
      });

      if (existingUserDimStd && project_id) {
        existingUserDimStd.indexing = indexing;
        existingUserDimStd.g_type = g_type;
        existingUserDimStd.dim_std = dim_std;
        await existingUserDimStd.save();
      } else {

        await db.DimStd.create({
        indexing,
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

