import { Request, Response } from "express";
import db from "../models";

// Create PMSC Creation
export const createPMSCCreation = async (req: Request, res: Response): Promise<void> => {
    try {
        // Handle both single item and array cases
        const items = Array.isArray(req.body) ? req.body : [req.body];
        
        if (items.length === 0) {
            res.json({ 
                success: false, 
                error: "Invalid input: Expected non-empty data", 
                status: 400 
            });
            return;
        }

        const createdItems = [];
        const errors = [];

        for (const itemData of items) {
            try {
                console.log(itemData);
                // Validate spec exists
                const specExists = await db.Spec.findByPk(itemData.specId);
                if (!specExists) {
                    errors.push({ 
                        specId: itemData.specId, 
                        error: "Spec not found" 
                    });
                    continue;
                }

                // Create new PMSC item
                const newItem = await db.PmsCreation.create({
                    spec_id: itemData.specId,
                    component_value: itemData.component.Value,
                    component_code: itemData.component.Code,
                    component_desc_value: itemData.componentDesc?.value,
                    component_desc_code: itemData.componentDesc?.code,
                    component_desc_client_code: itemData.componentDesc?.clientCode,
                    component_desc_g_type: itemData.componentDesc?.gType,
                    component_desc_s_type: itemData.componentDesc?.sType,
                    size1_value: itemData.size1?.value,
                    size1_code: itemData.size1?.code,
                    size1_client_code: itemData.size1?.clientCode,
                    size2_value: itemData.size2?.value,
                    size2_code: itemData.size2?.code,
                    size2_client_code: itemData.size2?.clientCode,
                    schedule_value: itemData.schedule?.value,
                    schedule_code: itemData.schedule?.code,
                    schedule_client_code: itemData.schedule?.clientCode,
                    rating_value: itemData.rating?.value,
                    rating_code: itemData.rating?.code,
                    rating_client_code: itemData.rating?.clientCode,
                    material_value: itemData.material?.value,
                    material_code: itemData.material?.code,
                    material_client_code: itemData.material?.clientCode,
                    dimensional_standard_value: itemData.dimensionalStandard?.Value,
                    dimensional_standard_id: itemData.dimensionalStandard?.id
                });

                createdItems.push(newItem);
            } catch (itemError) {
                console.error(`Error creating PMSC Creation item:`, itemError);
                errors.push({ 
                    specId: itemData.specId, 
                    error: "Failed to create PMSC Creation item",
                    details: (itemError as Error).message
                });
            }
        }

        // Determine response status based on results
        const responseStatus = createdItems.length > 0 ? 
            (errors.length === 0 ? 201 : 207) :
            400;

        res.status(responseStatus).json({
            success: createdItems.length > 0,
            message: `Processed ${items.length} items. ${createdItems.length} created successfully.`,
            createdItems,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error) {
        console.error("Error in PMSC Creation:", error);
        res.status(500).json({ 
            success: false, 
            error: "Internal server error", 
            details: (error as Error).message 
        });
    }
};

export const updatePMSCCreation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, specId, editingCell, ...updateData } = req.body;

        if (!id || !specId || !editingCell) {
            res.status(400).json({
                success: false,
                error: "Missing required fields: id, specId, and editingCell are required",
                status: 400
            });
            return;
        }

        // Find the item first
        const item = await db.PmsCreation.findByPk(id);

        if (!item) {
            res.status(404).json({
                success: false,
                error: "PMSC Creation item not found",
                status: 404
            });
            return;
        }

        // Function to update schedule based on size code
        const updateScheduleData = async (sizeCode: string): Promise<any> => {
            try {
                if (!sizeCode) {
                    throw new Error("Size code not found");
                }

                const sizeRange = await db.SizeRange.findOne({
                    where: {
                        size_code: sizeCode,
                        specId: specId
                    }
                });

                if (!sizeRange) {
                    throw new Error("No schedule mapping found for the given size");
                }

                const scheduleDetails = await db.Schedule.findOne({
                    where: {
                        code: sizeRange.schedule_code,
                        projectId: item.projectId
                    }
                });

                const schedule = scheduleDetails || await db.D_Schedule.findOne({
                    where: {
                        code: sizeRange.schedule_code
                    }
                });

                if (!schedule) {
                    throw new Error("Schedule details not found");
                }

                return {
                    schedule_value: schedule.sch1_sch2,
                    schedule_code: schedule.code,
                    schedule_client_code: schedule.c_code
                };
            } catch (error) {
                throw new Error(`Failed to update schedule: ${(error as Error).message}`);
            }
        };

        // Prepare update object based on editingCell
        let updateObject: any = {};

        switch (editingCell) {
            case 'size1':
                updateObject = {
                    size1_value: updateData.size1?.value,
                    size1_code: updateData.size1?.code,
                    size1_client_code: updateData.size1?.clientCode
                };
                // Update schedule when size1 changes
                try {
                    const scheduleUpdate = await updateScheduleData(updateData.size1?.code);
                    updateObject = { ...updateObject, ...scheduleUpdate };
                } catch (error) {
                    console.error("Error updating schedule with size1:", error);
                }
                break;

            case 'size2':
                updateObject = {
                    size2_value: updateData.size2?.value,
                    size2_code: updateData.size2?.code,
                    size2_client_code: updateData.size2?.clientCode
                };
                // Update schedule when size2 changes
                try {
                    const scheduleUpdate = await updateScheduleData(updateData.size2?.code);
                    updateObject = { ...updateObject, ...scheduleUpdate };
                } catch (error) {
                    console.error("Error updating schedule with size2:", error);
                }
                break;

            case '"itemDescription"':
                updateObject = {
                    component_desc_value: updateData.componentDesc?.value,
                    component_desc_code: updateData.componentDesc?.code,
                    component_desc_client_code: updateData.componentDesc?.clientCode,
                    component_desc_g_type: updateData.componentDesc?.gType,
                    component_desc_s_type: updateData.componentDesc?.sType
                };
                break;

            case 'rating':
                updateObject = {
                    rating_value: updateData.rating?.value,
                    rating_code: updateData.rating?.code,
                    rating_client_code: updateData.rating?.clientCode
                };
                break;

            case 'material':
                updateObject = {
                    material_value: updateData.material?.value,
                    material_code: updateData.material?.code,
                    material_client_code: updateData.material?.clientCode
                };
                break;

            case 'dimensionalStandard':
                updateObject = {
                    dimensional_standard_value: updateData.dimensionalStandard?.Value,
                    dimensional_standard_id: updateData.dimensionalStandard?.id
                };
                break;

            default:
                res.status(400).json({
                    success: false,
                    error: "Invalid editingCell value",
                    status: 400
                });
                return;
        }

        // Remove any undefined values from updateObject
        Object.keys(updateObject).forEach(key => 
            updateObject[key] === undefined && delete updateObject[key]
        );

        // Perform the update
        await item.update(updateObject);

        // Fetch the updated item
        const updatedItem = await db.PmsCreation.findByPk(id);

        res.json({
            success: true,
            message: `PMSC Creation item updated successfully`,
            status: 200,
            updatedItem
        });

    } catch (error) {
        console.error("Error updating PMSC Creation item:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: (error as Error).message
        });
    }
};

