import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const MaterialModel = (sequelize: any) => {
    const Material = sequelize.define(
        "material",
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
            },
            projectId: {
                type: DataTypes.INTEGER, 
                references: {
                  model: projectModel(sequelize),
                  key: 'id',
                },
                allowNull: false,
                onDelete: "CASCADE",
            }
        },
        {
            timestamps: true,  
            underscored: true, 
            paranoid: true,  
            deletedAt: 'deleted_at',  
          }
    )
    
    Material.associate = (models: any) => {
        Material.belongsTo(models.Component, {
            foreignKey: "component_id",
            as: "components",
          });
        Material.belongsTo(models.Project, {
            foreignKey: "projectId",
            as: "project",
        });
    };

    return Material;
}

export default MaterialModel;