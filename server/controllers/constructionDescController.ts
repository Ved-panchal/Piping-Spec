import { Request, Response } from "express";
import db from "../models"; // Adjust as per your setup


export const getConstructionDescs = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    const defaultConstructionDescs = await db.D_CDesc.findAll();

    const userConstructionDescs = projectId
      ? await db.CDesc.findAll({ where: { project_id: projectId } })
      : [];

    const constructionDescMap: Record<string, any> = {};

    defaultConstructionDescs.forEach((item: any) => {
      const key = `${item.code}`;
      constructionDescMap[key] = { ...item.dataValues, default: true };
    });

    userConstructionDescs.forEach((item: any) => {
      const key = `${item.code}`;
      constructionDescMap[key] = { ...item.dataValues, default: false };
    });

    const merged = Object.values(constructionDescMap);

    res.json({ success: true, constructionDescs: merged });
  } catch (error) {
    console.error("Error fetching Construction Descriptions:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

export const addOrUpdateConstructionDesc = async (req: Request, res: Response) => {
  try {
    const { payload } = req.body;
    if (!Array.isArray(payload) || payload.length === 0) {
      res.json({ success: false, error: "Payload must be a non-empty array." });
      return;
    }

    for (const item of payload) {
      const { construction_desc, code, c_code, project_id } = item;
      
      if (!project_id) {
        res.json({ success: false, error: "projectidproject_id is required." });
        return;
      }

      const existing = await db.CDesc.findOne({
        where: { code, c_code, project_id }
      });

      if (existing) {
        existing.construction_desc = construction_desc;
        await existing.save();
      } else {
        await db.CDesc.create({ 
          construction_desc, 
          code, 
          c_code, 
          project_id 
        });
      }
    }

    res.json({ success: true, message: "Construction Description(s) added or updated successfully." });
  } catch (error) {
    console.error("Error adding/updating Construction Descriptions:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};