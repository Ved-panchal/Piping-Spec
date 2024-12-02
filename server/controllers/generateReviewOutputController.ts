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


// export const generateReviewOutput = async (req: Request, res: Response): Promise<void> => {
//     const { specId } = req.body;

//     try {
//         const pms_items = await db.PmsCreation.findAll({ where: { spec_id: specId } });

//         if (!pms_items || pms_items.length === 0) {
//             res.status(400).json({ message: "No data found for the specified spec ID" });
//             return;
//         }

//         const processedItems = [];

        
//         for (const pmsItem of pms_items) {
//             const item = pmsItem.dataValues;
//             const {
//                 spec_id,
//                 component_code,
//                 component_desc_code,
//                 rating_code,
//                 material_code,
//                 size1_code,
//                 size2_code,
//                 dimensional_standard_id,
//             } = item;
            

//             const spec = spec_id ? await db.Spec.findOne({where:{ id: spec_id}}) : null

//             const component = component_code ? await db.Component.findOne({where:{id:component_code}}) : null;

//             // Resolve data from DB or default DB
//             const component_desc = component_desc_code
//                 ? await db.ComponentDesc.findOne({ where: { code: component_desc_code } }) ||
//                   await db.D_Component.findOne({ where: { code: component_desc_code } })
//                 : null;
        
            
        
//             const rating = rating_code
//                 ? await db.Rating.findOne({ where: { ratingCode: rating_code } }) ||
//                   await db.D_Rating.findOne({ where: { ratingCode: rating_code } })
//                 : null;
        
//             const material = material_code
//                 ? await db.Material.findOne({ where: { code: material_code } }) ||
//                   await db.D_Material.findOne({ where: { code: material_code } })
//                 : null;
        
//             const dimensionalStandard = dimensional_standard_id
//                 ? await db.DimensionalStandard.findOne({ where: { id: dimensional_standard_id } })
//                 : null;
        
//             const size1 =await db.Size.findOne({ where: { code: size1_code}}) ||
//                             await db.D_Size.findOne({ where: { code: size1_code }});
//             const size2 = await db.Size.findOne({ where: { code: size2_code}}) || await db.D_Size.findOne({where: { code: size2_code }});

//             if (size1.code && size2.code) {
//                 // console.log('size1',size1.size1_size2);
//                 let sizesInRange = await db.Size.findAll({
//                     attributes: ['id', 'size1_size2', 'code', 'size_inch', 'od', 'size_mm', 'created_at', 'updated_at', 'c_code'],
//                     where: {
//                         size1_size2: {
//                             [Op.between]: [size1.size1_size2,size2.size1_size2]
//                         }
//                     },
//                     order: [['od', 'ASC']],
//                 }); 

//                 if(sizesInRange.length == 0){
//                     sizesInRange = await db.D_Size.findAll({
//                         attributes: ['id', 'size1_size2', 'code', 'size_inch', 'od', 'size_mm', 'created_at', 'updated_at', 'c_code'],
//                         where: {
//                             size1_size2: {
//                                 [Op.between]: [size1.size1_size2,size2.size1_size2]
//                             }
//                         },
//                         order: [['od', 'ASC']],
//                     }); 
//                 }

//                 for (const size of sizesInRange) {
//                     const sizeData = size.dataValues;
                    
//                     if(component.componentname === "TEE"){
//                         const firstSizeData = sizesInRange[0].dataValues
//                         const branchValues = await db.Branch.findAll({
//                             where: {
//                                 run_size: sizeData.size_mm,
//                                 branch_size: {
//                                     [Op.gte]: firstSizeData.size_mm
//                                 },
//                                 spec_id: specId,
//                                 comp_name: "T"
//                             },
//                             raw: true 
//                         });

//                         for(const branch of branchValues){

                            
//                             const size1 =await db.Size.findOne({ where: { size_mm: branch.run_size}}) ||
//                             await db.D_Size.findOne({ where: {  size_mm: branch.run_size}});
                        
//                         const size2 = await db.Size.findOne({ where: {  size_mm: branch.branch_size}}) || await db.D_Size.findOne({where: {   size_mm: branch.branch_size }});
                        
