import { Request, Response } from "express";
import db from "../models";

// Create Item
export const createItem = async (req: Request, res: Response): Promise<void> => {
    try {
        const {items} = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            res.json({ success: false, error: "Invalid input: Expected non-empty array of items", status: 400 });
            return;
        }

        const createdItems = [];
        const errors = [];

        for (const itemData of items) {
            try {
                
                const specExists = await db.Spec.findByPk(itemData.specId);
                if (!specExists) {
                    errors.push({ 
                        specId: itemData.specId, 
                        error: "Spec not found" 
                    });
                    continue;
                }

                // Create individual item
                const newItem = await db.Item.create({
                    spec_id: itemData.specId,
                    component_code: itemData.component?.Code,
                    component_value: itemData.component?.Value,
                    component_desc_code: itemData.componentDesc?.Code,
                    component_desc_c_code: itemData.componentDesc?.CCode,
                    component_desc_value: itemData.componentDesc?.Value,
                    item_c_code: itemData.itemCCode,
                    item_code: itemData.itemCode,
                    item_long_desc: itemData.itemLongDesc,
                    size1_value:itemData.size1?.Value,
                    size1_code: itemData.size1?.Code,
                    size1_c_code: itemData.size1?.CCode,
                    size1_inch: itemData.size1?.Inch,
                    size1_mm: itemData.size1?.MM,
                    size2_value:itemData.size2?.Value,
                    size2_code: itemData.size2?.Code,
                    size2_c_code: itemData.size2?.CCode,
                    size2_inch: itemData.size2?.Inch,
                    size2_mm: itemData.size2?.MM,
                    schedule1_code: itemData.sch1?.Code,
                    schedule1_c_code: itemData.sch1?.CCode,
                    schedule1_value: itemData.sch1?.Value,
                    schedule2_code: itemData.sch2?.Code,
                    schedule2_c_code: itemData.sch2?.CCode,
                    schedule2_value: itemData.sch2?.Value,
                    rating_code: itemData.rating?.Code,
                    rating_value: itemData.rating?.Value,
                    rating_c_code: itemData.rating?.CCode,
                    material_code: itemData.material?.Code,
                    material_c_code: itemData.material?.CCode,
                    material_value: itemData.material?.Value,
                    dimensional_standards: itemData.dimensionalStandards,
                    short_code: itemData.shortCode,
                    g_type: itemData.g_type,
                    s_type: itemData.s_type
                });

                createdItems.push(newItem);
            } catch (itemError) {
                console.error(`Error creating individual item:`, itemError);
                errors.push({ 
                    itemCode: itemData.itemCode, 
                    error: "Failed to create item" 
                });
            }
        }

        // Respond with results
        res.json({
            success: true,
            message: `Processed ${items.length} items. ${createdItems.length} created successfully.`,
            status: createdItems.length > 0 ? 201 : 400,
            createdItems,
            errors
        });

    } catch (error) {
        console.error("Error Creating items:", error);
        res.json({ 
            success: false, 
            error: "Internal server error", 
            status: 500 
        });
    }
};

// Get Items by SpecId
export const getItemsBySpecId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { specId } = req.body;

        if (!specId) {
            res.json({ success: false, error: "SpecId is required", status: 400 });
            return;
        }

        // Fetch items by specId
        const items = await db.Item.findAll({
            where: { spec_id:specId },
        });

        res.json({
            success: true,
            message: `Items fetched successfully.`,
            status: 200,
            items: items,
        });
    } catch (error: unknown) {
        console.error("Error fetching Items by specId:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};