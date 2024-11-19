import db from "../models";
import { Request, Response } from "express";
import { validateProjectAndUser } from "../helpers/validateProjectUser";

interface ScheduleType {
  id:number;
  d_id:number;
  sch1_sch2: string;
  code: string;
  schDesc: string;
  projectId?: string;
}

export const getSchedulesByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;
    const userId = (req as any).user.id;

    const isProjectValid = await validateProjectAndUser(projectId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    const projectSchedules = await db.Schedule.findAll({
      where: { projectId },
    });

    const defaultSchedules = await db.D_Schedule.findAll();
    console.log(defaultSchedules);
    const scheduleMap: Record<string, ScheduleType> = {};

    defaultSchedules.forEach((defaultSchedule: ScheduleType) => {
      scheduleMap[defaultSchedule.code] = defaultSchedule;
    });

    projectSchedules.forEach((schedule: ScheduleType) => {
      scheduleMap[schedule.code] = schedule;
    });

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
    const userId = (req as any).user.id;

    const isProjectValid = await validateProjectAndUser(projectId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    for (const schedule of schedules) {
      const {sch1_sch2, code, c_code, schDesc } = schedule;

      const existingSchedule = await db.Schedule.findOne({
        where: { sch1_sch2, projectId }
      });

      if (existingSchedule) {
        if (existingSchedule.c_code !== c_code || existingSchedule.schDesc !== schDesc) {
          existingSchedule.c_code = c_code;
          existingSchedule.schDesc = schDesc;
          await existingSchedule.save();
          res.json({ success: true, message: `Schedule ${sch1_sch2} updated successfully.` });
        } else {
          res.json({ success: false, message: `No changes detected for schedule ${sch1_sch2}.` });
        }
      } else {
        await db.Schedule.create({
          sch1_sch2,
          code,
          c_code,
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