//                         const sch1Code = await db.SizeRange.findOne({
//                             where: {
//                                 size_code: size1.code,
//                                 spec_id: specId
//                             },
//                             raw: true
//                         })
//                         const sch2Code = await db.SizeRange.findOne({
//                             where: {
//                                 size_code: size2.code,
//                                 spec_id: specId
//                             },
//                             raw: true
//                         })

//                         const schedule1 = await db.Schedule.findOne({ where: { code: sch1Code.schedule_code } }) ||
//                         await db.D_Schedule.findOne({ where: { code: sch1Code.schedule_code } });
                        
//                         const schedule2 = await db.Schedule.findOne({ where: { code: sch2Code.schedule_code } }) ||
//                         await db.D_Schedule.findOne({ where: { code: sch2Code.schedule_code } });
                        
//                         const processedItem = {
//                             spec:spec.specName,
//                             CompType:component.componentname,
//                             ShortCode:component_desc.short_code,
//                             ItemCode:`${component_desc.code}${size1.code}${size2.code}${schedule1 ? sch1Code.schedule_code : 'X'}${schedule2 ? sch2Code.schedule_code:'X'}${rating ? rating.ratingCode : 'X'}${material.code}`,
//                             ItemLongDesc:`${component_desc.itemDescription}${!schedule1 && !schedule2 && !rating ?', ' :(schedule1? ', '+schedule1.sch1_sch2+', ' :', ')+(schedule2? schedule2.sch1_sch2+', ' :', ')+(rating ?rating.ratingValue+', ':', ')}${material.material_description},${dimensionalStandard.dimensional_standard}`,
//                             ItemShortDesc:`${component_desc.itemDescription}`,
//                             Size1Inch:`${size1.size_inch}`,
//                             Size2Inch:`${size2.size_inch}`,
//                             Size1MM:`${size1.size_mm}`,
//                             Size2MM:`${size2.size_mm}`,
//                             Sch1:`${schedule1 ? schedule1.sch1_sch2:'X'}`,
//                             Sch2:`${schedule2? schedule2.sch1_sch2 : 'X'}`,
//                             Rating:`${rating ? rating.ratingValue : 'X'}`,
//                             GType:`${component_desc.g_type}`,
//                             SType:`${component_desc.s_type}`,
//                         }
//                         // console.log('processedItem',processedItem);
//                         processedItems.push(processedItem);
//                     }

//                     } 
//                     else {
//                             const scheduleCode = await db.SizeRange.findOne({
//                             where: {
//                                 size_code: sizeData.code,
//                                 spec_id: specId
//                             },
//                             raw: true
//                         });
                        
//                         const schedule = await db.Schedule.findOne({ where: { code: scheduleCode.schedule_code } }) ||
//                         await db.D_Schedule.findOne({ where: { code: scheduleCode.schedule_code } });
                    

//                         const processedItem = {
//                             spec:spec.specName,
//                             CompType:component.componentname,
//                             ShortCode:component_desc.short_code,
//                             ItemCode:`${component_desc.code}${sizeData.code}${'X'}${schedule ? scheduleCode.schedule_code : 'X'}${'X'}${rating ? rating.ratingCode : 'X'}${material.code}`,
//                             ItemLongDesc:`${component_desc.itemDescription}${!schedule && !rating ?', ' :(schedule? ', '+schedule.sch1_sch2+', ' :', ')+(rating ?rating.ratingValue+', ':', ')}${material.material_description},    ${dimensionalStandard.dimensional_standard}`,
//                             ItemShortDesc:`${component_desc.itemDescription}`,
//                             Size1Inch:`${sizeData.size_inch}`,
//                             Size2Inch:`${'X'}`,
//                             Size1MM:`${sizeData.size_mm}`,
//                             Size2MM:`${'X'}`,
//                             Sch1:`${schedule.sch1_sch2}`,
//                             Sch2:`${'X'}`,
//                             Rating:`${rating ? rating.ratingValue : 'X'}`,
//                             GType:`${component_desc.g_type}`,
//                             SType:`${component_desc.s_type}`,
//                         }
//                         // console.log('processedItem',processedItem);
//                         processedItems.push(processedItem);
//                     }
//                 }
//             } else {
//                 // Handle cases where size1_code or size2_code is missing
//                 const processedItem = {
//                     item,
//                     component,
//                     component_desc,
//                     rating,
//                     material,
//                     size: null, // No size data
//                     dimensionalStandard,
//                 };
        