// Get PMSC Creation by SpecId
export const getPMSCCreationBySpecId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { specId } = req.body;

        if (!specId) {
            res.json({ success: false, error: "SpecId is required", status: 400 });
            return;
        }

        // Fetch PMSC Creation items by specId
        const items = await db.PmsCreation.findAll({
            where: { spec_id: specId },
        });

        res.json({
            success: true,
            message: `PMSC Creation items fetched successfully.`,
            status: 200,
            items: items,
        });
    } catch (error: unknown) {
        console.error("Error fetching PMSC Creation items by specId:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

// Delete PMSC Creation by ID
export const deletePMSCCreation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        if (!id) {
            res.json({ success: false, error: "ID is required", status: 400 });
            return;
        }

        // Find the item first
        const item = await db.PmsCreation.findByPk(id);

        if (!item) {
            res.json({ 
                success: false, 
                error: "PMSC Creation item not found", 
                status: 404 
            });
            return;
        }

        // Delete the item
        await item.destroy();

        res.json({
            success: true,
            message: `PMSC Creation item deleted successfully.`,
            status: 200,
        });
    } catch (error) {
        console.error("Error deleting PMSC Creation item:", error);
        res.json({ 
            success: false, 
            error: "Internal server error", 
            status: 500 
        });
    }
};