// defaultComponentModel.ts
import { DataTypes } from "sequelize";
import projectModel from "./projectmodel";

const DimStdModel = (sequelize: any) => {
  const DimStd = sequelize.define(
    "dim_std",
    {
    indexing:{
        type:DataTypes.STRING,
        allownull:true,
        unique:true,
    },
    g_type:{
        type:DataTypes.STRING,
        allownull:true,
    },
    dim_std:{
        type:DataTypes.STRING,
        allownull:true,
    },
    code:{
        type:DataTypes.STRING,
        allownull:true,
    },
    c_code:{
        type:DataTypes.STRING,
        allownull:true,
    },
    project_id: {
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
    }
  );
  
  return DimStd;
};

export default DimStdModel;
