import db from "../models";
import { Request, Response } from "express";
import { validateProjectAndUser } from "../helpers/validateProjectUser";  // Import the validation helper

interface RatingType {
    ratingCode: string,
    ratingValue:string;
    projectId: string
}

// Get Ratings by ProjectId with user validation
export const getRatingsByProjectId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { projectId } = req.body;
      const userId = (req as any).user.id;  // Get userId from cookies or headers
  
      // Validate the projectId and userId
      const isProjectValid = await validateProjectAndUser(projectId, userId);
      if (!isProjectValid) {
        res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
        return;
      }
  
      // Fetch project-specific ratings
      const projectRatings = await db.Rating.findAll({
        where: { projectId },
      });
  
      // Fetch default ratings
      const defaultRatings = await db.D_Rating.findAll();
  
      // Create a rating map to merge default and project-specific ratings
      const ratingMap: Record<string, any> = {};
  
      // Map default ratings using ratingValue as key
      defaultRatings.forEach((defaultRating:RatingType) => {
        ratingMap[defaultRating.ratingValue] = defaultRating;
      });
  
      // Override default ratings with project-specific ratings where applicable
      projectRatings.forEach((rating:RatingType) => {
        ratingMap[rating.ratingValue] = rating;
      });
  
      // Return merged ratings
      const mergedRatings = Object.values(ratingMap);
      res.json({ success: true, ratings: mergedRatings });
    } catch (error: unknown) {
      console.error("Error fetching ratings:", error);
      res.json({ success: false, error: "Internal server error", status: 500 });
    }
  };

// Add or Update Ratings with user validation
export const addOrUpdateRatings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { projectId, ratings } = req.body;
    const userId =  (req as any).user.id; // Get userId from cookies or headers

    // Validate the projectId and userId
    const isProjectValid = await validateProjectAndUser(projectId, userId);
    if (!isProjectValid) {
      res.json({ success: false, message: "Invalid project or unauthorized user.", status: 403 });
      return;
    }

    const ratingCodesSeen = new Set();
    const ratingValuesSeen = new Set();

    // Check for duplicates within the ratings array
    for (const rating of ratings) {
      const { ratingCode, ratingValue } = rating;

      if (ratingCodesSeen.has(ratingCode)) {
        res.json({ status: 400, success: false, error: `This ratingCode (${ratingCode}) is already in use.` });
        return;
      }
      ratingCodesSeen.add(ratingCode);

      if (ratingValuesSeen.has(ratingValue)) {
        res.json({ status: 400, success: false, error: `This ratingValue (${ratingValue}) is already in use.` });
        return;
      }
      ratingValuesSeen.add(ratingValue);
    }

    // Add or update each rating in the database
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
