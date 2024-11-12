import { Request, Response } from "express";
import db from "../models";

export const getBranchesBySpecId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specId } = req.body;

    const brancheData = await db.Branch.findAll({
      where: { specId },
      include: [{ model: db.Spec, as: "specs" }],
    });

    res.json({ success: true, brancheData });
  } catch (error: unknown) {
    console.error("Error fetching branches:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const addOrUpdateBranch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { specId, branchData } = req.body;
    const { branch_size, run_size, comp_name } = branchData;

    const existingBranch = await db.Branch.findOne({
      where: { specId, branch_size , run_size},
    });

    if (existingBranch) {
      existingBranch.comp_name = comp_name;
      await existingBranch.save();

      res.json({ success: true, message: "Branch updated successfully." });
    } else {
      await db.Branch.create({
        branch_size,
        run_size,
        comp_name,
        specId,
      });

      res.json({ success: true, message: "Branch added successfully." });
    }
  } catch (error: unknown) {
    console.error("Error adding or updating branch:", error);
    res.status(500).json({ success: false, message: "Failed to add or update branch. Internal server error." });
  }
};
