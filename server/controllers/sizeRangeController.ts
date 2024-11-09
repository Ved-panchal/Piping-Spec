import { Request, Response } from "express";
import db from "../models";
import { where } from "sequelize";

interface sizeRange {
    id:number;
    size_code: number;
    schedule_code: number;
    specId: number;
}

// Create SizeRange
export const createSizeRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sizes, scheduleCode, specId } = req.body;

        // Check if specId exists
        const specExists = await db.Spec.findByPk(specId);
        if (!specExists) {
            res.json({ success: false, error: "Spec not found.", status: 404 });
            return;
        }

        // Ensure that sizes is an array and check for empty array
        if (!Array.isArray(sizes) || sizes.length === 0) {
            res.json({ success: false, error: "No sizes provided.", status: 400 });
            return;
        }

        // Loop through the sizes array and create SizeRange entries for each size
        const createdSizeRanges = [];
        for (const size of sizes) {
            let sizeCode = await db.Size.findOne({
                where: {
                  size1_size2: size as number,
                },
              });
            
              if (!sizeCode) {
                sizeCode = await db.D_Size.findOne({
                  where: {
                    size1_size2: size as number,
                  },
                });
              }
            
              if (!sizeCode) {
                res.json({success:false,message:`Size code not found for size: ${size}`});
                return;
              }
            
            const newSizeRange = await db.SizeRange.create({
                size_code: sizeCode.code,
                schedule_code: scheduleCode || "ST",
                specId,
            });
            createdSizeRanges.push(newSizeRange);
        }

        // Return the created SizeRanges
        res.json({
            success: true,
            message: `${createdSizeRanges.length} SizeRange(s) created successfully.`,
            status: 201,
            createdSizeRanges,
        });
    } catch (error: unknown) {
        console.error("Error creating SizeRange:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};


// Update SizeRange
export const updateSizeRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, sizeCode, scheduleCode, specId } = req.body;

        // Check if specId exists
        const specExists = await db.Spec.findByPk(specId);
        if (!specExists) {
            res.json({ success: false, error: "Spec not found.", status: 404 });
            return;
        }

        const sizeRange = await db.SizeRange.findOne({
            where: {
                id: id,
                specId: specId
            }
        });
        if (!sizeRange) {
            res.json({ success: false, error: "SizeRange not found.", status: 404 });
            return;
        }

        // Update SizeRange details
        await sizeRange.update({ size_code:sizeCode, schedule_code:scheduleCode, specId });
        res.json({ success: true, message: "SizeRange updated successfully.", status: 200, sizeRange });
    } catch (error: unknown) {
        console.error("Error updating SizeRange:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

// Delete SizeRange (Soft Delete)
export const deleteSizeRange = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        // Attempt to hard delete the SizeRange by ID
        const deletedRowCount = await db.SizeRange.destroy({
            where: { id },
            force: true  // Ensures the deletion is permanent
        });

        if (deletedRowCount === 0) {
            res.json({ success: false, error: "SizeRange not found.", status: 404 });
            return;
        }

        res.json({ success: true, message: "SizeRange deleted successfully.", status: 200 });
    } catch (error: unknown) {
        console.error("Error deleting SizeRange:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};


// Get SizeRanges by SpecId
export const getSizeRangesBySpecId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { specId } = req.body;

        if (!specId) {
            res.json({ success: false, error: "SpecId is required", status: 400 });
            return;
        }

        // Fetch size ranges by specId
        const sizeRanges = await db.SizeRange.findAll({
            where: { specId },
        });

        // Prepare the response data
        const formattedData = await Promise.all(sizeRanges.map(async (range:sizeRange) => {
            const sizerange_id = range.id;
            const sizeCode = range.size_code;
            let sizeValue: number | null = null;

            // Find size in Size table
            const size = await db.Size.findOne({ where: { code: sizeCode } });
            if (size) {
                sizeValue = size.size1_size2; // Get size1_size2 from the Size table
            }

            // If not found, check in D_Size table
            if (!sizeValue) {
                const dSize = await db.D_Size.findOne({ where: { code: sizeCode } });
                if (dSize) {
                    sizeValue = dSize.size1_size2; // Get size1_size2 from the D_Size table
                }
            }

            const scheduleCode = range.schedule_code;
            let scheduleValue: string | null = null;

            // Find schedule in Schedule table
            const schedule = await db.Schedule.findOne({ where: { code: scheduleCode } });
            if (schedule) {
                scheduleValue = schedule.sch1_sch2;
            }

            if (!scheduleValue) {
                const dSchedule = await db.D_Schedule.findOne({ where: { code: scheduleCode } });
                if (dSchedule) {
                    scheduleValue = dSchedule.sch1_sch2;
                }
            }

            return {
                id:sizerange_id,
                specId: range.specId,
                sizeValue,
                sizeCode,
                scheduleValue,
                scheduleCode,
            };
        }));

        res.json({
            success: true,
            message: `SizeRanges fetched successfully.`,
            status: 200,
            sizeranges: formattedData,
        });
    } catch (error: unknown) {
        console.error("Error fetching SizeRanges by specId:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

