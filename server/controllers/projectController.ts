import { Request, Response } from "express";
import db from "../models";

// Create Project
export const createProject = async (req: Request, res: Response): Promise<void> => {
  try {
      const { projectCode, projectDescription, companyName } = req.body;
      const userId = (req as any).user.id;

      const subscription = await db.Subscription.findOne({ where: { userId, status: 'active' } });

      // Check if NoofProjects is null (unlimited) or if NoofProjects is greater than 0
      if (subscription && subscription.NoofProjects !== null && subscription.NoofProjects <= 0) {
          res.json({ success: false, error: "Project limit reached. Cannot create more projects.", status: 400 });
          return;
      }

      const project = await db.Project.findOne({ where: { projectCode, userId } });

      if (project) {
          if (project.isDeleted) {
              await project.update({
                  projectDescription,
                  companyName,
                  isDeleted: false,
              });
              res.json({ success: true, message: "Project Created Successfully.", status: 200, project });
              return;
          } else {
              res.json({ success: false, error: "Project with the same code already exists.", status: 400 });
              return;
          }
      }

      const newProject = await db.Project.create({
          projectCode,
          projectDescription,
          companyName,
          userId,
      });

      // Decrease NoofProjects if it is not null
      if (subscription && subscription.NoofProjects !== null) {
          await subscription.update({ NoofProjects: subscription.NoofProjects - 1 });
      }

      res.json({ success: true, message: "Project Created Successfully.", status: 201, newProject });
  } catch (error: unknown) {
      console.error("Error creating project:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Update Project
export const updateProject = async (req: Request, res: Response): Promise<void> => {
  try {
      const { projectCode, projectDescription, companyName } = req.body;
      const userId = (req as any).user.id;

      const project = await db.Project.findOne({ where: { projectCode, userId, isDeleted: false } });

      if (!project) {
          res.json({ success: false, error: "Project not found or access denied.", status: 404 });
          return;
      }

      await project.update({ projectDescription, companyName });

      res.json({ success: true, message: "Project Updated Successfully.", status: 200, project });
  } catch (error: unknown) {
      console.error("Error updating project:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Get Project by Code
export const getProjectByCode = async (req: Request, res: Response): Promise<void> => {
  try {
      const { projectCode } = req.params;
      const userId = (req as any).user.id;

      const project = await db.Project.findOne({ where: { projectCode, userId, isDeleted: false } });

      if (!project) {
          res.json({ success: false, error: "Project not found or access denied.", status: 404 });
          return;
      }

      res.json({ success: true, message: "Project fetched successfully.", status: 200, project });
  } catch (error: unknown) {
      console.error("Error fetching project:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Get All Projects by User ID
export const getAllProjectsByUserId = async (req: Request, res: Response): Promise<void> => {
  try {
      const userId = (req as any).user.id;
      // Fetch all projects associated with the user ID that are not marked as deleted
      const projects = await db.Project.findAll({ where: { userId, isDeleted: false } });

      res.json({ success: true, message: "Projects fetched successfully.", status: 200, projects });
  } catch (error: unknown) {
      console.error("Error fetching projects:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Delete Project (Soft Delete)
export const deleteProject = async (req: Request, res: Response): Promise<void> => {
  try {
      const { projectCode } = req.body;
      const userId = (req as any).user.id;

      const project = await db.Project.findOne({ where: { projectCode, userId, isDeleted: false } });

      if (!project) {
          res.json({ success: false, error: "Project not found or access denied.", status: 404 });
          return;
      }

      const subscription = await db.Subscription.findOne({ where: { userId, status: 'active' } });

      if (subscription && subscription.NoofProjects !== null) {
          await subscription.update({ NoofProjects: subscription.NoofProjects + 1 });
      }

      await project.destroy();

      res.json({ success: true, message: "Project deleted successfully.", status: 200 });
  } catch (error: unknown) {
      console.error("Error deleting project:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
  }
};