//                 processedItems.push(processedItem); // Add to the result array
//             }
//         }

//         // Respond with the processed items
//         res.status(200).json({ success:true, message: "Data processed successfully", data: processedItems });
//     } catch (error:unknown) {
//         console.error("Error processing data:", error);
//         res.status(500).json({sucess:false, error: "An error occurred while processing data",status:500 });
//     }
// };
interface ProcessedItem {
    spec: string;
    CompType: string;
    ShortCode: string;
    ItemCode: string;
    ItemLongDesc: string;
    ItemShortDesc: string;
    Size1Inch: string;
    Size2Inch: string;
    Size1MM: string;
    Size2MM: string;
    Sch1: string;
    Sch2: string;
    Rating: string;
    GType: string;
    SType: string;
}

// Define interfaces for database models
export interface PmsCreation {
    dataValues: {
        spec_id: string;
        component_code: string;
        component_desc_code: string;
        rating_code: string;
        material_code: string;
        size1_code: string;
        size2_code: string;
        dimensional_standard_id: string;
    }
}

export interface Spec {
    specName: string;
}

export interface Component {
    id: string;
    componentname: string;
    ratingrequired:boolean;
}

export interface ComponentDesc {
    code: string;
    short_code: string;
    itemDescription: string;
    g_type: string;
    s_type: string;
}

export interface Rating {
    ratingCode: string;
    ratingValue: string;
}

export interface Material {
    code: string;
    material_description: string;
}

export interface DimensionalStandard {
    id: string;
    dimensional_standard: string;
}

export interface Size {
    code: string;
    size1_size2: number;
    od: number;
    size_inch: string;
    size_mm: string;
}

export interface D_Size extends Size {}

export interface Schedule {
    code: string;
    sch1_sch2: string;
}

export interface D_Schedule extends Schedule {}

export interface SizeRange {
    size_code: string;
    specId: string;
    schedule_code: string;
}

export interface Branch {
    run_size: string;
    branch_size: string;
    comp_name: string;
}

export interface D_Component extends ComponentDesc {}
export interface D_Rating extends Rating {}
export interface D_Material extends Material {}

