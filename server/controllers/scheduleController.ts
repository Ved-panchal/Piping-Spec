import db from "../models";
import { Request, Response } from "express";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

interface ScheduleType {
  sch1_sch2: string;
  code: string;
  schDesc: string;
  projectId?: string;
}

export const getSchedulesByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    const userId = (req as any).user.id;

    // Validate the projectId and userId
    const isProjectValid = await validateProjectAndUser(projectId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    // Get project-specific schedules
    const projectSchedules = await db.Schedule.findAll({
      where: { projectId },
    });

    // Get default schedules
    const defaultSchedules = await db.D_Schedule.findAll();

    const scheduleMap: Record<string, any> = {};

    // Map default schedules by `sch1_sch2`
    defaultSchedules.forEach((defaultSchedule: ScheduleType) => {
      scheduleMap[defaultSchedule.sch1_sch2] = defaultSchedule;
    });

    // Override with project-specific schedules
    projectSchedules.forEach((schedule: ScheduleType) => {
      scheduleMap[schedule.sch1_sch2] = schedule;
    });

    // Return merged schedules
    const mergedSchedules = Object.values(scheduleMap);
    res.json({ success: true, schedules: mergedSchedules });
  } catch (error: unknown) {
    console.error("Error fetching schedules:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or Update schedules with user validation
export const addOrUpdateSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, schedules } = req.body;
    const userId = (req as any).user.id; // Get the user ID from the request

    // Validate the projectId and userId
    const isProjectValid = await validateProjectAndUser(projectId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    // Check for duplicates in `code` and `schDesc`
    const schCodesSeen = new Set();
    const schDescsSeen = new Set();

    for (const schedule of schedules) {
      const { code, schDesc } = schedule;

      if (schCodesSeen.has(code)) {
        res.json({ status: '400', success: false, error: `This CODE (${code}) is already in use.` });
        return;
      }
      schCodesSeen.add(code);

      if (schDescsSeen.has(schDesc)) {
        res.json({ status: '400', success: false, error: `This Sch Desc (${schDesc}) is already in use.` });
        return;
      }
      schDescsSeen.add(schDesc);
    }

    // Add or update schedules
    for (const schedule of schedules) {
      const { sch1_sch2, code, schDesc } = schedule;

      // Check if the schedule already exists for this project
      const existingSchedule = await db.Schedule.findOne({
        where: { sch1_sch2, projectId }
      });

      if (existingSchedule) {
        // Update `code` and `schDesc` if they have changed
        if (existingSchedule.code !== code || existingSchedule.schDesc !== schDesc) {
          existingSchedule.code = code;
          existingSchedule.schDesc = schDesc;
          await existingSchedule.save();
          res.json({ success: true, message: `Schedule ${sch1_sch2} updated successfully.` });
        } else {
          res.json({ success: false, message: `No changes detected for schedule ${sch1_sch2}.` });
        }
      } else {
        // Create a new schedule if it doesn't exist
        await db.Schedule.create({
          sch1_sch2,
          code,
          schDesc,
          projectId,
        });
        res.json({ success: true, message: `Schedule ${sch1_sch2} added successfully.` });
      }
    }
  } catch (error: unknown) {
    console.error("Error adding or updating schedules:", error);
    res.json({ success: false, error: "Failed to add or update schedules. Internal server error.", status: 500 });
  }
};
