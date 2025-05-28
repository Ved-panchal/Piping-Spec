import { Request, Response } from "express";
import db from "../models";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

// Get CatRef by component ID
export const getCatRefByComponentId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, projectId } = req.body;

    if(componentId == 19){
      const defaultCatRefs = await db.D_VCatref.findAll({
        where: { component_id: componentId },
      });

      const userCatRefs = await db.VCatref.findAll({
        where: { component_id: componentId, project_id: projectId },
      });

      const catRefMap: Record<string, any> = {};

      defaultCatRefs.forEach((defaultCatRef: any) => {
        catRefMap[defaultCatRef.item_short_desc+"~"+defaultCatRef.rating+"~"+defaultCatRef.valv_sub_type+"~"+defaultCatRef.construction_desc] = defaultCatRef;
      });

      userCatRefs.forEach((userCatRef: any) => {
        catRefMap[userCatRef.item_short_desc+"~"+userCatRef.rating+"~"+userCatRef.valv_sub_type+"~"+userCatRef.construction_desc] = userCatRef;
      });

      const mergedCatRefs = Object.values(catRefMap);
      res.json({ success: true, catRefs: mergedCatRefs });
      return;
    }
    const defaultCatRefs = await db.D_Catref.findAll({
      where: { component_id: componentId },
    });

    const userCatRefs = await db.Catref.findAll({
      where: { component_id: componentId, project_id: projectId },
    });

    const catRefMap: Record<string, any> = {};

    defaultCatRefs.forEach((defaultCatRef: any) => {
      catRefMap[defaultCatRef.item_short_desc+"~"+defaultCatRef.rating] = defaultCatRef;
    });

    userCatRefs.forEach((userCatRef: any) => {
      catRefMap[userCatRef.item_short_desc+"~"+userCatRef.rating] = userCatRef;
    });

    const mergedCatRefs = Object.values(catRefMap);
    res.json({ success: true, catRefs: mergedCatRefs });
    return;
  } catch (error: unknown) {
    console.error("Error fetching CatRefs:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update CatRef
// export const addOrUpdateCatRef = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const { componentId, catRefs } = req.body;
//     const userId = (req as any).user.id;
//     const { project_id } = catRefs[0]
//     const validProject = await validateProjectAndUser(project_id, userId);

//     if (!validProject) {
//       res.json({ success: false, error: "Invalid project.", status: 403 });
//       return;
//     }

//     for (const catRef of catRefs) {
//       const { 
//         item_short_desc, 
//         rating, 
//         concatenate, 
//         catalog,
//         project_id 
//       } = catRef;

//       const processedRating = rating == "null" ? null : rating;

//       // // Check for existing entries to prevent duplicates
//       // const existingDefaultCatRef = await db.D_Catref.findOne({
//       //   where: { 
//       //     component_id: componentId, 
//       //     item_short_desc, 
//       //     concatenate 
//       //   }
//       // });

//       const existingUserCatRef = await db.Catref.findOne({
//         where: { 
//           component_id: componentId, 
//           item_short_desc, 
//           concatenate,
//           project_id 
//         }
//       });

//       if (existingUserCatRef && project_id) {
//         // Update existing project-specific CatRef
//         existingUserCatRef.rating = rating;
//         existingUserCatRef.catalog = catalog;
//         await existingUserCatRef.save();
//       } else {
//         // Create new CatRef
//         if (project_id) {
//           // Project-specific CatRef
//           await db.Catref.create({
//             component_id: componentId,
//             item_short_desc,
//             processedRating,
//             concatenate,
//             catalog,
//             project_id
//           });
//         } else {
//           // Default CatRef
//           await db.D_Catref.create({
//             component_id: componentId,
//             item_short_desc,
//             processedRating,
//             concatenate,
//             catalog
//           });
//         }
//       }
//     }

//     res.json({ success: true, message: "CatRefs added or updated successfully." });
//   } catch (error: unknown) {
//     console.error("Error adding or updating CatRefs:", error);
//     res.json({ success: false, error: "Internal server error", status: 500 });
//   }
// };

export const addOrUpdateCatRef = async (req: Request, res: Response): Promise<void> => {
  try {
    const { componentId, catRefs } = req.body;  // since for 19 body is array itself
    // if (!Array.isArray(catRefs) || catRefs.length === 0) {
    //   res.status(400).json({ success: false, error: "Invalid request body, expected non-empty array." });
    //   return;
    // }

    // const componentId = catRefs[0].component_id;
    const userId = (req as any).user.id;
    const project_id = catRefs[0].project_id;

    const validProject = await validateProjectAndUser(project_id, userId);
    if (!validProject) {
      res.status(403).json({ success: false, error: "Invalid project.", status: 403 });
      return;
    }

    for (const catRef of catRefs) {
      const { 
        item_short_desc, 
        rating, 
        concatenate, 
        catalog,
        project_id,
        valv_sub_type,
        construction_desc
      } = catRef;

      const processedRating = rating == "null" ? null : rating;
        
        if (componentId === 19) {
      
        const existingUserValvCatRef = await db.VCatref.findOne({
          where: { component_id: componentId, item_short_desc, concatenate, project_id }
        });

        if (existingUserValvCatRef && project_id) {
          existingUserValvCatRef.rating = rating;
          existingUserValvCatRef.catalog = catalog;
          existingUserValvCatRef.valv_sub_type = valv_sub_type;
          existingUserValvCatRef.construction_desc = construction_desc;
          await existingUserValvCatRef.save();
        } else {
          if (project_id) {
            await db.VCatref.create({
              component_id: componentId,
              item_short_desc,
              rating: processedRating,
              concatenate,
              catalog,
              project_id,
              valv_sub_type,
              construction_desc
            });
          }
        }
      } else {
        // Default Catref logic (for all other components)
        const existingUserCatRef = await db.Catref.findOne({
          where: { component_id: componentId, item_short_desc, concatenate, project_id }
        });

        if (existingUserCatRef && project_id) {
          existingUserCatRef.rating = rating;
          existingUserCatRef.catalog = catalog;
          await existingUserCatRef.save();
        } else {
          if (project_id) {
            await db.Catref.create({
              component_id: componentId,
              item_short_desc,
              rating: processedRating,
              concatenate,
              catalog,
              project_id
            });
          } else {
            await db.D_Catref.create({
              component_id: componentId,
              item_short_desc,
              rating: processedRating,
              concatenate,
              catalog
            });
          }
        }
      }
    }

    res.json({ success: true, message: "CatRefs added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating CatRefs:", error);
    res.status(500).json({ success: false, error: "Internal server error", status: 500 });
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