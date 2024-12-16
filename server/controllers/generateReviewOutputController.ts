import { Request, Response } from "express";
import db from "../models";
interface ProcessedItem {
    spec: string;
    CompType: string;
    ShortCode: string;
    ItemCode: string;
    CItemCode: string;
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
    Catref:string;
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
    const { specId,projectId } = req.body;

    try {
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
            dcatref,
            catref,
            sizeRanges,
            branches
        ] = await Promise.all([
            db.PmsCreation.findAll({ where: { spec_id: specId } }),
            db.Spec.findByPk(specId),
            db.Component.findAll({raw:true}),
            db.ComponentDesc.findAll({where: {project_id:projectId}}),
            db.Rating.findAll({where: {project_id:projectId}}),
            db.Material.findAll({where: {project_id:projectId}}),
            db.DimensionalStandard.findAll(),
            db.Size.findAll({where:{project_id:projectId},raw:true}),
            db.D_Size.findAll({raw:true}),
            db.Schedule.findAll({where:{project_id:projectId},raw:true}),
            db.D_Schedule.findAll({raw:true}),
            db.D_Catref.findAll({raw:true}),
            db.Catref.findAll({where:{project_id:projectId},raw:true}),
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
                    (size: Size | D_Size) => size.size_mm >= size1.size_mm && 
                            size.size_mm <= size2.size_mm
                ).sort((a: Size | D_Size, b: Size | D_Size) => a.od - b.od);


                for (const sizeData of sizesInRange) {
                    
                    const existsInSizeRange = sizeRanges.some(
                        (sr: SizeRange) => sr.size_code === sizeData.code && sr.specId === specId
                    );
                    // console.log("existsInSizeRange",existsInSizeRange);

                    if (!existsInSizeRange) {
                        continue;
                    }
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

                            const catalogRef = [
                                ...dcatref, 
                                ...catref
                            ].find((cat: any) => 
                                cat.item_short_desc === componentDesc.itemDescription && 
                                cat.rating === (rating ? rating.ratingValue : null)
                            );
                            

                            processedItems.push({
                                spec: spec.specName,
                                CompType: component.componentname,
                                ShortCode: componentDesc.short_code,
                                ItemCode: `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                CItemCode: `${componentDesc.c_code}${branchRunSize.c_code}${branchSize.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dimensional_standard}`,
                                ItemShortDesc: componentDesc.itemDescription,
                                Size1Inch: branchRunSize.size1_size2,
                                Size2Inch: branchSize.size1_size2,
                                Size1MM: branchRunSize.size_mm,
                                Size2MM: branchSize.size_mm,
                                Sch1: schedule1 ? schedule1.sch1_sch2 : 'XX',
                                Sch2: schedule2 ? schedule2.sch1_sch2 : 'XX',
                                Rating: rating ? rating.ratingValue : 'X',
                                GType: componentDesc.g_type,
                                SType: componentDesc.s_type,
                                Catref: catalogRef ?catalogRef.catalog+"-"+branchRunSize.size_mm+"x"+branchSize.size_mm : "",
                            });
                        }
                    } else if(component.componentname === "OLET"){
                        // console.log(sizeData.size_mm,"+", sizesInRange[0].size_mm)
                        const branchValues = branches.filter(
                            (b: Branch) => b.branch_size === sizeData.size_mm && 
                                        //    b.branch_size >= sizesInRange[0].size_mm && 
                                        ["W", "H", "O", "S", "L"].includes(b.comp_name)
                        );


                        // console.log(branchValues);

                        for (const branch of branchValues) {
                            const branchRunSize = [...sizes, ...dSizes].find((s: Size | D_Size) => s.size_mm === branch.run_size);
                            const branchSize = [...sizes, ...dSizes].find((s: Size | D_Size) => s.size_mm === branch.branch_size);
                            
                            const sch1Code = sizeRanges.find((sr: SizeRange) => sr.size_code == branchRunSize.code && sr.specId == specId);
                            const sch2Code = sizeRanges.find((sr: SizeRange) => sr.size_code == branchSize.code && sr.specId == specId);

                            const schedule1 = [...schedules, ...dSchedules].find((s: Schedule | D_Schedule) => s.code == sch1Code?.schedule_code);
                            const schedule2 = [...schedules, ...dSchedules].find((s: Schedule | D_Schedule) => s.code == sch2Code?.schedule_code);

                            const catalogRef = [
                                ...dcatref, 
                                ...catref
                            ].find((cat: any) => 
                                cat.item_short_desc === componentDesc.itemDescription && 
                                cat.rating === (rating ? rating.ratingValue : null)
                            );

                            processedItems.push({
                                spec: spec.specName,
                                CompType: component.componentname,
                                ShortCode: componentDesc.short_code,
                                ItemCode: `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                CItemCode: `${componentDesc.c_code}${branchRunSize.c_code}${branchSize.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dimensional_standard}`,
                                ItemShortDesc: componentDesc.itemDescription,
                                Size1Inch: branchRunSize.size1_size2,
                                Size2Inch: branchSize.size1_size2,
                                Size1MM: branchRunSize.size_mm,
                                Size2MM: branchSize.size_mm,
                                Sch1: schedule1 ? schedule1.sch1_sch2 : 'XX',
                                Sch2: schedule2 ? schedule2.sch1_sch2 : 'XX',
                                Rating: rating ? rating.ratingValue : 'X',
                                GType: componentDesc.g_type,
                                SType: componentDesc.s_type,
                                Catref: catalogRef ?catalogRef.catalog+"-"+branchRunSize.size_mm+"x"+branchSize.size_mm : "",
                            });
                    } 
                }
                    else {
                        const scheduleCode = sizeRanges.find(
                            (sr: SizeRange) => sr.size_code === sizeData.code && sr.specId === specId
                        );
                        const schedule = [...schedules, ...dSchedules].find(
                            (s: Schedule | D_Schedule) => s.code === scheduleCode?.schedule_code
                        );

                        const catalogRef = [
                            ...dcatref, 
                            ...catref
                        ].find((cat: any) => 
                            cat.item_short_desc === componentDesc.itemDescription && 
                            cat.rating === (rating ? rating.ratingValue : null)
                        );
                        console.log(catalogRef)

                        processedItems.push({
                            spec: spec.specName,
                            CompType: component.componentname,
                            ShortCode: componentDesc.short_code,
                            ItemCode: `${componentDesc.code}${sizeData.code}${'X'}${schedule ? scheduleCode.schedule_code : 'XX'}${'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                            CItemCode: `${componentDesc.c_code}${sizeData.c_code}${'X'}${schedule ? schedule.c_code : 'XX'}${'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                            ItemLongDesc: `${componentDesc.itemDescription}${!schedule && !rating ? ', ' : (schedule ? ', ' + schedule.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},    ${dimensionalStandard.dimensional_standard}`,
                            ItemShortDesc: componentDesc.itemDescription,
                            Size1Inch: sizeData.size1_size2,
                            Size2Inch: 'X',
                            Size1MM: sizeData.size_mm,
                            Size2MM: 'X',
                            Sch1: schedule? schedule.sch1_sch2 : "XX",
                            Sch2: 'XX',
                            Rating: rating ? rating.ratingValue : 'X',
                            GType: componentDesc.g_type,
                            SType: componentDesc.s_type,
                            Catref: catalogRef ?catalogRef.catalog+"-"+sizeData.size_mm : "",
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