import { Request, Response } from "express";
import db from "../models";
import { Op } from "sequelize";

    // "items": [
    //     {
    //         "id": 6,
    //         "spec_id": 9,
    //         "component_value": "PIPE",
    //         "component_code": "1",
    //         "component_desc_value": "PIPE, Smls, BE",
    //         "component_desc_code": "P2",
    //         "component_desc_client_code": "CP2",
    //         "component_desc_g_type": "TUBE",
    //         "component_desc_s_type": "PIPE",
    //         "size1_value": "0.25",
    //         "size1_code": "a",
    //         "size1_client_code": "Ca",
    //         "size2_value": "0.25",
    //         "size2_code": "a",
    //         "size2_client_code": "Ca",
    //         "schedule_value": "10S",
    //         "schedule_code": "S1",
    //         "schedule_client_code": "CS1",
    //         "rating_value": null,
    //         "rating_code": "X",
    //         "rating_client_code": "X",
    //         "material_value": "A106 Gr.B w/ 3mm 316L SS Clad",
    //         "material_code": "ZL",
    //         "material_client_code": "CZL",
    //         "dimensional_standard_value": "ASME B36.19",
    //         "dimensional_standard_id": "2",
    //         "createdAt": "2024-11-24T10:30:24.837Z",
    //         "updatedAt": "2024-11-24T10:30:24.837Z"
    //     },
    // ]


export const generateReviewOutput = async (req: Request, res: Response): Promise<void> => {
    const { specId } = req.body;

    try {
        const pms_items = await db.PmsCreation.findAll({ where: { spec_id: specId } });

        if (!pms_items || pms_items.length === 0) {
            res.status(400).json({ message: "No data found for the specified spec ID" });
            return;
        }

        const processedItems = [];

        
        for (const pmsItem of pms_items) {
            const item = pmsItem.dataValues; 
            // Extract and process codes (e.g., component_code, schedule_code)
            const {
                component_desc_code,
                schedule_code,
                rating_code,
                material_code,
                size1_code,
                size2_code,
                dimensional_standard_id,
            } = item;
        
            // Resolve data from DB or default DB
            const component = component_desc_code
                ? await db.ComponentDesc.findOne({ where: { code: component_desc_code } }) ||
                  await db.D_Component.findOne({ where: { code: component_desc_code } })
                : null;
        
            const schedule = schedule_code
                ? await db.Schedule.findOne({ where: { code: schedule_code } }) ||
                  await db.D_Schedule.findOne({ where: { code: schedule_code } })
                : null;
        
            const rating = rating_code
                ? await db.Rating.findOne({ where: { ratingCode: rating_code } }) ||
                  await db.D_Rating.findOne({ where: { ratingCode: rating_code } })
                : null;
        
            const material = material_code
                ? await db.Material.findOne({ where: { code: material_code } }) ||
                  await db.D_Material.findOne({ where: { code: material_code } })
                : null;
        
            const dimensionalStandard = dimensional_standard_id
                ? await db.DimensionalStandard.findOne({ where: { id: dimensional_standard_id } })
                : null;
        
            const size1 =await db.Size.findOne({ where: { code: size1_code}}) ||
                            await db.D_Size.findOne({ where: { code: size1_code }});
            const size2 = await db.Size.findOne({ where: { code: size2_code}}) || await db.D_Size.findOne({where: { code: size2_code }});

            console.log('size1',size1);
            console.log('size2',size2);

            if (size1_code && size2_code) {
                const sizesInRange = await db.Size.findAll({
                    where: {
                        code: {
                            [Op.between]: [size1_code, size2_code],
                        },
                    },
                    order: [['od', 'ASC']],
                }) || await db.D_Size.findAll({
                    where:{
                        code:{
                            [Op.between]: [size1_code, size2_code],
                        },
                    },
                    order:[['od','ASC']],
                });

                console.log('sizeInRange',sizesInRange);
        
                for (const size of sizesInRange) {
                    const sizeData = size.dataValues; // Access size data
        
                    const processedItem = {
                        CompType:item.component_value,
                        ShortCode:component.short_code,
                        ItemCode:`${component.code}${sizeData.code}${'X'}${schedule.code}${'X'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                        ItemLongDesc:`${component.itemDescription}${schedule.sch1_sch2}${rating ? rating.ratingValue : ''}${material.material_description}${dimensionalStandard.dimensional_standard}`,
                        ItemShortDesc:`${component.itemDescription}`,
                        Size1Inch:`${sizeData.size_inch}`,
                        Size2Inch:`${'X'}`,
                        Size1MM:`${sizeData.size_mm}`,
                        Size2MM:`${'X'}`,
                        Sch1:`${schedule.sch1_sch2}`,
                        Sch2:`${'X'}`,
                        Rating:`${rating.ratingValue}`,
                        GType:`${component.g_type}`,
                        SType:`${component.s_type}`,
                    }
                    console.log(processedItem);
                    processedItems.push(processedItem);
                }
            } else {
                // Handle cases where size1_code or size2_code is missing
                const processedItem = {
                    item,
                    component,
                    schedule,
                    rating,
                    material,
                    size: null, // No size data
                    dimensionalStandard,
                };
        
                processedItems.push(processedItem); // Add to the result array
            }
        }

        // Respond with the processed items
        res.status(200).json({ message: "Data processed successfully", data: processedItems });
    } catch (error:unknown) {
        console.error("Error processing data:", error);
        res.status(500).json({sucess:false, error: "An error occurred while processing data",status:500 });
    }
};
