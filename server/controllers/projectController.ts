import { Request, Response } from "express";
import db from "../models";

// Create Project
export const createProject = async (req: Request, res: Response): Promise<void> => {
    try {
        const { projectCode, projectDescription, companyName } = req.body;
        const userId = (req as any).user.id;

        const project = await db.Project.findOne({ where: { projectCode, userId } });

        if (project) {
            if (project.isDeleted) {
                await project.update({
                    projectDescription,
                    companyName,
                    isDeleted: false,
                });
                res.status(200).json({ message: "Project restored and updated successfully", project });
            } else {
                res.status(400).json({ error: "Project with the same code already exists" });
            }
            return;
        }

        const newProject = await db.Project.create({
            projectCode,
            projectDescription,
            companyName,
            userId,
        });

        res.status(201).json(newProject);
    } catch (error) {
        console.error("Error creating project:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Update Project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectCode, projectDescription, companyName } = req.body;
      const userId = (req as any).user.id;

      const project = await db.Project.findOne({ where: { projectCode, userId, isDeleted: false } });

      if (!project) {
        res.status(404).json({ error: "Project not found or access denied" });
        return;
      }

      await project.update({ projectDescription, companyName });

      res.status(200).json(project);
    } catch (error: unknown) {
      console.error("Error updating project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};

// Get Project by Code
export const getProjectByCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectCode } = req.params;
      const userId = (req as any).user.id;

      const project = await db.Project.findOne({ where: { projectCode, userId, isDeleted: false } });

      if (!project) {
        res.status(404).json({ error: "Project not found or access denied" });
        return;
      }

      res.status(200).json(project);
    } catch (error: unknown) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Project (Soft Delete)
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectCode } = req.body;
      const userId = (req as any).user.id;

      const project = await db.Project.findOne({ where: { projectCode, userId, isDeleted: false } });

      if (!project) {
        res.status(404).json({ error: "Project not found or access denied" });
        return;
      }

      await project.update({ isDeleted: true });

      res.status(200).json({ message: "Project deleted successfully" });
    } catch (error: unknown) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Internal server error" });
    }
};