export const generateReviewOutput = async (req: Request, res: Response): Promise<void> => {
    const { specId } = req.body;

    try {
        // Bulk fetch all required data in parallel
        const [
            pmsItems, 
            spec, 
            components, 
            componentDescs, 
            ratings, 
            materials, 
            dimensionalStandards,
            sizes,
            dSizes,
            schedules,
            dSchedules,
            sizeRanges,
            branches
        ] = await Promise.all([
            db.PmsCreation.findAll({ where: { spec_id: specId } }),
            db.Spec.findByPk(specId),
            db.Component.findAll({raw:true}),
            db.ComponentDesc.findAll(),
            db.Rating.findAll(),
            db.Material.findAll(),
            db.DimensionalStandard.findAll(),
            db.Size.findAll({raw:true}),
            db.D_Size.findAll({raw:true}),
            db.Schedule.findAll({raw:true}),
            db.D_Schedule.findAll({raw:true}),
            db.SizeRange.findAll({ where: { spec_id: specId } ,raw:true}),
            db.Branch.findAll({ where: { spec_id: specId } })
        ]);

        if (!pmsItems || pmsItems.length === 0) {
            res.status(400).json({ message: "No data found for the specified spec ID" });
            return;
        }

        const processedItems: ProcessedItem[] = [];

        for (const pmsItem of pmsItems) {
            const item = pmsItem.dataValues;
            const {
                spec_id,
                component_code,
                component_desc_code,
                rating_code,
                material_code,
                size1_code,
                size2_code,
                dimensional_standard_id,
            } = item;

            // Type-safe finds with explicit typing
            const component = components.find((c: Component) => c.id == component_code);
            const componentDesc = [
                ...componentDescs, 
                ...(await db.D_Component.findAll())
            ].find((cd: ComponentDesc) => cd.code == component_desc_code);
            const rating = [
                ...ratings, 
                ...(await db.D_Rating.findAll())
            ].find((r: Rating) => r.ratingCode == rating_code);
            const material = [
                ...materials, 
                ...(await db.D_Material.findAll())
            ].find((m: Material) => m.code == material_code);
            const dimensionalStandard = dimensionalStandards.find((ds: DimensionalStandard) => ds.id == dimensional_standard_id);

            const size1 = [...sizes, ...dSizes].find((s: Size | D_Size) => s.code == size1_code);
            const size2 = [...sizes, ...dSizes].find((s: Size | D_Size) => s.code == size2_code);

            if (size1?.code && size2?.code) {
                const sizesInRange = [...sizes, ...dSizes].filter(
                    (size: Size | D_Size) => size.size1_size2 >= size1.size1_size2 && 
                            size.size1_size2 <= size2.size1_size2
                ).sort((a: Size | D_Size, b: Size | D_Size) => a.od - b.od);

                for (const sizeData of sizesInRange) {
                    if (component.componentname === "TEE") {
                        const branchValues = branches.filter(
                            (b: Branch) => b.run_size === sizeData.size_mm && 
                                  b.branch_size >= sizesInRange[0].size_mm && 
                                  b.comp_name === "T"
                        );

                        for (const branch of branchValues) {
                            const branchRunSize = [...sizes, ...dSizes].find((s: Size | D_Size) => s.size_mm === branch.run_size);
                            const branchSize = [...sizes, ...dSizes].find((s: Size | D_Size) => s.size_mm === branch.branch_size);
                            
                            const sch1Code = sizeRanges.find((sr: SizeRange) => sr.size_code == branchRunSize.code && sr.specId == specId);
                            const sch2Code = sizeRanges.find((sr: SizeRange) => sr.size_code == branchSize.code && sr.specId == specId);

                            const schedule1 = [...schedules, ...dSchedules].find((s: Schedule | D_Schedule) => s.code == sch1Code?.schedule_code);
                            const schedule2 = [...schedules, ...dSchedules].find((s: Schedule | D_Schedule) => s.code == sch2Code?.schedule_code);

                            processedItems.push({
                                spec: spec.specName,
                                CompType: component.componentname,
                                ShortCode: componentDesc.short_code,
                                ItemCode: `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dimensional_standard}`,
                                ItemShortDesc: componentDesc.itemDescription,
                                Size1Inch: branchRunSize.size_inch,
                                Size2Inch: branchSize.size_inch,
                                Size1MM: branchRunSize.size_mm,
                                Size2MM: branchSize.size_mm,
                                Sch1: schedule1 ? schedule1.sch1_sch2 : 'XX',
                                Sch2: schedule2 ? schedule2.sch1_sch2 : 'XX',
                                Rating: rating ? rating.ratingValue : 'X',
                                GType: componentDesc.g_type,
                                SType: componentDesc.s_type,
                            });
                        }
                    } else {
                        const scheduleCode = sizeRanges.find(
                            (sr: SizeRange) => sr.size_code === sizeData.code && sr.specId === specId
                        );
                        const schedule = [...schedules, ...dSchedules].find(
                            (s: Schedule | D_Schedule) => s.code === scheduleCode?.schedule_code
                        );

                        processedItems.push({
                            spec: spec.specName,
                            CompType: component.componentname,
                            ShortCode: componentDesc.short_code,
                            ItemCode: `${componentDesc.code}${sizeData.code}${'X'}${schedule ? scheduleCode.schedule_code : 'XX'}${'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                            ItemLongDesc: `${componentDesc.itemDescription}${!schedule && !rating ? ', ' : (schedule ? ', ' + schedule.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},    ${dimensionalStandard.dimensional_standard}`,
                            ItemShortDesc: componentDesc.itemDescription,
                            Size1Inch: sizeData.size_inch,
                            Size2Inch: 'X',
                            Size1MM: sizeData.size_mm,
                            Size2MM: 'X',
                            Sch1: schedule.sch1_sch2,
                            Sch2: 'XX',
                            Rating: rating ? rating.ratingValue : 'X',
                            GType: componentDesc.g_type,
                            SType: componentDesc.s_type,
                        });
                    }
                }
            }
        }

        res.status(200).json({ success: true, message: "Data processed successfully", data: processedItems });
    } catch (error: unknown) {
        console.error("Error processing data:", error);
        res.status(500).json({ success: false, error: "An error occurred while processing data", status: 500 });
    }
};