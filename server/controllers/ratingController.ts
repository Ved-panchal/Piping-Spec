import db from "../models";
import { Request, Response } from "express";
import { validateProjectAndUser } from "../helpers/validateProjectUser";  // Import the validation helper

interface RatingType {
    ratingCode: string,
    c_ratingCode:string;
    ratingValue:string;
    projectId: string
}

export const getRatingsByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.body;
      const userId = (req as any).user.id;
      const isProjectValid = await validateProjectAndUser(projectId, userId);
      if (!isProjectValid) {
        res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
        return;
      }
      const projectRatings = await db.Rating.findAll({
        where: { projectId },
      });

      const defaultRatings = await db.D_Rating.findAll();

      const ratingMap: Record<string, any> = {};

      defaultRatings.forEach((defaultRating:RatingType) => {
        ratingMap[defaultRating.ratingCode] = defaultRating;
      });

      projectRatings.forEach((rating:RatingType) => {
        ratingMap[rating.ratingCode] = rating;
      });

      const mergedRatings = Object.values(ratingMap);
      res.json({ success: true, ratings: mergedRatings });
    } catch (error: unknown) {
      console.error("Error fetching ratings:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
    }
  };

export const addOrUpdateRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, ratings } = req.body;
    const userId =  (req as any).user.id;

    const isProjectValid = await validateProjectAndUser(projectId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    for (const rating of ratings) {
      const { c_rating_code, ratingCode ,ratingValue } = rating;

      const existingRating = await db.Rating.findOne({
        where: { ratingValue, projectId }
      });

      if (existingRating) {
        existingRating.c_rating_code = c_rating_code;
        await existingRating.save();
      } else {
        await db.Rating.create({
          ratingCode,
          c_rating_code,
          ratingValue,
          projectId,
        });
      }
    }

    res.json({ success: true, message: "Ratings added or updated successfully." });
  } catch (error: unknown) {
    console.error("Error adding or updating ratings:", error);
    res.json({ success: false, error: "Failed to add or update ratings. Internal server error.", status: 500 });
  }
};
