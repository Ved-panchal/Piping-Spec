import { Request, Response } from "express";
import db from "../models"; // Adjust as per your setup

// Merge logic for default and project-specific
export const getValvSubTypes = async (req: Request, res: Response) => {
  try {
    const { projectId } = req.body;

    // Fetch all defaults
    const defaultValvs = await db.D_VSType.findAll();

    // Fetch user/project-specific
    const userValvs = projectId
      ? await db.VSType.findAll({ where: { project_id: projectId } })
      : [];

    // Use code+c_code as unique identifier for merging
    const valvMap: Record<string, any> = {};

    defaultValvs.forEach((item: any) => {
      valvMap[item.code] = { ...item.dataValues, default: true };
    });

    userValvs.forEach((item: any) => {
      valvMap[item.code] = { ...item.dataValues, default: false };
    });

    const merged = Object.values(valvMap);

    res.json({ success: true, valvSubTypes: merged });
  } catch (error) {
    console.error("Error fetching Valv Sub Types:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update Valv Sub Types (array support)
export const addOrUpdateValvSubType = async (req: Request, res: Response) => {
  try {
    const { payload } = req.body;
    if (!Array.isArray(payload) || payload.length === 0) {
      res.json({ success: false, error: "Payload must be a non-empty array." });
      return;
    }
    for (const item of payload) {
      const { valv_sub_type, code, c_code, project_id } = item;
      if (!project_id) {
        res.json({ success: false, error: "projectidproject_id is required." });
        return;
      }
      const existing = await db.VSType.findOne({
        where: { code, c_code, project_id }
      });
      if (existing) {
        existing.valv_sub_type = valv_sub_type;
        await existing.save();
      } else {
        await db.VSType.create({ valv_sub_type, code, c_code, project_id });
      }
    }
    res.json({ success: true, message: "Valv Sub Type(s) added or updated successfully." });
  } catch (error) {
    console.error("Error adding/updating Valv Sub Types:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
