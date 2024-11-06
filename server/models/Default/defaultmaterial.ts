import { DataTypes } from "sequelize";

const defaultMaterialModel = (sequelize: any) => {
    const DefaultMaterial = sequelize.define(
        "default_material",
        {
            material_description: {
                type: DataTypes.STRING, 
                allowNull: false,
            },
            code: {
                type: DataTypes.STRING(10), 
                allowNull: false,
                validate: {
                  is: /^[0-9A-Z]+$/,
                },
            },
            c_code: {
                type: DataTypes.STRING(10),
                allowNull: false,
                validate: {
                  is: /^[0-9A-Z]+$/,
                },
            },
            comp_matching_id:{
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            base_material:{
                type:DataTypes.STRING,
                allowNull:false,
            }
        }
    )
    return DefaultMaterial;
}

export default defaultMaterialModel;