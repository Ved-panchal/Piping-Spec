// In your default rating controller
import db from "../models";
import { Request, Response } from "express";

interface RatingType {
  ratingValue:string;
  ratingCode:string;
  projectId?:string;
}

export const getRatingsByProjectId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId } = req.body;

    const projectRatings = await db.Rating.findAll({
      where: { projectId },
    });

    const defaultRatings = await db.D_Rating.findAll();

    const ratingMap: Record<string, any> = {};

    defaultRatings.forEach((defaultRating:RatingType) => {
      ratingMap[defaultRating.ratingValue] = defaultRating;
    });

    projectRatings.forEach((rating:RatingType) => {
      ratingMap[rating.ratingValue] = rating;  
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
    const { projectId, ratingCode, ratingValue } = req.body;

    const existingRating = await db.Rating.findOne({
      where: { ratingValue, projectId }
    });

    if (existingRating) {
      if (existingRating.ratingCode !== ratingCode) {
        existingRating.ratingCode = ratingCode;
        await existingRating.save();
        res.json({ success: true, message: "Rating updated successfully." });
      } else {
        res.json({ success: false, message: "Rating code is the same, no update needed." });
      }
    } else {
      await db.Rating.create({
        ratingCode,
        ratingValue,
        projectId,
      });
      res.json({ success: true, message: "Rating added successfully." });
    }
  } catch (error: unknown) {
    console.error("Error adding or updating ratings:", error);
    res.json({ success: false, error: "Failed to add or update ratings. Internal server error.", status: 500 });
  }
};

  
  
