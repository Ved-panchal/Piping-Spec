import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

// Get CatRef by component ID
export const getCatRefByComponentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, projectId } = req.body;

    const defaultCatRefs = await db.D_Catref.findAll({
      where: { component_id: componentId },
    });

    const userCatRefs = await db.Catref.findAll({
      where: { component_id: componentId, project_id: projectId },
    });

    const catRefMap: Record<string, any> = {};

    defaultCatRefs.forEach((defaultCatRef: any) => {
      catRefMap[defaultCatRef.item_short_desc || defaultCatRef.id] = defaultCatRef;
    });

    userCatRefs.forEach((userCatRef: any) => {
      catRefMap[userCatRef.item_short_desc || userCatRef.id] = userCatRef;
    });

    const mergedCatRefs = Object.values(catRefMap);
    res.json({ success: true, catRefs: mergedCatRefs });
  } catch (error: unknown) {
    console.error("Error fetching CatRefs:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update CatRef
export const addOrUpdateCatRef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, catRefs } = req.body;
    const userId = (req as any).user.id;
    const { project_id } = catRefs[0]
    const validProject = await validateProjectAndUser(project_id, userId);

    if (!validProject) {
      res.json({ success: false, error: "Invalid project.", status: 403 });
      return;
    }

    for (const catRef of catRefs) {
      const { 
        item_short_desc, 
        rating, 
        concatenate, 
        catalog,
        project_id 
      } = catRef;

      const processedRating = rating == "null" ? null : rating;

      // // Check for existing entries to prevent duplicates
      // const existingDefaultCatRef = await db.D_Catref.findOne({
      //   where: { 
      //     component_id: componentId, 
      //     item_short_desc, 
      //     concatenate 
      //   }
      // });

      const existingUserCatRef = await db.Catref.findOne({
        where: { 
          component_id: componentId, 
          item_short_desc, 
          concatenate,
          project_id 
        }
      });

      if (existingUserCatRef && project_id) {
        // Update existing project-specific CatRef
        existingUserCatRef.rating = rating;
        existingUserCatRef.catalog = catalog;
        await existingUserCatRef.save();
      } else {
        // Create new CatRef
        if (project_id) {
          // Project-specific CatRef
          await db.Catref.create({
            component_id: componentId,
            item_short_desc,
            processedRating,
            concatenate,
            catalog,
            project_id
          });
        } else {
          // Default CatRef
          await db.D_Catref.create({
            component_id: componentId,
            item_short_desc,
            processedRating,
            concatenate,
            catalog
          });
        }
      }
    }

    res.json({ success: true, message: "CatRefs added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating CatRefs:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// // Optional: Delete CatRef
// export const deleteCatRef = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { id, isDefault } = req.body;
//     const userId = (req as any).user.id;

//     let catRef;
//     if (isDefault) {
//       catRef = await db.D_Catref.findByPk(id);
//     } else {
//       catRef = await db.CatRef.findByPk(id);
      
//       // Validate project ownership if it's a project-specific CatRef
//       if (catRef) {
//         const validProject = await validateProjectAndUser(catRef.project_id, userId);
//         if (!validProject) {
//           res.json({ success: false, error: "Invalid project.", status: 403 });
//           return;
//         }
//       }
//     }

//     if (!catRef) {
//       res.json({ success: false, message: "CatRef not found.", status: 404 });
//       return;
//     }

//     await catRef.destroy();
//     res.json({ success: true, message: "CatRef deleted successfully." });
//   } catch (error: unknown) {
//     console.error("Error deleting CatRef:", error);
//     res.json({ success: false, error: "Internal server error", status: 500 });
//   }
// };

export default {
  getCatRefByComponentId,
  addOrUpdateCatRef,
};