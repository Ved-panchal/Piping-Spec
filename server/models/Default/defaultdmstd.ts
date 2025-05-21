// defaultComponentModel.ts
import { DataTypes } from "sequelize";

const defaultDimStdModel = (sequelize: any) => {
  const DefaultDimStd = sequelize.define(
    "default_dim_std",
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
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  
  return DefaultDimStd;
};

export default defaultDimStdModel;
