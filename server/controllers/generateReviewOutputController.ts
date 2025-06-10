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
    UnitWeight: string;
    SKey: string;
    Catref:string;
}

interface ValvProcessedItem {
    spec: string;
    CompType: string;
    ShortCode: string;
    ItemCode: string;
    CItemCode: string;
    ItemLongDesc: string;
    ItemShortDesc: string;
    ValvSubType: string;
    Size1Inch: string;
    Size2Inch: string;
    Size1MM: string;
    Size2MM: string;
    Sch1: string;
    Sch2: string;
    ConstructionDesc: string;
    Rating: string;
    GType: string;
    SType: string;
    UnitWeight: string;
    SKey: string;
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
    dimensional_standard?: string;
    dim_std?: string;
}

export interface Dim_Std {
    id?: string;
    code: string;
    dim_std: string;
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
            valvPmsItems, 
            spec, 
            components, 
            componentDescs, 
            ratings, 
            materials,
            reviewOutput, 
            // dimensionalStandards,
            // dDimStd,
            dimStd,
            sizes,
            dSizes,
            schedules,
            dSchedules,
            dcatref,
            catref,
            dVSType,
            VSType,
            dCDesc,
            CDesc,
            sizeRanges,
            branches,
            reducer,
        ] = await Promise.all([
            db.PmsCreation.findAll({ where: { spec_id: specId },order: [['sort_order', 'ASC']] }),
            db.ValvPmsCreation.findAll({ where: { spec_id: specId },order: [['sort_order', 'ASC']] }),
            db.Spec.findByPk(specId),
            db.Component.findAll({raw:true}),
            db.ComponentDesc.findAll({where: {project_id:projectId}}),
            db.Rating.findAll({where: {project_id:projectId}}),
            db.Material.findAll({where: {project_id:projectId}}),
            db.ReviewOutput.findAll({where: {project_id:projectId}}),
            // db.DimensionalStandard.findAll(),
            // db.D_DimStd.findAll({raw:true}),
            db.DimStd.findAll({where: {project_id:projectId},raw:true}),
            db.Size.findAll({where:{project_id:projectId},raw:true}),
            db.D_Size.findAll({raw:true}),
            db.Schedule.findAll({where:{project_id:projectId},raw:true}),
            db.D_Schedule.findAll({raw:true}),
            db.D_Catref.findAll({raw:true}),
            db.Catref.findAll({where:{project_id:projectId},raw:true}),
            db.D_VSType.findAll({raw:true}),
            db.VSType.findAll({where:{project_id:projectId},raw:true}),
            db.D_CDesc.findAll({raw:true}),
            db.CDesc.findAll({where:{project_id:projectId},raw:true}),
            db.SizeRange.findAll({ where: { spec_id: specId } ,raw:true}),
            db.Branch.findAll({ where: { spec_id: specId } }),
            db.Reducer.findAll({raw:true}),
        ]);

        if (!pmsItems || pmsItems.length === 0) {
            res.status(400).json({ message: "No data found for the specified spec ID" });
            return;
        }

        const processedItems: ProcessedItem[] = [];
        const valvProcessedItems: ValvProcessedItem[] = [];

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

            const dimensionalStandard = [
                    ...dimStd,
                    ...(await db.D_DimStd.findAll())
                ].find((ds: Dim_Std) => ds.id == dimensional_standard_id);

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

                    if (!existsInSizeRange) {
                        continue;
                    }

                    if(component.componentname !== "VALV"){
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
                            const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`)?.unit_weight || '0.00';
                            

                            processedItems.push({
                                spec: spec.specName,
                                CompType: component.componentname,
                                ShortCode: componentDesc.short_code,
                                ItemCode: `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                CItemCode: `${componentDesc.c_code}${branchRunSize.c_code}${branchSize.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dim_std}`,
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
                                UnitWeight: unitWeight,
                                SKey: componentDesc.skey ? componentDesc.skey : "",
                                Catref: catalogRef ?catalogRef.catalog+"-"+branchRunSize.size_mm+"x"+branchSize.size_mm : "",
                            });
                        }
                        } else if(component.componentname === "REDUCER" ){
                            if(componentDesc.itemDescription.toLowerCase().includes('swage')){
                                // Handle REDUCER SWAGE type
                                const reducerSizes = reducer.filter(
                                    (r: any) => r.type === 'REDUCER SWAGE' &&
                                    r.big_size >= size1.size1_size2 && r.big_size <= size2.size1_size2 && r.big_size == sizeData.size1_size2 &&
                                    r.small_size <= size2.size1_size2 && r.small_size >= size1.size1_size2
                                );
                        
                                for (const reducerSize of reducerSizes) {
                                    const bigSizeData = [...sizes, ...dSizes].find(
                                        (s: Size | D_Size) => s.size1_size2 == reducerSize.big_size
                                    );
                                    const smallSizeData = [...sizes, ...dSizes].find(
                                        (s: Size | D_Size) => s.size1_size2 == reducerSize.small_size
                                    );
                        
                                    const existsInSizeRange2 = sizeRanges.some(
                                        (sr: SizeRange) => sr.size_code === smallSizeData?.code && sr.specId === specId
                                    );
                                    if ( !existsInSizeRange2 || !bigSizeData || !smallSizeData) {
                                        continue;
                                    }
                                    
                                    const scheduleCode1 = sizeRanges.find(
                                        (sr: SizeRange) => sr.size_code === bigSizeData.code && sr.specId === specId
                                    );
                                    const scheduleCode2 = sizeRanges.find(
                                        (sr: SizeRange) => sr.size_code === smallSizeData.code && sr.specId === specId
                                    );
                        
                                    const schedule1 = [...schedules, ...dSchedules].find(
                                        (s: Schedule | D_Schedule) => s.code === scheduleCode1?.schedule_code
                                    );
                                    const schedule2 = [...schedules, ...dSchedules].find(
                                        (s: Schedule | D_Schedule) => s.code === scheduleCode2?.schedule_code
                                    );
                        
                                    const catalogRef = [
                                        ...dcatref, 
                                        ...catref
                                    ].find((cat: any) => 
                                        cat.item_short_desc === componentDesc.itemDescription && 
                                        cat.rating === (rating ? rating.ratingValue : null)
                                    );

                                    const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${bigSizeData.code}${smallSizeData.code}${schedule1 ? scheduleCode1.schedule_code : 'XX'}${schedule2 ? scheduleCode2.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`)?.unit_weight || '0.00';
                            
                        
                                    processedItems.push({
                                        spec: spec.specName,
                                        CompType: component.componentname,
                                        ShortCode: componentDesc.short_code,
                                        ItemCode: `${componentDesc.code}${bigSizeData.code}${smallSizeData.code}${schedule1 ? scheduleCode1.schedule_code : 'XX'}${schedule2 ? scheduleCode2.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                        CItemCode: `${componentDesc.c_code}${bigSizeData.c_code}${smallSizeData.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                        ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dim_std}`,
                                        ItemShortDesc: componentDesc.itemDescription,
                                        Size1Inch: bigSizeData.size1_size2,
                                        Size2Inch: smallSizeData.size1_size2,
                                        Size1MM: bigSizeData.size_mm,
                                        Size2MM: smallSizeData.size_mm,
                                        Sch1: schedule1 ? schedule1.sch1_sch2 : 'XX',
                                        Sch2: schedule2 ? schedule2.sch1_sch2 : 'XX',
                                        Rating: rating ? rating.ratingValue : 'X',
                                        GType: componentDesc.g_type,
                                        SType: componentDesc.s_type,
                                        UnitWeight: unitWeight,
                                        SKey: componentDesc.skey ? componentDesc.skey : "",
                                        Catref: catalogRef ? catalogRef.catalog+"-"+bigSizeData.size_mm+"x"+smallSizeData.size_mm : "",
                                    });
                                }
                            } else {
                                // Handle regular REDUCER type
                                const reducerSizes = reducer.filter(
                                    (r: any) => r.type === 'REDUCER' &&
                                    r.big_size >= size1.size1_size2 && r.big_size <= size2.size1_size2 && r.big_size == sizeData.size1_size2 &&
                                    r.small_size <= size2.size1_size2 && r.small_size >= size1.size1_size2
                                );

                        
                                for (const reducerSize of reducerSizes) {
                                    const bigSizeData = [...sizes, ...dSizes].find(
                                        (s: Size | D_Size) => s.size1_size2 == reducerSize.big_size
                                    );
                                    const smallSizeData = [...sizes, ...dSizes].find(
                                        (s: Size | D_Size) => s.size1_size2 == reducerSize.small_size
                                    );
                        
                                    const existsInSizeRange2 = sizeRanges.some(
                                        (sr: SizeRange) => sr.size_code === smallSizeData?.code && sr.specId === specId
                                    );
                        
                                    if ( !existsInSizeRange2 || !bigSizeData || !smallSizeData) {
                                        continue;
                                    }
                                    // console.log("existsInSizeRange2 in REUDUCER Only",existsInSizeRange2);

                        
                                    const scheduleCode1 = sizeRanges.find(
                                        (sr: SizeRange) => sr.size_code === bigSizeData.code && sr.specId === specId
                                    );
                                    const scheduleCode2 = sizeRanges.find(
                                        (sr: SizeRange) => sr.size_code === smallSizeData.code && sr.specId === specId
                                    );
                        
                                    const schedule1 = [...schedules, ...dSchedules].find(
                                        (s: Schedule | D_Schedule) => s.code === scheduleCode1?.schedule_code
                                    );
                                    const schedule2 = [...schedules, ...dSchedules].find(
                                        (s: Schedule | D_Schedule) => s.code === scheduleCode2?.schedule_code
                                    );
                        
                                    const catalogRef = [
                                        ...dcatref, 
                                        ...catref
                                    ].find((cat: any) => 
                                        cat.item_short_desc === componentDesc.itemDescription && 
                                        cat.rating === (rating ? rating.ratingValue : null)
                                    );

                                    const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${bigSizeData.code}${smallSizeData.code}${schedule1 ? scheduleCode1.schedule_code : 'XX'}${schedule2 ? scheduleCode2.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`)?.unit_weight || '0.00';
                            
                        
                                    processedItems.push({
                                        spec: spec.specName,
                                        CompType: component.componentname,
                                        ShortCode: componentDesc.short_code,
                                        ItemCode: `${componentDesc.code}${bigSizeData.code}${smallSizeData.code}${schedule1 ? scheduleCode1.schedule_code : 'XX'}${schedule2 ? scheduleCode2.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                        CItemCode: `${componentDesc.c_code}${bigSizeData.c_code}${smallSizeData.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                        ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dim_std}`,
                                        ItemShortDesc: componentDesc.itemDescription,
                                        Size1Inch: bigSizeData.size1_size2,
                                        Size2Inch: smallSizeData.size1_size2,
                                        Size1MM: bigSizeData.size_mm,
                                        Size2MM: smallSizeData.size_mm,
                                        Sch1: schedule1 ? schedule1.sch1_sch2 : 'XX',
                                        Sch2: schedule2 ? schedule2.sch1_sch2 : 'XX',
                                        Rating: rating ? rating.ratingValue : 'X',
                                        GType: componentDesc.g_type,
                                        SType: componentDesc.s_type,
                                        UnitWeight: unitWeight,
                                        SKey: componentDesc.skey ? componentDesc.skey : "",
                                        Catref: catalogRef ? catalogRef.catalog+"-"+bigSizeData.size_mm+"x"+smallSizeData.size_mm : "",
                                    });
                                }
                            }
                        } else if (component.componentname === "COUPLING" || (component.componentname === "FLANGE" && componentDesc.itemDescription.toLowerCase().includes("reducing"))) {
                                // Get 4 sizes that are lower than the current size
                                const lowerSizes = sizesInRange
                                    .filter(s => s.size_mm < sizeData.size_mm)
                                    .sort((a, b) => b.size_mm - a.size_mm) // Sort in descending order
                                    .slice(0, 4); // Take up to 4 sizes
                        
                                // If no lower sizes available, skip this iteration
                                if (lowerSizes.length === 0) {
                                    continue;
                                }
                        
                                // For each lower size, create a coupling item
                                for (const size2Data of lowerSizes) {

                                    const existsInSizeRange = sizeRanges.some(
                                        (sr: SizeRange) => sr.size_code === size2Data.code && sr.specId === specId
                                    );

                                    if (!existsInSizeRange) {
                                        continue;
                                    }
                                    const scheduleCode1 = sizeRanges.find(
                                        (sr: SizeRange) => sr.size_code === sizeData.code && sr.specId === specId
                                    );
                                    const scheduleCode2 = sizeRanges.find(
                                        (sr: SizeRange) => sr.size_code === size2Data.code && sr.specId === specId
                                    );
                        
                                    const schedule1 = [...schedules, ...dSchedules].find(
                                        (s: Schedule | D_Schedule) => s.code === scheduleCode1?.schedule_code
                                    );
                                    const schedule2 = [...schedules, ...dSchedules].find(
                                        (s: Schedule | D_Schedule) => s.code === scheduleCode2?.schedule_code
                                    );
                        
                                    const catalogRef = [
                                        ...dcatref, 
                                        ...catref
                                    ].find((cat: any) => 
                                        cat.item_short_desc === componentDesc.itemDescription && 
                                        cat.rating === (rating ? rating.ratingValue : null)
                                    );

                                    const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${sizeData.code}${size2Data.code}${schedule1 ? scheduleCode1.schedule_code : 'XX'}${schedule2 ? scheduleCode2.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`)?.unit_weight || '0.00';
                            
                        
                                    processedItems.push({
                                        spec: spec.specName,
                                        CompType: component.componentname,
                                        ShortCode: componentDesc.short_code,
                                        ItemCode: `${componentDesc.code}${sizeData.code}${size2Data.code}${schedule1 ? scheduleCode1.schedule_code : 'XX'}${schedule2 ? scheduleCode2.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                        CItemCode: `${componentDesc.c_code}${sizeData.c_code}${size2Data.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                        ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dim_std}`,
                                        ItemShortDesc: componentDesc.itemDescription,
                                        Size1Inch: sizeData.size1_size2,
                                        Size2Inch: size2Data.size1_size2,
                                        Size1MM: sizeData.size_mm,
                                        Size2MM: size2Data.size_mm,
                                        Sch1: schedule1 ? schedule1.sch1_sch2 : 'XX',
                                        Sch2: schedule2 ? schedule2.sch1_sch2 : 'XX',
                                        Rating: rating ? rating.ratingValue : 'X',
                                        GType: componentDesc.g_type,
                                        SType: componentDesc.s_type,
                                        UnitWeight: unitWeight,
                                        SKey: componentDesc.skey ? componentDesc.skey : "",
                                        Catref: catalogRef ? catalogRef.catalog+"-"+sizeData.size_mm+"x"+size2Data.size_mm : "",
                                    });
                                }
                        } else if(component.componentname === "OLET"){
                            // console.log(sizeData.size_mm,"+", sizesInRange[0].size_mm)
                            const branchValues = branches.filter(
                                (b: Branch) => b.branch_size === sizeData.size_mm && 
                                            //    b.branch_size >= sizesInRange[0].size_mm && 
                                            ["W", "H", "O", "S", "L"].includes(b.comp_name)
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

                                const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`)?.unit_weight || '0.00';

                                processedItems.push({
                                    spec: spec.specName,
                                    CompType: component.componentname,
                                    ShortCode: componentDesc.short_code,
                                    ItemCode: `${componentDesc.code}${branchRunSize.code}${branchSize.code}${schedule1 ? sch1Code.schedule_code : 'XX'}${schedule2 ? sch2Code.schedule_code : 'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                    CItemCode: `${componentDesc.c_code}${branchRunSize.c_code}${branchSize.c_code}${schedule1 ? schedule1.c_code : 'XX'}${schedule2 ? schedule2.c_code : 'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                    ItemLongDesc: `${componentDesc.itemDescription}${!schedule1 && !schedule2 && !rating ? ', ' : (schedule1 ? ', ' + schedule1.sch1_sch2 + ', ' : '') + (schedule2 ? schedule2.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dim_std}`,
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
                                    UnitWeight: unitWeight,
                                    SKey: componentDesc.skey ? componentDesc.skey : "",
                                    Catref: catalogRef ?catalogRef.catalog+"-"+branchRunSize.size_mm+"x"+branchSize.size_mm : "",
                                });
                        } 
                        }else {
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
                            // console.log(catalogRef)
                            const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${sizeData.code}${'X'}${schedule ? scheduleCode.schedule_code : 'XX'}${'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`)?.unit_weight || '0.00';
                            

                            processedItems.push({
                                spec: spec.specName,
                                CompType: component.componentname,
                                ShortCode: componentDesc.short_code,
                                ItemCode: `${componentDesc.code}${sizeData.code}${'X'}${schedule ? scheduleCode.schedule_code : 'XX'}${'XX'}${rating ? rating.ratingCode : 'X'}${material.code}`,
                                CItemCode: `${componentDesc.c_code}${sizeData.c_code}${'X'}${schedule ? schedule.c_code : 'XX'}${'XX'}${rating ? rating.c_rating_code : 'X'}${material.c_code}`,
                                ItemLongDesc: `${componentDesc.itemDescription}${!schedule && !rating ? ', ' : (schedule ? ', ' + schedule.sch1_sch2 + ', ' : '') + (rating ? rating.ratingValue + ', ' : '')}${material.material_description},${dimensionalStandard.dim_std}`,
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
                                UnitWeight: unitWeight,
                                SKey: componentDesc.skey ? componentDesc.skey : "",
                                Catref: catalogRef ?catalogRef.catalog+"-"+sizeData.size_mm : "",
                            });
                        }
                    }   
                }
            }
        }
        
        if(valvPmsItems.length > 0){
            for (const valvItem of valvPmsItems) {
                const item = valvItem.dataValues;
                const {
                    spec_id,
                    component_code,
                    component_desc_code,
                    rating_code,
                    material_code,
                    size1_code,
                    size2_code,
                    dimensional_standard_code,
                    construction_desc_code,
                    valv_sub_type_code
                } = item;

                const component = components.find((c: Component) => c.id == component_code);

                if (!component || component.componentname !== "VALV") continue;

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

                const dimensionalStandard = [
                    ...dimStd,
                    ...(await db.D_DimStd.findAll())
                ].find((ds: Dim_Std) => ds.code == dimensional_standard_code);

                const size1 = [...sizes, ...dSizes].find((s: Size | D_Size) => s.code == size1_code);
                const size2 = [...sizes, ...dSizes].find((s: Size | D_Size) => s.code == size2_code);

                const scheduleCode1 = sizeRanges.find(
                    (sr:SizeRange) => sr.size_code === size1?.code && sr.specId === specId
                );
                const scheduleCode2 = sizeRanges.find(
                    (sr:SizeRange) => sr.size_code === size2?.code && sr.specId === specId
                );

                const schedule1 = [...schedules, ...dSchedules].find(
                    s => s.code === scheduleCode1?.schedule_code
                );
                const schedule2 = [...schedules, ...dSchedules].find(
                    s => s.code === scheduleCode2?.schedule_code
                );

                const constructionDesc = [...dCDesc, ...CDesc].find(
                    (c: any) => c.code == construction_desc_code
                );

                const valvSubtype = [...dVSType, ...VSType].find(
                    (v: any) => v.code == valv_sub_type_code
                );

                const catalogRef = [...dcatref, ...catref].find(
                    (cat: any) =>
                        cat.item_short_desc === componentDesc?.itemDescription &&
                        cat.rating === (rating ? rating.ratingValue : null)
                );

                if (size1?.code && size2?.code) {
                const sizesInRange = [...sizes, ...dSizes].filter(
                    (size: Size | D_Size) => size.size_mm >= size1.size_mm && 
                            size.size_mm <= size2.size_mm
                ).sort((a: Size | D_Size, b: Size | D_Size) => a.od - b.od);


                for (const sizeData of sizesInRange) {
                    
                    const existsInSizeRange = sizeRanges.some(
                        (sr: SizeRange) => sr.size_code === sizeData.code && sr.specId === specId
                    );

                    if (!existsInSizeRange) {
                        continue;
                    }

                    const unitWeight = reviewOutput.find((item: any) => item.item_code === `${componentDesc.code}${sizeData?.code}${'X'}${rating ? rating.ratingCode : 'X'}${material?.code}`)?.unit_weight || '0.00';
                            

                    valvProcessedItems.push({
                        spec: spec.specName,
                        CompType: component.componentname,
                        ShortCode: componentDesc.short_code,
                        ItemCode: `${componentDesc.code}${sizeData?.code}${'X'}${rating ? rating.ratingCode : 'X'}${material?.code}`,
                        CItemCode: `${componentDesc.c_code}${sizeData?.c_code}${'X'}${rating ? rating.c_rating_code : 'X'}${material?.c_code}`,
                        ItemLongDesc: `${componentDesc.itemDescription}${!rating ? ', ' :(rating ? rating.ratingValue + ', ' : '')}${material?.material_description}, ${dimensionalStandard?.dim_std}`,
                        ItemShortDesc: componentDesc.itemDescription,
                        ValvSubType: valvSubtype?.valv_sub_type ?? '',
                        Size1Inch: sizeData.size1_size2 ?? '',
                        Size2Inch:'X',
                        Size1MM: size1?.size_mm ?? '',
                        Size2MM: size2?.size_mm ?? '',
                        Sch1:'XX',
                        Sch2:'XX',
                        ConstructionDesc: constructionDesc?.construction_desc ?? '',
                        Rating: rating?.ratingValue ?? 'X',
                        GType: componentDesc.g_type,
                        SType: componentDesc.s_type,
                        UnitWeight: unitWeight,
                        SKey: componentDesc.skey ? componentDesc.skey : "",
                        Catref: catalogRef ? `${catalogRef.catalog}-${size1?.size_mm}x${size2?.size_mm}` : '',
                    });
                }
        }
            }


        }

        res.status(200).json({ success: true, message: "Data processed successfully", data: [...processedItems,...valvProcessedItems] });
    } catch (error: unknown) {
        console.error("Error processing data:", error);
        res.status(500).json({ success: false, error: "An error occurred while processing data", status: 500 });
    }
};