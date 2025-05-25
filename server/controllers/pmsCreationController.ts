import { Request, Response } from "express";
import db from "../models";
import { Op } from "sequelize";

interface PmsCreation {
    id: number;
    component_code?: string;
    component_desc_code?: string;
    size1_code?: string;
    size2_code?: string;
    schedule_code?: string;
    rating_code?: string;
    material_code?: string;
    dimensional_standard_id?: number;
    dimensional_standard_code?: string;
    valv_sub_type_code?: string;
    construction_desc_code?: string;
}


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
                // Validate spec exists
                const specExists = await db.Spec.findByPk(itemData.specId);
                if (!specExists) {
                    errors.push({ 
                        specId: itemData.specId, 
                        error: "Spec not found" 
                    });
                    continue;
                }
                let newItem = null;
                if(itemData.component.Code === 19){
                    newItem = await db.ValvPmsCreation.create({
                        spec_id: itemData.specId,
                        component_code: itemData.component.Code,
                        component_desc_code: itemData.componentDesc?.code,
                        size1_code: itemData.size1?.code,
                        size2_code: itemData.size2?.code,
                        schedule_code: itemData.schedule?.code,
                        rating_code: itemData.rating?.code,
                        material_code: itemData.material?.code,
                        dimensional_standard_code: itemData.dimensionalStandard?.id,
                        valv_sub_type_code: itemData.valvSubtype?.code,
                        construction_desc_code: itemData.constructionDesc?.code,
                        sort_order: itemData.sort_order      // <-- Add this line
                    });
                } else {
                    newItem = await db.PmsCreation.create({
                        spec_id: itemData.specId,
                        component_code: itemData.component.Code,
                        component_desc_code: itemData.componentDesc?.code,
                        size1_code: itemData.size1?.code,
                        size2_code: itemData.size2?.code,
                        schedule_code: itemData.schedule?.code,
                        rating_code: itemData.rating?.code,
                        material_code: itemData.material?.code,
                        dimensional_standard_id: itemData.dimensionalStandard?.id,
                        sort_order: itemData.sort_order      // <-- Add this line
                    });
                }
                

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

        const item = await db.PmsCreation.findByPk(id);
        const valvItem = await db.ValvPmsCreation.findByPk(id);

        if (!item && !valvItem) {
            res.status(404).json({
                success: false,
                error: "PMSC Creation item not found",
                status: 404
            });
            return;
        }

        const updateScheduleData = async (sizeCode: string): Promise<any> => {
            const sizeRange = await db.SizeRange.findOne({
                where: { size_code: sizeCode, specId: specId }
            });

            if (!sizeRange) throw new Error("No schedule mapping found for the given size");

            const scheduleDetails = await db.Schedule.findOne({
                where: { code: sizeRange.schedule_code, projectId: item.projectId }
            });

            const schedule = scheduleDetails || await db.D_Schedule.findOne({
                where: { code: sizeRange.schedule_code }
            });

            if (!schedule) throw new Error("Schedule details not found");

            return {
                schedule_value: schedule.sch1_sch2,
                schedule_code: schedule.code,
                schedule_client_code: schedule.c_code
            };
        };

        let updateObject: any = {};

        if (item) {
            switch (editingCell) {
                case 'size1':
                    updateObject = {
                        size1_value: updateData.size1?.value,
                        size1_code: updateData.size1?.code,
                        size1_client_code: updateData.size1?.clientCode
                    };
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
                    try {
                        const scheduleUpdate = await updateScheduleData(updateData.size2?.code);
                        updateObject = { ...updateObject, ...scheduleUpdate };
                    } catch (error) {
                        console.error("Error updating schedule with size2:", error);
                    }
                    break;
                case 'itemDescription':
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
                        dimensional_standard_value: updateData.dimensionalStandard?.value,
                        dimensional_standard_code: updateData.dimensionalStandard?.code
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

            Object.keys(updateObject).forEach(key =>
                updateObject[key] === undefined && delete updateObject[key]
            );

            await item.update(updateObject);

            const updatedItem = await db.PmsCreation.findByPk(id);
            res.json({
                success: true,
                message: `PMSC Creation item updated successfully`,
                status: 200,
                updatedItem
            });

        } else if (valvItem) {
            switch (editingCell) {
                case 'component':
                    updateObject = {
                        component_code: updateData.component?.code
                    };
                    break;
                case 'componentDescription':
                    updateObject = {
                        component_desc_code: updateData.componentDescription?.code
                    };
                    break;
                case 'size1':
                    updateObject = {
                        size1_code: updateData.size1?.code
                    };
                    break;
                case 'size2':
                    updateObject = {
                        size2_code: updateData.size2?.code
                    };
                    break;
                case 'schedule':
                    updateObject = {
                        schedule_code: updateData.schedule?.code
                    };
                    break;
                case 'rating':
                    updateObject = {
                        rating_code: updateData.rating?.code
                    };
                    break;
                case 'material':
                    updateObject = {
                        material_code: updateData.material?.code
                    };
                    break;
                case 'dimensionalStandard':
                    updateObject = {
                        dimensional_standard_code: updateData.dimensionalStandard?.id
                    };
                    break;
                case 'valvSubType':
                    updateObject = {
                        valv_sub_type_code: updateData.valvSubType?.code
                    };
                    break;
                case 'constructionDescription':
                    updateObject = {
                        construction_desc_code: updateData.constructionDescription?.code
                    };
                    break;
                default:
                    res.status(400).json({
                        success: false,
                        error: "Invalid editingCell value for ValvPmsCreation",
                        status: 400
                    });
                    return;
            }

            Object.keys(updateObject).forEach(key =>
                updateObject[key] === undefined && delete updateObject[key]
            );

            await valvItem.update(updateObject);

            const updatedValvItem = await db.ValvPmsCreation.findByPk(id);
            res.json({
                success: true,
                message: `Valv PMS Creation item updated successfully`,
                status: 200,
                updatedItem: updatedValvItem
            });
        }

    } catch (error) {
        console.error("Error updating PMSC Creation item:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error",
            details: (error as Error).message
        });
    }
};

