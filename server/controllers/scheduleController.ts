import db from "../models";
import { Request, Response } from "express";

// Get schedules by projectId or default schedules if none exist
export const getSchedulesByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    const projectSchedules = await db.Schedule.findAll({
      where: { projectId },
    });

    if (projectSchedules.length > 0) {
      res.json({ success: true, schedules: projectSchedules });
    } else {
      // If not, return default schedules
      const defaultSchedules = await db.D_Schedule.findAll();
      res.json({ success: true, schedules: defaultSchedules });
    }
  } catch (error: unknown) {
    console.error("Error fetching schedules:", error);
    res.json({ success: false, error: "Internal server error", status: 500 });
  }
};

// Add or update schedules for a project
export const addOrUpdateSchedules = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, schedules } = req.body;

    const schCodesSeen = new Set();
    const schDescsSeen = new Set();

    // Check for duplicates within the schedules array
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

      const existingSchedule = await db.Schedule.findOne({
        where: { sch1_sch2, projectId }
      });

      if (existingSchedule) {
        // Update only code and schDesc, keep sch1_sch2 immutable
        existingSchedule.code = code;
        existingSchedule.schDesc = schDesc;
        await existingSchedule.save();
      } else {
        await db.Schedule.create({
          sch1_sch2,
          code,
          schDesc,
          projectId,
        });
      }
    }

    res.json({ success: true, message: "Schedules added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating schedules:", error);
    res.json({ success: false, error: "Failed to add or update schedules. Internal server error.", status: 500 });
  }
};
