// In your default rating controller
import db from "../models";
import { Request, Response } from "express";

export const getRatingsByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.body;
  
      const projectRatings = await db.Rating.findAll({
        where: { projectId },
      });
  
      if (projectRatings.length > 0) {
        res.json({ success: true, ratings: projectRatings });
      } else {

        const defaultRatings = await db.D_Rating.findAll();
        res.json({ success: true, ratings: defaultRatings });
      }
    } catch (error: unknown) {
      console.error("Error fetching ratings:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
    }
  };
  

  export const addOrUpdateRatings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId, ratings } = req.body;
  
      const ratingCodesSeen = new Set();
      const ratingValuesSeen = new Set();
  
      // Check for duplicates within the ratings array
      for (const rating of ratings) {
        const { ratingCode, ratingValue } = rating;
  
        if (ratingCodesSeen.has(ratingCode)) {
          res.json({staus:'400', success: false, error: `This ratingCode (${ratingCode}) is already in use.` });
          return;
        }
        ratingCodesSeen.add(ratingCode);
  
        if (ratingValuesSeen.has(ratingValue)) {
           res.json({ status:'400', success: false, error: `This ratingValue (${ratingValue}) is already in use.` });
           return;
        }
        ratingValuesSeen.add(ratingValue);
      }
  
      for (const rating of ratings) {
        const { ratingCode, ratingValue } = rating;
  
        const existingRating = await db.Rating.findOne({
          where: { ratingValue, projectId }
        });
  
        if (existingRating) {
          // Update only the fields you want to change
          existingRating.ratingCode = ratingCode;
          await existingRating.save();
        } else {
          // Create a new rating if it doesn't exist
          await db.Rating.create({
            ratingCode,
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
  
  