export const getPMSCCreationBySpecId = async (req: Request, res: Response): Promise<void> => {
    try {
        const { specId, projectId } = req.body;

        if (!specId) {
            res.json({ success: false, error: "SpecId is required", status: 400 });
            return;
        }

        let items = []
        let valvItems = []
        // Fetch PMSC Creation items by specId
        items = await db.PmsCreation.findAll({
            where: { spec_id: specId },
            order: [['sort_order', 'ASC']]
        });
        valvItems = await db.ValvPmsCreation.findAll({
            where: { spec_id: specId },
            order: [['sort_order', 'ASC']]
        });
        

        const transformedItems = await Promise.all([...items,...valvItems].map(async (item:PmsCreation) => {
            let component = null;
            if (item.component_code) {
                component = await db.Component.findOne({ 
                    where: { id: item.component_code },
                    attributes: ['id','componentname'] 
                });
            }

            let componentDesc = null;
            if (item.component_desc_code) {
                componentDesc = await db.ComponentDesc.findOne({ 
                    where: { code: item.component_desc_code },
                    attributes: ['component_id', 'itemDescription', 'code', 'c_code', 'g_type', 's_type'] 
                });

                if (!componentDesc) {
                    componentDesc = await db.D_Component.findOne({ 
                        where: { code: item.component_desc_code },
                        attributes: ['component_id', 'itemDescription', 'code', 'c_code', 'g_type', 's_type'] 
                    });
                }
            }

            let size1 = null;
            if (item.size1_code) {
                size1 = await db.Size.findOne({ 
                    where: { code: item.size1_code },
                    attributes: ['id', 'size1_size2', 'code', 'c_code'] 
                });

                if (!size1) {
                    size1 = await db.D_Size.findOne({ 
                        where: { code: item.size1_code },
                        attributes: ['id', 'size1_size2', 'code','c_code'] 
                    });
                }
            }

            let size2 = null;
            if (item.size2_code) {
                size2 = await db.Size.findOne({ 
                    where: { code: item.size2_code },
                    attributes: ['id', 'size1_size2', 'code', 'c_code'] 
                });

                if (!size2) {
                    size2 = await db.D_Size.findOne({ 
                        where: { code: item.size2_code },
                        attributes: ['id', 'size1_size2', 'code','c_code'] 
                    });
                }
            }

            let schedule = null;
            if (item.schedule_code) {
                schedule = await db.Schedule.findOne({ 
                    where: { code: item.schedule_code },
                    attributes: ['id', 'sch1_sch2', 'code', 'c_code'] 
                });

                if (!schedule) {
                    schedule = await db.D_Schedule.findOne({ 
                        where: { code: item.schedule_code },
                        attributes: ['id', 'sch1_sch2', 'code', 'c_code'] 
                    });
                }
            }

            let rating = null;
            if (item.rating_code) {
                rating = await db.Rating.findOne({ 
                    where: { ratingCode: item.rating_code },
                    attributes: ['id', 'ratingValue', 'ratingCode', 'c_rating_code'] 
                });

                if (!rating) {
                    rating = await db.D_Rating.findOne({ 
                        where: { ratingCode: item.rating_code },
                        attributes: ['id', 'ratingValue', 'ratingCode','c_rating_code'] 
                    });
                }
            }

            let material = null;
            if (item.material_code) {
                material = await db.Material.findOne({ 
                    where: { code: item.material_code, project_id: projectId },
                    attributes: ['id', 'material_description', 'code', 'c_code'] 
                });

                if (!material && item.component_code !== '19') {
                    material = await db.D_Material.findOne({ 
                        where: { 
                            code: item.material_code,
                            comp_matching_id: { [Op.ne]: 6 }
                        },
                        attributes: ['id', 'material_description', 'code', 'c_code'] 
                    });                    
                }
            }

            let dimensionalStandard = null;
            if (item.dimensional_standard_id) {

                dimensionalStandard = await db.D_DimStd.findByPk(item.dimensional_standard_id, {
                attributes: ['id', 'dim_std'],
                });

                if (!dimensionalStandard) {
                    dimensionalStandard = await db.DimStd.findByPk(item.dimensional_standard_id, {
                    attributes: ['id', 'dim_std'],
                    });
                }
            }

            let valvSubType = null;
            let constructionDesc = null;
            if(item.component_code === '19'){
                valvSubType = await db.VSType.findOne({
                    where: { code: item.valv_sub_type_code },
                    attributes: ['id', 'valv_sub_type', 'code', 'c_code']
                })

                if(!valvSubType){
                    valvSubType = await db.D_VSType.findOne({
                        where: { code: item.valv_sub_type_code },
                        attributes: ['id', 'valv_sub_type', 'code', 'c_code']
                    })
                }

                constructionDesc = await db.D_CDesc.findOne({
                    where: { code: item.construction_desc_code },
                    attributes: ['id', 'construction_desc', 'code', 'c_code']
                })

                if(!constructionDesc){
                    constructionDesc = await db.CDesc.findOne({
                        where: { code: item.construction_desc_code },
                        attributes: ['id', 'construction_desc', 'code', 'c_code']
                    })
                }

                let dimensionalStandard = null;
                if (item.dimensional_standard_code) {
                    dimensionalStandard = await db.D_DimStd.findOne({
                        where: { code: item.dimensional_standard_code },
                        attributes: ['code', 'dim_std'],
                    });

                    if (!dimensionalStandard) {
                        dimensionalStandard = await db.DimStd.findOne({
                        where: { code: item.dimensional_standard_code },
                        attributes: ['code', 'dim_std'],
                    });
                    }
                }

                if (!material) {
                    material = await db.D_Material.findOne({ 
                        where: { 
                            code: item.material_code,
                            comp_matching_id: 6 
                        },
                        attributes: ['id', 'material_description', 'code', 'c_code'] 
                    });                    
                }

                return {
                    id: item.id,
                    component_value: component?.componentname || '',
                    component_code: item.component_code,
                    component_desc_value: componentDesc?.itemDescription || '',
                    size1_value: size1?.size1_size2 || '',
                    size2_value: size2?.size1_size2 || 'X',
                    schedule_value: schedule?.sch1_sch2 || '',
                    rating_value: rating?.ratingValue || 'X',
                    material_value: material?.material_description || '',
                    dimensional_standard_value: dimensionalStandard?.dim_std || '',
                    valv_sub_type_value: valvSubType?.valv_sub_type || '',
                    construction_desc_value: constructionDesc?.construction_desc || ''
                };
            }

            // Transform to match frontend structure
            return {
                id: item.id,
                component_value: component?.componentname || '',
                component_code: item.component_code,
                component_desc_value: componentDesc?.itemDescription || '',
                size1_value: size1?.size1_size2 || '',
                size2_value: size2?.size1_size2 || 'X',
                schedule_value: schedule?.sch1_sch2 || '',
                rating_value: rating?.ratingValue || 'X',
                material_value: material?.material_description || '',
                dimensional_standard_value: dimensionalStandard?.dim_std || ''
            };
        }));

        

        res.json({
            success: true,
            message: `PMSC Creation items fetched successfully.`,
            status: 200,
            items: transformedItems,
        });
    } catch (error: unknown) {
        console.error("Error fetching PMSC Creation items by specId:", error);
        res.json({ success: false, error: "Internal server error", status: 500 });
    }
};

export const deletePMSCCreation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.body;

        if (!id) {
            res.json({ success: false, error: "ID is required", status: 400 });
            return;
        }

        // Find the item first
        const item = await db.PmsCreation.findByPk(id);
        const valvItem = await db.ValvPmsCreation.findByPk(id);

        if (!item && !valvItem) {
            res.json({ 
                success: false, 
                error: "PMSC Creation item not found", 
                status: 404 
            });
            return;
        }


        if(item){
            await item.destroy();
        } else if(valvItem){
            await valvItem.destroy();
        }

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

export const updatePMSCOrder = async (req: Request, res: Response): Promise<void> => {
    try {
      const { items, isValv } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        res.json({ success: false, error: 'Invalid data', status:400 });
        return;
      }
      const model = isValv ? db.ValvPmsCreation : db.PmsCreation;
      await db.sequelize.transaction(async (t) => {
        for (const item of items) {
          await model.update({ sort_order: item.sort_order }, { where: { id: item.id }, transaction: t });
        }
      });
      res.json({ success: true, message:"Order Updated successfully", status:200 });
      return;
    } catch (error) {
      console.error('updatePMSCOrder error:', error);
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
  