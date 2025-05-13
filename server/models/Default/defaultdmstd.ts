// defaultComponentModel.ts
import { DataTypes } from "sequelize";

const defaultDimStdModel = (sequelize: any) => {
  const DefaultDimStd = sequelize.define(
    "default_dim_std",
    {
    g_type:{
        type:DataTypes.STRING,
        allownull:true,
    },
    dim_std:{
        type:DataTypes.STRING,
        allownull:true,
    }
    },
    {
      timestamps: true,
      underscored: true,
    }
  );
  
  return DefaultDimStd;
};

export default defaultDimStdModel;
